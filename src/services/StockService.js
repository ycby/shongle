import { executeBatch, executeQuery } from '#root/src/db/db.ts';
import Stock from '#root/src/models/Stock.ts';
import { DuplicateFoundError, InvalidRequestError } from "#root/src/errors/Errors.ts";
import { filterClauseGenerator, processData } from "#root/src/helpers/DBHelpers.ts";
import { validator } from "#root/src/utilities/Validator.ts";
import { Category, Subcategory, Currency, QueryType } from "#root/src/types.ts";
const STOCK_PARAM_VALIDATION = [
    {
        name: 'query_type',
        isRequired: false,
        rule: (query_type) => typeof query_type === 'string' && Object.values(QueryType).includes(query_type),
        errorMessage: 'Query Type is invalid. It must be either "AND" or "OR".'
    },
    {
        name: 'ticker_no',
        isRequired: false,
        rule: (ticker_no) => typeof ticker_no === 'string',
        errorMessage: 'Ticker No. is formatted incorrectly, it should be 5 characters long. E.g "00001"'
    },
    {
        name: 'name',
        isRequired: false,
        rule: (name) => typeof name === 'string',
        errorMessage: 'Name must be a string'
    },
    {
        name: 'ISIN',
        isRequired: false,
        rule: (ISIN) => typeof ISIN === 'string',
        errorMessage: 'ISIN must be a string'
    },
];
const STOCK_PARAM_SINGLE_VALIDATION = [
    {
        name: 'ticker_no',
        isRequired: true,
        rule: (ticker_no) => typeof ticker_no === 'string' && ticker_no.length === 5,
        errorMessage: 'Ticker No. is formatted incorrectly, it should be 5 characters long. E.g "00001"'
    }
];
const STOCK_DATA_VALIDATION = [
    {
        name: 'id',
        isRequired: false,
        rule: (id) => typeof id === 'number',
        errorMessage: 'Id must be a number'
    },
    {
        name: 'ticker_no',
        isRequired: false,
        rule: (ticker_no) => typeof ticker_no === 'string' && ticker_no.length === 5,
        errorMessage: 'Ticker No. is formatted incorrectly, it should be 5 characters long. E.g "00001"'
    },
    {
        name: 'name',
        isRequired: false,
        rule: (name) => typeof name === 'string',
        errorMessage: 'Name must be a string'
    },
    {
        name: 'full_name',
        isRequired: false,
        rule: (full_name) => typeof full_name === 'string',
        errorMessage: 'Full Name must be a string'
    },
    {
        name: 'description',
        isRequired: false,
        rule: (description) => typeof description === 'string',
        errorMessage: 'Description must be a string'
    },
    {
        name: 'category',
        isRequired: false,
        rule: (category) => typeof category === 'string' && Object.values(Category).includes(category),
        errorMessage: 'Category must be one of the following: ' + Object.values(Category).join(', '),
    },
    {
        name: 'subcategory',
        isRequired: false,
        rule: (subcategory) => typeof subcategory === 'string' && Object.values(Subcategory).includes(subcategory),
        errorMessage: 'Subcategory must be one of the following: ' + Object.values(Subcategory).join(', ')
    },
    {
        name: 'board_lot',
        isRequired: false,
        rule: (board_lot) => typeof board_lot === 'number',
        errorMessage: 'Board Lot must be a number'
    },
    {
        name: 'ISIN',
        isRequired: false,
        rule: (ISIN) => typeof ISIN === 'string',
        errorMessage: 'ISIN must be a string'
    },
    {
        name: 'currency',
        isRequired: false,
        rule: (currency) => typeof currency === 'string' && Object.values(Currency).includes(currency),
        errorMessage: 'Currency must be one of the following: ' + Object.values(Currency).join(', ')
    },
    {
        name: 'is_active',
        isRequired: false,
        rule: (isActive) => typeof isActive === 'boolean',
        errorMessage: 'Currency must be a boolean'
    },
];
const columnInsertionOrder = [
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
//TODO: Convert all db calls to use the new executeQuery and executeBatch functions
const getStocksData = async (args) => {
    console.log(args);
    let validationResult = validator(args, STOCK_PARAM_VALIDATION);
    console.log(validationResult);
    if (validationResult.length > 0)
        throw new InvalidRequestError(validationResult);
    let result = [];
    const queryParams = {
        name: args.name,
        ticker_no: args.ticker_no,
        ISIN: args.ISIN
    };
    const queryType = args.query_type ?? QueryType.AND;
    const filterClause = filterClauseGenerator(queryType, fieldMapping, queryParams);
    let whereString = filterClause !== '' ? 'WHERE ' + filterClause : '';
    try {
        result = await executeQuery({
            namedPlaceholders: true,
            sql: `SELECT * FROM Stocks ${whereString}`,
        }, {
            ticker_no: `%${args.ticker_no}%`,
            name: `%${args.name}%`,
            ISIN: `%${args.ISIN}%`
        });
    }
    catch (err) {
        throw err;
    }
    return result;
};
const postStockData = async (data) => {
    let validationResult = validator(data, STOCK_DATA_VALIDATION);
    if (validationResult.length > 0)
        throw new InvalidRequestError(validationResult);
    let result = [];
    const dataIds = data.map((d) => d.ticker_no);
    try {
        const existingRecords = await executeQuery({
            sql: "SELECT id, ticker_no, name FROM Stocks WHERE ticker_no IN (?)"
        }, [dataIds]);
        if (existingRecords.length > 0) {
            const existingCodes = existingRecords.map((d) => d.ticker_no);
            throw new DuplicateFoundError(`Stocks with ids ( ${existingCodes.join(', ')} ) already exist!`);
        }
        result = await executeBatch({
            namedPlaceholders: true,
            sql: 'INSERT INTO Stocks ' +
                '(ticker_no, name, full_name, description, category, subcategory, board_lot, ISIN, currency, created_datetime, last_modified_datetime) ' +
                'VALUES (:ticker_no, :name, :full_name, :description, :category, :subcategory, :board_lot, :ISIN, :currency, :created_datetime, :last_modified_datetime)'
        }, data.map((item) => {
            let stock = new Stock('INSERT');
            return processData(item, columnInsertionOrder, stock);
        }));
        console.log(result);
    }
    catch (err) {
        throw err;
    }
    return result;
};
const getStockData = async (args) => {
    let validationResult = validator(args, STOCK_PARAM_SINGLE_VALIDATION);
    if (validationResult.length > 0)
        throw new InvalidRequestError(validationResult);
    const ticker_no = args.ticker_no;
    let result = [];
    try {
        result = await executeQuery({
            namedPlaceholders: true,
            sql: `SELECT * FROM Stocks WHERE ticker_no = :ticker_no`
        }, {
            ticker_no: ticker_no
        });
    }
    catch (err) {
        throw err;
    }
    return result;
};
const putStockData = async (data) => {
    let validationResult = validator(data, STOCK_DATA_VALIDATION);
    if (validationResult.length > 0)
        throw new InvalidRequestError(validationResult);
    let result = [];
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
        }, () => {
            let stock = new Stock('UPDATE');
            return processData(data, columnInsertionOrder, stock).getPlainObject();
        });
    }
    catch (err) {
        throw err;
    }
    return result;
};
const deleteStockData = async (args) => {
    let validationResult = validator(args, STOCK_PARAM_SINGLE_VALIDATION);
    if (validationResult.length > 0)
        throw new InvalidRequestError(validationResult);
    const ticker_no = args.ticker_no;
    try {
        await executeQuery({
            namedPlaceholders: true,
            sql: `DELETE FROM Stocks WHERE ticker_no = :ticker_no`
        }, {
            ticker_no: ticker_no
        });
    }
    catch (err) {
        throw err;
    }
    //assume no error or else will throw error
    return {
        ticker_no: ticker_no,
        status: 'success'
    };
};
const getTrackedStocks = async () => {
    let result = [];
    try {
        result = await executeQuery({
            sql: 'SELECT * FROM Stocks WHERE is_tracked = TRUE',
        });
    }
    catch (err) {
        throw err;
    }
    return result;
};
const setTrackStock = async (args, isTrack) => {
    let result = [];
    try {
        const existingRecords = await executeQuery({
            namedPlaceholders: true,
            sql: "SELECT id, ticker_no, name FROM Stocks WHERE id = :id"
        }, {
            id: args.id
        });
        if (existingRecords.length === 0) {
            const existingCodes = existingRecords.map((d) => d.ticker_no);
            throw new DuplicateFoundError(`No stocks with tickers ( ${existingCodes.join(', ')} ) found!`);
        }
        result = await executeQuery({
            namedPlaceholders: true,
            sql: 'UPDATE Stocks ' +
                'SET is_tracked = :is_tracked ' +
                'WHERE id = :id'
        }, {
            id: args.id,
            is_tracked: isTrack
        });
    }
    catch (err) {
        throw err;
    }
    return result;
};
export { getStocksData, postStockData, getStockData, putStockData, deleteStockData, getTrackedStocks, setTrackStock };
