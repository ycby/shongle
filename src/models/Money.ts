export default class Money {

    whole: number | bigint;
    fractional: number;
    decimal_places: number;
    iso_code: string;

    constructor(value: number | bigint, decimal_places: number, iso_code: string) {

        if (value === undefined || value === null) throw new Error('Value must not be undefined or null');

        if (typeof value === 'bigint') {

            this.whole = value / (10n ** BigInt(decimal_places));
            this.fractional = Number(value % (10n ** BigInt(decimal_places)));
        } else {

            this.whole = Math.trunc(value * (10 ** -decimal_places));
            this.fractional = value % (10 ** decimal_places);
        }

        this.decimal_places = decimal_places;
        this.iso_code = iso_code;
    }

    getAsNumber(): number {

        return Number(`${this.whole}.${this.fractional}`);
    }
}