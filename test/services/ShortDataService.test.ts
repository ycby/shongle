import {afterEach, describe, expect, jest, test} from "@jest/globals";
import * as db from "#root/src/db/db.ts";
import * as ShortDataService from "#root/src/services/ShortDataService.ts";
import {ShortDataBody, ShortDataGetParam, ShortDataGetSingleParam} from "#root/src/services/ShortDataService.ts";
import {InvalidRequestError, RecordNotFoundError} from "#root/src/errors/Errors.ts";

jest.mock('#root/src/db/db.ts');

const executeQueryMock = db.executeQuery as jest.MockedFunction<typeof db.executeQuery>;
const executeBatchMock = db.executeBatch as jest.MockedFunction<typeof db.executeBatch>;

const testBody: ShortDataBody = {
    id: 1,
    stock_code: '00001',
    shorted_amount: 100,
    shorted_shares: 10,
    reporting_date: '2025-01-01'
}

describe('Short Data Service Tests', () => {

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('GET by query', () => {

        test('Get all short data for stock', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    stock_id: 1,
                    shorted_amount: 100,
                    shorted_shares: 10,
                    reporting_date: '2025-01-01'
                }
            ]);

            const args: ShortDataGetParam = {stock_id: 1};

            const result = await ShortDataService.getShortData(args);

            expect(result).toHaveLength(1);
        });

        test('Get all short data, verify ticker_no exists', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    stock_id: 1,
                    shorted_amount: 100,
                    shorted_shares: 10,
                    reporting_date: '2025-01-01'
                }
            ]);

            const args: any = {};

            await expect(() => ShortDataService.getShortData(args))
                .rejects.toThrow(InvalidRequestError);
        });

        test('Get all short data, expect error when start_date is invalid', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    stock_id: 1,
                    shorted_amount: 100,
                    shorted_shares: 10,
                    reporting_date: '2025-01-01'
                }
            ]);

            const args: ShortDataGetParam = {stock_id: 1, start_date: '2025-aa-01'};

            await expect(() => ShortDataService.getShortData(args))
                .rejects.toThrow(InvalidRequestError);
        });

        test('Get all short data, expect error when end_date is invalid', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    stock_id: 1,
                    shorted_amount: 100,
                    shorted_shares: 10,
                    reporting_date: '2025-01-01'
                }
            ]);

            const args: ShortDataGetParam = {stock_id: 1, end_date: '2025-aa-01'};

            await expect(() => ShortDataService.getShortData(args))
                .rejects.toThrow(InvalidRequestError);
        });
    });

    describe('POST', () => {

        test('Post short data', async () => {

            executeQueryMock.mockResolvedValueOnce([{id: 1, ticker_no: '00001', name: 'test1'}]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}])

            const data = [testBody];

            const result = await ShortDataService.postShortData(data);

            expect(result).toHaveLength(1);
        });

        test('Post short data, expect error when reporting_date is wrong format', async () => {

            executeQueryMock.mockResolvedValueOnce([{id: 1, ticker_no: '00001', name: 'test1'}]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}])

            const data: any[] = [{...testBody, reporting_date: '2025-a1-01'}];

            await expect(() => ShortDataService.postShortData(data))
                .rejects.toThrow(InvalidRequestError);
        });

        test('Post short data, expect error when existing stock does not exist', async () => {

            executeQueryMock.mockResolvedValueOnce([]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}])

            const data: any[] = [testBody];

            await expect(() => ShortDataService.postShortData(data))
                .rejects.toThrow(RecordNotFoundError);
        });
    });

    describe('GET by Id', () => {

        test('Get short data by Id', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    stock_id: 1,
                    shorted_amount: 100,
                    shorted_shares: 10,
                    reporting_date: '2025-01-01'
                }
            ]);

            const args: ShortDataGetSingleParam = {id: 1};

            const result = await ShortDataService.getShortDatum(args);

            expect(result).toHaveLength(1);
        });

        test('Get short data by Id, verify id exists', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    stock_id: 1,
                    shorted_amount: 100,
                    shorted_shares: 10,
                    reporting_date: '2025-01-01'
                }
            ]);

            const args: any = {};

            await expect(() => ShortDataService.getShortDatum(args))
                .rejects.toThrow(InvalidRequestError);
        });
    })

    describe('PUT', () => {

        test('Put short data', async () => {

            executeQueryMock.mockResolvedValueOnce([{id: 1, ticker_no: '00001', name: 'test1'}]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}])

            const result = await ShortDataService.putShortDatum(testBody);

            expect(result).toHaveLength(1);
        });

        test('Put short data, expect error when reporting_date is wrong format', async () => {

            executeQueryMock.mockResolvedValueOnce([{id: 1, ticker_no: '00001', name: 'test1'}]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}])

            const data: ShortDataBody = {...testBody, reporting_date: '2025-a1-01'};

            await expect(() => ShortDataService.putShortDatum(data))
                .rejects.toThrow(InvalidRequestError);
        });
    });

    describe('DELETE', () => {

        test('Delete short data', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {affectedRows: 1, insertId: 0, warningStatus: 0}
            ]);

            const args: ShortDataGetSingleParam = {id: 1};

            const result = await ShortDataService.deleteShortDatum(args);

            expect(result.status).toEqual('success');
        });

        test('Delete short data, missing id', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {affectedRows: 1, insertId: 0, warningStatus: 0}
            ]);

            const args: any = {};

            await expect(() => ShortDataService.deleteShortDatum(args))
                .rejects.toThrow(InvalidRequestError);
        });
    });
})