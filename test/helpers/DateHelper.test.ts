import {describe, expect, test} from "@jest/globals";
import {dateToStringConverter, stringToDateConverter} from "#root/src/helpers/DateHelper.ts";

describe('Date Helper tests', () => {

    describe('stringToDateConverted', () => {

        test('Check stringToDateConverter converts from yyyy-MM-dd to Date', () => {

            expect(stringToDateConverter('2024-01-02')).toEqual(new Date(Date.UTC(2024, 0, 2)));
        });

        test('Check stringToDateConverter returns null when given null', () => {

            expect(stringToDateConverter(null)).toEqual(null);
        });

        test('Check stringToDateConverter returns null when invalid numbers given', () => {

            expect(stringToDateConverter('2024-01-abc')).toEqual(null);
        });
    });

    describe('dateToStringConverter', () => {

        test('Check dateToStringConverter to yyyy-MM-dd string', () => {

            expect(dateToStringConverter(new Date(2025, 0, 1))).toEqual('2025-01-01');
        });

        test('Check dateToStringConverter returns null for null', () => {

            expect(dateToStringConverter(null)).toEqual('');
        })
    })
})