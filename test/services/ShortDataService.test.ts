import {afterEach, describe, expect, jest, test} from "@jest/globals";
import * as db from "#root/src/db/db.js";
import * as ShortDataService from "#root/src/services/ShortDataService.js";
import {
    ShortDataBody,
    ShortDataGetParam,
    ShortDataGetSingleParam, ShortDataMismatchQuery,
    ShortDataTickersWithMismatchQuery
} from "#root/src/services/ShortDataService.js";
import {InvalidRequestError} from "#root/src/errors/Errors.js";
import {SqlError} from "mariadb";
import ShortData from "#root/src/models/ShortData.js";

jest.mock('#root/src/db/db.js');

const executeQueryMock = db.executeQuery as jest.MockedFunction<typeof db.executeQuery>;
const executeBatchMock = db.executeBatch as jest.MockedFunction<typeof db.executeBatch>;

const testBody: ShortDataBody = {
    id: '1',
    stock_id: '1',
    ticker_no: '00001',
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
                    id: '1',
                    stock_id: '1',
                    shorted_amount: 100,
                    shorted_shares: 10,
                    reporting_date: '2025-01-01'
                }
            ]);

            const args: ShortDataGetParam = {stock_id: '1'};

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

            const args: ShortDataGetParam = {stock_id: '1', start_date: '2025-aa-01'};

            await expect(() => ShortDataService.getShortData(args))
                .rejects.toThrow(InvalidRequestError);
        });

        test('Get all short data, expect error when end_date is invalid', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: '1',
                    stock_id: '1',
                    shorted_amount: 100,
                    shorted_shares: 10,
                    reporting_date: '2025-01-01'
                }
            ]);

            const args: ShortDataGetParam = {stock_id: '1', end_date: '2025-aa-01'};

            await expect(() => ShortDataService.getShortData(args))
                .rejects.toThrow(InvalidRequestError);
        });


    });

    describe('POST', () => {

        test('Post short data', async () => {

            executeQueryMock.mockResolvedValueOnce([{id: '1', ticker_no: '00001', name: 'test1'}]);
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

            const args: ShortDataGetSingleParam = {id: '1'};

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

            executeQueryMock.mockResolvedValueOnce([{id: '1', ticker_no: '00001', name: 'test1'}]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}])

            const result = await ShortDataService.putShortDatum([testBody]);

            expect(result).toHaveLength(1);
        });

        test('Put short data, expect error when reporting_date is wrong format', async () => {

            executeQueryMock.mockResolvedValueOnce([{id: 1, ticker_no: '00001', name: 'test1'}]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}])

            const data: ShortDataBody = {...testBody, reporting_date: '2025-a1-01'};

            await expect(() => ShortDataService.putShortDatum([data]))
                .rejects.toThrow(InvalidRequestError);
        });
    });

    describe('DELETE', () => {

        test('Delete short data', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {affectedRows: 1, insertId: 0, warningStatus: 0}
            ]);

            const args: ShortDataGetSingleParam = {id: '1'};

            const result = await ShortDataService.deleteShortDatum(args);

            expect(result.status).toEqual('success');
        });

        test('Delete short data, missing id', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {affectedRows: 1, insertId: 0, warningStatus: 0}
            ]);

            const args: any = {};

            await expect(ShortDataService.deleteShortDatum(args))
                .rejects.toThrow(InvalidRequestError);
        });
    });

    describe('GET Shorts with Mismatched Tickers', () => {

        test('Get shorts with mismatched tickers', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    ticker_no: '00001',
                },
                {
                    ticker_no: '00002',
                }
            ]);

            const args: ShortDataTickersWithMismatchQuery = {
                limit: 0,
                offset: 0
            }

            expect(await ShortDataService.getTickersWithMismatchedData(args)).toEqual(['00001', '00002']);
        });

        test('Get shorts with mismatched tickers, missing limit', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    ticker_no: '00001',
                },
                {
                    ticker_no: '00002',
                }
            ]);

            const args: ShortDataTickersWithMismatchQuery = {
                offset: 0
            }

            expect(await ShortDataService.getTickersWithMismatchedData(args)).toEqual(['00001', '00002']);
        });

        test('Get shorts with mismatched tickers, missing offset', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    ticker_no: '00001',
                },
                {
                    ticker_no: '00002',
                }
            ]);

            const args: ShortDataTickersWithMismatchQuery = {
                limit: 0
            }

            expect(await ShortDataService.getTickersWithMismatchedData(args)).toEqual(['00001', '00002']);
        });

        test('Get shorts with mismatched tickers, error with query', async () => {

            executeQueryMock.mockRejectedValueOnce(new SqlError('Some error'));

            const args: ShortDataTickersWithMismatchQuery = {
                limit: 0,
                offset: 0
            };

            await expect(ShortDataService.getTickersWithMismatchedData(args)).rejects.toThrow(SqlError);
        });
    });

    describe('GET mismatched Short by Ticker', () => {

        test('Get shorts with mismatched tickers', async () => {

            executeQueryMock.mockResolvedValueOnce([
                new ShortData({
                    id: '1',
                    stock_id: null,
                    reporting_date: new Date(2025, 0, 1),
                    shorted_shares: 100,
                    shorted_amount: 1000,
                    ticker_no: '00001',
                    created_datetime: new Date(2025, 0, 1),
                    last_modified_datetime: new Date(2025, 0, 1)
                }),
                new ShortData({
                    id: '2',
                    stock_id: null,
                    reporting_date: new Date(2025, 0, 1),
                    shorted_shares: 200,
                    shorted_amount: 2000,
                    ticker_no: '00001',
                    created_datetime: new Date(2025, 0, 1),
                    last_modified_datetime: new Date(2025, 0, 1)
                })
            ]);

            const args: ShortDataMismatchQuery = {ticker_no: '00001'};

            const result = await ShortDataService.getMismatchedDataByTicker(args);
            expect(result.length).toBe(2);
        });

        test('Get shorts with mismatched tickers, fail validation', async () => {

            const args: any = {ticker_no: 1};

            await expect(ShortDataService.getMismatchedDataByTicker(args)).rejects.toThrow(InvalidRequestError);
        });
    });
});