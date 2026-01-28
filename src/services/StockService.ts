import {executeBatch, executeQuery} from '#root/src/db/db.js';
import Stock from '#root/src/models/Stock.js';
import {DuplicateFoundError, InvalidRequestError} from "#root/src/errors/Errors.js";
import {
	FieldMapping,
	filterClauseGenerator
} from "#root/src/helpers/DBHelpers.js";
import {UpsertResult} from "mariadb";
import {validate, ValidatorResult} from "#root/src/utilities/Validator.js";
import {
	QueryTypeKeys, QueryType
} from "#root/src/types.js";
import {retrieveStockData} from "#root/src/helpers/StocksLatestRetriever.js";
import {
	STOCK_PARAM_VALIDATION,
	STOCK_PARAM_SINGLE_VALIDATION,
	STOCK_DATA_VALIDATION
} from "#root/src/validation/VRule_Stock.js";

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

const getStocksData = async (args: StocksDataGetParam) => {

	let validationResult: ValidatorResult[] = validate(args, STOCK_PARAM_VALIDATION);
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

		result = await executeQuery<Stock>({
			namedPlaceholders: true,
			sql: `SELECT * FROM Stocks ${whereString}`,
		}, {
			ticker_no: `%${args.ticker_no}%`,
			name: `%${args.name}%`,
			ISIN: `%${args.ISIN}%`
		}, (stock) => new Stock(stock));

	} catch (err) {

		throw err;
	}

	return result;
}

const postStockData = async (data: StocksDataBody[]) => {

	let validationResult: ValidatorResult[] = validate(data, STOCK_DATA_VALIDATION);

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
			data.map((item: StocksDataBody): Stock => new Stock(item))
		);
		console.log(result);

	} catch (err) {

		throw err;
	}

	return result;
}

const getStockData = async (args: StocksDataGetParam) => {

	let validationResult: ValidatorResult[] = validate(args, STOCK_PARAM_SINGLE_VALIDATION);

	if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

	const ticker_no = args.ticker_no;

	let result: Stock[] = [];

	try {

		result = await executeQuery({
			namedPlaceholders: true,
			sql: `SELECT * FROM Stocks WHERE ticker_no = :ticker_no`
		}, {
			ticker_no: ticker_no
		},
			(stock) => new Stock(stock));
	} catch (err) {

		throw err;
	}

	return result;
}

const putStockData = async (data: StocksDataBody) => {

	let validationResult: ValidatorResult[] = validate(data, STOCK_DATA_VALIDATION);

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
			() => new Stock(data).getPlainObject()
		)

	} catch (err) {

		throw err;
	}

	return result;
}

const deleteStockData = async (args: StocksDataGetParam) => {

	let validationResult: ValidatorResult[] = validate(args, STOCK_PARAM_SINGLE_VALIDATION);

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