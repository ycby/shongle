import {describe, it, expect, jest, afterEach} from "@jest/globals";
import ShortData from "#root/src/models/ShortData.js";
import {CurrencyCache} from "#root/src/utilities/DataCache.js";
import {Currency} from "#root/src/types.js";

let db: any;
let executeQueryMock: jest.MockedFunction<any>;
let ShortDataRetrieverHelper: any;

describe('StocksLatestRetriever Tests', () => {

    beforeAll(async () => {

        jest.unstable_mockModule('#root/src/db/db.ts', () => ({
            executeQuery: jest.fn()
        }));

        ShortDataRetrieverHelper = await import("#root/src/helpers/ShortDataRetriever/ShortDataRetrieverHelper.ts");
        db = await import("#root/src/db/db.ts");

        executeQueryMock = db.executeQuery;

        await CurrencyCache.init(async (): Promise<Currency[]> => {

            return [
                {
                    ISO_code: 'HKD',
                    decimal_places: 2
                },
                {
                    ISO_code: 'USD',
                    decimal_places: 2
                }
            ]
        }, (element) => element.ISO_code);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('shortDataRetrieverComplete', () => {

        it('Should map the stock Id correctly based on the ticker no and name', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1n,
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
                    id: 2n,
                    ticker_no: '00002',
                    name: 'test2',
                    full_name: 'test full 2',
                    description: '',
                    category: 'equity',
                    subcategory: 'equity_securities_main',
                    board_lot: 100,
                    ISIN: 'xxyyzz',
                    currency: 'HKD',
                }
            ]);

            let result: ShortData[];

            await ShortDataRetrieverHelper.shortDataRetrieverComplete({
                data: [
                    {
                        ticker_no: '00001',
                        name: 'test1',
                        reporting_date: new Date(2026, 0, 1),
                        shorted_shares: 100,
                        shorted_amount: 1000
                    },
                    {
                        ticker_no: '00002',
                        name: 'test2',
                        reporting_date: new Date(2026, 0, 1),
                        shorted_shares: 100,
                        shorted_amount: 1000
                    },
                ],
                errors: [],
                meta: {
                    delimiter: ',',
                    linebreak: ',',
                    aborted: false,
                    truncated: false,
                    cursor: 1
                }
            }, (data: ShortData[]) => {
                result = data;
            });

            expect(result).toContainEqual(expect.objectContaining({
                stock_id: 1n,
                ticker_no: '00001',
            }));

            expect(result).toContainEqual(expect.objectContaining({
                stock_id: 2n,
                ticker_no: '00002',
            }));
        });

        it('Should not map stock id if no matching stock exists', async () => {

            executeQueryMock.mockResolvedValueOnce([
                {
                    id: 1n,
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
            ]);

            let result: ShortData[];

            await ShortDataRetrieverHelper.shortDataRetrieverComplete({
                data: [
                    {
                        ticker_no: '00002',
                        name: 'test2',
                        reporting_date: new Date(2026, 0, 1),
                        shorted_shares: 100,
                        shorted_amount: 1000
                    },
                ],
                errors: [],
                meta: {
                    delimiter: ',',
                    linebreak: ',',
                    aborted: false,
                    truncated: false,
                    cursor: 1
                }
            }, (data: ShortData[]) => {
                result = data;
            });

            expect(result).toContainEqual(expect.objectContaining({
                ticker_no: '00002',
                reporting_date: new Date(2026, 0, 1),
            }));
        });
    });

    describe('shortDataRetrieverTransformHeader', () => {

        it('Should return the mapped values of the header columns', () => {

            const headersId = ShortDataRetrieverHelper.shortDataRetrieverTransformHeader('id');
            const headersStockCode = ShortDataRetrieverHelper.shortDataRetrieverTransformHeader('Stock Code');
            const headersStockName = ShortDataRetrieverHelper.shortDataRetrieverTransformHeader('Stock Name');
            const headersDate = ShortDataRetrieverHelper.shortDataRetrieverTransformHeader('Date');
            const headersShortPosition = ShortDataRetrieverHelper.shortDataRetrieverTransformHeader('Aggregated Reportable Short Positions (Shares)');
            const headersShortAmount = ShortDataRetrieverHelper.shortDataRetrieverTransformHeader('Aggregated Reportable Short Positions (HK$)');

            expect(headersId).toEqual('id');
            expect(headersStockCode).toEqual('ticker_no');
            expect(headersStockName).toEqual('name');
            expect(headersDate).toEqual('reporting_date');
            expect(headersShortPosition).toEqual('shorted_shares');
            expect(headersShortAmount).toEqual('shorted_amount');
        });
    });

    describe('shortDataRetrieverTransform', () => {

        it('Should format the date properly when handling reporting_date', () => {

            const dateString = '01/01/2026';

            const result = ShortDataRetrieverHelper.shortDataRetrieverTransform(dateString, 'reporting_date');

            expect(result).toEqual('2026-01-01');
        });

        it('Should throw an error for an improper date', () => {

            const dateString = '01/01/20a6';

            expect(() => ShortDataRetrieverHelper.shortDataRetrieverTransform(dateString, 'reporting_date')).toThrow('Invalid Date');
        });

        it('Should format the ticker no properly when handling ticker_no, padded', () => {

            const tickerNos = '00005';

            const result = ShortDataRetrieverHelper.shortDataRetrieverTransform(tickerNos, 'ticker_no');

            expect(result).toEqual('00005');
        });

        it('Should format the ticker no properly when handling ticker_no, unpadded', () => {

            const tickerNos = '5';

            const result = ShortDataRetrieverHelper.shortDataRetrieverTransform(tickerNos, 'ticker_no');

            expect(result).toEqual('00005');
        });

        it('Should return the same value when anything else', () => {

            const randomValue = '5';

            const result = ShortDataRetrieverHelper.shortDataRetrieverTransform(randomValue, 'name');

            expect(result).toEqual('5');
        });
    });
});