import {executeBatch, executeQuery} from '#root/src/db/db.js';
import Stock from '#root/src/models/Stock.js';
import {DuplicateFoundError, InvalidRequestError} from "#root/src/errors/Errors.js";
import {FieldMapping, filterClauseGenerator, processData, ProcessDataMapping} from "#root/src/helpers/DBHelpers.js";
import {UpsertResult} from "mariadb";
import {ValidationRule, validator, ValidatorResult} from "#root/src/utilities/Validator.js";
import ExcelJS from 'exceljs3';
import {
	Category,
	Subcategory,
	Currency,
	CategoryKeys,
	SubcategoryKeys,
	CurrencyKeys,
	QueryTypeKeys, QueryType
} from "#root/src/types.js";
import stream from "node:stream";

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

//TODO: Get the latest stock list from HKEX: https://www.hkex.com.hk/eng/services/trading/securities/securitieslists/ListOfSecurities.xlsx
// then parse the file: skip the first 2 lines, use 3rd line as header
// have a mapping of the headers, filter out non-(equity, exchange_traded_products, reit) and map it to create a dataset for Stock Data
// ^ if can chunk the above then best to try in chunks
//   check chunk against db and if match with an active one then make it not active and insert the new one and make it active
//   if no found, just insert new one and make it active
// Consider splitting to its own file later
// Worksheet Cols:
// 1: Stock Code
// 2: Name of Securities
// 3: Category
// 4: Sub-Category
// 5: Board Lot
// 7: ISIN
// 21: Currency

const hkexStockMapping = {
	"ticker_no": {
		"hkex": 1,
		"internal": "ticker_no"
	},
	"name": {
		"hkex": 2,
		"internal": "name",
	},
	"category": {
		"hkex": 3,
		"internal": "category",
	},
	"subcategory": {
		"hkex": 4,
		"internal": "subcategory",
	},
	"board_lot": {
		"hkex": 5,
		"internal": "board_lot",
	},
	"ISIN": {
		"hkex": 6,
		"internal": "ISIN",
	},
	"currency": {
		"hkex": 17,
		"internal": "currency",
	}
}

const subcategoryMapping = {
	'Equity Securities (GEM)': 'equity_securities_gem',
	'Equity Securities (Main Board)': 'equity_securities_main',
	'Exchange Traded Funds': 'etf',
	'Investment Companies': 'investment_companies',
	'Leveraged and Inverse': 'leveraged_and_inverse',
	'Trading Only Securities': 'trading_only_securities',
	'Depositary Receipts': 'depository_receipts',
	'Other Unit Trusts/Mutual Funds': 'others'
}

const categoryMapping = {
	'Equity': 'equity',
	'Real Estate Investment Trusts': 'reit',
	'Exchange Traded Products': 'exchange_traded_products',
	'Debt Securities': 'debt_securities',
	'Equity Warrants (Main Board)': 'equity_warrants',
	'Derivative Warrants': 'derivative_warrants',
	'Callable Bull/Bear Contracts': 'bull_bear_contracts'
}

const retrieveStockDataFromSource = async () => {

	// const url = '/home/pikachu/Documents/Data/Exchange Data/2026ListOfSecurities.xlsx';
	const url = 'https://www.hkex.com.hk/eng/services/trading/securities/securitieslists/ListOfSecurities.xlsx';
	const workbook = new ExcelJS.Workbook();

	try {

		const response = await fetch(url, {
			method: 'GET',
		});

		if (!response.ok) throw new Error('Failed to retrieve latest Stock Data');
		if (!response.body) throw new Error ('Body is null when attempting to access latest Stock Data');

		await workbook.xlsx.read(stream.Readable.fromWeb(response.body));
		// await workbook.xlsx.readFile(url);

		console.log('read workbook');

		const worksheet = workbook.getWorksheet();
		console.log('got worksheet');

		if (!worksheet) return;
		console.log('got worksheet');

		const newStocksMap: Map<string, Stock> = new Map<string, Stock>();

		worksheet.eachRow({includeEmpty: false}, (row, rowNumber) => {

			if (rowNumber < 4) return;
			if (!['Equity', 'Exchange Traded Products', 'Real Estate Investment Trusts'].includes(row.getCell(3).value as string)) return;

			const stock: Stock = new Stock('INSERT');
			stock.ticker_no = (row.getCell(hkexStockMapping.ticker_no.hkex).value as string).padStart(5, '0');
			stock.name = row.getCell(hkexStockMapping.name.hkex).value as string;
			stock.category = categoryMapping[row.getCell(hkexStockMapping.category.hkex).value as keyof typeof categoryMapping];
			stock.subcategory = subcategoryMapping[row.getCell(hkexStockMapping.subcategory.hkex).value as keyof typeof subcategoryMapping];
			stock.board_lot = Number((row.getCell(hkexStockMapping.board_lot.hkex).value ?? '0').toString().replaceAll(',', '')) as number;
			stock.ISIN = row.getCell(hkexStockMapping.ISIN.hkex).value as string;
			stock.currency = row.getCell(hkexStockMapping.currency.hkex).value as CurrencyKeys;
			stock.is_active = true;

			newStocksMap.set(stock.ticker_no, stock);
		});

		console.log(newStocksMap.size);

		const activeStocks: Stock[] = await executeQuery<Stock[]>({
			sql: `SELECT * FROM Stocks WHERE ticker_no IN (?) AND is_active = TRUE`,
		},
			[[...newStocksMap.keys()]],
			(result: any): Stock[] => result.map((element: any) => new Stock('', element))
		);

		const nonActiveStocks: Stock[] = await executeQuery<Stock[]>({
			sql: `SELECT * FROM Stocks WHERE ticker_no NOT IN (?) AND is_active = TRUE`,
		},
			[[...newStocksMap.keys()]],
			(result: any): Stock[] => result.map((element: any) => new Stock('', element))
		);

		const stocksToUpdate: Stock[] = [];
		const dbMap: Map<string, Stock> = new Map<string, Stock>();
		activeStocks.forEach((dbStock: Stock) => {

			dbMap.set(dbStock.ticker_no, dbStock);
		});

		for (let newStock of newStocksMap.values()) {

			//new
			if (!dbMap.has(newStock.ticker_no)) {
				stocksToUpdate.push(newStock);
				continue;
			}

			const dbStock = dbMap.get(newStock.ticker_no);

			if (!dbStock) continue;

			//name is the same but other details maybe need to update
			if (dbStock.name === newStock.name) {

				if (dbStock.board_lot === newStock.board_lot && dbStock.ISIN === newStock.ISIN) continue;

				dbStock.board_lot = newStock.board_lot;
				dbStock.ISIN = newStock.ISIN;
				stocksToUpdate.push(dbStock);
				continue;
			}

			//old stock is inactive
			dbStock.is_active = false;

			stocksToUpdate.push(dbStock);
			stocksToUpdate.push(newStock);
		}

		nonActiveStocks.forEach(stock => {

			// console.log(stock);
			stock.is_active = false;
			stocksToUpdate.push(stock);
		});

		console.log(stocksToUpdate);
		const updateTickerResults = await executeBatch({
			namedPlaceholders: true,
			sql: 'INSERT INTO Tickers (ticker_no, created_datetime, last_modified_datetime) ' +
				'VALUES (:ticker_no, :created_datetime, :last_modified_datetime) ' +
				'ON DUPLICATE KEY UPDATE last_modified_datetime=VALUES(last_modified_datetime)'
		},
			() => [...newStocksMap.values()].map((element) => ({
				ticker_no: element.ticker_no,
				created_datetime: element.created_datetime,
				last_modified_datetime: element.last_modified_datetime,
			})));

		const updateResults = await executeBatch({
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
			() => stocksToUpdate.map(stock => stock.getPlainObject())
		);
	} catch (e) {

		console.error(e);
	}
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