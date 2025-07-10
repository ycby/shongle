type ValidationRule = {
    name: string,
    isRequired: boolean,
    rule: (element: any) => boolean,
    errorMessage: string
}

const validator = <T>(data: T, validationRules: ValidationRule[]) => {

    let errorMessages: Array<string> = [];

    validationRules.forEach((rule: ValidationRule) => {

        if (!data[rule.name as keyof T]) {

            if (!rule.isRequired) return;

            //if is optional, return false to set accumulator to false
            errorMessages.push(`Field "${rule.name}" is required.`);
            return false;
        }
        //perform the check
        if (!rule.rule(data[rule.name as keyof T])) errorMessages.push(`Field "${rule.name}": ${rule.errorMessage}`);

    }, true);

    return errorMessages;
}

export {
    validator,
}