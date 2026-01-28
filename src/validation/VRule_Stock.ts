import {
    canConvertToBigNumber,
    canConvertToNumber
} from "#root/src/helpers/DBHelpers.js";
import {ValidationRule} from "#root/src/utilities/Validator.js";
import {
    Category,
    CategoryKeys,
    Currency, CurrencyKeys,
    QueryType,
    QueryTypeKeys,
    Subcategory,
    SubcategoryKeys
} from "#root/src/types.js";

const STOCK_PARAM_VALIDATION: ValidationRule[] = [
    {
        name: 'query_type',
        isRequired: false,
        rule: (query_type: any): boolean => typeof query_type === 'string' && Object.values(QueryType).includes(query_type as QueryTypeKeys),
        errorMessage: 'Query Type is invalid. It must be either "AND" or "OR".'
    },
    {
        name: 'ticker_no',
        isRequired: false,
        rule: (ticker_no: any): boolean => typeof ticker_no === 'string' && ticker_no.length === 5,
        errorMessage: 'Ticker No. is formatted incorrectly, it should be 5 characters long. E.g "00001"'
    },
    {
        name: 'name',
        isRequired: false,
        rule: (name: any): boolean => typeof name === 'string',
        errorMessage: 'Name must be a string'
    },
    {
        name: 'ISIN',
        isRequired: false,
        rule: (ISIN: any): boolean => typeof ISIN === 'string',
        errorMessage: 'ISIN must be a string'
    },
];

const STOCK_PARAM_SINGLE_VALIDATION: ValidationRule[] = [
    {
        name: 'ticker_no',
        isRequired: true,
        rule: (ticker_no: any): boolean => typeof ticker_no === 'string' && ticker_no.length === 5,
        errorMessage: 'Ticker No. is formatted incorrectly, it should be 5 characters long. E.g "00001"'
    }
]

const STOCK_DATA_VALIDATION: ValidationRule[] = [
    {
        name: 'id',
        isRequired: false,
        rule: (id: any): boolean => typeof id === 'string' && canConvertToBigNumber(id),
        errorMessage: 'Id must be a string which can be converted into a BigNumber'
    },
    {
        name: 'ticker_no',
        isRequired: false,
        rule: (ticker_no: any): boolean => typeof ticker_no === 'string' && ticker_no.length === 5,
        errorMessage: 'Ticker No. is formatted incorrectly, it should be 5 characters long. E.g "00001"'
    },
    {
        name: 'name',
        isRequired: false,
        rule: (name: any): boolean => typeof name === 'string',
        errorMessage: 'Name must be a string'
    },
    {
        name: 'full_name',
        isRequired: false,
        rule: (full_name: any): boolean => typeof full_name === 'string',
        errorMessage: 'Full Name must be a string'
    },
    {
        name: 'description',
        isRequired: false,
        rule: (description: any): boolean => typeof description === 'string',
        errorMessage: 'Description must be a string'
    },
    {
        name: 'category',
        isRequired: false,
        rule: (category: any): boolean => typeof category === 'string' && Object.values(Category).includes(category as CategoryKeys),
        errorMessage: 'Category must be one of the following: ' + Object.values(Category).join(', '),
    },
    {
        name: 'subcategory',
        isRequired: false,
        rule: (subcategory: any): boolean => typeof subcategory === 'string' && Object.values(Subcategory).includes(subcategory as SubcategoryKeys),
        errorMessage: 'Subcategory must be one of the following: ' + Object.values(Subcategory).join(', ')
    },
    {
        name: 'board_lot',
        isRequired: false,
        rule: (board_lot: any): boolean => canConvertToNumber(board_lot),
        errorMessage: 'Board Lot must be a number'
    },
    {
        name: 'ISIN',
        isRequired: false,
        rule: (ISIN: any): boolean => typeof ISIN === 'string',
        errorMessage: 'ISIN must be a string'
    },
    {
        name: 'currency',
        isRequired: false,
        rule: (currency: any): boolean => typeof currency === 'string' && Object.values(Currency).includes(currency as CurrencyKeys),
        errorMessage: 'Currency must be one of the following: ' + Object.values(Currency).join(', ')
    },
    {
        name: 'is_active',
        isRequired: false,
        rule: (isActive: any): boolean => typeof isActive === 'boolean',
        errorMessage: 'Is Active must be a boolean'
    },
];

export {
    STOCK_PARAM_VALIDATION,
    STOCK_PARAM_SINGLE_VALIDATION,
    STOCK_DATA_VALIDATION,
}