import {afterEach, describe, expect, jest, test} from "@jest/globals";
import * as StockService from "#root/src/services/StockService.ts";
import {StocksDataBody, StocksDataGetParam} from "#root/src/services/StockService.ts";
import * as db from "#root/src/db/db.ts";
import {DuplicateFoundError, InvalidRequestError} from "#root/src/errors/Errors.ts";

jest.mock('#root/src/db/db.ts');
const executeQueryMock = db.executeQuery as jest.MockedFunction<typeof db.executeQuery>;
const executeBatchMock = db.executeBatch as jest.MockedFunction<typeof db.executeBatch>;

const testStockDataBody = {
    ticker_no: '00002',
    name: 'Test1',
    full_name: 'Full Test 1',
    description: '',
    category: 'exchange_traded_products',
    subcategory: 'etf',
    board_lot: 500,
    ISIN: 'testISIN',
    currency: 'HKD',
}

//TODO: Complete testing
describe('Stock Service Tests', () => {

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('GET by Query', () => {

        test('Get all stocks', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                    full_name: 'test full 1',
                    description: '',
                    category: 'equity',
                    subcategory: 'equity_securities_main',
                    board_lot: 100,
                    ISIN: 'xxyyzz',
                    currency: 'HKD',
                }
            ]);
            //Check if running normally, accepts {} with no complaint
            const args:StocksDataGetParam = {};

            const result = await StockService.getStocksData(args);

            expect(result).toHaveLength(1);
        });

        test('Get all stocks, verify ticker_no success', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                    full_name: 'test full 1',
                    description: '',
                    category: 'equity',
                    subcategory: 'equity_securities_main',
                    board_lot: 100,
                    ISIN: 'xxyyzz',
                    currency: 'HKD',
                }
            ]);

            const args:StocksDataGetParam = {
                ticker_no: '00001'
            };

            const result = await StockService.getStocksData(args);

            expect(result).toHaveLength(1);
        });

        test('Get all stocks, verify name success', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                    full_name: 'test full 1',
                    description: '',
                    category: 'equity',
                    subcategory: 'equity_securities_main',
                    board_lot: 100,
                    ISIN: 'xxyyzz',
                    currency: 'HKD',
                }
            ]);

            const args:StocksDataGetParam = {
                name: 'test1'
            };

            const result = await StockService.getStocksData(args);

            expect(result).toHaveLength(1);
        });

        test('Get all stocks, verify ISIN success', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                    full_name: 'test full 1',
                    description: '',
                    category: 'equity',
                    subcategory: 'equity_securities_main',
                    board_lot: 100,
                    ISIN: 'xxyyzz',
                    currency: 'HKD',
                }
            ]);

            const args:StocksDataGetParam = {
                ISIN: 'test1'
            };

            const result = await StockService.getStocksData(args);

            expect(result).toHaveLength(1);
        });
    });

    describe('POST', () => {

        test('Post stocks', async () => {

            executeQueryMock.mockResolvedValueOnce([]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}]);

            const data: StocksDataBody[] = [
                testStockDataBody
            ];

            const result = await StockService.postStockData(data);

            expect(result).toHaveLength(1);
        });

        test('Post stocks, but existing exists', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                    full_name: 'test full 1',
                    description: '',
                    category: 'equity',
                    subcategory: 'equity_securities_main',
                    board_lot: 100,
                    ISIN: 'xxyyzz',
                    currency: 'HKD',
                }
            ]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}]);

            const data: StocksDataBody[] = [
                testStockDataBody
            ];

            await expect(async () => StockService.postStockData(data))
                .rejects.toThrow(DuplicateFoundError);
        });

        test('Post stocks, verify ticker_no violate length', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                    full_name: 'test full 1',
                    description: '',
                    category: 'equity',
                    subcategory: 'equity_securities_main',
                    board_lot: 100,
                    ISIN: 'xxyyzz',
                    currency: 'HKD',
                }
            ]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}]);


            //ticker no must be 5 chars long and a string
            const data: StocksDataBody[] = [
                {...testStockDataBody, ticker_no: '2'}
            ];

            await expect(async () => StockService.postStockData(data))
                .rejects.toThrow(InvalidRequestError);
        });

        test('Post stocks, verify category with accepted values', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                    full_name: 'test full 1',
                    description: '',
                    category: 'equity',
                    subcategory: 'equity_securities_main',
                    board_lot: 100,
                    ISIN: 'xxyyzz',
                    currency: 'HKD',
                }
            ]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}]);


            //ticker no must be 5 chars long and a string
            const data: StocksDataBody[] = [
                {...testStockDataBody, category: 'cryptocurrency'}
            ];

            await expect(async () => StockService.postStockData(data))
                .rejects.toThrow(InvalidRequestError);
        });

        test('Post stocks, verify subcategory with accepted values', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                    full_name: 'test full 1',
                    description: '',
                    category: 'equity',
                    subcategory: 'equity_securities_main',
                    board_lot: 100,
                    ISIN: 'xxyyzz',
                    currency: 'HKD',
                }
            ]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}]);


            //ticker no must be 5 chars long and a string
            const data: StocksDataBody[] = [
                {...testStockDataBody, subcategory: 'memecoins'}
            ];

            await expect(async () => StockService.postStockData(data))
                .rejects.toThrow(InvalidRequestError);
        });

        test('Post stocks, verify currency with accepted values', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                    full_name: 'test full 1',
                    description: '',
                    category: 'equity',
                    subcategory: 'equity_securities_main',
                    board_lot: 100,
                    ISIN: 'xxyyzz',
                    currency: 'HKD',
                }
            ]);
            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}]);


            //ticker no must be 5 chars long and a string
            const data: StocksDataBody[] = [
                {...testStockDataBody, currency: 'GBP'}
            ];

            await expect(async () => StockService.postStockData(data))
                .rejects.toThrow(InvalidRequestError);
        });
    });

    describe('GET by ticker_no', () => {

        test('Get single stock', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                    full_name: 'test full 1',
                    description: '',
                    category: 'equity',
                    subcategory: 'equity_securities_main',
                    board_lot: 100,
                    ISIN: 'xxyyzz',
                    currency: 'HKD',
                }
            ]);
            const args:StocksDataGetParam = {ticker_no: '00001'};

            const result = await StockService.getStockData(args);

            expect(result).toHaveLength(1);
        });

        test('Get single stock, error on missing ticker_no', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                    full_name: 'test full 1',
                    description: '',
                    category: 'equity',
                    subcategory: 'equity_securities_main',
                    board_lot: 100,
                    ISIN: 'xxyyzz',
                    currency: 'HKD',
                }
            ]);
            const args:StocksDataGetParam = {};

            await expect(async () => StockService.getStockData(args))
                .rejects.toThrow(InvalidRequestError);
        });

        test('Get single stock, invalid ticker_no', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                    full_name: 'test full 1',
                    description: '',
                    category: 'equity',
                    subcategory: 'equity_securities_main',
                    board_lot: 100,
                    ISIN: 'xxyyzz',
                    currency: 'HKD',
                }
            ]);
            const args:StocksDataGetParam = {ticker_no: '001'};

            await expect(async () => StockService.getStockData(args))
                .rejects.toThrow(InvalidRequestError);
        });
    })

    describe('PUT', () => {

        test('Put stock', async () => {

            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}]);

            const data: StocksDataBody = testStockDataBody;

            const result = await StockService.putStockData([data]);

            expect(result).toHaveLength(1);
        });

        test('Put stocks, verify ticker_no violate length', async () => {

            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}]);

            //ticker no must be 5 chars long and a string
            const data: StocksDataBody = {...testStockDataBody, ticker_no: '2'};

            await expect(async () => StockService.putStockData([data]))
                .rejects.toThrow(InvalidRequestError);
        });

        test('Put stocks, verify category with accepted values', async () => {

            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}]);

            //ticker no must be 5 chars long and a string
            const data: StocksDataBody = {...testStockDataBody, category: 'cryptocurrency'};

            await expect(async () => StockService.putStockData([data]))
                .rejects.toThrow(InvalidRequestError);
        });

        test('Put stocks, verify subcategory with accepted values', async () => {

            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}]);

            //ticker no must be 5 chars long and a string
            const data: StocksDataBody = {...testStockDataBody, subcategory: 'memecoins'};

            await expect(async () => StockService.putStockData([data]))
                .rejects.toThrow(InvalidRequestError);
        });

        test('Put stocks, verify currency with accepted values', async () => {

            executeBatchMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 1, warningStatus: 0}]);

            //ticker no must be 5 chars long and a string
            const data: StocksDataBody = {...testStockDataBody, currency: 'GBP'};

            await expect(async () => StockService.putStockData([data]))
                .rejects.toThrow(InvalidRequestError);
        });
    });

    describe('DELETE', () => {

        test('Delete stock', async () => {

            executeQueryMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 0, warningStatus: 0}]);

            const args:StocksDataGetParam = {ticker_no: '00001'};

            const result = await StockService.deleteStockData(args);

            expect(result.status).toBe('success');
        });

        test('Delete single stock, error on missing ticker_no', async () => {

            executeQueryMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 0, warningStatus: 0}]);

            const args:StocksDataGetParam = {};

            await expect(async () => StockService.deleteStockData(args))
                .rejects.toThrow(InvalidRequestError);
        });

        test('Delete single stock, invalid ticker_no', async () => {

            executeQueryMock.mockResolvedValueOnce([{affectedRows: 1, insertId: 0, warningStatus: 0}]);

            const args:StocksDataGetParam = {ticker_no: '001'};

            await expect(async () => StockService.deleteStockData(args))
                .rejects.toThrow(InvalidRequestError);
        });
    });
});