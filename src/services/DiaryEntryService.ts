import {validate, ValidatorResult} from "#root/src/utilities/Validator.js";
import {InvalidRequestError, RecordNotFoundError} from "#root/src/errors/Errors.js";
import {FieldMapping, filterClauseGenerator} from "#root/src/helpers/DBHelpers.js";
import {executeBatch, executeQuery} from "#root/src/db/db.js";
import {UpsertResult} from "mariadb";
import Stock from "#root/src/models/Stock.js";
import DiaryEntry from "#root/src/models/DiaryEntry.js";
import {QueryType} from "#root/src/types.js";
import {
    DIARY_ENTRY_PARAM_VALIDATION,
    DIARY_ENTRY_PARAM_SINGLE_VALIDATION,
    DIARY_ENTRY_BODY_VALIDATION
} from "#root/src/validation/VRule_DiaryEntry.js";

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

    let validationResult: ValidatorResult[] = validate(args, DIARY_ENTRY_PARAM_VALIDATION);

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

    let validationResult: ValidatorResult[] = validate(data, DIARY_ENTRY_BODY_VALIDATION);

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

    let validationResult: ValidatorResult[] = validate(data, DIARY_ENTRY_BODY_VALIDATION);

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

    let validationResult: ValidatorResult[] = validate(args, DIARY_ENTRY_PARAM_SINGLE_VALIDATION);

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