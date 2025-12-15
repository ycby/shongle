import { describe, expect, test } from "@jest/globals";
import { stringToDateConverter } from "#root/src/helpers/DateHelper.ts";
describe('Date Helper tests', () => {
    test('Check stringToDateHelper converts from yyyy-MM-dd to Date', () => {
        expect(stringToDateConverter('2024-01-02')).toEqual(new Date(Date.UTC(2024, 0, 2)));
    });
    test('Check stringToDateHelper returns null when given null', () => {
        expect(stringToDateConverter(null)).toEqual(null);
    });
    test('Check stringToDateHelper returns null when invalid numbers given', () => {
        expect(stringToDateConverter('2024-01-abc')).toEqual(null);
    });
});
