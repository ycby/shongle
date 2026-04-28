import {DBCallType, executeBatch, executeOrchestration, executeQuery, UpsertResult} from '#root/src/db/db.js';
import Stock from '#root/src/models/Stock.js';
import {DuplicateFoundError, InvalidRequestError} from "#root/src/errors/Errors.js";
import {
	FieldMapping,
	filterClauseGenerator
} from "#root/src/helpers/DBHelpers.js";
import {validate, ValidatorResult} from "#root/src/utilities/Validator.js";
import {
	QueryTypeKeys, QueryType, PaginationParams, PaginationResponse
} from "#root/src/types.js";
import {retrieveStockData} from "#root/src/helpers/StocksLatestRetriever/StocksLatestRetriever.js";
import {
	STOCK_PARAM_VALIDATION,
	STOCK_DATA_VALIDATION,
	STOCK_PARAM_GET_VALIDATION,
	STOCK_PARAM_DELETE_VALIDATION,
	POTENTIAL_DUPLICATE_QUERY_VALIDATION, MERGE_DUPLICATE_VALIDATION
} from "#root/src/validation/VRule_Stock.js";
import {RecordsWithRowCount} from "#root/src/services/types.js";

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
	id: string;
}

export type MergeStockBody = {
	survivor: Stock;
	rejects: Stock[];
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
		}, (stock) => Stock.fromDB(stock));

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
			data.map((item: StocksDataBody): Stock => Stock.fromAPI(item).toDB())
		);

	} catch (err) {

		throw err;
	}

	return result;
}

const getStockData = async (args: StocksDataGetParam) => {

	let validationResult: ValidatorResult[] = validate(args, STOCK_PARAM_GET_VALIDATION);

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
			(stock) => Stock.fromDB(stock));
	} catch (err) {

		throw err;
	}

	return result;
}

const putStockData = async (data: StocksDataBody[]) => {

	let validationResult: ValidatorResult[] = validate(data, STOCK_DATA_VALIDATION);

	if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

	let result: UpsertResult[] = [];

	try {

		result = await executeBatch({
			sql: 'INSERT INTO Stocks ' +
				'(id, ticker_no, name, full_name, description, category, subcategory, board_lot, ISIN, currency, is_active, created_datetime, last_modified_datetime) ' +
				'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ' +
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
			data.map(element => {

				const result = Stock.fromAPI(element);
				return [
					result.id,
					result.ticker_no,
					result.name,
					result.full_name,
					result.description,
					result.category,
					result.subcategory,
					result.board_lot,
					result.ISIN,
					result.currency,
					result.is_active,
					result.created_datetime,
					result.last_modified_datetime
				];
			})
		)

	} catch (err) {

		throw err;
	}

	return result;
}

const deleteStockData = async (args: StocksTrackParam) => {

	let validationResult: ValidatorResult[] = validate(args, STOCK_PARAM_DELETE_VALIDATION);

	if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

	const id = args.id;

	try {

		await executeQuery({
			namedPlaceholders: true,
			sql: `DELETE FROM Stocks WHERE id = :id`
		}, {
			id: id
		});

	} catch (err) {

		throw err;
	}

	//assume no error or else will throw error
	return {
		ticker_no: id,
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

	// const url = '/home/pikachu/Documents/Data/Exchange Data/2026ListOfSecurities.xlsx';
	const url = process.env.STOCK_DATA_RETRIEVAL_URL ?? '';

	retrieveStockData(url);
}

//identify the potential duplicates and then in the same transaction, grab the children too
const getPotentialDuplicates = async (args: PaginationParams): Promise<PaginationResponse> => {

	let validationResults: ValidatorResult[] = validate(args, POTENTIAL_DUPLICATE_QUERY_VALIDATION);

	if (validationResults.length > 0) throw new InvalidRequestError(validationResults);

	args.limit = args.limit ? args.limit : 10;
	args.offset = args.offset ? args.offset : 0;

	const response: PaginationResponse = {
		total_rows: 0n,
		data: new Map(),
		offset: Number(args.offset),
		limit: Number(args.limit),
	}

	try {

		const duplicatedISINs = await executeQuery<RecordsWithRowCount & {ISIN: string}>({
			namedPlaceholders: true,
			sql: `SELECT ISIN, COUNT(*) OVER() AS total_rows FROM Stocks_w_Same_ISIN LIMIT :limit OFFSET :offset`
		}, {
			limit: Number(args.limit),
			offset: Number(args.offset),
		});

		response.total_rows = duplicatedISINs.length > 0 ? duplicatedISINs[0].total_rows : 0n;

		const duplicatedStocks = await executeQuery<Stock>({
			namedPlaceholders: true,
			sql: `SELECT id, name, full_name, description, category, subcategory, board_lot, ISIN, currency, is_active, is_tracked, created_datetime, last_modified_datetime FROM Stocks WHERE ISIN IN (:isins) ORDER BY created_datetime DESC`
		}, {
			isins: duplicatedISINs.map((element) => element.ISIN)
		}, (element) => Stock.fromDB(element));

		response.data = Object.fromEntries(duplicatedStocks.reduce((map, element) => {

			if (!map.has(element.ISIN)) {

				map.set(element.ISIN, []);
			}

			map.get(element.ISIN).push(element);
			return map;
		}, response.data));

	} catch (err) {

		throw err;
	}

	return response;
}

const mergeStockDuplicates = async (args: MergeStockBody) => {

	let validationResults: ValidatorResult[] = validate(args, MERGE_DUPLICATE_VALIDATION);

	if (validationResults.length > 0) throw new InvalidRequestError(validationResults);

	const survivingStock = Stock.fromAPI(args.survivor);
	const rejectedStocks = args.rejects.map(element => Stock.fromAPI(element));

	const rejectedStockIds = rejectedStocks.map(s => s.id);

	let result = false;
	try {

		//TODO: raise an issue with mariadb connector?
		result = await executeOrchestration([
			{
				type: DBCallType.BATCH,
				queryOptions: {
					sql: `
						UPDATE Stock_Transactions st
						SET stock_id = ?
						WHERE stock_id IN (${rejectedStockIds.map(() => '?').join(',')})
					`,
				},
				data: [
					survivingStock.id,
					...rejectedStockIds
				]
			},
			{
				type: DBCallType.BATCH,
				queryOptions: {
					sql: `
						UPDATE Short_Reporting sr
						SET stock_id = ?
						WHERE stock_id IN (${rejectedStockIds.map(() => '?').join(',')})
					`
				},
				data: [
					survivingStock.id,
					...rejectedStockIds
				]
			},
			{
				type: DBCallType.BATCH,
				queryOptions: {
					sql: `
						UPDATE Stocks 
						SET merged_id = ?
						WHERE id IN (${rejectedStockIds.map(() => '?').join(',')})
					`
				},
				data: [
					survivingStock.id,
					...rejectedStockIds
				]
			},
			{
				type: DBCallType.QUERY,
				queryOptions: {
					namedPlaceholders: true,
					sql: `
						UPDATE Stocks s
						SET name = :name,
						    full_name = :full_name,
						    description = :description,
						    category = :category,
						    subcategory = :subcategory,
						    board_lot = :board_lot,
						    currency = :currency,
						    is_active = :is_active,
						    is_tracked = :is_tracked
						WHERE id = :id
					`
				},
				data: {
					id: survivingStock.id,
					name: survivingStock.name,
					full_name: survivingStock.full_name,
					description: survivingStock.description,
					category: survivingStock.category,
					subcategory: survivingStock.subcategory,
					board_lot: survivingStock.board_lot,
					currency: survivingStock.currency,
					is_active: survivingStock.is_active,
					is_tracked: survivingStock.is_tracked,
				}
			}
		]);
	} catch (err) {

		throw err;
	}

	return {
		status: result ? 'success' : 'failed'
	};
}

export {
	getStocksData,
	postStockData,
	getStockData,
	putStockData,
	deleteStockData,
	getTrackedStocks,
	setTrackStock,
	retrieveStockDataFromSource,
	getPotentialDuplicates,
	mergeStockDuplicates
}