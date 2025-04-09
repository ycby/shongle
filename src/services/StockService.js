import db from '#root/src/db/db.js';
import Stock from '#root/src/models/Stock.js';
import {SqlError} from "mariadb";
import {DuplicateFoundError} from "#root/src/errors/Errors.js";

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

const getStockData = async (args) => {

	let conn;
	let result = [];

	try {

		conn = await db.pool.getConnection();

		await conn.beginTransaction();

		result = await conn.query({
			namedPlaceholders: true,
			sql: `SELECT * FROM Stock`
		});
	} catch (err) {

		if (conn) await conn.rollback();

	} finally {

		if (conn) await conn.end();
	}

	return result;
}

const postStockData = async (data) => {

	let result = [];
	let conn;
	//TODO: put complete the insert and handle response

	const dataIds = data.map(d => d.code);
	try {

		conn = await db.pool.getConnection();

		await conn.beginTransaction();

		const existingRecords = await conn.query("SELECT code, name FROM Stock WHERE code IN (?)", [dataIds]);

		if (existingRecords.length > 0) {

			const existingCodes = existingRecords.map(d => d.code);

			throw new DuplicateFoundError(`Stocks with ids ( ${existingCodes.join(', ')} ) already exist!`);
		}

		result = await conn.batch(
			'INSERT INTO Stock ' +
			'(code, name, full_name, description, category, subcategory, board_lot, ISIN, currency, created_datetime, last_modified_datetime) ' +
			'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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

const processStockData = (data, columnOrder) => {

	let result = [];

	let stock = new Stock('INSERT');
	columnOrder.forEach(column => stock[column] = data[column]);

	result.push(...stock.getFields());
	console.log(result);
	return result;
}

export {
	getStockData,
	postStockData
}

// export default async (req, res) => {
//
// 	const stockQuery = `SELECT * FROM Stock`
//
// 	let conn
//
// 	try {
//
// 		conn = await db.pool.getConnection()
//
// 		await conn.beginTransaction()
//
// 		const result = await conn.query(stockQuery)
//
// 		res.setHeader('content-type', 'application/json').send(result)
// 	} catch (err) {
//
// 		if (conn) await conn.rollback();
//
// 		res.status(500).send('The spaghetti has been spilled')
// 	} finally {
//
// 		if (conn) conn.end()
// 	}
// }