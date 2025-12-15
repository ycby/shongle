const validator = (data, validationRules) => {
    let errors = [];
    const mergedData = Array.isArray(data) ? data : [data];
    mergedData.forEach((d, index) => {
        let error = performValidation(d, index, validationRules);
        if (!error)
            return;
        errors.push(error);
    });
    return errors;
};
const performValidation = (data, index, validationRules) => {
    let errorMessages = [];
    validationRules.forEach((rule) => {
        if (data[rule.name] === undefined) {
            if (!rule.isRequired)
                return;
            //if is optional, return false to set accumulator to false
            errorMessages.push(`Field "${rule.name}" is required.`);
            return false;
        }
        //perform the check
        if (!rule.rule(data[rule.name]))
            errorMessages.push(`Field "${rule.name}": ${rule.errorMessage}`);
    });
    if (errorMessages.length > 0) {
        return ({
            index: index,
            errorMessages: errorMessages
        });
    }
    return null;
};
export { validator, };
