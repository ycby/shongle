import {afterEach, describe, expect, jest, test} from "@jest/globals";
import {
    ShortDataBody,
    ShortDataGetParam,
    ShortDataGetSingleParam, ShortDataMismatchQuery,
    ShortDataTickersWithMismatchQuery
} from "#root/src/services/ShortDataService.js";
import {InvalidRequestError} from "#root/src/errors/Errors.js";
import ShortData from "#root/src/models/ShortData.js";
import Money from "money-type";

let ShortDataService: any;
let db: any;
let executeQueryMock: jest.MockedFunction<any>;
let executeBatchMock: jest.MockedFunction<any>;

const testBody: ShortDataBody = {
    id: '1',
    stock_id: '1',
    ticker_no: '00001',
    shorted_amount: {
        "whole": 1000,
        "fractional": 0,
        "decimal_places": 2,
        "iso_code": 'HKD'
    } as Money,
    shorted_shares: 10,
    reporting_date: '2025-01-01'
}

describe('Short Data Service Tests', () => {

    beforeAll(async () => {
        jest.unstable_mockModule('#root/src/db/db.ts', () => ({
            executeQuery: jest.fn(),
            executeBatch: jest.fn(),
        }));

        ShortDataService = await import("#root/src/services/ShortDataService.ts");
        db = await import("#root/src/db/db.ts");

        executeQueryMock = db.executeQuery;
        executeBatchMock = db.executeBatch;
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('GET by query', () => {

        test('Get all short data for stock', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: '1',
                    stock_id: '1',
                    shorted_amount: new Money(1000, 0, 2, 'HKD'),
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
                    shorted_amount: new Money(1000, 0, 2, 'HKD'),
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
                    shorted_amount: new Money(1000, 0, 2, 'HKD'),
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
                    shorted_amount: new Money(1000, 0, 2, 'HKD'),
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
                    shorted_amount: new Money(1000, 0, 2, 'HKD'),
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
                    shorted_amount: new Money(1000, 0, 2, 'HKD'),
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
                    total_rows: 2,
                },
                {
                    ticker_no: '00002',
                    total_rows: 2,
                }
            ]);

            const args: ShortDataTickersWithMismatchQuery = {
                limit: 10,
                offset: 0
            }

            expect((await ShortDataService.getTickersWithMismatchedData(args)).tickers).toEqual(['00001', '00002']);
        });

        test('Get shorts with mismatched tickers, missing limit', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    ticker_no: '00001',
                    total_rows: 2,
                },
                {
                    ticker_no: '00002',
                    total_rows: 2,
                }
            ]);

            const args: ShortDataTickersWithMismatchQuery = {
                offset: 0
            }

            expect((await ShortDataService.getTickersWithMismatchedData(args)).tickers).toEqual(['00001', '00002']);
        });

        test('Get shorts with mismatched tickers, missing offset', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    ticker_no: '00001',
                    total_rows: 2,
                },
                {
                    ticker_no: '00002',
                    total_rows: 2,
                }
            ]);

            const args: ShortDataTickersWithMismatchQuery = {
                limit: 10
            }

            expect((await ShortDataService.getTickersWithMismatchedData(args)).tickers).toEqual(['00001', '00002']);
        });

        test('Get shorts with mismatched tickers, error with query', async () => {

            executeQueryMock.mockRejectedValueOnce(new Error('Some error'));

            const args: ShortDataTickersWithMismatchQuery = {
                limit: 10,
                offset: 0
            };

            await expect(ShortDataService.getTickersWithMismatchedData(args)).rejects.toThrow(Error);
        });
    });

    describe('GET mismatched Short by Ticker', () => {

        test('Get shorts with mismatched tickers', async () => {

            executeQueryMock.mockResolvedValueOnce([
                ShortData.fromDB({
                    id: '1',
                    stock_id: null,
                    reporting_date: new Date(2025, 0, 1),
                    shorted_shares: 100,
                    shorted_amount: new Money(1000, 0, 2, 'HKD'),
                    ticker_no: '00001',
                    decimal_places: 2,
                    currency: 'HKD',
                    created_datetime: new Date(2025, 0, 1),
                    last_modified_datetime: new Date(2025, 0, 1)
                }),
                ShortData.fromDB({
                    id: '2',
                    stock_id: null,
                    reporting_date: new Date(2025, 0, 1),
                    shorted_shares: 200,
                    shorted_amount: new Money(2000, 0, 2, 'HKD'),
                    ticker_no: '00001',
                    decimal_places: 2,
                    currency: 'HKD',
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