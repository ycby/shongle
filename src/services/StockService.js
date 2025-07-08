import db from '#root/src/db/db.js';
import Stock from '#root/src/models/Stock.js';
import { DuplicateFoundError } from "#root/src/errors/Errors.js";
import { filterClauseGenerator } from "#root/src/helpers/DBHelpers.js";
const columnInsertionOrder = [
    'ticker_no',
    'name',
    'full_name',
    'description',
    'category',
    'subcategory',
    'board_lot',
    'ISIN',
    'currency'
];
const fieldMapping = [
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
];
const getStocksData = async (args) => {
    let conn;
    let result = [];
    //TODO: Determine if can make function of it
    //Maybe need to have column mapping to avoid exposure?
    const filterClause = filterClauseGenerator(fieldMapping, args);
    let whereString = filterClause !== '' ? 'WHERE ' + filterClause : '';
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
    }
    catch (err) {
        if (conn)
            await conn.rollback();
        throw err;
    }
    finally {
        if (conn)
            await conn.end();
    }
    return result;
};
const postStockData = async (data) => {
    let result = [];
    let conn;
    //TODO: put complete the insert and handle response
    console.log(data.map(item => processStockData(item, columnInsertionOrder)));
    const dataIds = data.map(d => d.ticker_no);
    try {
        conn = await db.pool.getConnection();
        await conn.beginTransaction();
        const existingRecords = await conn.query("SELECT id, ticker_no, name FROM Stock WHERE ticker_no IN (?)", [dataIds]);
        if (existingRecords.length > 0) {
            const existingCodes = existingRecords.map(d => d.ticker_no);
            throw new DuplicateFoundError(`Stocks with ids ( ${existingCodes.join(', ')} ) already exist!`);
        }
        result = await conn.batch({
            namedPlaceholders: true,
            sql: 'INSERT INTO Stocks ' +
                '(ticker_no, name, full_name, description, category, subcategory, board_lot, ISIN, currency, created_datetime, last_modified_datetime) ' +
                'VALUES (:ticker_no, :name, :full_name, :description, :category, :subcategory, :board_lot, :ISIN, :currency, :created_datetime, :last_modified_datetime)'
        }, data.map(item => processStockData(item, columnInsertionOrder)));
        await conn.commit();
    }
    catch (err) {
        if (conn)
            await conn.rollback();
        throw err;
    }
    finally {
        if (conn)
            await conn.end();
    }
    return result;
};
const getStockData = async (ticker_no) => {
    let conn;
    let result = [];
    try {
        conn = await db.pool.getConnection();
        await conn.beginTransaction();
        result = await conn.query({
            namedPlaceholders: true,
            sql: `SELECT * FROM Stocks WHERE ticker_no = :ticker_no`
        }, {
            ticker_no: ticker_no
        });
    }
    catch (err) {
        if (conn)
            await conn.rollback();
        throw err;
    }
    finally {
        if (conn)
            await conn.end();
    }
    return result;
};
const putStockData = async (data) => {
    let result = [];
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
        }, processStockData(data, columnInsertionOrder));
        //await conn.commit();
    }
    catch (err) {
        if (conn)
            await conn.rollback();
        throw err;
    }
    finally {
        if (conn)
            await conn.end();
    }
    return result;
};
const deleteStockData = async (ticker_no) => {
    let conn;
    let result = [];
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
    }
    catch (err) {
        if (conn)
            await conn.rollback();
        throw err;
    }
    finally {
        if (conn)
            await conn.end();
    }
    return result;
};
//TODO: convert to using named placeholders like Short Data
const processStockData = (data, columnOrder) => {
    let stock = new Stock('INSERT');
    columnOrder.forEach(column => stock[column] = data[column]);
    return stock;
};
export { getStocksData, postStockData, getStockData, putStockData, deleteStockData };
