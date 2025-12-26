import {afterEach, describe, expect, jest, test} from "@jest/globals";
import * as db from "#root/src/db/db.ts";
import * as DiaryEntryService from "#root/src/services/DiaryEntryService.ts";
import {InvalidRequestError, RecordNotFoundError} from "#root/src/errors/Errors.ts";
import {DiaryEntryDataBody, DiaryEntryDataGetParams} from "#root/src/services/DiaryEntryService.ts";
import DiaryEntry from "#root/src/models/DiaryEntry.ts";

jest.mock('#root/src/db/db.ts');

const executeQueryMock = db.executeQuery as jest.MockedFunction<typeof db.executeQuery>;
const executeBatchMock = db.executeBatch as jest.MockedFunction<typeof db.executeBatch>;

const testBody: DiaryEntryDataBody = {
    id: 1,
    stock_id: 1,
    title: 'test1',
    content: 'lorum ipsum',
    posted_date: '2025-01-01'
}

describe('Diary Entry Service Tests', () => {

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('GET by query', () => {

        test('Get all diary entries', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    stock_id: 1,
                    title: 'test1',
                    content: 'lorem ipsum',
                    posted_date: '2025-01-01'
                }
            ]);

            const args: DiaryEntryDataGetParams = {stock_id: 1};

            const result: DiaryEntry[] = await DiaryEntryService.getDiaryEntryData(args);

            expect(result).toHaveLength(1);
        });

        test('Get all diary entries, expect error when stock_id is missing', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    stock_id: 1,
                    shorted_amount: 100,
                    shorted_shares: 10,
                    reporting_date: '2025-01-01'
                }
            ]);

            const args: DiaryEntryDataGetParams = {stock_id: undefined};

            await expect(() => DiaryEntryService.getDiaryEntryData(args))
                .rejects.toThrow(InvalidRequestError);
        });

        test('Get all diary entries, expect error when start_date is formatted wrong', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    stock_id: 1,
                    title: 'test1',
                    content: 'lorem ipsum',
                    posted_date: '2025-01-01'
                }
            ]);

            const args: any = {start_date: '2025-01-aa'};

            await expect(() => DiaryEntryService.getDiaryEntryData(args))
                .rejects.toThrow(InvalidRequestError);
        });

        test('Get all diary entries, expect error when start_date is formatted wrong', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    stock_id: 1,
                    title: 'test1',
                    content: 'lorem ipsum',
                    posted_date: '2025-01-01'
                }
            ]);

            const args: any = {end_date: '2025-aa-01'};

            await expect(() => DiaryEntryService.getDiaryEntryData(args))
                .rejects.toThrow(InvalidRequestError);
        });
    });

    describe('POST', () => {

        test('Post diary entry', async () => {

            executeQueryMock.mockResolvedValueOnce([{id: 1, ticker_no: '00001', name: 'test1'}]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}])

            const data = [testBody];

            const result = await DiaryEntryService.createDiaryEntryData(data);

            expect(result).toHaveLength(1);
        });

        test('Post diary entry, expect error when stock_id missing', async () => {

            executeQueryMock.mockResolvedValueOnce([{id: 1, ticker_no: '00001', name: 'test1'}]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}])

            const data: any[] = [{...testBody, stock_id: undefined}];

            await expect(() => DiaryEntryService.createDiaryEntryData(data))
                .rejects.toThrow(InvalidRequestError);
        });

        test('Post diary entry, expect error when existing stock does not exist', async () => {

            executeQueryMock.mockResolvedValueOnce([]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}])

            const data: any[] = [testBody];

            await expect(() => DiaryEntryService.createDiaryEntryData(data))
                .rejects.toThrow(RecordNotFoundError);
        });

        test('Post diary entry, expect error when title is missing', async () => {

            executeQueryMock.mockResolvedValueOnce([]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}])

            const data: any[] = [{...testBody, title: undefined}];

            await expect(() => DiaryEntryService.createDiaryEntryData(data))
                .rejects.toThrow(InvalidRequestError);
        });

        test('Post diary entry, expect error when content is missing', async () => {

            executeQueryMock.mockResolvedValueOnce([]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}])

            const data: any[] = [{...testBody, content: undefined}];

            await expect(() => DiaryEntryService.createDiaryEntryData(data))
                .rejects.toThrow(InvalidRequestError);
        });

        test('Post diary entry, expect error when posted_date is missing', async () => {

            executeQueryMock.mockResolvedValueOnce([]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}])

            const data: any[] = [{...testBody, posted_date: undefined}];

            await expect(() => DiaryEntryService.createDiaryEntryData(data))
                .rejects.toThrow(InvalidRequestError);
        });

        test('Post diary entry, expect error when posted_date is wrong format', async () => {

            executeQueryMock.mockResolvedValueOnce([]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}])

            const data: any[] = [{...testBody, posted_date: '2025-01-aa'}];

            await expect(() => DiaryEntryService.createDiaryEntryData(data))
                .rejects.toThrow(InvalidRequestError);
        });
    });

    describe('PUT', () => {

        test('Put diary entry', async () => {

            executeQueryMock.mockResolvedValueOnce([{id: 1, ticker_no: '00001', name: 'test1'}]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}])

            const result = await DiaryEntryService.upsertDiaryEntryData(testBody);

            expect(result).toHaveLength(1);
        });

        test('Put diary entry, expect error when missing stock_id', async () => {

            executeQueryMock.mockResolvedValueOnce([{id: 1, ticker_no: '00001', name: 'test1'}]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}])

            const data: any = {...testBody, stock_id: undefined};

            await expect(() => DiaryEntryService.upsertDiaryEntryData(data))
                .rejects.toThrow(InvalidRequestError);
        });

        test('Put diary entry, expect error when missing title', async () => {

            executeQueryMock.mockResolvedValueOnce([{id: 1, ticker_no: '00001', name: 'test1'}]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}])

            const data: any = {...testBody, title: undefined};

            await expect(() => DiaryEntryService.upsertDiaryEntryData(data))
                .rejects.toThrow(InvalidRequestError);
        });

        test('Put diary entry, expect error when missing content', async () => {

            executeQueryMock.mockResolvedValueOnce([{id: 1, ticker_no: '00001', name: 'test1'}]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}])

            const data: any = {...testBody, content: undefined};

            await expect(() => DiaryEntryService.upsertDiaryEntryData(data))
                .rejects.toThrow(InvalidRequestError);
        });

        test('Put diary entry, expect error when missing posted_date', async () => {

            executeQueryMock.mockResolvedValueOnce([{id: 1, ticker_no: '00001', name: 'test1'}]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}])

            const data: any = {...testBody, posted_date: undefined};

            await expect(() => DiaryEntryService.upsertDiaryEntryData(data))
                .rejects.toThrow(InvalidRequestError);
        });

        test('Put diary entry, expect error when posted_date is wrong format', async () => {

            executeQueryMock.mockResolvedValueOnce([{id: 1, ticker_no: '00001', name: 'test1'}]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}])

            const data: any = {...testBody, posted_date: '2025-01-0a'};

            await expect(() => DiaryEntryService.upsertDiaryEntryData(data))
                .rejects.toThrow(InvalidRequestError);
        });
    });

    describe('DELETE', () => {

        test('Delete diary entry', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {affectedRows: 1, insertId: 0, warningStatus: 0}
            ]);

            const args: DiaryEntryDataGetParams = {id: 1};

            const result = await DiaryEntryService.deleteDiaryEntryData(args);

            expect(result.status).toEqual('success');
        });

        test('Delete diary entry, expect error when stock_id is missing', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {affectedRows: 1, insertId: 0, warningStatus: 0}
            ]);

            const args: any = {};

            await expect(() => DiaryEntryService.deleteDiaryEntryData(args))
                .rejects.toThrow(InvalidRequestError);
        });
    });
})