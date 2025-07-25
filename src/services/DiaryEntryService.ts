import {ValidationRule, validator, ValidatorResult} from "#root/src/utilities/Validator.ts";
import {InvalidRequestError, RecordNotFoundError} from "#root/src/errors/Errors.ts";
import {FieldMapping, filterClauseGenerator, processData, ProcessDataMapping} from "#root/src/helpers/DBHelpers.ts";
import {executeBatch, executeQuery} from "#root/src/db/db.ts";
import {stringToDateConverter} from "#root/src/helpers/DateHelper.ts";
import {UpsertResult} from "mariadb";
import Stock from "#root/src/models/Stock.ts";
import DiaryEntry from "#root/src/models/DiaryEntry.ts";

export type DiaryEntryDataGetParams = {
    id?: number,
    stock_id?: number,
    title?: string,
    start_date?: string,
    end_date?: string
}

export type DiaryEntryDataBody = {
    id?: number;
    stock_id: number;
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

const insertColumnMapping: ProcessDataMapping[] = [
    {
        field: 'id'
    },
    {
        field: 'stock_id'
    },
    {
        field: 'title'
    },
    {
        field: 'content'
    },
    {
        field: 'posted_date',
        transform: (postedDate: string): Date => {

            return (stringToDateConverter(postedDate) ?? new Date(1970, 1, 1));
        }
    }
];

const getDiaryEntryData = async (args: DiaryEntryDataGetParams) => {

    console.log('getDiaryEntryData');

    let validationResult: ValidatorResult[] = validator(args, DIARY_ENTRY_PARAM_VALIDATION);

    if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

    let result: DiaryEntry[] = [];

    const whereString = filterClauseGenerator(whereFieldMapping, args);

    try {

        result = await executeQuery<DiaryEntry[]>({
            namedPlaceholders: true,
            sql: `SELECT * FROM Diary_Entries WHERE ${whereString !== '' ? whereString : ''} ORDER BY posted_date DESC`
        }, {
            id: args.id,
            stock_id: args.stock_id,
            title: args.title,
            start_date: args.start_date,
            end_date: args.end_date,
        });

    } catch (err) {

        throw err;
    }

    return result;
}

const createDiaryEntryData = async (data: DiaryEntryDataBody[]) => {

    console.log('createDiaryEntryData');

    let validationResult: ValidatorResult[] = validator(data, DIARY_ENTRY_BODY_VALIDATION);

    if (validationResult.length > 0) throw new InvalidRequestError(validationResult);

    let result: UpsertResult[] = [];

    const stockIds: number[] = data.map((d: DiaryEntryDataBody): number => d.stock_id);
    try {

        const existingRecords: Stock[] = await executeQuery<Stock[]>({
            namedPlaceholders: true,
            sql: "SELECT id, ticker_no, name FROM Stocks WHERE id IN (:ids)"
        }, {
            ids: stockIds
        });

        if (existingRecords.length === 0) {

            const nonExistentStockIds: number[] = data.map((d: DiaryEntryDataBody): number => d.stock_id);

            throw new RecordNotFoundError(`Stocks with ids ( ${nonExistentStockIds.join(', ')} ) already exist!`);
        }

        result = await executeBatch({
                namedPlaceholders: true,
                sql: 'INSERT INTO Diary_Entries ' +
                    '(stock_id, title, content, posted_date, created_datetime, last_modified_datetime) ' +
                    'VALUES (:stock_id, :title, :content, :posted_date, :created_datetime, :last_modified_datetime)'
            },
            data.map((item: DiaryEntryDataBody): DiaryEntry => {

                let transaction: DiaryEntry = new DiaryEntry('INSERT');

                return processData(item, insertColumnMapping, transaction);
            })
        )

        // await conn.commit();
    } catch (err) {

        throw err;
    }

    return result;
}

const upsertDiaryEntryData = async (data: DiaryEntryDataBody) => {

    console.log('upsertDiaryEntryData');

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
            () => {

                let diaryEntry: DiaryEntry = new DiaryEntry('UPDATE');

                const processedData = processData(data, insertColumnMapping, diaryEntry);
                console.log(processedData.getPlainObject())
                return processedData.getPlainObject();
            }
        );

    } catch (err) {

        throw err;
    }

    return result;
}

const deleteDiaryEntryData = async (args: DiaryEntryDataGetParams) => {

    console.log('deleteDiaryEntryData');

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