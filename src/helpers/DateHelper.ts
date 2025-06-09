
const stringToDateConverter = (value: String | null) => {

    if (value === null || value === undefined) return null;

    const dateArray = value.split('-');

    return new Date(Date.UTC(parseInt(dateArray[0]), parseInt(dateArray[1]) - 1, parseInt(dateArray[2])));
}

export {
    stringToDateConverter
}