import {describe, expect, test} from "@jest/globals";
import {FieldMapping, filterClauseGenerator, processData, ProcessDataMapping} from "#root/src/helpers/DBHelpers.ts";
import {QueryType} from "#root/src/types.ts";

describe('DBHelper Tests', () => {

    test('Checks filterClauseGenerator ANDs the clauses given the field mapping and object', () => {

        const fieldMapping: FieldMapping[] = [
            {
                param: 'name',
                field: 'name',
                operator: '='
            },
            {
                param: 'start_date',
                field: 'reporting_date',
                operator: '>='
            },
            {
                param: 'end_date',
                field: 'reporting_date',
                operator: '<='
            }
        ];

        const data = {
            name: 'Test1',
            start_date: '2019-01-01',
            end_date: '2022-12-31',
        };

        expect(filterClauseGenerator(QueryType.AND, fieldMapping, data)).toEqual('(name = :name) AND (reporting_date >= :start_date) AND (reporting_date <= :end_date)');
    });

    test('Checks filterClauseGenerator skips missing clauses given the field mapping and object', () => {

        const fieldMapping: FieldMapping[] = [
            {
                param: 'name',
                field: 'name',
                operator: '='
            },
            {
                param: 'start_date',
                field: 'reporting_date',
                operator: '>='
            },
            {
                param: 'end_date',
                field: 'reporting_date',
                operator: '<='
            }
        ];

        const data = {
            name: 'Test1',
            end_date: '2022-12-31',
        };

        expect(filterClauseGenerator(QueryType.AND, fieldMapping, data)).toEqual('(name = :name) AND (reporting_date <= :end_date)');
    });

    test('Checks filterClauseGenerator ignores extra clauses given the field mapping and object', () => {

        const fieldMapping: FieldMapping[] = [
            {
                param: 'name',
                field: 'name',
                operator: '='
            },
            {
                param: 'end_date',
                field: 'reporting_date',
                operator: '<='
            }
        ];

        const data = {
            name: 'Test1',
            start_date: '2019-01-01',
            end_date: '2022-12-31',
        };

        expect(filterClauseGenerator(QueryType.AND, fieldMapping, data)).toEqual('(name = :name) AND (reporting_date <= :end_date)');
    });

    test('Checks filterClauseGenerator returns empty string if no data', () => {

        const fieldMapping: FieldMapping[] = [
            {
                param: 'name',
                field: 'name',
                operator: '='
            },
            {
                param: 'end_date',
                field: 'reporting_date',
                operator: '<='
            }
        ];

        const data = {};

        expect(filterClauseGenerator(QueryType.AND, fieldMapping, data)).toEqual('');
    });

    test('Checks filterClauseGenerator returns empty string if no mapping', () => {

        const fieldMapping: FieldMapping[] = [];

        const data = {
            name: 'Test1',
            start_date: '2019-01-01',
            end_date: '2022-12-31',
        };

        expect(filterClauseGenerator(QueryType.AND, fieldMapping, data)).toEqual('');
    });

    test('Checks processData returns mapped objects with correct fields', () => {

        let testObj: any = {};

        const columns: ProcessDataMapping[] = [
            {
                field: 'ticker_no',
            },
            {
                field: 'reporting_date',
            },
            {
                field: 'name'
            }
        ];

        const bodyData: Object = {
            name: 'Test1',
            ticker_no: '00024',
            reporting_date: '2019-01-01',
        };

        const result = processData(bodyData, columns, testObj);
        expect(result).toHaveProperty('ticker_no');
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('reporting_date');
        expect(result.name).toEqual('Test1');
        expect(result.ticker_no).toEqual('00024');
        expect(result.reporting_date).toEqual('2019-01-01');
    });

    test('Checks processData skip unnecessary columns', () => {

        let testObj: any = {};

        const columns: ProcessDataMapping[] = [
            {
                field: 'ticker_no',
            },
            {
                field: 'name'
            }
        ];

        const bodyData: Object = {
            name: 'Test1',
            ticker_no: '00024',
            reporting_date: '2019-01-01',
        };

        const result = processData(bodyData, columns, testObj);
        expect(result).toHaveProperty('ticker_no');
        expect(result).toHaveProperty('name');
        expect(result.name).toEqual('Test1');
        expect(result.ticker_no).toEqual('00024');
    });

    test('Checks processData maps null data', () => {

        let testObj: any = {};

        const columns: ProcessDataMapping[] = [
            {
                field: 'ticker_no',
            },
            {
                field: 'name'
            }
        ];

        const bodyData: Object = {
            name: null,
            ticker_no: '00024',
        };

        const result = processData(bodyData, columns, testObj);
        expect(result).toHaveProperty('ticker_no');
        expect(result).toHaveProperty('name');
        expect(result.name).toEqual(null);
        expect(result.ticker_no).toEqual('00024');
    });

    test('Checks processData maps missing data', () => {

        let testObj: any = {};

        const columns: ProcessDataMapping[] = [
            {
                field: 'ticker_no',
            },
            {
                field: 'name'
            }
        ];

        const bodyData: Object = {
            ticker_no: '00024',
        };

        const result = processData(bodyData, columns, testObj);
        expect(result).toHaveProperty('ticker_no');
        expect(result).toHaveProperty('name');
        expect(result.name).toEqual(null);
        expect(result.ticker_no).toEqual('00024');
    });

    test('Checks processData maps with transformation', () => {

        let testObj: any = {};

        const columns: ProcessDataMapping[] = [
            {
                field: 'ticker_no',
                transform: (stockCode) => {
                	switch (typeof stockCode) {
                		case 'number' :
                			return stockCode.toString().padStart(5, '0');
                		case 'string' :
                			return stockCode.padStart(5, '0');
                		default:
                			throw new Error('Unexpected Stock Code type')
                	}
                }
            },
            {
                field: 'name'
            }
        ];

        const bodyData: Object = {
            ticker_no: 24,
            name: 'Test1',
        };

        const result = processData(bodyData, columns, testObj);
        expect(result).toHaveProperty('ticker_no');
        expect(result).toHaveProperty('name');
        expect(result.name).toEqual('Test1');
        expect(result.ticker_no).toEqual('00024');
    });
});