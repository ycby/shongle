import db from '#root/src/db/db.js'
import {filterClauseGenerator} from "#root/src/helpers/DBHelpers.js";
import {DuplicateFoundError, RecordNotFoundError} from "#root/src/errors/Errors.js";
import ShortData from "#root/src/models/ShortData.js";

const columnInsertionOrder = [
	{
		field: 'id'
	},
	{
		field: 'stock_code',
		transform: (stockCode) => {
			switch (typeof stockCode) {
				case 'number' :
					return stockCode.toString().padStart(5, '0');
				case 'string' :
					return stockCode.padStart(5, '0');
				default:
					throw new Error('Unexpected Stock Code type')
			}
		}
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

const fieldMapping = [
	{
		param: 'stock_code',
		field: 'stock_code',
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

const getShortData = async (args) => {

	//TODO: if stockCode is invalid/does not exist, return error

	let conn;
	let result = [];

	const whereString = filterClauseGenerator(fieldMapping, args);

	try {
		conn = await db.pool.getConnection();
		
		await conn.beginTransaction();

		result = await conn.query({
			namedPlaceholders: true,
			sql: `SELECT * FROM Short_Reporting WHERE ${whereString !== '' ? whereString : ''} ORDER BY reporting_date DESC`
		}, {
			stock_code: args.stock_code,
			start_date: args.start_date,
			end_date: args.end_date,
		});

	} catch (err) {

		if (conn) await conn.rollback();

		throw err;

	} finally {

		if (conn) await conn.end();
	}

	return result;
}

const postShortData = async (data) => {

	//TODO: if stockCode is invalid/does not exist, return error

	let conn;
	let result = [];
	console.log(data);

	const dataIds = data.map(d => d.stock_code);

	data.forEach(d => {d.reporting_date = new Date(d.reporting_date);})

	try {
		conn = await db.pool.getConnection();

		await conn.beginTransaction();

		const existingRecords = await conn.query({
			namedPlaceholders: true,
			sql: "SELECT code, name FROM Stock WHERE code IN (:codes)"
		}, {
			codes: [dataIds]
		});

		if (existingRecords.length === 0) {

			const existingCodes = existingRecords.map(d => d.code);

			throw new RecordNotFoundError(`Stocks with ids ( ${existingCodes.join(', ')} ) do not exist!`);
		}

		result = await conn.batch({
			namedPlaceholders: true,
			sql: 'INSERT INTO Short_Reporting ' +
				'(stock_code, reporting_date, shorted_shares, shorted_amount, created_datetime, last_modified_datetime) ' +
				'VALUES (:stock_code, :reporting_date, :shorted_shares, :shorted_amount, :created_datetime, :last_modified_datetime)'
		},
			data.map(item => processShortData(item, columnInsertionOrder))
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

const getShortDatum = async (id) => {

	//TODO: if stockCode is invalid/does not exist, return error

	let conn;
	let result = [];

	try {
		conn = await db.pool.getConnection();

		await conn.beginTransaction();

		result = await conn.query({
			namedPlaceholders: true,
			sql: `SELECT * FROM Short_Reporting WHERE id = :id`
		}, {
			id: id
		});
		console.log(result)

	} catch (err) {

		if (conn) await conn.rollback();

		throw err;

	} finally {

		if (conn) await conn.end();
	}

	return result;
}

const putShortDatum = async (data) => {

	//TODO: if stockCode is invalid/does not exist, return error

	let conn;
	let result = [];

	try {
		conn = await db.pool.getConnection();

		await conn.beginTransaction();

		result = await conn.query({
			namedPlaceholders: true,
			sql: 'INSERT INTO Short_Reporting ' +
				'(id, stock_code, reporting_date, shorted_shares, shorted_amount, created_datetime, last_modified_datetime) ' +
				'VALUES (:id, :stock_code, :reporting_date, :shorted_shares, :shorted_amount, :created_datetime, :last_modified_datetime) ' +
				'ON DUPLICATE KEY UPDATE ' +
				'stock_code=VALUES(stock_code), ' +
				'reporting_date=VALUES(reporting_date), ' +
				'shorted_shares=VALUES(shorted_shares), ' +
				'shorted_amount=VALUES(shorted_amount), ' +
				'last_modified_datetime=VALUES(last_modified_datetime)'
			},
			processShortData(data, columnInsertionOrder)
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

const deleteShortDatum = async (id) => {

	let conn;
	let result = [];

	try {
		conn = await db.pool.getConnection();

		await conn.beginTransaction();

		result = await conn.query({
			namedPlaceholders: true,
			sql: `DELETE FROM Short_Reporting WHERE id = :id`,
		}, {
			id: id
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

const processShortData = (data, columnOrder) => {

	let shortData = new ShortData('INSERT');
	columnOrder.forEach(column => {
		shortData[column.field] = column.transform ? column.transform(data[column.field]) : data[column.field];
	});

	return shortData;
}

export {
	getShortData,
	postShortData,
	getShortDatum,
	putShortDatum,
	deleteShortDatum
}