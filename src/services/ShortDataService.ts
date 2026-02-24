import {executeBatch, executeQuery} from '#root/src/db/db.js'
import {FieldMapping, filterClauseGenerator} from "#root/src/helpers/DBHelpers.js";
import {InvalidRequestError, RecordMissingDataError, RecordNotFoundError} from "#root/src/errors/Errors.js";
import ShortData from "#root/src/models/ShortData.js";
import Stock from "#root/src/models/Stock.js";
import {retrieveShortData} from "#root/src/helpers/ShortDataRetriever.js";
import {UpsertResult} from "mariadb";
import {validate, ValidatorResult} from "#root/src/utilities/Validator.js";
import {QueryType} from "#root/src/types.js";
import {
	SHORT_PARAM_SINGLE_VALIDATION,
	SHORT_PARAM_VALIDATION,
	SHORT_BODY_VALIDATION,
	SHORT_MISMATCH_PARAM_VALIDATION,
	SHORT_MISMATCH_QUERY_VALIDATION
} from "#root/src/validation/VRule_ShortData.js";

export type ShortDataGetParam = {
	id?: string,
	stock_id: string;
	start_date?: string;
	end_date?: string;
}

export type ShortDataGetSingleParam = {
	id: string;
}

export type ShortDataBody = {
	id?: string;
	ticker_no?: string;
	stock_id?: string;
	name?: string;
	reporting_date: string;
	shorted_shares: number;
	shorted_amount: number;
}

export type ShortDataRetrieveQuery = {
	start_date?: string;
	end_date?: string;
}

export type ShortDataTickersWithMismatchQuery = {
	limit?: number;
	offset?: number;
}

export type ShortDataMismatchQuery = {
	ticker_no: string;
}

const fieldMapping: FieldMapping[] = [
	{
		param: 'stock_id',
		field: 'stock_id',
		operator: '='
	},
	{
		param: 'start_date',
		field: 'reporting_date',
		operator: '>='
	},
	{
		param: 'end_date',
		field: 'reporting_date',
		operator: '<='
	}
]

const getShortData = async (args: ShortDataGetParam) => {

	//TODO: if stockCode is invalid/does not exist, return error
	let validationResult: ValidatorResult[] = validate(args, SHORT_PARAM_VALIDATION);

	if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

	let result: ShortData[] = [];

	const whereString = filterClauseGenerator(QueryType.AND, fieldMapping, args);

	try {

		result = await executeQuery<ShortData>({
			namedPlaceholders: true,
			sql: `SELECT sr.*, c.decimal_places FROM Short_Reporting sr LEFT JOIN Currencies c ON sr.currency = c.ISO_code WHERE ${whereString !== '' ? whereString : ''} ORDER BY reporting_date DESC`
		}, {
			stock_id: args.stock_id,
			start_date: args.start_date,
			end_date: args.end_date,
		}, (element) => new ShortData(element));

	} catch (err) {

		throw err;

	}

	return result;
}

//Allow dumping records without matching stock id first
//TODO: for front end?, allow user to find unparented short reporting and manually parent them.
const postShortData = async (data: ShortDataBody[]) => {

	let validationResult: ValidatorResult[] = validate(data, SHORT_BODY_VALIDATION);

	if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

	let result: UpsertResult[] = [];

	const stockIds: BigInt[] = [];
	const tickerNos: string[] = [];

	data.forEach(d => {

		if (d.stock_id !== undefined) stockIds.push(BigInt(d.stock_id));
		if (d.stock_id === undefined && d.ticker_no !== undefined) tickerNos.push(d.ticker_no);
	});

	if (stockIds.length > 0 && tickerNos.length > 0) throw new InvalidRequestError('Either stock ids or ticker nos must be supplied, not a mixture of both');

	try {

		if (stockIds.length > 0) {

			const existingRecords = await executeQuery<Stock>({
				namedPlaceholders: true,
				sql: "SELECT id, ticker_no, name FROM Stocks WHERE id IN (:ids) AND is_active = TRUE"
			}, {
				ids: stockIds
			}, (element) => new Stock(element));

			if (existingRecords.length === 0) {

				const nonExistentStockIds = data.map((d: ShortDataBody) => d.stock_id);

				throw new RecordNotFoundError(`Stocks with ids ( ${nonExistentStockIds.join(', ')} ) do not exist!`);
			}
		} else if (tickerNos.length > 0) {

			const existingRecords = await executeQuery<Stock>({
				namedPlaceholders: true,
				sql: "SELECT id, ticker_no, name FROM Stocks WHERE ticker_no IN (:ticker_nos)"
			}, {
				ticker_nos: tickerNos
			}, (element) => new Stock(element));

			const tickerNoNameMap = new Map<string, Stock>(existingRecords.map(element => [`${element.ticker_no}_${element.name}`, element]));

			data.forEach(d => {

				if (!tickerNoNameMap.has(`${d.ticker_no}_${d.name}`)) return;

				const stock = tickerNoNameMap.get(`${d.ticker_no}_${d.name}`);
				if (stock === undefined || stock?.id === undefined) return;

				d.stock_id = stock.id.toString();
			})
		}


		result = await executeBatch({
			namedPlaceholders: true,
			sql: 'INSERT INTO Short_Reporting ' +
				'(stock_id, ticker_no, reporting_date, shorted_shares, shorted_amount, created_datetime, last_modified_datetime) ' +
				'VALUES (:stock_id, :ticker_no, :reporting_date, :shorted_shares, :shorted_amount, :created_datetime, :last_modified_datetime)'
		},
			data.map(item => new ShortData(item))
		);

	} catch (err) {

		throw err;
	}

	return result;
}

const getShortDatum = async (args: ShortDataGetSingleParam) => {

	let validationResults: ValidatorResult[] = validate(args, SHORT_PARAM_SINGLE_VALIDATION);

	if (validationResults.length > 0) throw new InvalidRequestError(validationResults);
	//TODO: if stockCode is invalid/does not exist, return error

	const bigIntId = BigInt(args.id);
	let result = [];

	try {

		result = await executeQuery<ShortData>({
			namedPlaceholders: true,
			sql: `SELECT * FROM Short_Reporting_w_Stocks WHERE id = :id`
		}, {
			id: bigIntId
		}, (element) => new ShortData(element));

	} catch (err) {

		throw err;
	}

	return result;
}

const putShortDatum = async (data: ShortDataBody[]) => {

	let validationResults: ValidatorResult[] = validate(data, SHORT_BODY_VALIDATION);

	if (validationResults.length > 0) throw new InvalidRequestError(validationResults);

	//TODO: if stockCode is invalid/does not exist, return error

	let result = [];

	try {

		result = await executeBatch({
			sql: 'INSERT INTO Short_Reporting ' +
				'(id, stock_id, ticker_no, reporting_date, shorted_shares, shorted_amount, created_datetime, last_modified_datetime) ' +
				'VALUES (?, ?, ?, ?, ?, ?, ?, ?) ' +
				'ON DUPLICATE KEY UPDATE ' +
				'stock_id=VALUES(stock_id), ' +
				'ticker_no=VALUES(ticker_no), ' +
				'reporting_date=VALUES(reporting_date), ' +
				'shorted_shares=VALUES(shorted_shares), ' +
				'shorted_amount=VALUES(shorted_amount), ' +
				'last_modified_datetime=VALUES(last_modified_datetime)'
			},
			data.map(element => {
				const result = new ShortData(element);
				return [
					result.id,
					result.stock_id,
					result.ticker_no,
					result.reporting_date,
					result.shorted_shares,
					result.shorted_amount,
					result.created_datetime,
					result.last_modified_datetime
				];
			})
		);

	} catch (err) {

		throw err;
	}

	return result;
}

const deleteShortDatum = async (args: ShortDataGetSingleParam) => {

	let validationResults: ValidatorResult[] = validate(args, SHORT_PARAM_SINGLE_VALIDATION);

	if (validationResults.length > 0) throw new InvalidRequestError(validationResults);

	try {

		await executeQuery({
			namedPlaceholders: true,
			sql: `DELETE FROM Short_Reporting WHERE id = :id`,
		}, {
			id: args.id
		});

	} catch (err) {

		throw err;
	}

	return {
		id: args.id,
		status: 'success'
	};
}

const retrieveShortDataFromSource = async (startDate: Date | null, endDate: Date | null) => {
	console.log('Inside Retrieve Short Data From Source')

	//Step 1: get the last date which was imported
	//Step 2: loop over each date from the last date to today and insert records as appropriate
	//Step 2.1: use setTimeout to wait for 1 minute before doing the next call = https://stackoverflow.com/questions/23316525/nodejs-wait-in-a-loop
	let result;

	try {

		result = await executeQuery<ShortData>({
			sql: `SELECT id, reporting_date FROM Short_Reporting ORDER BY reporting_date DESC LIMIT 1`
		},
			undefined,
			(element) => new ShortData(element));
	} catch (err) {

		throw err;
	}

	if (!result[0]?.reporting_date) {

		throw new RecordMissingDataError();
	}

	const finalDate = endDate ?? new Date();
	let latestDate = startDate ?? result[0].reporting_date;

	while(latestDate < finalDate) {

		latestDate.setDate(latestDate.getDate() + 1);

		//fire and forget
		retrieveShortData(latestDate, async (shortData: ShortData[]) => {

			await executeBatch({
					namedPlaceholders: true,
					sql: 'INSERT INTO Short_Reporting ' +
						'(stock_id, ticker_no, reporting_date, shorted_shares, shorted_amount, created_datetime, last_modified_datetime) ' +
						'VALUES (:stock_id, :ticker_no, :reporting_date, :shorted_shares, :shorted_amount, :created_datetime, :last_modified_datetime)'
				},
				shortData.map(element => element.getPlainObject())
			);
		});

		await wait(10000);
	}
	//TODO: log this better.
	console.log('Job Done.')
}

type MismatchTickerResponse = {
	ticker_no: string;
	total_rows: BigInt;
}
//Use limit+offset since I will be managing the data myself, and it won't change much
const getTickersWithMismatchedData = async (args: ShortDataTickersWithMismatchQuery) => {

	let validationResults: ValidatorResult[] = validate(args, SHORT_MISMATCH_QUERY_VALIDATION);

	if (validationResults.length > 0) throw new InvalidRequestError(validationResults);

	args.limit = args.limit ? args.limit : 10;
	args.offset = args.offset ? args.offset : 0;
	let result = [];

	try {

		result = await executeQuery<MismatchTickerResponse>({
			namedPlaceholders: true,
			sql: `SELECT ticker_no, COUNT(*) OVER() AS total_rows FROM Short_Reporting_wo_Stock_Id_Distinct LIMIT :limit OFFSET :offset`
		}, {
			limit: Number(args.limit),
			offset: Number(args.offset),
		});

	} catch (err) {

		throw err;
	}

	return {
		total_rows: result.length > 0 ? result[0].total_rows.toString() : '0',
		tickers: result.map(element => element.ticker_no),
		offset: Number(args.offset),
		limit: Number(args.limit),
	};
}

const getMismatchedDataByTicker = async (args: ShortDataMismatchQuery) => {

	let validationResults: ValidatorResult[] = validate(args, SHORT_MISMATCH_PARAM_VALIDATION);

	if (validationResults.length > 0) throw new InvalidRequestError(validationResults);

	let result = [];

	try {

		result = await executeQuery<ShortData>({
			namedPlaceholders: true,
			sql: `SELECT * FROM Short_Reporting_wo_Stock_Id WHERE ticker_no = :ticker_no`,
		}, {
			ticker_no: args.ticker_no
		}, (element) => new ShortData(element));

	} catch (err) {

		throw err;
	}

	return result;
}

const wait = (milliseconds: number) => {

	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export {
	getShortData,
	postShortData,
	getShortDatum,
	putShortDatum,
	deleteShortDatum,
	retrieveShortDataFromSource,
	getTickersWithMismatchedData,
	getMismatchedDataByTicker
}