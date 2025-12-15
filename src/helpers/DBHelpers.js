import { QueryType } from "#root/src/types.ts";
const filterClauseGenerator = (queryType = QueryType.AND, fieldMapping, args) => {
    //mapping format in case I forget:
    //list of objects where: param - param in url, field - db field, operator
    let whereArray = [];
    //changed to use Object.keys instead of hasOwnProperty because query doesnt extend Object
    //maybe after validation, should extract necessary fields and put into a real js object?
    console.log(args);
    const objKeys = Object.keys(args);
    for (const el of fieldMapping) {
        if (!objKeys.includes(el.param))
            continue;
        whereArray.push(`(${el.field} ${el.operator} :${el.param})`);
    }
    return whereArray.length !== 0 ? whereArray.join(` ${queryType} `) : '';
};
const processData = (bodyData, columns, editedObject) => {
    columns.forEach(column => {
        //map but set default to null if not found
        let newValue = bodyData[column.field] ?? null;
        if (column.transform) {
            newValue = column.transform(newValue);
        }
        editedObject[column.field] = newValue;
    });
    return editedObject;
};
export { filterClauseGenerator, processData };
