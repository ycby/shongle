
const stringToDateConverter = (value: String | null) => {

    if (value === null || value === undefined) return null;

    const dateArray = value.split('-');

    const resultDate = Date.UTC(Number(dateArray[0]), Number(dateArray[1]) - 1, Number(dateArray[2]));
    return resultDate ? new Date(resultDate) : null;
}

export {
    stringToDateConverter
}