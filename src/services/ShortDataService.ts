import {executeBatch, executeQuery} from '#root/src/db/db.js'
import {FieldMapping, filterClauseGenerator} from "#root/src/helpers/DBHelpers.js";
import {InvalidRequestError, RecordMissingDataError, RecordNotFoundError} from "#root/src/errors/Errors.js";
import ShortData from "#root/src/models/ShortData.js";
import Stock from "#root/src/models/Stock.js";
import {retrieveShortData} from "#root/src/helpers/ShortDataRetriever.js";
import {UpsertResult} from "mariadb";
import {ValidationRule, validate, ValidatorResult} from "#root/src/utilities/Validator.js";
import {stringToDateConverter} from "#root/src/helpers/DateHelper.js";
import {QueryType} from "#root/src/types.js";

export type ShortDataGetParam = {
	id?: number,
	stock_id: number;
	start_date?: string;
	end_date?: string;
}

export type ShortDataGetSingleParam = {
	id: string;
}

export type ShortDataBody = {
	id?: string;
	ticker_no?: string;
	stock_id: number;
	reporting_date: string;
	shorted_shares: number;
	shorted_amount: number;
}

export type ShortDataRetrieveQuery = {
	end_date?: string;
}

export type ShortDataTickersWithMismatchQuery = {
	limit?: number;
	offset?: number;
}

export type ShortDataMismatchQuery = {
	ticker_no: string;
}

const SHORT_PARAM_VALIDATION: ValidationRule[] = [
	{
		name: 'stock_id',
		isRequired: true,
		rule: (stock_id: any): boolean => !isNaN(Number(stock_id)),
		errorMessage: 'Stock Id is required and must be a number',
	},
	{
		name: 'start_date',
		isRequired: false,
		rule: (start_date: any): boolean => stringToDateConverter(start_date) !== null,
		errorMessage: 'Start Date must be a date'
	},
	{
		name: 'end_date',
		isRequired: false,
		rule: (end_date: any): boolean => stringToDateConverter(end_date) !== null,
		errorMessage: 'End Date must be a date'
	},
];

const SHORT_PARAM_SINGLE_VALIDATION: ValidationRule[] = [
	{
		name: 'id',
		isRequired: true,
		rule: (id: any): boolean => {
			try {
				BigInt(id)
				return typeof id === 'string';
			} catch (e) {
				return false;
			}
		},
		errorMessage: 'Id is required and must be a bigint string'
	}
]

const SHORT_BODY_VALIDATION: ValidationRule[] = [
	{
		name: 'id',
		isRequired: false,
		rule: (id: any): boolean => {
			try {
				BigInt(id)
				return typeof id === 'string';
			} catch (e) {
				return false;
			}
		},
		errorMessage: 'Id is must be a number"'
	},
	{
		name: 'ticker_no',
		isRequired: false,
		rule: (stock_code: any): boolean => stock_code.toString().length === 5,
		errorMessage: 'Stock Code is must be a string of 5 characters and is required"'
	},
	{
		name: 'stock_id',
		isRequired: true,
		rule: (id: any): boolean => {
			try {
				BigInt(id)
				return typeof id === 'string';
			} catch (e) {
				return false;
			}
		},
		errorMessage: 'Id is must be a number"'
	},
	{
		name: 'reporting_date',
		isRequired: false,
		rule: (reporting_date: any): boolean => stringToDateConverter(reporting_date) !== null,
		errorMessage: 'Reporting Date must be formatted like so: yyyy-MM-dd'
	},
	{
		name: 'shorted_shares',
		isRequired: false,
		rule: (shorted_shares: any): boolean => !isNaN(Number(shorted_shares)),
		errorMessage: 'Shorted Shares must be a number'
	},
	{
		name: 'shorted_amount',
		isRequired: false,
		rule: (shorted_amount: any): boolean => !isNaN(Number(shorted_amount)),
		errorMessage: 'Shorted Amount must be a number'
	},
];

const SHORT_MISMATCH_QUERY_VALIDATION = [
	{
		name: 'limit',
		isRequired: false,
		rule: (limit: any): boolean => !isNaN(Number(limit)) && Number(limit) >= 0,
		errorMessage: 'Limit must be a positive number',
	},
	{
		name: 'offset',
		isRequired: false,
		rule: (offset: any): boolean => !isNaN(Number(offset)) && Number(offset) >= 0,
		errorMessage: 'Offset must be a positive number',
	}
]

const SHORT_MISMATCH_PARAM_VALIDATION: ValidationRule[] = [
	{
		name: 'ticker_no',
		isRequired: true,
		rule: (ticker_no: any): boolean => typeof ticker_no === 'string' && ticker_no.length === 5,
		errorMessage: 'Ticker No. in param is formatted incorrectly, it should be 5 characters long. E.g "00001"'
	}
]

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
			sql: `SELECT * FROM Short_Reporting WHERE ${whereString !== '' ? whereString : ''} ORDER BY reporting_date DESC`
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

	console.log(data);
	//TODO: if stockCode is invalid/does not exist, return error
	let validationResult: ValidatorResult[] = validate(data, SHORT_BODY_VALIDATION);

	if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

	let result: UpsertResult[] = [];

	const stockIds = data.map(d => BigInt(d.stock_id));

	try {

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

const putShortDatum = async (data: ShortDataBody) => {

	let validationResults: ValidatorResult[] = validate(data, SHORT_BODY_VALIDATION);

	if (validationResults.length > 0) throw new InvalidRequestError(validationResults);

	//TODO: if stockCode is invalid/does not exist, return error

	let result = [];

	try {

		result = await executeQuery({
			namedPlaceholders: true,
			sql: 'INSERT INTO Short_Reporting ' +
				'(id, stock_id, ticker_no, reporting_date, shorted_shares, shorted_amount, created_datetime, last_modified_datetime) ' +
				'VALUES (:id, :stock_id, :ticker_no, :reporting_date, :shorted_shares, :shorted_amount, :created_datetime, :last_modified_datetime) ' +
				'ON DUPLICATE KEY UPDATE ' +
				'stock_id=VALUES(stock_id), ' +
				'ticker_no=VALUES(ticker_no), ' +
				'reporting_date=VALUES(reporting_date), ' +
				'shorted_shares=VALUES(shorted_shares), ' +
				'shorted_amount=VALUES(shorted_amount), ' +
				'last_modified_datetime=VALUES(last_modified_datetime)'
			},
			() => new ShortData(data).getPlainObject()
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

const retrieveShortDataFromSource = async (endDate: Date | null) => {
	console.log('Inside Retrieve Short Data From Source')

	//Step 1: get the last date which was imported
	//Step 2: loop over each date from the last date to today and insert records as appropriate
	//Step 2.1: use setTimeout to wait for 1 minute before doing the next call = https://stackoverflow.com/questions/23316525/nodejs-wait-in-a-loop
	let result;

	try {

		result = await executeQuery<ShortData>({
			sql: `SELECT id, reporting_date FROM Short_Reporting ORDER BY reporting_date DESC LIMIT 1`
		});
	} catch (err) {

		throw err;
	}

	if (!result[0].reporting_date) {

		throw new RecordMissingDataError();
	}

	const finalDate = endDate === null ? new Date() : endDate;
	let latestDate = result[0].reporting_date;

	while(latestDate < finalDate) {

		latestDate.setDate(latestDate.getDate() + 1);

		//fire and forget
		retrieveShortData(latestDate, postShortData);

		await wait(10000);
	}
	//TODO: log this better.
	console.log('Job Done.')
}

//Use limit+offset since I will be managing the data myself, and it won't change much
const getTickersWithMismatchedData = async (args: ShortDataTickersWithMismatchQuery) => {

	let validationResults: ValidatorResult[] = validate(args, SHORT_MISMATCH_QUERY_VALIDATION);

	if (validationResults.length > 0) throw new InvalidRequestError(validationResults);

	args.limit = args.limit ? args.limit : 10;
	args.offset = args.offset ? args.offset : 0;
	let result = [];

	try {

		result = await executeQuery<Stock>({
			namedPlaceholders: true,
			sql: `SELECT ticker_no FROM Short_Reporting_wo_Stock_Id_Distinct LIMIT :limit OFFSET :offset`
		}, {
			limit: Number(args.limit),
			offset: Number(args.offset),
		}, (element) => new Stock(element));

	} catch (err) {

		throw err;
	}

	return result.map(element => element.ticker_no);
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