import db from '#root/src/db/db.js';
import Stock from '#root/src/models/Stock.js';
import {DuplicateFoundError} from "#root/src/errors/Errors.js";
import {filterClauseGenerator} from "#root/src/helpers/DBHelpers.js";

const columnInsertionOrder = [
	'code',
	'name',
	'full_name',
	'description',
	'category',
	'subcategory',
	'board_lot',
	'ISIN',
	'currency'
]

const fieldMapping = [
	{
		param: 'code',
		field: 'code',
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

const getStocksData = async (args) => {

	let conn;
	let result = [];
	//TODO: Determine if can make function of it
	//Maybe need to have column mapping to avoid exposure?
	let whereString = `WHERE ${filterClauseGenerator(fieldMapping, args)}`;

	try {

		conn = await db.pool.getConnection();

		await conn.beginTransaction();

		result = await conn.query({
			namedPlaceholders: true,
			sql: `SELECT * FROM Stock ${whereString}`,
		}, {
			code: `%${args.code}%`,
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

const postStockData = async (data) => {

	let result = [];
	let conn;
	//TODO: put complete the insert and handle response
	console.log(data.map(item => processStockData(item, columnInsertionOrder)))
	const dataIds = data.map(d => d.code);
	try {

		conn = await db.pool.getConnection();

		await conn.beginTransaction();

		const existingRecords = await conn.query("SELECT code, name FROM Stock WHERE code IN (?)", [dataIds]);

		if (existingRecords.length > 0) {

			const existingCodes = existingRecords.map(d => d.code);

			throw new DuplicateFoundError(`Stocks with ids ( ${existingCodes.join(', ')} ) already exist!`);
		}

		result = await conn.batch({
			namedPlaceholders: true,
			sql: 'INSERT INTO Stock ' +
					'(code, name, full_name, description, category, subcategory, board_lot, ISIN, currency, created_datetime, last_modified_datetime) ' +
				'VALUES (:code, :name, :full_name, :description, :category, :subcategory, :board_lot, :ISIN, :currency, :created_datetime, :last_modified_datetime)'
			},
			data.map(item => processStockData(item, columnInsertionOrder))
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

const getStockData = async (code) => {

	let conn;
	let result = [];

	try {

		conn = await db.pool.getConnection();

		await conn.beginTransaction();

		result = await conn.query({
			namedPlaceholders: true,
			sql: `SELECT * FROM Stock WHERE code = :code`
		}, {
			code: code
		});
	} catch (err) {

		if (conn) await conn.rollback();

		throw err;

	} finally {

		if (conn) await conn.end();
	}

	return result;
}

const putStockData = async (data) => {

	let result = [];
	let conn;

	try {

		conn = await db.pool.getConnection();

		await conn.beginTransaction();

		result = await conn.query({
			namedPlaceholders: true,
			sql: 'INSERT INTO Stock ' +
					'(code, name, full_name, description, category, subcategory, board_lot, ISIN, currency, created_datetime, last_modified_datetime) ' +
				'VALUES (:code, :name, :full_name, :description, :category, :subcategory, :board_lot, :ISIN, :currency, :created_datetime, :last_modified_datetime) ' +
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

		//await conn.commit();
	} catch (err) {

		if (conn) await conn.rollback();

		throw err;
	} finally {

		if (conn) await conn.end();
	}

	return result;
}

const deleteStockData = async (code) => {

	let conn;
	let result = [];

	try {

		conn = await db.pool.getConnection();

		await conn.beginTransaction();

		result = await conn.query({
			namedPlaceholders: true,
			sql: `DELETE FROM Stock WHERE code = :code`
		}, {
			code: code
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

//TODO: convert to using named placeholders like Short Data
const processStockData = (data, columnOrder) => {

	let stock = new Stock('INSERT');
	columnOrder.forEach(column => stock[column] = data[column]);

	// console.log(stock);
	return stock;
}

export {
	getStocksData,
	postStockData,
	getStockData,
	putStockData,
	deleteStockData
}