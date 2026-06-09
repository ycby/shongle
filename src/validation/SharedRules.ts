import {canConvertToNumber} from "#root/src/helpers/DBHelpers.js";
import {ValidationRule} from "#root/src/utilities/Validator.js";

const PAGINATION_VALIDATION: ValidationRule[] = [
    {
        name: 'limit',
        isRequired: false,
        rule: (limit: any): boolean => canConvertToNumber(limit) && Number(limit) >= 0,
        errorMessage: 'Limit must be a positive number',
    },
    {
        name: 'offset',
        isRequired: false,
        rule: (offset: any): boolean => canConvertToNumber(offset) && Number(offset) >= 0,
        errorMessage: 'Offset must be a positive number',
    }
];


export {
    PAGINATION_VALIDATION
}