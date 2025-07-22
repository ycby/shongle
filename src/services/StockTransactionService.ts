import {ValidationRule, validator, ValidatorResult} from "#root/src/utilities/Validator.ts";
import {InvalidRequestError, RecordNotFoundError} from "#root/src/errors/Errors.ts";
import {FieldMapping, filterClauseGenerator, processData, ProcessDataMapping} from "#root/src/helpers/DBHelpers.ts";
import {executeBatch, executeQuery} from "#root/src/db/db.ts";
import {stringToDateConverter} from "#root/src/helpers/DateHelper.ts";
import {UpsertResult} from "mariadb";
import {Currency, CurrencyKeys, TransactionType, TransactionTypeKeys} from "#root/src/types.ts";
import Stock from "#root/src/models/Stock.ts";
import StockTransaction from "#root/src/models/StockTransaction.ts";

export type TransactionDataGetParams = {
    id?: number,
    stock_id?: number,
    type?: string[],
    start_date?: string,
    end_date?: string
}

export type TransactionDataBody = {
    id?: number;
    stock_id: number;
    type: string;
    amount: number;
    quantity: number;
    fee: number;
    transaction_date: string;
    currency: string;
}

const TRANSACTION_PARAM_VALIDATION: ValidationRule[] = [
    {
        name: 'id',
        isRequired: false,
        rule: (id: any): boolean => typeof id === 'number',
        errorMessage: 'Id must be a number',
    },
    {
        name: 'stock_id',
        isRequired: false,
        rule: (stock_id: any): boolean => typeof stock_id === 'string' && !isNaN(Number(stock_id)),
        errorMessage: 'Stock Id must be a number'
    },
    {
        name: 'type',
        isRequired: false,
        rule: (transactionTypes: any): boolean => transactionTypes instanceof Array &&
            transactionTypes.reduce(
                (accumulator, currentValue) => accumulator && Object.values(TransactionType).includes(currentValue)
            , true),
        errorMessage: 'Type must be an array and must only have the following values if included: "buy", "sell", "dividend"'
    },
    {
        name: 'start_date',
        isRequired: false,
        rule: (start_date: any): boolean => stringToDateConverter(start_date) !== null,
        errorMessage: 'Start Date must be formatted like so: yyyy-MM-dd'
    },
    {
        name: 'end_date',
        isRequired: false,
        rule: (end_date: any): boolean => stringToDateConverter(end_date) !== null,
        errorMessage: 'End Date must be formatted like so: yyyy-MM-dd'
    },
];

const TRANSACTION_PARAM_SINGLE_VALIDATION: ValidationRule[] = [
    {
        name: 'id',
        isRequired: true,
        rule: (id: any): boolean => !isNaN(Number(id)),
        errorMessage: 'Id must be a number'
    }
]

const TRANSACTION_BODY_VALIDATION: ValidationRule[] = [
    {
        name: 'id',
        isRequired: false,
        rule: (id: any): boolean => typeof id === 'number',
        errorMessage: 'Id must be a number'
    },
    {
        name: 'stock_id',
        isRequired: true,
        rule: (stock_id: any): boolean => typeof stock_id === 'number',
        errorMessage: 'Stock Id must be a number'
    },
    {
        name: 'type',
        isRequired: true,
        rule: (transactionType: any): boolean => typeof transactionType === 'string' && Object.values(TransactionType).includes(transactionType as TransactionTypeKeys),
        errorMessage: 'Type must be an array and must only have the following values if included: "buy", "sell", "dividend"'
    },
    {
        name: 'amount',
        isRequired: true,
        rule: (amount: any): boolean => typeof amount === 'number',
        errorMessage: 'Amount must be a number'
    },
    {
        name: 'quantity',
        isRequired: true,
        rule: (quantity: any): boolean => typeof quantity === 'number' && quantity >= 0,
        errorMessage: 'Quantity must be a number and be a positive value'
    },
    {
        name: 'fee',
        isRequired: true,
        rule: (fee: any): boolean => typeof fee === 'number',
        errorMessage: 'Fee must be a number'
    },
    {
        name: 'transaction_date',
        isRequired: true,
        rule: (transactionDate: any): boolean => typeof transactionDate === 'string' && stringToDateConverter(transactionDate) !== null,
        errorMessage: 'Transaction Date must be formatted like so: yyyy-MM-dd'
    },
    {
        name: 'currency',
        isRequired: true,
        rule: (currency: any): boolean => typeof currency === 'string' && Object.values(Currency).includes(currency as CurrencyKeys),
        errorMessage: 'Currency must be one of the following: ' + Object.values(Currency).join(', ')
    },
];

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

const insertColumnMapping: ProcessDataMapping[] = [
    {
        field: 'id'
    },
    {
        field: 'stock_id'
    },
    {
        field: 'type'
    },
    {
        field: 'amount'
    },
    {
        field: 'quantity'
    },
    {
        field: 'fee'
    },
    {
        field: 'transaction_date'
    },
    {
        field: 'currency'
    }
];

const getStockTransactionsData = async (args: TransactionDataGetParams) => {

    let validationResult: ValidatorResult[] = validator(args, TRANSACTION_PARAM_VALIDATION);

    if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

    let result = [];

    const whereString = filterClauseGenerator(whereFieldMapping, args);

    try {

        result = await executeQuery<StockTransaction[]>({
            namedPlaceholders: true,
            sql: `SELECT * FROM Stock_Transactions ${whereString !== '' ? 'WHERE ' + whereString : ''} ORDER BY transaction_date DESC`
        }, {
            id: args.id,
            stock_id: args.stock_id,
            type: args.type,
            start_date: args.start_date,
            end_date: args.end_date,
        });

    } catch (err) {

        throw err;
    }

    return result;
}

const getStocksWithTransactions = async () => {

    let result = [];

    try {

        result = await executeQuery<StockTransaction[]>({
            sql: `SELECT * FROM Stocks_w_Transactions ORDER BY ticker_no ASC`
        });

    } catch (err) {

        throw err;
    }

    return result;
}

const createStockTransactionsData = async (data: TransactionDataBody[]) => {

    let validationResult: ValidatorResult[] = validator(data, TRANSACTION_BODY_VALIDATION);

    if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

    let result: UpsertResult[] = [];

    const stockIds: number[] = data.map((d: TransactionDataBody): number => d.stock_id);
    try {

        const existingRecords: Stock[] = await executeQuery<Stock[]>({
            namedPlaceholders: true,
            sql: "SELECT id, ticker_no, name FROM Stocks WHERE id IN (:ids)"
        }, {
            ids: stockIds
        });

        if (existingRecords.length === 0) {

            const nonExistantStockIds = data.map((d: TransactionDataBody) => d.stock_id);

            throw new RecordNotFoundError(`Stocks with ids ( ${nonExistantStockIds.join(', ')} ) already exist!`);
        }

        result = await executeBatch({
                namedPlaceholders: true,
                sql: 'INSERT INTO Stock_Transactions ' +
                    '(stock_id, type, amount, quantity, fee, transaction_date, currency, created_datetime, last_modified_datetime) ' +
                    'VALUES (:stock_id, :type, :amount, :quantity, :fee, :transaction_date, :currency, :created_datetime, :last_modified_datetime)'
            },
            data.map((item: TransactionDataBody): StockTransaction => {

                let transaction: StockTransaction = new StockTransaction('INSERT');

                return processData(item, insertColumnMapping, transaction);
            })
        )

        // await conn.commit();
    } catch (err) {

        throw err;
    }

    return result;
}

const upsertStockTransactionData = async (data: TransactionDataBody) => {

    let validationResult: ValidatorResult[] = validator(data, TRANSACTION_BODY_VALIDATION);

    if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

    let result: UpsertResult[] = [];

    try {

        result = await executeQuery({
                namedPlaceholders: true,
                sql: 'INSERT INTO Stock_Transactions ' +
                    '(id, stock_id, type, amount, quantity, fee, transaction_date, currency, created_datetime, last_modified_datetime) ' +
                    'VALUES (:id, :stock_id, :type, :amount, :quantity, :fee, :transaction_date, :currency, :created_datetime, :last_modified_datetime) ' +
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
            () => {

                let transaction: StockTransaction = new StockTransaction('UPDATE');

                return processData(data, insertColumnMapping, transaction);
            }
        );

    } catch (err) {

        throw err;
    }

    return result;
}

const deleteStockTransactionData = async (args: TransactionDataGetParams) => {

    let validationResult: ValidatorResult[] = validator(args, TRANSACTION_PARAM_SINGLE_VALIDATION);

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
    getStocksWithTransactions,
    upsertStockTransactionData,
    deleteStockTransactionData
}