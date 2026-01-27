import {executeBatch, executeQuery} from '#root/src/db/db.js';
import Stock from '#root/src/models/Stock.js';
import {DuplicateFoundError, InvalidRequestError} from "#root/src/errors/Errors.js";
import {FieldMapping, filterClauseGenerator, processData, ProcessDataMapping} from "#root/src/helpers/DBHelpers.js";
import {UpsertResult} from "mariadb";
import {ValidationRule, validator, ValidatorResult} from "#root/src/utilities/Validator.js";

import {
	Category,
	Subcategory,
	Currency,
	CategoryKeys,
	SubcategoryKeys,
	CurrencyKeys,
	QueryTypeKeys, QueryType
} from "#root/src/types.js";
import {retrieveStockData} from "#root/src/helpers/StocksLatestRetriever.ts.js";

export type StocksDataGetParam = {
	query_type?: QueryTypeKeys;
	ticker_no?: string;
	name?: string;
	ISIN?: string;
}

export type StocksDataBody = {
	ticker_no: string;
	name: string;
	full_name: string;
	description: string;
	category: string;
	subcategory: string;
	board_lot: number;
	ISIN: string;
	currency: string;
}

export type StocksTrackParam = {
	id: number;
}

const STOCK_PARAM_VALIDATION: ValidationRule[] = [
	{
		name: 'query_type',
		isRequired: false,
		rule: (query_type: any): boolean => typeof query_type === 'string' && Object.values(QueryType).includes(query_type as QueryTypeKeys),
		errorMessage: 'Query Type is invalid. It must be either "AND" or "OR".'
	},
	{
		name: 'ticker_no',
		isRequired: false,
		rule: (ticker_no: any): boolean => typeof ticker_no === 'string',
		errorMessage: 'Ticker No. is formatted incorrectly, it should be 5 characters long. E.g "00001"'
	},
	{
		name: 'name',
		isRequired: false,
		rule: (name: any): boolean => typeof name === 'string',
		errorMessage: 'Name must be a string'
	},
	{
		name: 'ISIN',
		isRequired: false,
		rule: (ISIN: any): boolean => typeof ISIN === 'string',
		errorMessage: 'ISIN must be a string'
	},
];

const STOCK_PARAM_SINGLE_VALIDATION: ValidationRule[] = [
	{
		name: 'ticker_no',
		isRequired: true,
		rule: (ticker_no: any): boolean => typeof ticker_no === 'string' && ticker_no.length === 5,
		errorMessage: 'Ticker No. is formatted incorrectly, it should be 5 characters long. E.g "00001"'
	}
]

const STOCK_DATA_VALIDATION: ValidationRule[] = [
	{
		name: 'id',
		isRequired: false,
		rule: (id: any): boolean => typeof id === 'number',
		errorMessage: 'Id must be a number'
	},
	{
		name: 'ticker_no',
		isRequired: false,
		rule: (ticker_no: any): boolean => typeof ticker_no === 'string' && ticker_no.length === 5,
		errorMessage: 'Ticker No. is formatted incorrectly, it should be 5 characters long. E.g "00001"'
	},
	{
		name: 'name',
		isRequired: false,
		rule: (name: any): boolean => typeof name === 'string',
		errorMessage: 'Name must be a string'
	},
	{
		name: 'full_name',
		isRequired: false,
		rule: (full_name: any): boolean => typeof full_name === 'string',
		errorMessage: 'Full Name must be a string'
	},
	{
		name: 'description',
		isRequired: false,
		rule: (description: any): boolean => typeof description === 'string',
		errorMessage: 'Description must be a string'
	},
	{
		name: 'category',
		isRequired: false,
		rule: (category: any): boolean => typeof category === 'string' && Object.values(Category).includes(category as CategoryKeys),
		errorMessage: 'Category must be one of the following: ' + Object.values(Category).join(', '),
	},
	{
		name: 'subcategory',
		isRequired: false,
		rule: (subcategory: any): boolean => typeof subcategory === 'string' && Object.values(Subcategory).includes(subcategory as SubcategoryKeys),
		errorMessage: 'Subcategory must be one of the following: ' + Object.values(Subcategory).join(', ')
	},
	{
		name: 'board_lot',
		isRequired: false,
		rule: (board_lot: any): boolean => typeof board_lot === 'number',
		errorMessage: 'Board Lot must be a number'
	},
	{
		name: 'ISIN',
		isRequired: false,
		rule: (ISIN: any): boolean => typeof ISIN === 'string',
		errorMessage: 'ISIN must be a string'
	},
	{
		name: 'currency',
		isRequired: false,
		rule: (currency: any): boolean => typeof currency === 'string' && Object.values(Currency).includes(currency as CurrencyKeys),
		errorMessage: 'Currency must be one of the following: ' + Object.values(Currency).join(', ')
	},
	{
		name: 'is_active',
		isRequired: false,
		rule: (isActive: any): boolean => typeof isActive === 'boolean',
		errorMessage: 'Currency must be a boolean'
	},
];

const columnInsertionOrder: ProcessDataMapping[] = [
	{
		field: 'id'
	},
	{
		field: 'ticker_no'
	},
	{
		field: 'name'
	},
	{
		field: 'full_name'
	},
	{
		field: 'description'
	},
	{
		field: 'category'
	},
	{
		field: 'subcategory'
	},
	{
		field: 'board_lot'
	},
	{
		field: 'ISIN'
	},
	{
		field: 'currency'
	},
	{
		field: 'is_active'
	}
]

const fieldMapping: FieldMapping[] = [
	{
		param: 'ticker_no',
		field: 'ticker_no',
		operator: 'LIKE'
	},
	{
		param: 'name',
		field: 'name',
		operator: 'LIKE'
	},
	{
		param: 'ISIN',
		field: 'ISIN',
		operator: 'LIKE'
	}
]

//TODO: Convert all db calls to use the new executeQuery and executeBatch functions
const getStocksData = async (args: StocksDataGetParam) => {

	console.log(args);
	let validationResult: ValidatorResult[] = validator(args, STOCK_PARAM_VALIDATION);
	console.log(validationResult);
	if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

	let result: Stock[] = [];

	const queryParams = {
		name: args.name,
		ticker_no: args.ticker_no,
		ISIN: args.ISIN
	}

	const queryType = args.query_type ?? QueryType.AND;

	const filterClause: string = filterClauseGenerator(queryType, fieldMapping, queryParams);

	let whereString: string = filterClause !== '' ? 'WHERE ' + filterClause : '';

	try {

		result = await executeQuery<Stock[]>({
			namedPlaceholders: true,
			sql: `SELECT * FROM Stocks ${whereString}`,
		}, {
			ticker_no: `%${args.ticker_no}%`,
			name: `%${args.name}%`,
			ISIN: `%${args.ISIN}%`
		});

	} catch (err) {

		throw err;
	}

	return result;
}

const postStockData = async (data: StocksDataBody[]) => {

	let validationResult: ValidatorResult[] = validator(data, STOCK_DATA_VALIDATION);

	if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

	let result: UpsertResult[] = [];

	const dataIds: string[] = data.map((d: StocksDataBody): string => d.ticker_no);
	try {

		const existingRecords: Stock[] = await executeQuery({
			sql: "SELECT id, ticker_no, name FROM Stocks WHERE ticker_no IN (?)"
		}, [dataIds]);

		if (existingRecords.length > 0) {

			const existingCodes: string[] = existingRecords.map((d: Stock): string => d.ticker_no);

			throw new DuplicateFoundError(`Stocks with ids ( ${existingCodes.join(', ')} ) already exist!`);
		}

		result = await executeBatch({
			namedPlaceholders: true,
			sql: 'INSERT INTO Stocks ' +
					'(ticker_no, name, full_name, description, category, subcategory, board_lot, ISIN, currency, created_datetime, last_modified_datetime) ' +
				'VALUES (:ticker_no, :name, :full_name, :description, :category, :subcategory, :board_lot, :ISIN, :currency, :created_datetime, :last_modified_datetime)'
			},
			data.map((item: StocksDataBody): Stock => {

				let stock: Stock = new Stock('INSERT');

				return processData(item, columnInsertionOrder, stock);
			})
		);
		console.log(result);

	} catch (err) {

		throw err;
	}

	return result;
}

const getStockData = async (args: StocksDataGetParam) => {

	let validationResult: ValidatorResult[] = validator(args, STOCK_PARAM_SINGLE_VALIDATION);

	if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

	const ticker_no = args.ticker_no;
	console.log(ticker_no)

	let result: Stock[] = [];

	try {

		result = await executeQuery({
			namedPlaceholders: true,
			sql: `SELECT * FROM Stocks WHERE ticker_no = :ticker_no`
		}, {
			ticker_no: ticker_no
		},
			(result) => result.map((element) => new Stock('UPDATE', element)));
	} catch (err) {

		throw err;

	}

	return result;
}

const putStockData = async (data: StocksDataBody) => {

	let validationResult: ValidatorResult[] = validator(data, STOCK_DATA_VALIDATION);

	if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

	let result: UpsertResult[] = [];

	try {

		result = await executeQuery({
			namedPlaceholders: true,
			sql: 'INSERT INTO Stocks ' +
					'(id, ticker_no, name, full_name, description, category, subcategory, board_lot, ISIN, currency, is_active, created_datetime, last_modified_datetime) ' +
				'VALUES (:id, :ticker_no, :name, :full_name, :description, :category, :subcategory, :board_lot, :ISIN, :currency, :is_active, :created_datetime, :last_modified_datetime) ' +
				'ON DUPLICATE KEY UPDATE ' +
				'ticker_no=VALUES(ticker_no), ' +
				'name=VALUES(name), ' +
				'full_name=VALUES(full_name), ' +
				'description=VALUES(description), ' +
				'category=VALUES(category), ' +
				'subcategory=VALUES(subcategory), ' +
				'board_lot=VALUES(board_lot), ' +
				'ISIN=VALUES(ISIN), ' +
				'currency=VALUES(currency), ' +
				'is_active=VALUES(is_active), ' +
				'last_modified_datetime=VALUES(last_modified_datetime)'
			},
			() => {

				let stock: Stock = new Stock('UPDATE');
				return processData(data, columnInsertionOrder, stock).getPlainObject();
			}
		)

	} catch (err) {

		throw err;
	}

	return result;
}

const deleteStockData = async (args: StocksDataGetParam) => {

	let validationResult: ValidatorResult[] = validator(args, STOCK_PARAM_SINGLE_VALIDATION);

	if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

	const ticker_no = args.ticker_no;

	try {

		await executeQuery({
			namedPlaceholders: true,
			sql: `DELETE FROM Stocks WHERE ticker_no = :ticker_no`
		}, {
			ticker_no: ticker_no
		});

	} catch (err) {

		throw err;
	}

	//assume no error or else will throw error
	return {
		ticker_no: ticker_no,
		status: 'success'
	};
}

const getTrackedStocks = async () => {

	let result: Stock[] = [];

	try {
		result = await executeQuery({
			sql: 'SELECT * FROM Stocks WHERE is_tracked = TRUE',
		});
	} catch (err) {

		throw err;
	}

	return result;
}

const setTrackStock = async (args: StocksTrackParam, isTrack: boolean) => {

	let result: UpsertResult[] = [];

	try {
		const existingRecords: Stock[] = await executeQuery({
			namedPlaceholders: true,
			sql: "SELECT id, ticker_no, name FROM Stocks WHERE id = :id"
		}, {
			id: args.id
		});

		if (existingRecords.length === 0) {

			const existingCodes: string[] = existingRecords.map((d: Stock): string => d.ticker_no);

			throw new DuplicateFoundError(`No stocks with tickers ( ${existingCodes.join(', ')} ) found!`);
		}

		result = await executeQuery(
			{
				namedPlaceholders: true,
				sql: 'UPDATE Stocks ' +
					'SET is_tracked = :is_tracked ' +
					'WHERE id = :id'
			}, {
				id: args.id,
				is_tracked: isTrack
			}
		);
	} catch (err) {

		throw err;
	}

	return result;
}

const retrieveStockDataFromSource = () => {

	retrieveStockData();
}

export {
	getStocksData,
	postStockData,
	getStockData,
	putStockData,
	deleteStockData,
	getTrackedStocks,
	setTrackStock,
	retrieveStockDataFromSource
}