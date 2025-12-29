import {QueryType, QueryTypeKeys} from "#root/src/types.js";

export type FieldMapping = {
    param: string;
    field: string;
    operator: string;
}

export type ProcessDataMapping = {
    field: string;
    transform?: (element: any) => any;
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

const processData: <T>(bodyData: Object, columns: ProcessDataMapping[], editedObject: T) => T = <T>(bodyData: Object, columns: ProcessDataMapping[], editedObject: T): T => {

    columns.forEach(column => {
        //map but set default to null if not found
        let newValue: any = bodyData[column.field as keyof Object] ?? null;

        if (column.transform) {

            newValue = column.transform(newValue);
        }
        editedObject[column.field as keyof T] = newValue;
    });

    return editedObject;
}

export {
    filterClauseGenerator,
    processData
}