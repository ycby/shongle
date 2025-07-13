import {describe, expect, jest, test} from "@jest/globals";
import * as StockService from "#root/src/services/StockService.ts";
import {StocksDataGetParam} from "#root/src/services/StockService.ts";
import * as db from "#root/src/db/db.ts";

jest.mock('#root/src/db/db.ts');
const executeQueryMock = db.executeQuery as jest.MockedFunction<typeof db.executeQuery>;

//TODO: Complete testing
describe('Stock Service Tests', () => {

    test('Get all stock transactions', async () => {

        //Check if running normally, accepts {} with no complaint
        executeQueryMock.mockResolvedValue([
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

        const result = await StockService.getStocksData(args);

        expect(result).toHaveLength(1);
    });
});