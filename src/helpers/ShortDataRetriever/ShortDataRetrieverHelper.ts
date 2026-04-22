import Stock from "#root/src/models/Stock.js";
import {executeQuery} from "#root/src/db/db.js";
import ShortData from "#root/src/models/ShortData.js";
import {CurrencyCache} from "#root/src/utilities/DataCache.js";
import Money from "money-type";
import {dateToStringConverter} from "#root/src/helpers/DateHelper.js";

type UploadDataMapping = { [p: string]: UploadDataMappingElement };
type UploadDataMappingElement = { label: string; value: string };

export type SFCData = {
    ticker_no: string;
    name: string;
    reporting_date: Date;
    shorted_shares: number;
    shorted_amount: number;
}

const mapping: UploadDataMapping = {
    'id': {
        label: 'id',
        value: 'id'
    },
    'Stock Code': {
        label: "Stock Code",
        value: "ticker_no"
    },
    'Stock Name': {
        label: 'Stock Name',
        value: 'name'
    },
    'Date': {
        label: "Reporting Date",
        value: "reporting_date"
    },
    'Aggregated Reportable Short Positions (Shares)': {
        label: "Shorted Shares",
        value: "shorted_shares"
    },
    'Aggregated Reportable Short Positions (HK$)': {
        label: "Shorted Amount",
        value: "shorted_amount"
    }
}

const getShortDataFromWeb = async (targetDate: Date): Promise<string> => {

    const root = process.env.SHORT_DATA_RETRIEVAL_BASE_URL;
    if (!root) throw new Error('Short Data retrieval URL is undefined!');

    let fileName = `Short_Position_Reporting_Aggregated_Data_${targetDate.getFullYear()}${(targetDate.getMonth() + 1).toString().padStart(2, '0')}${targetDate.getDate().toString().padStart(2, '0')}.csv`;

    const response = await fetch(
        `${root}/${targetDate.getFullYear()}/${(targetDate.getMonth() + 1).toString().padStart(2, '0')}/${targetDate.getDate().toString().padStart(2, '0')}/${fileName}`,
        {
            method: 'GET'
        }
    )

    //for some reason, error is also 200
    if (!response.ok) throw new Error('Failed to fetch Short Data');

    //this is the expected error if path is invalid
    const responseHeaders = response.headers.get('content-type');
    if (responseHeaders !== null && responseHeaders.includes('text/html')) throw new Error('No file exists for this date.');

    //this is for handling the unexpected errors
    if (responseHeaders !== null && !responseHeaders.includes('text/plain')) throw new Error('Unexpected error occurred when retrieving file.');

    return await response.text();
}

const shortDataRetrieverComplete = async (results: Papa.ParseResult<SFCData>, callbackHandler: (data: ShortData[]) => void) => {

    const existingStockMap = new Map<string, Stock>();
    const existingStocks = await executeQuery<Stock>(
        {
            namedPlaceholders: true,
            sql: 'SELECT id, ticker_no, name FROM Stocks WHERE ticker_no IN (?)'
        },
        [results.data.map((element) => element.ticker_no)],
        (element) => Stock.fromDB(element)
    );

    existingStocks.forEach((existingStock: Stock) => existingStockMap.set(`${existingStock.ticker_no}_${existingStock.name}`, existingStock));

    callbackHandler(results.data.map((element: SFCData): ShortData => ShortData.fromAPI({
        ticker_no: element.ticker_no,
        reporting_date: element.reporting_date,
        shorted_shares: element.shorted_shares,
        shorted_amount: Money.fromNominalValue(element.shorted_amount, CurrencyCache.get().get('HKD')?.decimal_places ?? 2, 'HKD'),
        stock_id: existingStockMap.get(`${element.ticker_no}_${element.name}`)?.id
    })));
}

const shortDataRetrieverTransformHeader = (header: any) => {

    if (!Object.hasOwn(mapping, header)) return header;

    return mapping[header as keyof UploadDataMapping].value;
}
const shortDataRetrieverTransform = (value: string, field: string) => {

    if (field === 'reporting_date') {

        const dateString = value.split('/');

        const parsedDate = new Date(Number(dateString[2]), Number(dateString[1]) - 1, Number(dateString[0]));
        if (isNaN(parsedDate.getTime())) throw new Error('Invalid Date');

        return dateToStringConverter(parsedDate);
    }

    if (field === 'ticker_no') {

        return value.padStart(5, '0');
    }

    return value;
}

export {
    getShortDataFromWeb,
    shortDataRetrieverComplete,
    shortDataRetrieverTransformHeader,
    shortDataRetrieverTransform
}