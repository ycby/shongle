import {executeBatch, executeQuery} from '#root/src/db/db.ts'
import {FieldMapping, filterClauseGenerator, processData, ProcessDataMapping} from "#root/src/helpers/DBHelpers.ts";
import {InvalidRequestError, RecordMissingDataError} from "#root/src/errors/Errors.ts";
import ShortData from "#root/src/models/ShortData.ts";
import Stock from "#root/src/models/Stock.ts";
import {retrieveShortData} from "#root/src/helpers/ShortDataRetriever.ts";
import {UpsertResult} from "mariadb";
import {ValidationRule, validator, ValidatorResult} from "#root/src/utilities/Validator.ts";
import {stringToDateConverter} from "#root/src/helpers/DateHelper.ts";
import {QueryType} from "#root/src/types.ts";

export type ShortDataGetParam = {
	id?: number,
	stock_id: number;
	start_date?: string;
	end_date?: string;
}

export type ShortDataGetSingleParam = {
	id: number;
}

export type ShortDataBody = {
	id?: number;
	stock_code: string;
	stock_id?: number;
	reporting_date: string;
	shorted_shares: number;
	shorted_amount: number;
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
		name: 'stock_code',
		isRequired: true,
		rule: (stock_code: any): boolean => stock_code.toString().length === 5,
		errorMessage: 'Stock Code is must be a number and is required"'
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

const columnInsertionOrder: ProcessDataMapping[] = [
	{
		field: 'id'
	},
	{
		field: 'stock_id',
	},
	{
		field: 'stock_code',
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
	let validationResult: ValidatorResult[] = validator(args, SHORT_PARAM_VALIDATION);

	if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

	let result: ShortData[] = [];

	const whereString = filterClauseGenerator(QueryType.AND, fieldMapping, args);

	try {

		result = await executeQuery<ShortData[]>({
			namedPlaceholders: true,
			sql: `SELECT * FROM Short_Reporting WHERE ${whereString !== '' ? whereString : ''} ORDER BY reporting_date DESC`
		}, {
			stock_id: args.stock_id,
			start_date: args.start_date,
			end_date: args.end_date,
		});

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
	let validationResult: ValidatorResult[] = validator(data, SHORT_BODY_VALIDATION);

	if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

	let result: UpsertResult[] = [];

	const tickerNumbers = data.map(d => d.stock_code.toString().padStart(5, '0'));

	try {

		const existingRecords = await executeQuery<Stock[]>({
			namedPlaceholders: true,
			sql: "SELECT id, ticker_no, name FROM Stocks WHERE ticker_no IN (:ticker_nos) AND is_active = TRUE"
		}, {
			ticker_nos: [tickerNumbers]
		});

		//create map for getting right stock id -in future consider caching
		const stockMap = new Map(existingRecords.map(element => [element.ticker_no, element.id]));

		data.forEach(element => {
			element.stock_id = stockMap.get(element.stock_code)
		});

		//use existing records to set stock_id
		result = await executeBatch({
			namedPlaceholders: true,
			sql: 'INSERT INTO Short_Reporting ' +
				'(stock_id, ticker_no, reporting_date, shorted_shares, shorted_amount, created_datetime, last_modified_datetime) ' +
				'VALUES (:stock_id, :stock_code, :reporting_date, :shorted_shares, :shorted_amount, :created_datetime, :last_modified_datetime)'
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
	let result;

	try {

		result = await executeQuery<ShortData[]>({
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