import db from '#root/src/db/db.ts';
import Stock from '#root/src/models/Stock.ts';
import {DuplicateFoundError} from "#root/src/errors/Errors.js";
import {FieldMapping, filterClauseGenerator, processData, ProcessDataMapping} from "#root/src/helpers/DBHelpers.ts";
import {UpsertResult} from "mariadb";

type StocksDataGetParam = {
	ticker_no: string;
	name: string;
	ISIN: string;
}

type StocksDataBody = {
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

type StocksDataGetSingleParam = {
	ticker_no: string;
}

const columnInsertionOrder: ProcessDataMapping[] = [
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

const getStocksData = async (args: StocksDataGetParam) => {

	let conn;
	let result: Stock[] = [];

	const filterClause: string = filterClauseGenerator(fieldMapping, args);

	let whereString: string = filterClause !== '' ? 'WHERE ' + filterClause : '';

	try {

		conn = await db.pool.getConnection();

		await conn.beginTransaction();

		result = await conn.query({
			namedPlaceholders: true,
			sql: `SELECT * FROM Stocks ${whereString}`,
		}, {
			ticker_no: `%${args.ticker_no}%`,
			name: `%${args.name}%`,
			ISIN: `%${args.ISIN}%`
		});

	} catch (err) {

		if (conn) await conn.rollback();

		throw err;

	} finally {

		if (conn) await conn.end();
	}

	return result;
}

const postStockData = async (data: StocksDataBody[]) => {

	let result: UpsertResult[] = [];
	let conn;

	const dataIds: string[] = data.map((d: StocksDataBody): string => d.ticker_no);
	try {

		conn = await db.pool.getConnection();

		await conn.beginTransaction();

		const existingRecords: Stock[] = await conn.query("SELECT id, ticker_no, name FROM Stock WHERE ticker_no IN (?)", [dataIds]);

		if (existingRecords.length > 0) {

			const existingCodes: string[] = existingRecords.map((d: Stock): string => d.ticker_no);

			throw new DuplicateFoundError(`Stocks with ids ( ${existingCodes.join(', ')} ) already exist!`);
		}

		result = await conn.batch({
			namedPlaceholders: true,
			sql: 'INSERT INTO Stocks ' +
					'(ticker_no, name, full_name, description, category, subcategory, board_lot, ISIN, currency, created_datetime, last_modified_datetime) ' +
				'VALUES (:ticker_no, :name, :full_name, :description, :category, :subcategory, :board_lot, :ISIN, :currency, :created_datetime, :last_modified_datetime)'
			},
			data.map((item: StocksDataBody): Stock => processStockData(item, columnInsertionOrder))
		)

		await conn.commit();
	} catch (err) {

		if (conn) await conn.rollback();

		throw err;
	} finally {

		if (conn) await conn.end();
	}

	return result;
}

const getStockData = async (args: StocksDataGetSingleParam) => {

	const ticker_no = args.ticker_no;

	let conn;
	let result: Stock[] = [];

	try {

		conn = await db.pool.getConnection();

		await conn.beginTransaction();

		result = await conn.query({
			namedPlaceholders: true,
			sql: `SELECT * FROM Stocks WHERE ticker_no = :ticker_no`
		}, {
			ticker_no: ticker_no
		});
	} catch (err) {

		if (conn) await conn.rollback();

		throw err;

	} finally {

		if (conn) await conn.end();
	}

	return result;
}

const putStockData = async (data: StocksDataBody) => {

	let result: UpsertResult[] = [];
	let conn;

	try {

		conn = await db.pool.getConnection();

		await conn.beginTransaction();

		result = await conn.query({
			namedPlaceholders: true,
			sql: 'INSERT INTO Stocks ' +
					'(ticker_no, name, full_name, description, category, subcategory, board_lot, ISIN, currency, created_datetime, last_modified_datetime) ' +
				'VALUES (:ticker_no, :name, :full_name, :description, :category, :subcategory, :board_lot, :ISIN, :currency, :created_datetime, :last_modified_datetime) ' +
				'ON DUPLICATE KEY UPDATE ' +
				'name=VALUES(name), ' +
				'full_name=VALUES(full_name), ' +
				'description=VALUES(description), ' +
				'category=VALUES(category), ' +
				'subcategory=VALUES(subcategory), ' +
				'board_lot=VALUES(board_lot), ' +
				'ISIN=VALUES(ISIN), ' +
				'currency=VALUES(currency), ' +
				'last_modified_datetime=VALUES(last_modified_datetime)'
			},
			processStockData(data, columnInsertionOrder)
		)

		await conn.commit();
	} catch (err) {

		if (conn) await conn.rollback();

		throw err;
	} finally {

		if (conn) await conn.end();
	}

	return result;
}

const deleteStockData = async (args: StocksDataGetSingleParam) => {

	const ticker_no = args.ticker_no;

	let conn;
	let result: UpsertResult[] = [];

	try {

		conn = await db.pool.getConnection();

		await conn.beginTransaction();

		result = await conn.query({
			namedPlaceholders: true,
			sql: `DELETE FROM Stocks WHERE ticker_no = :ticker_no`
		}, {
			ticker_no: ticker_no
		});

		await conn.commit();

	} catch (err) {

		if (conn) await conn.rollback();

		throw err;

	} finally {

		if (conn) await conn.end();
	}

	return result;
}

const processStockData: (data: StocksDataBody, columns: ProcessDataMapping[]) => Stock = (data: StocksDataBody, columns: ProcessDataMapping[]): Stock => {

	let stock: Stock = new Stock('INSERT');

	return processData(data, columns, stock);
}

export {
	getStocksData,
	postStockData,
	getStockData,
	putStockData,
	deleteStockData
}