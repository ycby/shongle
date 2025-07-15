import db, {executeBatch, executeQuery} from '#root/src/db/db.ts'
import {FieldMapping, filterClauseGenerator, processData, ProcessDataMapping} from "#root/src/helpers/DBHelpers.ts";
import {InvalidRequestError, RecordNotFoundError} from "#root/src/errors/Errors.ts";
import ShortData from "#root/src/models/ShortData.ts";
import Stock from "#root/src/models/Stock.ts";
import {retrieveShortData} from "#root/src/helpers/ShortDataRetriever.ts";
import {UpsertResult} from "mariadb";
import {ValidationRule, validator, ValidatorResult} from "#root/src/utilities/Validator.ts";
import {stringToDateConverter} from "#root/src/helpers/DateHelper.ts";

export type ShortDataGetParam = {
	id?: number,
	ticker_no: string;
	start_date?: string;
	end_date?: string;
}

export type ShortDataGetSingleParam = {
	id: number;
}

export type ShortDataBody = {
	id?: number;
	stock_id: number;
	reporting_date: string;
	shorted_shares: number;
	shorted_amount: number;
}

const SHORT_PARAM_VALIDATION: ValidationRule[] = [
	{
		name: 'ticker_no',
		isRequired: true,
		rule: (ticker_no: any): boolean => typeof ticker_no === 'string' && ticker_no.length === 5,
		errorMessage: 'Ticker No. is formatted incorrectly, it should be 5 characters long. E.g "00001"'
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
		rule: (id: any): boolean => typeof id === 'number',
		errorMessage: 'Id is required and must be a number'
	}
]

const SHORT_BODY_VALIDATION: ValidationRule[] = [
	{
		name: 'id',
		isRequired: false,
		rule: (id: any): boolean => typeof id === 'number',
		errorMessage: 'Id is must be a number"'
	},
	{
		name: 'stock_id',
		isRequired: true,
		rule: (stock_id: any): boolean => typeof stock_id === 'number',
		errorMessage: 'Stock Id is must be a number and is required"'
	},
	{
		name: 'reporting_date',
		isRequired: false,
		rule: (reporting_date: any): boolean => stringToDateConverter(reporting_date) !== null,
		errorMessage: 'Reporting Date must be a date'
	},
	{
		name: 'shorted_shares',
		isRequired: false,
		rule: (shorted_shares: any): boolean => typeof shorted_shares === 'number',
		errorMessage: 'Shorted Shares must be a number'
	},
	{
		name: 'shorted_amount',
		isRequired: false,
		rule: (shorted_amount: any): boolean => typeof shorted_amount === 'number',
		errorMessage: 'Shorted Amount must be a number'
	},
];

const columnInsertionOrder: ProcessDataMapping[] = [
	{
		field: 'id'
	},
	{
		field: 'stock_id',
	},
	{
		field: 'reporting_date'
	},
	{
		field: 'shorted_shares'
	},
	{
		field: 'shorted_amount'
	}
]

const fieldMapping: FieldMapping[] = [
	{
		param: 'ticker_no',
		field: 'ticker_no',
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
	let validationResult: ValidatorResult[] = validator(args, SHORT_PARAM_VALIDATION);

	if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

	let result: ShortData[] = [];

	const whereString = filterClauseGenerator(fieldMapping, args);

	try {

		result = await executeQuery<ShortData[]>({
			namedPlaceholders: true,
			sql: `SELECT * FROM Short_Reporting_w_Stocks WHERE ${whereString !== '' ? whereString : ''} ORDER BY reporting_date DESC`
		}, {
			ticker_no: args.ticker_no,
			start_date: args.start_date,
			end_date: args.end_date,
		});

	} catch (err) {

		throw err;

	}

	return result;
}

const postShortData = async (data: ShortDataBody[]) => {

	//TODO: if stockCode is invalid/does not exist, return error
	let validationResult: ValidatorResult[] = validator(data, SHORT_BODY_VALIDATION);

	if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

	let result: UpsertResult[] = [];

	const dataIds = data.map(d => d.stock_id);

	data.forEach(d => {d.reporting_date = (d.reporting_date)});

	try {

		const existingRecords = await executeQuery<Stock[]>({
			namedPlaceholders: true,
			sql: "SELECT id, ticker_no, name FROM Stocks WHERE id IN (:stock_ids)"
		}, {
			stock_ids: [dataIds]
		});

		if (existingRecords.length === 0) {

			const nonExistantStockIds = data.map((d: ShortDataBody) => d.stock_id);

			throw new RecordNotFoundError(`Stocks with ids ( ${nonExistantStockIds.join(', ')} ) do not exist!`);
		}

		//use existing records to set stock_id
		result = await executeBatch({
			namedPlaceholders: true,
			sql: 'INSERT INTO Short_Reporting ' +
				'(stock_id, reporting_date, shorted_shares, shorted_amount, created_datetime, last_modified_datetime) ' +
				'VALUES (:stock_id, :reporting_date, :shorted_shares, :shorted_amount, :created_datetime, :last_modified_datetime)'
		},
			data.map(item => {

				let shortData = new ShortData('INSERT');

				return processData(item, columnInsertionOrder, shortData);
			})
		);

	} catch (err) {

		throw err;
	}

	return result;
}

const getShortDatum = async (args: ShortDataGetSingleParam) => {

	let validationResults: ValidatorResult[] = validator(args, SHORT_PARAM_SINGLE_VALIDATION);

	if (validationResults.length > 0) throw new InvalidRequestError(validationResults);
	//TODO: if stockCode is invalid/does not exist, return error

	let result = [];

	try {

		result = await executeQuery<ShortData[]>({
			namedPlaceholders: true,
			sql: `SELECT * FROM Short_Reporting_w_Stocks WHERE id = :id`
		}, {
			id: args.id
		});

	} catch (err) {

		throw err;
	}

	return result;
}

const putShortDatum = async (data: ShortDataBody) => {

	let validationResults: ValidatorResult[] = validator(data, SHORT_BODY_VALIDATION);

	if (validationResults.length > 0) throw new InvalidRequestError(validationResults);

	//TODO: if stockCode is invalid/does not exist, return error

	let result = [];

	try {

		result = await executeQuery<ShortData[]>({
			namedPlaceholders: true,
			sql: 'INSERT INTO Short_Reporting ' +
				'(id, stock_id, reporting_date, shorted_shares, shorted_amount, created_datetime, last_modified_datetime) ' +
				'VALUES (:id, :stock_id, :reporting_date, :shorted_shares, :shorted_amount, :created_datetime, :last_modified_datetime) ' +
				'ON DUPLICATE KEY UPDATE ' +
				'stock_id=VALUES(stock_id), ' +
				'reporting_date=VALUES(reporting_date), ' +
				'shorted_shares=VALUES(shorted_shares), ' +
				'shorted_amount=VALUES(shorted_amount), ' +
				'last_modified_datetime=VALUES(last_modified_datetime)'
			},
			() => {

				let shortData = new ShortData('UPDATE');

				return processData(data, columnInsertionOrder, shortData);
			}
		);

	} catch (err) {

		throw err;
	}

	return result;
}

const deleteShortDatum = async (args: ShortDataGetSingleParam) => {

	let validationResults: ValidatorResult[] = validator(args, SHORT_PARAM_SINGLE_VALIDATION);

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

const retrieveShortDataFromSource = async (endDate: Date) => {
	console.log('Inside Retrieve Short Data From Source')

	//Step 1: get the last date which was imported
	//Step 2: loop over each date from the last date to today and insert records as appropriate
	//Step 2.1: use settimeout to wait for 1 minute before doing the next call = https://stackoverflow.com/questions/23316525/nodejs-wait-in-a-loop
	let conn;
	let result;

	try {

		conn = await db.pool.getConnection();

		await conn.beginTransaction();

		result = await conn.query({
			sql: `SELECT id, reporting_date FROM Short_Reporting ORDER BY reporting_date DESC LIMIT 1`
		});

		// console.log(result[0].reporting_date);
	} catch (err) {

		if (conn) await conn.rollback();

		throw err;
	} finally {

		if (conn) await conn.end();
	}

	const finalDate = endDate === null ? new Date() : endDate;
	let latestDate = result[0].reporting_date;

	while(latestDate < finalDate) {

		latestDate.setDate(latestDate.getDate() + 1);

		retrieveShortData(latestDate, postShortData);

		await wait(10000);
	}
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
	retrieveShortDataFromSource
}