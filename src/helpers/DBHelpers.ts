import {QueryType, QueryTypeKeys} from "#root/src/types.js";

export type FieldMapping = {
    param: string;
    field: string;
    operator: string;
}

const filterClauseGenerator: (queryType: QueryTypeKeys, fieldMapping: FieldMapping[], args: Object) => string = (queryType: QueryTypeKeys = QueryType.AND, fieldMapping: FieldMapping[], args: Object) => {

    //mapping format in case I forget:
    //list of objects where: param - param in url, field - db field, operator
    let whereArray: string[] = [];

    //changed to use Object.keys instead of hasOwnProperty because query doesnt extend Object
    //maybe after validation, should extract necessary fields and put into a real js object?
    const objKeys = Object.keys(args);

    for (const el of fieldMapping) {

        if (!objKeys.includes(el.param)) continue;

        whereArray.push(`(${el.field} ${el.operator} :${el.param})`);
    }

    return whereArray.length !== 0 ? whereArray.join(` ${queryType} `) : '';
}

const canConvertToBigNumber = (value: string | number | bigint | boolean): boolean => {

    try {
        BigInt(value);
        return true;
    } catch (e) {
        return false;
    }
}

const canConvertToNumber = (value: any): boolean => {

    if (value === null) return false;

    return !isNaN(Number(value));
}

const canConvertToMoney = (value: any): boolean => {

    if (value === undefined || value === null) return false;

    return value.whole && value.fractional && value.decimal_places && value.iso_code;
}

export {
    filterClauseGenerator,
    canConvertToBigNumber,
    canConvertToNumber,
    canConvertToMoney
}