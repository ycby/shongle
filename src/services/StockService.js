import db from '#root/src/db/db.js';
import Stock from '#root/src/objectModels/Stock.js';
import {SqlError} from "mariadb";

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
	try {

		conn = await db.pool.getConnection();

		await conn.beginTransaction();

		result = await conn.batch(
			'INSERT INTO Stock ' +
			'(code, name, full_name, description, category, subcategory, board_lot, ISIN, currency, created_datetime, last_modified_datetime) ' +
			'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
			data.map(item => processStockData(item, columnInsertionOrder))
		)
	} catch (err) {

		if (err instanceof SqlError) console.log('I am a sql error')
		console.error(`Error: ${err}`)

		if (conn) await conn.rollback();
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