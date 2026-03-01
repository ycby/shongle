import {validate, ValidatorResult} from "#root/src/utilities/Validator.js";
import {InvalidRequestError, RecordNotFoundError} from "#root/src/errors/Errors.js";
import {FieldMapping, filterClauseGenerator} from "#root/src/helpers/DBHelpers.js";
import {executeBatch, executeQuery} from "#root/src/db/db.js";
import {UpsertResult} from "mariadb";
import {QueryType} from "#root/src/types.js";
import Stock from "#root/src/models/Stock.js";
import StockTransaction from "#root/src/models/StockTransaction.js";
import {
    TRANSACTION_PARAM_VALIDATION,
    TRANSACTION_PARAM_SINGLE_VALIDATION,
    TRANSACTION_BODY_VALIDATION,
} from "#root/src/validation/VRule_StockTransaction.js";

export type TransactionDataGetParams = {
    id?: string,
    stock_id?: string,
    type?: string[],
    start_date?: string,
    end_date?: string
}

export type TransactionDataBody = {
    id?: string;
    stock_id: string;
    type: string;
    amount: number;
    quantity: number;
    fee: number;
    transaction_date: string;
    currency: string;
}

const whereFieldMapping: FieldMapping[] = [
    {
        param: 'id',
        field: 'id',
        operator: '='
    },
    {
        param: 'stock_id',
        field: 'stock_id',
        operator: '='
    },
    {
        param: 'type',
        field: 'type',
        operator: 'IN'
    },
    {
        param: 'start_date',
        field: 'transaction_date',
        operator: '>='
    },
    {
        param: 'end_date',
        field: 'transaction_date',
        operator: '<='
    }
];

const getStockTransactionsData = async (args: TransactionDataGetParams) => {

    let validationResult: ValidatorResult[] = validate(args, TRANSACTION_PARAM_VALIDATION);

    if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

    let result = [];
    const whereString = filterClauseGenerator(QueryType.AND, whereFieldMapping, args);

    try {

        result = await executeQuery<StockTransaction>({
            namedPlaceholders: true,
            sql: `SELECT st.*, c.decimal_places FROM Stock_Transactions st LEFT JOIN Currencies c ON st.currency = c.ISO_code ${whereString !== '' ? 'WHERE ' + whereString : ''} ORDER BY transaction_date DESC`
        }, {
            id: args.id,
            stock_id: args.stock_id,
            type: args.type,
            start_date: args.start_date,
            end_date: args.end_date,
        }, (element) => StockTransaction.fromDB(element));

    } catch (err) {

        throw err;
    }

    return result;
}

const createStockTransactionsData = async (data: TransactionDataBody[]) => {

    let validationResult: ValidatorResult[] = validate(data, TRANSACTION_BODY_VALIDATION);

    if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

    let result: UpsertResult[] = [];

    const stockIds: bigint[] = data.map((d: TransactionDataBody): bigint => BigInt(d.stock_id));
    try {

        const existingRecords: Stock[] = await executeQuery<Stock>({
            namedPlaceholders: true,
            sql: "SELECT id, ticker_no, name FROM Stocks WHERE id IN (:ids)"
        }, {
            ids: stockIds
        }, (element) => new Stock(element));

        if (existingRecords.length === 0) {

            const nonExistentStockIds = data.map((d: TransactionDataBody) => d.stock_id);

            throw new RecordNotFoundError(`Stocks with ids ( ${nonExistentStockIds.join(', ')} ) already exist!`);
        }

        result = await executeBatch({
                namedPlaceholders: true,
                sql: 'INSERT INTO Stock_Transactions ' +
                    '(stock_id, type, amount, quantity, fee, transaction_date, currency, created_datetime, last_modified_datetime) ' +
                    'VALUES (:stock_id, :type, :amount, :quantity, :fee, :transaction_date, :currency, :created_datetime, :last_modified_datetime)'
            },
            data.map((item: TransactionDataBody): StockTransaction => StockTransaction.fromAPI(item).getPlainObject())
        );

    } catch (err) {

        throw err;
    }

    return result;
}

const upsertStockTransactionData = async (data: TransactionDataBody[]) => {

    let validationResult: ValidatorResult[] = validate(data, TRANSACTION_BODY_VALIDATION);

    if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

    let result: UpsertResult[] = [];

    try {

        result = await executeBatch({
                sql: 'INSERT INTO Stock_Transactions ' +
                    '(id, stock_id, type, amount, quantity, fee, transaction_date, currency, created_datetime, last_modified_datetime) ' +
                    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ' +
                    'ON DUPLICATE KEY UPDATE ' +
                    'stock_id=VALUES(stock_id), ' +
                    'type=VALUES(type), ' +
                    'amount=VALUES(amount), ' +
                    'quantity=VALUES(quantity), ' +
                    'fee=VALUES(fee), ' +
                    'transaction_date=VALUES(transaction_date), ' +
                    'currency=VALUES(currency), ' +
                    'last_modified_datetime=VALUES(last_modified_datetime)'
            },
            data.map((element) => {

                const result = StockTransaction.fromAPI(element).getPlainObject();
                return [
                    result.id,
                    result.stock_id,
                    result.type,
                    result.amount,
                    result.quantity,
                    result.fee,
                    result.transaction_date,
                    result.currency,
                    result.created_datetime,
                    result.last_modified_datetime,
                ];
            })
        );

    } catch (err) {

        throw err;
    }

    return result;
}

const deleteStockTransactionData = async (args: TransactionDataGetParams) => {

    let validationResult: ValidatorResult[] = validate(args, TRANSACTION_PARAM_SINGLE_VALIDATION);

    if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

    const id = args.id;

    try {

        await executeQuery({
            namedPlaceholders: true,
            sql: `DELETE FROM Stock_Transactions WHERE id = :id`
        }, {
            id: id
        });

    } catch (err) {

        throw err;
    }

    return {
        id: id,
        status: 'success',
    };
}

export {
    getStockTransactionsData,
    createStockTransactionsData,
    upsertStockTransactionData,
    deleteStockTransactionData
}