const dateToStringConverter = (value) => {
    if (value === null)
        return '';
    return `${value.getFullYear()}-${(value.getMonth() + 1).toString().padStart(2, '0')}-${(value.getDate()).toString().padStart(2, '0')}`;
};
const stringToDateConverter = (value) => {
    if (value === null || value === undefined)
        return null;
    const dateArray = value.split('-');
    const resultDate = Date.UTC(Number(dateArray[0]), Number(dateArray[1]) - 1, Number(dateArray[2]));
    return resultDate ? new Date(resultDate) : null;
};
export { dateToStringConverter, stringToDateConverter };
