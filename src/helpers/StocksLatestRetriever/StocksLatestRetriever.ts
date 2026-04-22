import Stock from "#root/src/models/Stock.js";
import {executeBatch} from "#root/src/db/db.js";
import {
    getStockDataAsWorksheet,
    getNewStockMap,
    getStocksToUpdate
} from "#root/src/helpers/StocksLatestRetriever/StocksLatestRetrieverHelper.js";

//For getting the latest stock list from HKEX: https://www.hkex.com.hk/eng/services/trading/securities/securitieslists/ListOfSecurities.xlsx
//Worksheet Cols seems to change arbitrarily (thanks hkex) so need to parameterise it somehow
//Also should parameterise the hkex endpoint

const retrieveStockData = async (url: string) => {

    if (!url) throw new Error('Stock retrieval URL is undefined!');

    const worksheet = await getStockDataAsWorksheet(url);

    if (worksheet === undefined) return;
    console.log('got worksheet');

    const newStocksMap: Map<string, Stock> = getNewStockMap(worksheet);

    const stocksToUpdate: Stock[] = await getStocksToUpdate(newStocksMap);

    try {

        await executeBatch({
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

        await executeBatch({
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
            stocksToUpdate.map(stock => stock.toDB())
        );
    } catch (e) {

        console.error(e);
    }
}

export {
    retrieveStockData
}