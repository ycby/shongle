import ExcelJS from "exceljs3";
import stream from "node:stream";
import {CurrencyKeys} from "#root/src/types.ts";
import {executeQuery} from "#root/src/db/db.ts";
import Stock from "#root/src/models/Stock.ts";

const hkexStockMapping = {
    "ticker_no": {
        "hkex": 1,
        "internal": "ticker_no"
    },
    "name": {
        "hkex": 2,
        "internal": "name",
    },
    "category": {
        "hkex": 3,
        "internal": "category",
    },
    "subcategory": {
        "hkex": 4,
        "internal": "subcategory",
    },
    "board_lot": {
        "hkex": 5,
        "internal": "board_lot",
    },
    "ISIN": {
        "hkex": 6,
        "internal": "ISIN",
    },
    "currency": {
        "hkex": 17,
        "internal": "currency",
    }
}

const subcategoryMapping = {
    'Equity Securities (GEM)': 'equity_securities_gem',
    'Equity Securities (Main Board)': 'equity_securities_main',
    'Exchange Traded Funds': 'etf',
    'Investment Companies': 'investment_companies',
    'Leveraged and Inverse': 'leveraged_and_inverse',
    'Trading Only Securities': 'trading_only_securities',
    'Depositary Receipts': 'depository_receipts',
    'Other Unit Trusts/Mutual Funds': 'others'
}

const categoryMapping = {
    'Equity': 'equity',
    'Real Estate Investment Trusts': 'reit',
    'Exchange Traded Products': 'exchange_traded_products',
    'Debt Securities': 'debt_securities',
    'Equity Warrants (Main Board)': 'equity_warrants',
    'Derivative Warrants': 'derivative_warrants',
    'Callable Bull/Bear Contracts': 'bull_bear_contracts'
}

const getStockDataAsWorksheet = async (url: string): Promise<ExcelJS.Worksheet | undefined> => {

    const response = await fetch(url, {
        method: 'GET',
    });

    if (!response.ok) throw new Error('Failed to retrieve latest Stock Data');
    if (!response.body) throw new Error ('Body is null when attempting to access latest Stock Data');

    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.read(stream.Readable.fromWeb(response.body));

    return workbook.getWorksheet();
}

const getStocksToUpdate = async (newStocksMap: Map<string, Stock>): Promise<Stock[]> => {

    const stocksToUpdate: Stock[] = [];
    const activeDBStockMap: Map<string, Stock> = await getCurrentActiveDBStocks([...newStocksMap.keys()]);

    for (let newStock of newStocksMap.values()) {

        //new
        if (!activeDBStockMap.has(newStock.ticker_no)) {
            stocksToUpdate.push(newStock);
            continue;
        }

        const dbStock = activeDBStockMap.get(newStock.ticker_no);

        if (!dbStock) continue;

        //name is the same but other details maybe need to update
        if (dbStock.name === newStock.name) {

            if (dbStock.board_lot === newStock.board_lot && dbStock.ISIN === newStock.ISIN) continue;

            dbStock.board_lot = newStock.board_lot;
            dbStock.ISIN = newStock.ISIN;
            stocksToUpdate.push(dbStock);
            continue;
        }

        //old stock is inactive
        dbStock.is_active = false;

        stocksToUpdate.push(dbStock);
        stocksToUpdate.push(newStock);
    }

    (await getCurrentInactiveDBStocks([...newStocksMap.keys()])).forEach(stock => {

        stock.is_active = false;
        stocksToUpdate.push(stock);
    });

    return stocksToUpdate;
}

const getNewStockMap = (worksheet: ExcelJS.Worksheet): Map<string, Stock> => {

    const newStocksMap = new Map<string, Stock>();

    worksheet.eachRow({includeEmpty: false}, (row, rowNumber) => {

        if (rowNumber < 4) return null;
        if (!['Equity', 'Exchange Traded Products', 'Real Estate Investment Trusts'].includes(row.getCell(3).value as string)) return null;

        const stock: Stock = new Stock();
        stock.ticker_no = (row.getCell(hkexStockMapping.ticker_no.hkex).value as string).padStart(5, '0');
        stock.name = row.getCell(hkexStockMapping.name.hkex).value as string;
        stock.category = categoryMapping[row.getCell(hkexStockMapping.category.hkex).value as keyof typeof categoryMapping];
        stock.subcategory = subcategoryMapping[row.getCell(hkexStockMapping.subcategory.hkex).value as keyof typeof subcategoryMapping];
        stock.board_lot = Number((row.getCell(hkexStockMapping.board_lot.hkex).value ?? '0').toString().replaceAll(',', '')) as number;
        stock.ISIN = row.getCell(hkexStockMapping.ISIN.hkex).value as string;
        stock.currency = row.getCell(hkexStockMapping.currency.hkex).value as CurrencyKeys;
        stock.is_active = true;

        newStocksMap.set(stock.ticker_no, stock);
    });

    return newStocksMap;
}

const getCurrentActiveDBStocks = async (activeTickers: string[]): Promise<Map<string, Stock>> => {

    const dbMap: Map<string, Stock> = new Map<string, Stock>();

    const activeStocks: Stock[] = await executeQuery<Stock>({
            sql: `SELECT * FROM Stocks WHERE ticker_no IN (?) AND is_active = TRUE`,
        },
        [activeTickers],
        (element: any): Stock => Stock.fromDB(element)
    );

    activeStocks.forEach((dbStock: Stock) => {

        dbMap.set(dbStock.ticker_no, dbStock);
    });

    return dbMap;
}

const getCurrentInactiveDBStocks = async (activeTickers: string[]): Promise<Stock[]> => {

    return await executeQuery<Stock>({
            sql: `SELECT * FROM Stocks WHERE ticker_no NOT IN (?) AND is_active = TRUE`,
        },
        [activeTickers],
        (element: any): Stock => Stock.fromDB(element)
    );
}

export {
    getStockDataAsWorksheet,
    getStocksToUpdate,
    getNewStockMap
}