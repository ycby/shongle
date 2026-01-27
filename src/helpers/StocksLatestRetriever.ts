import ExcelJS from "exceljs3";
import stream from "node:stream";
import Stock from "#root/src/models/Stock.js";
import {CurrencyKeys} from "#root/src/types.js";
import {executeBatch, executeQuery} from "#root/src/db/db.js";


//For getting the latest stock list from HKEX: https://www.hkex.com.hk/eng/services/trading/securities/securitieslists/ListOfSecurities.xlsx
//Worksheet Cols seems to change arbitrarily (thanks hkex) so need to parameterise it somehow
//Also should parameterise the hkex endpoint

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

const retrieveStockData = async () => {

    // const url = '/home/pikachu/Documents/Data/Exchange Data/2026ListOfSecurities.xlsx';
    const url = 'https://www.hkex.com.hk/eng/services/trading/securities/securitieslists/ListOfSecurities.xlsx';
    const workbook = new ExcelJS.Workbook();

    try {

        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) throw new Error('Failed to retrieve latest Stock Data');
        if (!response.body) throw new Error ('Body is null when attempting to access latest Stock Data');

        await workbook.xlsx.read(stream.Readable.fromWeb(response.body));
        // await workbook.xlsx.readFile(url);

        console.log('read workbook');

        const worksheet = workbook.getWorksheet();
        console.log('got worksheet');

        if (!worksheet) return;
        console.log('got worksheet');

        const newStocksMap: Map<string, Stock> = new Map<string, Stock>();

        worksheet.eachRow({includeEmpty: false}, (row, rowNumber) => {

            if (rowNumber < 4) return;
            if (!['Equity', 'Exchange Traded Products', 'Real Estate Investment Trusts'].includes(row.getCell(3).value as string)) return;

            const stock: Stock = new Stock('INSERT');
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

        console.log(newStocksMap.size);

        const activeStocks: Stock[] = await executeQuery<Stock[]>({
                sql: `SELECT * FROM Stocks WHERE ticker_no IN (?) AND is_active = TRUE`,
            },
            [[...newStocksMap.keys()]],
            (result: any): Stock[] => result.map((element: any) => new Stock('', element))
        );

        const nonActiveStocks: Stock[] = await executeQuery<Stock[]>({
                sql: `SELECT * FROM Stocks WHERE ticker_no NOT IN (?) AND is_active = TRUE`,
            },
            [[...newStocksMap.keys()]],
            (result: any): Stock[] => result.map((element: any) => new Stock('', element))
        );

        const stocksToUpdate: Stock[] = [];
        const dbMap: Map<string, Stock> = new Map<string, Stock>();
        activeStocks.forEach((dbStock: Stock) => {

            dbMap.set(dbStock.ticker_no, dbStock);
        });

        for (let newStock of newStocksMap.values()) {

            //new
            if (!dbMap.has(newStock.ticker_no)) {
                stocksToUpdate.push(newStock);
                continue;
            }

            const dbStock = dbMap.get(newStock.ticker_no);

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

        nonActiveStocks.forEach(stock => {

            // console.log(stock);
            stock.is_active = false;
            stocksToUpdate.push(stock);
        });

        console.log(stocksToUpdate);
        const updateTickerResults = await executeBatch({
                namedPlaceholders: true,
                sql: 'INSERT INTO Tickers (ticker_no, created_datetime, last_modified_datetime) ' +
                    'VALUES (:ticker_no, :created_datetime, :last_modified_datetime) ' +
                    'ON DUPLICATE KEY UPDATE last_modified_datetime=VALUES(last_modified_datetime)'
            },
            () => [...newStocksMap.values()].map((element) => ({
                ticker_no: element.ticker_no,
                created_datetime: element.created_datetime,
                last_modified_datetime: element.last_modified_datetime,
            })));

        const updateResults = await executeBatch({
                namedPlaceholders: true,
                sql: 'INSERT INTO Stocks ' +
                    '(id, ticker_no, name, full_name, description, category, subcategory, board_lot, ISIN, currency, is_active, created_datetime, last_modified_datetime) ' +
                    'VALUES (:id, :ticker_no, :name, :full_name, :description, :category, :subcategory, :board_lot, :ISIN, :currency, :is_active, :created_datetime, :last_modified_datetime) ' +
                    'ON DUPLICATE KEY UPDATE ' +
                    'ticker_no=VALUES(ticker_no), ' +
                    'name=VALUES(name), ' +
                    'full_name=VALUES(full_name), ' +
                    'description=VALUES(description), ' +
                    'category=VALUES(category), ' +
                    'subcategory=VALUES(subcategory), ' +
                    'board_lot=VALUES(board_lot), ' +
                    'ISIN=VALUES(ISIN), ' +
                    'currency=VALUES(currency), ' +
                    'is_active=VALUES(is_active), ' +
                    'last_modified_datetime=VALUES(last_modified_datetime)'
            },
            () => stocksToUpdate.map(stock => stock.getPlainObject())
        );
    } catch (e) {

        console.error(e);
    }
}

export {
    retrieveStockData
}