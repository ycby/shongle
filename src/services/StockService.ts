import {executeBatch, executeQuery} from '#root/src/db/db.ts';
import Stock from '#root/src/models/Stock.ts';
import {DuplicateFoundError, InvalidRequestError} from "#root/src/errors/Errors.ts";
import {FieldMapping, filterClauseGenerator, processData, ProcessDataMapping} from "#root/src/helpers/DBHelpers.ts";
import {UpsertResult} from "mariadb";
import {ValidationRule, validator, ValidatorResult} from "#root/src/utilities/Validator.ts";
import {Category, Subcategory, Currency, CategoryKeys, SubcategoryKeys, CurrencyKeys} from "#root/src/types.ts";

export type StocksDataGetParam = {
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

const STOCK_PARAM_VALIDATION: ValidationRule[] = [
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

	let validationResult: ValidatorResult[] = validator(args, STOCK_PARAM_VALIDATION);

	if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

	let result: Stock[] = [];

	const filterClause: string = filterClauseGenerator(fieldMapping, args);

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

	let result: Stock[] = [];

	try {


		result = await executeQuery({
			namedPlaceholders: true,
			sql: `SELECT * FROM Stocks WHERE ticker_no = :ticker_no`
		}, {
			ticker_no: ticker_no
		});
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

export {
	getStocksData,
	postStockData,
	getStockData,
	putStockData,
	deleteStockData
}