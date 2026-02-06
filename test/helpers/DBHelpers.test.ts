import {describe, expect, test} from "@jest/globals";
import {
    canConvertToBigNumber, canConvertToNumber,
    FieldMapping,
    filterClauseGenerator,
} from "#root/src/helpers/DBHelpers.ts";
import {QueryType} from "#root/src/types.ts";

describe('DBHelper Tests', () => {

    describe('filterClauseGenerator', () => {

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
    });

    describe('canConvertToBigNumber', () => {

        test('Checks canConvertToBigNumber normal', () => {

            expect(canConvertToBigNumber('5')).toBe(true);
        });

        test('Checks canConvertToBigNumber number', () => {

            expect(canConvertToBigNumber(5)).toBe(true);
        });

        test('Checks canConvertToBigNumber bignumber', () => {

            expect(canConvertToBigNumber(5n)).toBe(true);
        });

        test('Checks canConvertToBigNumber boolean', () => {

            expect(canConvertToBigNumber(true)).toBe(true);
        });

        test('Checks canConvertToBigNumber empty string', () => {
            //BigInt becomes 0 if its empty string
            expect(canConvertToBigNumber('')).toBe(true);
        });

        test('Checks canConvertToBigNumber invalid', () => {

            expect(canConvertToBigNumber('x')).toBe(false);
        });

        test('Checks canConvertToBigNumber null', () => {

            expect(canConvertToBigNumber(null as any)).toBe(false);
        });

        test('Checks canConvertToBigNumber undefined', () => {

            expect(canConvertToBigNumber(undefined as any)).toBe(false);
        });
    });

    describe('canConvertToNumber', () => {

        test('Checks canConvertToNumber normal', () => {

            expect(canConvertToNumber(5)).toBe(true);
        });

        test('Checks canConvertToNumber string', () => {

            expect(canConvertToNumber('5')).toBe(true);
        });

        test('Checks canConvertToNumber bignumber', () => {

            expect(canConvertToNumber(5n)).toBe(true);
        });

        test('Checks canConvertToNumber empty string', () => {

            expect(canConvertToNumber('')).toBe(true);
        });

        test('Checks canConvertToNumber null', () => {

            expect(canConvertToNumber(null)).toBe(false);
        });

        test('Checks canConvertToNumber undefined', () => {

            expect(canConvertToNumber(undefined)).toBe(false);
        });

        test('Checks canConvertToNumber invalid', () => {

            expect(canConvertToNumber('x')).toBe(false);
        });
    })
});