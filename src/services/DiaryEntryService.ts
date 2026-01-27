import {ValidationRule, validator, ValidatorResult} from "#root/src/utilities/Validator.js";
import {InvalidRequestError, RecordNotFoundError} from "#root/src/errors/Errors.js";
import {FieldMapping, filterClauseGenerator} from "#root/src/helpers/DBHelpers.js";
import {executeBatch, executeQuery} from "#root/src/db/db.js";
import {stringToDateConverter} from "#root/src/helpers/DateHelper.js";
import {UpsertResult} from "mariadb";
import Stock from "#root/src/models/Stock.js";
import DiaryEntry from "#root/src/models/DiaryEntry.js";
import {QueryType} from "#root/src/types.js";

export type DiaryEntryDataGetParams = {
    id?: number,
    stock_id?: number,
    title?: string,
    start_date?: string,
    end_date?: string
}

export type DiaryEntryDataBody = {
    id?: string;
    stock_id: string;
    title: string;
    content: string;
    posted_date: string;
}

const DIARY_ENTRY_PARAM_VALIDATION: ValidationRule[] = [
    {
        name: 'id',
        isRequired: false,
        rule: (id: any): boolean => !isNaN(Number(id)),
        errorMessage: 'Id must be a number',
    },
    {
        name: 'stock_id',
        isRequired: true,
        rule: (stock_id: any): boolean => !isNaN(Number(stock_id)),
        errorMessage: 'Stock Id must be a number'
    },
    {
        name: 'title',
        isRequired: false,
        rule: (title: any): boolean => typeof title === 'string',
        errorMessage: 'Title must be string'
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

const DIARY_ENTRY_PARAM_SINGLE_VALIDATION: ValidationRule[] = [
    {
        name: 'id',
        isRequired: true,
        rule: (id: any): boolean => !isNaN(Number(id)),
        errorMessage: 'Id must be a number'
    }
]

const DIARY_ENTRY_BODY_VALIDATION: ValidationRule[] = [
    {
        name: 'id',
        isRequired: false,
        rule: (id: any): boolean => {
            try {
                BigInt(id)
                return typeof id === 'string';
            } catch (e) {
                return false;
            }
        },
        errorMessage: 'Id must be a number'
    },
    {
        name: 'stock_id',
        isRequired: true,
        rule: (stock_id: any): boolean => {
            try {
                BigInt(stock_id)
                return typeof stock_id === 'string';
            } catch (e) {
                return false;
            }
        },
        errorMessage: 'Stock Id must be a number'
    },
    {
        name: 'title',
        isRequired: true,
        rule: (title: any): boolean => typeof title === 'string',
        errorMessage: 'Title must be a string'
    },
    {
        name: 'content',
        isRequired: true,
        rule: (content: any): boolean => typeof content === 'string',
        errorMessage: 'String must be a string'
    },
    {
        name: 'posted_date',
        isRequired: true,
        rule: (postedDate: any): boolean => typeof postedDate === 'string' && stringToDateConverter(postedDate) !== null,
        errorMessage: 'Posted Date must be formatted like so: yyyy-MM-dd'
    }
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

const getDiaryEntryData = async (args: DiaryEntryDataGetParams) => {

    let validationResult: ValidatorResult[] = validator(args, DIARY_ENTRY_PARAM_VALIDATION);

    if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

    let result: DiaryEntry[] = [];

    const whereString = filterClauseGenerator(QueryType.AND, whereFieldMapping, args);

    try {

        result = await executeQuery<DiaryEntry>({
            namedPlaceholders: true,
            sql: `SELECT * FROM Diary_Entries WHERE ${whereString !== '' ? whereString : ''} ORDER BY posted_date DESC`
        }, {
            id: args.id,
            stock_id: args.stock_id,
            title: args.title,
            start_date: args.start_date,
            end_date: args.end_date,
        }, (element) => new DiaryEntry(element));

    } catch (err) {

        throw err;
    }

    return result;
}

const createDiaryEntryData = async (data: DiaryEntryDataBody[]) => {

    let validationResult: ValidatorResult[] = validator(data, DIARY_ENTRY_BODY_VALIDATION);

    if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

    let result: UpsertResult[] = [];

    const stockIds: BigInt[] = data.map((d: DiaryEntryDataBody): BigInt => BigInt(d.stock_id));
    try {

        const existingRecords: Stock[] = await executeQuery<Stock>({
            namedPlaceholders: true,
            sql: "SELECT id, ticker_no, name FROM Stocks WHERE id IN (:ids)"
        }, {
            ids: stockIds
        }, (element) => new Stock(element));

        if (existingRecords.length === 0) {

            throw new RecordNotFoundError(`Stocks with ids ( ${stockIds.join(', ')} ) do not exist!`);
        }

        result = await executeBatch({
                namedPlaceholders: true,
                sql: 'INSERT INTO Diary_Entries ' +
                    '(stock_id, title, content, posted_date, created_datetime, last_modified_datetime) ' +
                    'VALUES (:stock_id, :title, :content, :posted_date, :created_datetime, :last_modified_datetime)'
            },
            data.map((item: DiaryEntryDataBody): DiaryEntry => new DiaryEntry(item).getPlainObject())
        );
    } catch (err) {

        throw err;
    }

    return result;
}

const upsertDiaryEntryData = async (data: DiaryEntryDataBody) => {

    let validationResult: ValidatorResult[] = validator(data, DIARY_ENTRY_BODY_VALIDATION);

    if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

    let result: UpsertResult[] = [];

    try {

        result = await executeQuery({
                namedPlaceholders: true,
                sql: 'INSERT INTO Diary_Entries ' +
                    '(id, stock_id, title, content, posted_date, created_datetime, last_modified_datetime) ' +
                    'VALUES (:id, :stock_id, :title, :content, :posted_date, :created_datetime, :last_modified_datetime) ' +
                    'ON DUPLICATE KEY UPDATE ' +
                    'stock_id=VALUES(stock_id), ' +
                    'title=VALUES(title), ' +
                    'content=VALUES(content), ' +
                    'posted_date=VALUES(posted_date), ' +
                    'last_modified_datetime=VALUES(last_modified_datetime)'
            },
            () => new DiaryEntry(data).getPlainObject()
        );

    } catch (err) {

        throw err;
    }

    return result;
}

const deleteDiaryEntryData = async (args: DiaryEntryDataGetParams) => {

    let validationResult: ValidatorResult[] = validator(args, DIARY_ENTRY_PARAM_SINGLE_VALIDATION);

    if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

    const id = args.id;

    try {

        await executeQuery({
            namedPlaceholders: true,
            sql: `DELETE FROM Diary_Entries WHERE id = :id`
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
    getDiaryEntryData,
    createDiaryEntryData,
    upsertDiaryEntryData,
    deleteDiaryEntryData
}