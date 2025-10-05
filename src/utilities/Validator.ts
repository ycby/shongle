export type ValidationRule = {
    name: string,
    isRequired: boolean,
    rule: (element: any) => boolean,
    errorMessage: string
}

export type ValidatorResult = {
    index: number,
    errorMessages: string[],
}

const validator: <T>(data: T | T[], validationRules: ValidationRule[]) => ValidatorResult[] = <T>(data: T | T[], validationRules: ValidationRule[]): ValidatorResult[] => {

    let errors: ValidatorResult[] = [];

    const mergedData = Array.isArray(data) ? data : [data];

    mergedData.forEach((d, index) => {

        let error = performValidation(d, index, validationRules);

        if (!error) return;

        errors.push(error);
    });

    return errors;
}

const performValidation: <T>(data: T, index: number, validationRules: ValidationRule[]) => ValidatorResult | null = <T>(data: T, index: number, validationRules: ValidationRule[]) => {

    let errorMessages: string[] = [];

    validationRules.forEach((rule: ValidationRule) => {

        if (data[rule.name as keyof T] === undefined) {

            if (!rule.isRequired) return;

            //if is optional, return false to set accumulator to false
            errorMessages.push(`Field "${rule.name}" is required.`);
            return false;
        }
        //perform the check
        if (!rule.rule(data[rule.name as keyof T])) errorMessages.push(`Field "${rule.name}": ${rule.errorMessage}`);

    });

    if (errorMessages.length > 0) {

        return ({
            index: index,
            errorMessages: errorMessages
        });
    }

    return null;
}

export {
    validator,
}