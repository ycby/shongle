import { validator } from "#root/src/utilities/Validator.ts";
import { InvalidRequestError, RecordNotFoundError } from "#root/src/errors/Errors.ts";
import { filterClauseGenerator, processData } from "#root/src/helpers/DBHelpers.ts";
import { executeBatch, executeQuery } from "#root/src/db/db.ts";
import { stringToDateConverter } from "#root/src/helpers/DateHelper.ts";
import DiaryEntry from "#root/src/models/DiaryEntry.ts";
import { QueryType } from "#root/src/types.ts";
const DIARY_ENTRY_PARAM_VALIDATION = [
    {
        name: 'id',
        isRequired: false,
        rule: (id) => !isNaN(Number(id)),
        errorMessage: 'Id must be a number',
    },
    {
        name: 'stock_id',
        isRequired: true,
        rule: (stock_id) => !isNaN(Number(stock_id)),
        errorMessage: 'Stock Id must be a number'
    },
    {
        name: 'title',
        isRequired: false,
        rule: (title) => typeof title === 'string',
        errorMessage: 'Title must be string'
    },
    {
        name: 'start_date',
        isRequired: false,
        rule: (start_date) => stringToDateConverter(start_date) !== null,
        errorMessage: 'Start Date must be formatted like so: yyyy-MM-dd'
    },
    {
        name: 'end_date',
        isRequired: false,
        rule: (end_date) => stringToDateConverter(end_date) !== null,
        errorMessage: 'End Date must be formatted like so: yyyy-MM-dd'
    },
];
const DIARY_ENTRY_PARAM_SINGLE_VALIDATION = [
    {
        name: 'id',
        isRequired: true,
        rule: (id) => !isNaN(Number(id)),
        errorMessage: 'Id must be a number'
    }
];
const DIARY_ENTRY_BODY_VALIDATION = [
    {
        name: 'id',
        isRequired: false,
        rule: (id) => typeof id === 'number',
        errorMessage: 'Id must be a number'
    },
    {
        name: 'stock_id',
        isRequired: true,
        rule: (stock_id) => typeof stock_id === 'number',
        errorMessage: 'Stock Id must be a number'
    },
    {
        name: 'title',
        isRequired: true,
        rule: (title) => typeof title === 'string',
        errorMessage: 'Title must be a string'
    },
    {
        name: 'content',
        isRequired: true,
        rule: (content) => typeof content === 'string',
        errorMessage: 'String must be a string'
    },
    {
        name: 'posted_date',
        isRequired: true,
        rule: (postedDate) => typeof postedDate === 'string' && stringToDateConverter(postedDate) !== null,
        errorMessage: 'Posted Date must be formatted like so: yyyy-MM-dd'
    }
];
const whereFieldMapping = [
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
const insertColumnMapping = [
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
        transform: (postedDate) => {
            return (stringToDateConverter(postedDate) ?? new Date(1970, 1, 1));
        }
    }
];
const getDiaryEntryData = async (args) => {
    console.log('getDiaryEntryData');
    let validationResult = validator(args, DIARY_ENTRY_PARAM_VALIDATION);
    if (validationResult.length > 0)
        throw new InvalidRequestError(validationResult);
    let result = [];
    const whereString = filterClauseGenerator(QueryType.AND, whereFieldMapping, args);
    try {
        result = await executeQuery({
            namedPlaceholders: true,
            sql: `SELECT * FROM Diary_Entries WHERE ${whereString !== '' ? whereString : ''} ORDER BY posted_date DESC`
        }, {
            id: args.id,
            stock_id: args.stock_id,
            title: args.title,
            start_date: args.start_date,
            end_date: args.end_date,
        });
    }
    catch (err) {
        throw err;
    }
    return result;
};
const createDiaryEntryData = async (data) => {
    console.log('createDiaryEntryData');
    let validationResult = validator(data, DIARY_ENTRY_BODY_VALIDATION);
    if (validationResult.length > 0)
        throw new InvalidRequestError(validationResult);
    let result = [];
    const stockIds = data.map((d) => d.stock_id);
    try {
        const existingRecords = await executeQuery({
            namedPlaceholders: true,
            sql: "SELECT id, ticker_no, name FROM Stocks WHERE id IN (:ids)"
        }, {
            ids: stockIds
        });
        if (existingRecords.length === 0) {
            const nonExistentStockIds = data.map((d) => d.stock_id);
            throw new RecordNotFoundError(`Stocks with ids ( ${nonExistentStockIds.join(', ')} ) already exist!`);
        }
        result = await executeBatch({
            namedPlaceholders: true,
            sql: 'INSERT INTO Diary_Entries ' +
                '(stock_id, title, content, posted_date, created_datetime, last_modified_datetime) ' +
                'VALUES (:stock_id, :title, :content, :posted_date, :created_datetime, :last_modified_datetime)'
        }, data.map((item) => {
            let transaction = new DiaryEntry('INSERT');
            return processData(item, insertColumnMapping, transaction);
        }));
        // await conn.commit();
    }
    catch (err) {
        throw err;
    }
    return result;
};
const upsertDiaryEntryData = async (data) => {
    console.log('upsertDiaryEntryData');
    let validationResult = validator(data, DIARY_ENTRY_BODY_VALIDATION);
    if (validationResult.length > 0)
        throw new InvalidRequestError(validationResult);
    let result = [];
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
        }, () => {
            let diaryEntry = new DiaryEntry('UPDATE');
            const processedData = processData(data, insertColumnMapping, diaryEntry);
            console.log(processedData.getPlainObject());
            return processedData.getPlainObject();
        });
    }
    catch (err) {
        throw err;
    }
    return result;
};
const deleteDiaryEntryData = async (args) => {
    console.log('deleteDiaryEntryData');
    let validationResult = validator(args, DIARY_ENTRY_PARAM_SINGLE_VALIDATION);
    if (validationResult.length > 0)
        throw new InvalidRequestError(validationResult);
    const id = args.id;
    try {
        await executeQuery({
            namedPlaceholders: true,
            sql: `DELETE FROM Diary_Entries WHERE id = :id`
        }, {
            id: id
        });
    }
    catch (err) {
        throw err;
    }
    return {
        id: id,
        status: 'success',
    };
};
export { getDiaryEntryData, createDiaryEntryData, upsertDiaryEntryData, deleteDiaryEntryData };
