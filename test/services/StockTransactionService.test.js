import { afterEach, describe, expect, jest, test } from "@jest/globals";
import * as StockTransactionService from "#root/src/services/StockTransactionService.ts";
import * as db from "#root/src/db/db.ts";
import { InvalidRequestError, RecordNotFoundError } from "#root/src/errors/Errors.ts";
jest.mock('#root/src/db/db.ts');
const executeQueryMock = db.executeQuery;
const executeBatchMock = db.executeBatch;
const testStockTransactionDataBody = {
    id: 1,
    stock_id: 1,
    type: 'buy',
    amount: 123.45,
    quantity: 100,
    fee: 43.21,
    transaction_date: '2025-01-01',
    currency: 'HKD',
};
//TODO: Complete testing
describe('Stock Transaction Service Tests', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });
    describe('GET by Query', () => {
        test('Get all stocks transactions', async () => {
            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    stock_id: 1,
                    type: 'buy',
                    quantity: 10,
                    amount: 100,
                    fee: 10,
                    amount_per_share: 10,
                    currency: 'HKD',
                }
            ]);
            //Check if running normally, accepts {} with no complaint
            const args = {};
            const result = await StockTransactionService.getStockTransactionsData(args);
            expect(result).toHaveLength(1);
        });
        test('Get all stocks transactions, check all params success', async () => {
            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    stock_id: 1,
                    type: 'buy',
                    quantity: 10,
                    amount: 100,
                    fee: 10,
                    amount_per_share: 10,
                    currency: 'HKD',
                }
            ]);
            const args = {
                id: 1,
                stock_id: 1,
                type: ['buy'],
                start_date: '2025-01-01',
                end_date: '2025-12-31',
            };
            const result = await StockTransactionService.getStockTransactionsData(args);
            expect(result).toHaveLength(1);
        });
        test('Get all stock transactions, verify type success', async () => {
            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    stock_id: 1,
                    type: 'buy',
                    quantity: 10,
                    amount: 100,
                    fee: 10,
                    amount_per_share: 10,
                    currency: 'HKD',
                }
            ]);
            const args = {
                type: ['buy', 'sell']
            };
            const result = await StockTransactionService.getStockTransactionsData(args);
            expect(result).toHaveLength(1);
        });
        test('Get all stock transactions, verify type violate values', async () => {
            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    stock_id: 1,
                    type: 'buy',
                    quantity: 10,
                    amount: 100,
                    fee: 10,
                    amount_per_share: 10,
                    currency: 'HKD',
                }
            ]);
            //ticker no must be 5 chars long and a string
            const args = {
                type: ['buy', 'yeowza']
            };
            await expect(async () => StockTransactionService.getStockTransactionsData(args))
                .rejects.toThrow(InvalidRequestError);
        });
        test('Get all stock transactions, expect error when start_date invalid format', async () => {
            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    stock_id: 1,
                    type: 'buy',
                    quantity: 10,
                    amount: 100,
                    fee: 10,
                    amount_per_share: 10,
                    currency: 'HKD',
                }
            ]);
            const args = {
                start_date: '2025-01-aa'
            };
            await expect(async () => StockTransactionService.getStockTransactionsData(args))
                .rejects.toThrow(InvalidRequestError);
        });
        test('Get all stock transactions, expect error when end_date invalid format', async () => {
            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    stock_id: 1,
                    type: 'buy',
                    quantity: 10,
                    amount: 100,
                    fee: 10,
                    amount_per_share: 10,
                    currency: 'HKD',
                }
            ]);
            const args = {
                end_date: '2025-01-aa'
            };
            await expect(async () => StockTransactionService.getStockTransactionsData(args))
                .rejects.toThrow(InvalidRequestError);
        });
    });
    describe('POST', () => {
        test('Post stock transactions', async () => {
            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                }
            ]);
            executeBatchMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            const data = [
                testStockTransactionDataBody
            ];
            const result = await StockTransactionService.createStockTransactionsData(data);
            expect(result).toHaveLength(1);
        });
        test('Post stock transactions, but existing does not exist', async () => {
            executeQueryMock.mockResolvedValueOnce([]);
            executeBatchMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            const data = [
                testStockTransactionDataBody
            ];
            await expect(async () => StockTransactionService.createStockTransactionsData(data))
                .rejects.toThrow(RecordNotFoundError);
        });
        test('Post stock transactions, expect error when stock_id does not exist', async () => {
            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                }
            ]);
            executeBatchMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            //ticker no must be 5 chars long and a string
            const data = [
                { ...testStockTransactionDataBody, stock_id: undefined }
            ];
            await expect(async () => StockTransactionService.createStockTransactionsData(data))
                .rejects.toThrow(InvalidRequestError);
        });
        test('Post stock transactions, expect error when type does not exist', async () => {
            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                }
            ]);
            executeBatchMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            //ticker no must be 5 chars long and a string
            const data = [
                { ...testStockTransactionDataBody, type: undefined }
            ];
            await expect(async () => StockTransactionService.createStockTransactionsData(data))
                .rejects.toThrow(InvalidRequestError);
        });
        test('Post stock transactions, expect error when type is not supported', async () => {
            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                }
            ]);
            executeBatchMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            //ticker no must be 5 chars long and a string
            const data = [
                { ...testStockTransactionDataBody, type: 'transfer' }
            ];
            await expect(async () => StockTransactionService.createStockTransactionsData(data))
                .rejects.toThrow(InvalidRequestError);
        });
        test('Post stock transactions, expect error when amount does not exist', async () => {
            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                }
            ]);
            executeBatchMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            //ticker no must be 5 chars long and a string
            const data = [
                { ...testStockTransactionDataBody, amount: undefined }
            ];
            await expect(async () => StockTransactionService.createStockTransactionsData(data))
                .rejects.toThrow(InvalidRequestError);
        });
        test('Post stock transactions, expect error when quantity does not exist', async () => {
            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                }
            ]);
            executeBatchMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            //ticker no must be 5 chars long and a string
            const data = [
                { ...testStockTransactionDataBody, quantity: undefined }
            ];
            await expect(async () => StockTransactionService.createStockTransactionsData(data))
                .rejects.toThrow(InvalidRequestError);
        });
        test('Post stock transactions, expect error when quantity is less than 0', async () => {
            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                }
            ]);
            executeBatchMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            //ticker no must be 5 chars long and a string
            const data = [
                { ...testStockTransactionDataBody, quantity: -1 }
            ];
            await expect(async () => StockTransactionService.createStockTransactionsData(data))
                .rejects.toThrow(InvalidRequestError);
        });
        test('Post stock transactions, expect error when fee does not exist', async () => {
            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                }
            ]);
            executeBatchMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            //ticker no must be 5 chars long and a string
            const data = [
                { ...testStockTransactionDataBody, fee: undefined }
            ];
            await expect(async () => StockTransactionService.createStockTransactionsData(data))
                .rejects.toThrow(InvalidRequestError);
        });
        test('Post stock transactions, expect error when transaction_date does not exist', async () => {
            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                }
            ]);
            executeBatchMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            //ticker no must be 5 chars long and a string
            const data = [
                { ...testStockTransactionDataBody, transaction_date: undefined }
            ];
            await expect(async () => StockTransactionService.createStockTransactionsData(data))
                .rejects.toThrow(InvalidRequestError);
        });
        test('Post stock transactions, expect error when transaction_date format is wrong', async () => {
            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                }
            ]);
            executeBatchMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            //ticker no must be 5 chars long and a string
            const data = [
                { ...testStockTransactionDataBody, transaction_date: '2025-01-aaa' }
            ];
            await expect(async () => StockTransactionService.createStockTransactionsData(data))
                .rejects.toThrow(InvalidRequestError);
        });
        test('Post stock transactions, expect error when currency does not exist', async () => {
            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                }
            ]);
            executeBatchMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            //ticker no must be 5 chars long and a string
            const data = [
                { ...testStockTransactionDataBody, currency: undefined }
            ];
            await expect(async () => StockTransactionService.createStockTransactionsData(data))
                .rejects.toThrow(InvalidRequestError);
        });
        test('Post stock transactions, expect error when currency is not supported', async () => {
            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1,
                    ticker_no: '00001',
                    name: 'test1',
                }
            ]);
            executeBatchMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            //ticker no must be 5 chars long and a string
            const data = [
                { ...testStockTransactionDataBody, currency: 'GBP' }
            ];
            await expect(async () => StockTransactionService.createStockTransactionsData(data))
                .rejects.toThrow(InvalidRequestError);
        });
    });
    describe('PUT', () => {
        test('Put stock transaction', async () => {
            executeQueryMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            const data = testStockTransactionDataBody;
            const result = await StockTransactionService.upsertStockTransactionData(data);
            expect(result).toHaveLength(1);
        });
        test('Put stock transactions, expect error when stock_id does not exist', async () => {
            executeQueryMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            const data = { ...testStockTransactionDataBody, stock_id: undefined };
            await expect(async () => StockTransactionService.upsertStockTransactionData(data))
                .rejects.toThrow(InvalidRequestError);
        });
        test('Put stock transactions, expect error when type does not exist', async () => {
            executeQueryMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            const data = { ...testStockTransactionDataBody, type: undefined };
            await expect(async () => StockTransactionService.upsertStockTransactionData(data))
                .rejects.toThrow(InvalidRequestError);
        });
        test('Put stock transactions, expect error when type is not supported', async () => {
            executeQueryMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            const data = { ...testStockTransactionDataBody, type: 'yowza' };
            await expect(async () => StockTransactionService.upsertStockTransactionData(data))
                .rejects.toThrow(InvalidRequestError);
        });
        test('Put stock transactions, expect error when amount does not exist', async () => {
            executeQueryMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            const data = { ...testStockTransactionDataBody, amount: undefined };
            await expect(async () => StockTransactionService.upsertStockTransactionData(data))
                .rejects.toThrow(InvalidRequestError);
        });
        test('Put stock transactions, expect error when quantity does not exist', async () => {
            executeQueryMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            const data = { ...testStockTransactionDataBody, quantity: undefined };
            await expect(async () => StockTransactionService.upsertStockTransactionData(data))
                .rejects.toThrow(InvalidRequestError);
        });
        test('Put stock transactions, expect error when quantity is less than 0', async () => {
            executeQueryMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            const data = { ...testStockTransactionDataBody, quantity: -1 };
            await expect(async () => StockTransactionService.upsertStockTransactionData(data))
                .rejects.toThrow(InvalidRequestError);
        });
        test('Put stock transactions, expect error when fee does not exist', async () => {
            executeQueryMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            const data = { ...testStockTransactionDataBody, fee: undefined };
            await expect(async () => StockTransactionService.upsertStockTransactionData(data))
                .rejects.toThrow(InvalidRequestError);
        });
        test('Put stock transactions, expect error when transaction_date does not exist', async () => {
            executeQueryMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            const data = { ...testStockTransactionDataBody, transaction_date: undefined };
            await expect(async () => StockTransactionService.upsertStockTransactionData(data))
                .rejects.toThrow(InvalidRequestError);
        });
        test('Put stock transactions, expect error when transaction_date format is wrong', async () => {
            executeQueryMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            const data = { ...testStockTransactionDataBody, transaction_date: '2025-01-0a' };
            await expect(async () => StockTransactionService.upsertStockTransactionData(data))
                .rejects.toThrow(InvalidRequestError);
        });
        test('Put stock transactions, expect error when currency does not exist', async () => {
            executeQueryMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            const data = { ...testStockTransactionDataBody, currency: undefined };
            await expect(async () => StockTransactionService.upsertStockTransactionData(data))
                .rejects.toThrow(InvalidRequestError);
        });
        test('Put stock transactions, expect error when currency is not supported', async () => {
            executeQueryMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 1, warningStatus: 0 }]);
            const data = { ...testStockTransactionDataBody, currency: 'GBP' };
            await expect(async () => StockTransactionService.upsertStockTransactionData(data))
                .rejects.toThrow(InvalidRequestError);
        });
    });
    describe('DELETE', () => {
        test('Delete stock transaction', async () => {
            executeQueryMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 0, warningStatus: 0 }]);
            const args = { id: 1 };
            const result = await StockTransactionService.deleteStockTransactionData(args);
            expect(result.status).toBe('success');
        });
        test('Delete stock transaction, error on missing id', async () => {
            executeQueryMock.mockResolvedValueOnce([{ affectedRows: 1, insertId: 0, warningStatus: 0 }]);
            const args = {};
            await expect(async () => StockTransactionService.deleteStockTransactionData(args))
                .rejects.toThrow(InvalidRequestError);
        });
    });
});
