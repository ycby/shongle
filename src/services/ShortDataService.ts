import db from '#root/src/db/db.ts'
import {FieldMapping, filterClauseGenerator, processData, ProcessDataMapping} from "#root/src/helpers/DBHelpers.ts";
import {RecordNotFoundError} from "#root/src/errors/Errors.ts";
import ShortData from "#root/src/models/ShortData.ts";
import Stock from "#root/src/models/Stock.ts";
import {retrieveShortData} from "#root/src/helpers/ShortDataRetriever.ts";
import {UpsertResult} from "mariadb";

type ShortDataGetParam = {
	ticker_no: string;
	start_date: Date;
	end_date: Date;
}

export type ShortDataBody = {
	id?: number;
	stock_id: number;
	reporting_date: Date;
	shorted_shares: number;
	shorted_amount: number;
}

const columnInsertionOrder: ProcessDataMapping[] = [
	{
		field: 'id'
	},
	{
		field: 'stock_id',
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

const fieldMapping: FieldMapping[] = [
	{
		param: 'ticker_no',
		field: 'ticker_no',
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

const getShortData = async (args: ShortDataGetParam) => {

	//TODO: if stockCode is invalid/does not exist, return error

	let conn;
	let result = [];

	const whereString = filterClauseGenerator(fieldMapping, args);

	try {
		conn = await db.pool.getConnection();
		
		await conn.beginTransaction();

		//TODO: change to view
		result = await conn.query({
			namedPlaceholders: true,
			sql: `SELECT * FROM Short_Reporting_w_Stocks WHERE ${whereString !== '' ? whereString : ''} ORDER BY reporting_date DESC`
		}, {
			ticker_no: args.ticker_no,
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

const postShortData = async (data: ShortDataBody[]) => {

	//TODO: if stockCode is invalid/does not exist, return error

	let conn;
	let result: UpsertResult[] = [];
	console.log(data);

	const dataIds = data.map(d => d.stock_id);

	data.forEach(d => {d.reporting_date = new Date(d.reporting_date);})

	try {
		conn = await db.pool.getConnection();

		await conn.beginTransaction();

		const existingRecords = await conn.query({
			namedPlaceholders: true,
			sql: "SELECT id, ticker_no, name FROM Stocks WHERE id IN (:stock_ids)"
		}, {
			stock_ids: [dataIds]
		});

		if (existingRecords.length === 0) {

			const existingCodes = existingRecords.map((d: Stock) => d.ticker_no);

			throw new RecordNotFoundError(`Stocks with ids ( ${existingCodes.join(', ')} ) do not exist!`);
		}

		//use existing records to set stock_id
		result = await conn.batch({
			namedPlaceholders: true,
			sql: 'INSERT INTO Short_Reporting ' +
				'(stock_id, reporting_date, shorted_shares, shorted_amount, created_datetime, last_modified_datetime) ' +
				'VALUES (:stock_id, :reporting_date, :shorted_shares, :shorted_amount, :created_datetime, :last_modified_datetime)'
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

const getShortDatum = async (id: number) => {

	//TODO: if stockCode is invalid/does not exist, return error

	let conn;
	let result = [];

	try {
		conn = await db.pool.getConnection();

		await conn.beginTransaction();

		result = await conn.query({
			namedPlaceholders: true,
			sql: `SELECT * FROM Short_Reporting_w_Stocks WHERE id = :id`
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

const putShortDatum = async (data: ShortDataBody) => {

	//TODO: if stockCode is invalid/does not exist, return error

	let conn;
	let result = [];

	try {
		conn = await db.pool.getConnection();

		await conn.beginTransaction();

		result = await conn.query({
			namedPlaceholders: true,
			sql: 'INSERT INTO Short_Reporting ' +
				'(id, stock_id, reporting_date, shorted_shares, shorted_amount, created_datetime, last_modified_datetime) ' +
				'VALUES (:id, :stock_id, :reporting_date, :shorted_shares, :shorted_amount, :created_datetime, :last_modified_datetime) ' +
				'ON DUPLICATE KEY UPDATE ' +
				'stock_id=VALUES(stock_id), ' +
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

const deleteShortDatum = async (id: number) => {

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

const retrieveShortDataFromSource = async (endDate: Date) => {
	console.log('Inside Retrieve Short Data From Source')

	//Step 1: get the last date which was imported
	//Step 2: loop over each date from the last date to today and insert records as appropriate
	//Step 2.1: use settimeout to wait for 1 minute before doing the next call = https://stackoverflow.com/questions/23316525/nodejs-wait-in-a-loop
	let conn;
	let result;

	try {

		conn = await db.pool.getConnection();

		await conn.beginTransaction();

		result = await conn.query({
			sql: `SELECT id, reporting_date FROM Short_Reporting ORDER BY reporting_date DESC LIMIT 1`
		});

		// console.log(result[0].reporting_date);
	} catch (err) {

		if (conn) await conn.rollback();

		throw err;
	} finally {

		if (conn) await conn.end();
	}

	const finalDate = endDate === null ? new Date() : endDate;
	let latestDate = result[0].reporting_date;

	while(latestDate < finalDate) {

		latestDate.setDate(latestDate.getDate() + 1);

		retrieveShortData(latestDate, postShortData);

		await wait(10000);
	}
}

const processShortData = (data: ShortDataBody, columns: ProcessDataMapping[]) => {

	let shortData = new ShortData('INSERT');

	return processData(data, columns, shortData);
}

const wait = (milliseconds: number) => {

	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export {
	getShortData,
	postShortData,
	getShortDatum,
	putShortDatum,
	deleteShortDatum,
	retrieveShortDataFromSource
}