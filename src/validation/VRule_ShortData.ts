import {
    canConvertToBigNumber,
    canConvertToNumber,
} from "#root/src/helpers/DBHelpers.js";
import {ValidationRule} from "#root/src/utilities/Validator.js";
import {stringToDateConverter} from "#root/src/helpers/DateHelper.js";

const SHORT_PARAM_VALIDATION: ValidationRule[] = [
    {
        name: 'stock_id',
        isRequired: true,
        rule: (stock_id: any): boolean => typeof stock_id === 'string' && canConvertToBigNumber(stock_id),
        errorMessage: 'Stock Id is required and must be a number',
    },
    {
        name: 'start_date',
        isRequired: false,
        rule: (start_date: any): boolean => stringToDateConverter(start_date) !== null,
        errorMessage: 'Start Date must be a date'
    },
    {
        name: 'end_date',
        isRequired: false,
        rule: (end_date: any): boolean => stringToDateConverter(end_date) !== null,
        errorMessage: 'End Date must be a date'
    },
];

const SHORT_PARAM_SINGLE_VALIDATION: ValidationRule[] = [
    {
        name: 'id',
        isRequired: true,
        rule: (id: any): boolean => typeof id === 'string' && canConvertToBigNumber(id),
        errorMessage: 'Id is required and must be a bigint string'
    }
]

const SHORT_BODY_VALIDATION: ValidationRule[] = [
    {
        name: 'id',
        isRequired: false,
        rule: (id: any): boolean => typeof id === 'string' && canConvertToBigNumber(id),
        errorMessage: 'Id is must be a string and convertible to BigNumber'
    },
    {
        name: 'ticker_no',
        isRequired: false,
        rule: (ticker_no: any): boolean => typeof ticker_no === 'string' && ticker_no.toString().length === 5,
        errorMessage: 'Stock Code is must be a string of 5 characters and is required"'
    },
    {
        name: 'stock_id',
        isRequired: false,
        rule: (stock_id: any): boolean => typeof stock_id === 'string' && canConvertToBigNumber(stock_id),
        errorMessage: 'Stock id is must be a string and convertible to BigNumber'
    },
    {
        name: 'reporting_date',
        isRequired: false,
        rule: (reporting_date: any): boolean => stringToDateConverter(reporting_date) !== null,
        errorMessage: 'Reporting Date must be formatted like so: yyyy-MM-dd'
    },
    {
        name: 'shorted_shares',
        isRequired: false,
        rule: (shorted_shares: any): boolean => canConvertToNumber(shorted_shares),
        errorMessage: 'Shorted Shares must be a number'
    },
    {
        name: 'shorted_amount',
        isRequired: false,
        rule: (shorted_amount: any): boolean => canConvertToNumber(shorted_amount),
        errorMessage: 'Shorted Amount must be a number'
    },
];

const SHORT_MISMATCH_QUERY_VALIDATION = [
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
]

const SHORT_MISMATCH_PARAM_VALIDATION: ValidationRule[] = [
    {
        name: 'ticker_no',
        isRequired: true,
        rule: (ticker_no: any): boolean => typeof ticker_no === 'string' && ticker_no.length === 5,
        errorMessage: 'Ticker No. in param is formatted incorrectly, it should be 5 characters long. E.g "00001"'
    }
]

export {
    SHORT_PARAM_VALIDATION,
    SHORT_PARAM_SINGLE_VALIDATION,
    SHORT_BODY_VALIDATION,
    SHORT_MISMATCH_QUERY_VALIDATION,
    SHORT_MISMATCH_PARAM_VALIDATION
}