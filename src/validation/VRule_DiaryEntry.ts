import {ValidationRule} from "#root/src/utilities/Validator.js";
import {stringToDateConverter} from "#root/src/helpers/DateHelper.js";
import {canConvertToBigNumber} from "#root/src/helpers/DBHelpers.js";

const DIARY_ENTRY_PARAM_VALIDATION: ValidationRule[] = [
    {
        name: 'id',
        isRequired: false,
        rule: (id: any): boolean => typeof id === 'string' && canConvertToBigNumber(id),
        errorMessage: 'Id must be a string and convertible to a BigNumber',
    },
    {
        name: 'stock_id',
        isRequired: true,
        rule: (stock_id: any): boolean => typeof stock_id === 'string' && canConvertToBigNumber(stock_id),
        errorMessage: 'Stock Id must be a string and convertible to a BigNumber',
    },
    {
        name: 'title',
        isRequired: false,
        rule: (title: any): boolean => typeof title === 'string',
        errorMessage: 'Title must be string'
    },
    {
        name: 'start_date',
        isRequired: false,
        rule: (start_date: any): boolean => stringToDateConverter(start_date) !== null,
        errorMessage: 'Start Date must be formatted like so: yyyy-MM-dd'
    },
    {
        name: 'end_date',
        isRequired: false,
        rule: (end_date: any): boolean => stringToDateConverter(end_date) !== null,
        errorMessage: 'End Date must be formatted like so: yyyy-MM-dd'
    },
];

const DIARY_ENTRY_PARAM_SINGLE_VALIDATION: ValidationRule[] = [
    {
        name: 'id',
        isRequired: true,
        rule: (id: any): boolean => typeof id === 'string' && canConvertToBigNumber(id),
        errorMessage: 'Id must be a string and convertible to a BigNumber',
    }
]

const DIARY_ENTRY_BODY_VALIDATION: ValidationRule[] = [
    {
        name: 'id',
        isRequired: false,
        rule: (id: any): boolean => typeof id === 'string' && canConvertToBigNumber(id),
        errorMessage: 'Id must be a string and convertible to a BigNumber',
    },
    {
        name: 'stock_id',
        isRequired: true,
        rule: (stock_id: any): boolean => typeof stock_id === 'string' && canConvertToBigNumber(stock_id),
        errorMessage: 'Stock Id must be a string and convertible to a BigNumber',
    },
    {
        name: 'title',
        isRequired: true,
        rule: (title: any): boolean => typeof title === 'string',
        errorMessage: 'Title must be a string'
    },
    {
        name: 'content',
        isRequired: true,
        rule: (content: any): boolean => typeof content === 'string',
        errorMessage: 'String must be a string'
    },
    {
        name: 'posted_date',
        isRequired: true,
        rule: (postedDate: any): boolean => typeof postedDate === 'string' && stringToDateConverter(postedDate) !== null,
        errorMessage: 'Posted Date must be formatted like so: yyyy-MM-dd'
    }
];

export {
    DIARY_ENTRY_PARAM_VALIDATION,
    DIARY_ENTRY_PARAM_SINGLE_VALIDATION,
    DIARY_ENTRY_BODY_VALIDATION,
}