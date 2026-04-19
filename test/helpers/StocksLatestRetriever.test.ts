import {afterEach, jest} from "@jest/globals";
import ExcelJS from "exceljs3";

let db: any;
let executeQueryMock: jest.MockedFunction<any>;
let StocksLatestRetrieverHelper: any;
let worksheet: ExcelJS.Worksheet;

describe('StocksLatestRetriever Tests', () => {

    beforeAll(async () => {

        jest.unstable_mockModule('#root/src/db/db.ts', () => ({
            executeQuery: jest.fn(),
            executeBatch: jest.fn(),
        }));

        // jest.unstable_mockModule('#root/src/helpers/StocksLatestRetriever/StocksLatestRetrieverHelper.ts', () => ({
        //     getStockDataAsWorksheet: jest.fn(),
        // }));

        StocksLatestRetrieverHelper = await import("#root/src/helpers/StocksLatestRetriever/StocksLatestRetrieverHelper.ts");
        db = await import("#root/src/db/db.ts");

        executeQueryMock = db.executeQuery;

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile('test/test-files/StockImport_Test.xlsx');

        const worksheetRaw = workbook.getWorksheet();
        if (worksheetRaw !== undefined) {

            worksheet = worksheetRaw;
        } else {

            throw new Error('No Worksheet found!');
        }
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('Should getNewStockMap given a worksheet', async () => {

        const newStockMap = StocksLatestRetrieverHelper.getNewStockMap(worksheet);

        expect(newStockMap.size).toEqual(3);
        expect(newStockMap.has('00001')).toEqual(true);
        expect(newStockMap.has('00002')).toEqual(true);
        expect(newStockMap.has('00003')).toEqual(true);
        expect(newStockMap.has('00004')).toEqual(false);

        expect(newStockMap.get('00001').name).toEqual('CKH HOLDINGS');
        expect(newStockMap.get('00002').name).toEqual('CLP HOLDINGS');
        expect(newStockMap.get('00003').name).toEqual('HK & CHINA GAS');
    });

    it('Should properly generate the stocks to update given a newStockMap', async () => {

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
            },
            {
                id: 2,
                ticker_no: '00002',
                name: 'CLP HOLDINGS',
                full_name: 'test full 1',
                description: '',
                category: 'equity',
                subcategory: 'equity_securities_main',
                board_lot: 500,
                ISIN: 'test',
                currency: 'HKD',
            }
        ]);

        executeQueryMock.mockResolvedValueOnce([
            {
                id: 4,
                ticker_no: '00004',
                name: 'Test Holdings',
                full_name: 'test to inactive',
                description: '',
                category: 'equity',
                subcategory: 'equity_securities_main',
                board_lot: 500,
                ISIN: 'test',
                currency: 'HKD',
            }
        ]);

        const newStockMap = StocksLatestRetrieverHelper.getNewStockMap(worksheet);

        const stocksToUpdate = await StocksLatestRetrieverHelper.getStocksToUpdate(newStockMap);

        console.log(stocksToUpdate);
        expect(stocksToUpdate.length).toEqual(5);
        expect(stocksToUpdate).toContainEqual({
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
            is_active: false
        });
        expect(stocksToUpdate).toContainEqual({
            id: 2,
            ticker_no: '00002',
            name: 'CLP HOLDINGS',
            full_name: 'test full 1',
            description: '',
            category: 'equity',
            subcategory: 'equity_securities_main',
            board_lot: 500,
            ISIN: 'HK0002007356',
            currency: 'HKD',
        });
        expect(stocksToUpdate).toContainEqual({
            id: 4,
            ticker_no: '00004',
            name: 'Test Holdings',
            full_name: 'test to inactive',
            description: '',
            category: 'equity',
            subcategory: 'equity_securities_main',
            board_lot: 500,
            ISIN: 'test',
            currency: 'HKD',
            is_active: false
        });
        expect(stocksToUpdate).toContainEqual(expect.objectContaining({
            ticker_no: '00001',
            name: 'CKH HOLDINGS',
            category: 'equity',
            subcategory: 'equity_securities_main',
            board_lot: 500,
            ISIN: 'KYG217651051',
            currency: 'HKD',
            is_active: true
        }));
        expect(stocksToUpdate).toContainEqual(expect.objectContaining({
            ticker_no: '00003',
            name: 'HK & CHINA GAS',
            category: 'equity',
            subcategory: 'equity_securities_main',
            board_lot: 1000,
            ISIN: 'HK0003000038',
            currency: 'HKD',
            is_active: true
        }));
    });
});