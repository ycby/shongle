const filterClauseGenerator = (fieldMapping, args) => {

    //mapping format in case i forget:
    //list of objects where: param - param in url, field - db field, operator
    let whereArray = [];

    for (const el of fieldMapping) {

        if (!args.hasOwnProperty(el.param)) continue;

        whereArray.push(`(${el.field} ${el.operator} :${el.param})`);
    }
    return whereArray.length !== 0 ? whereArray.join(' AND ') : '';
}

export {
    filterClauseGenerator,
}