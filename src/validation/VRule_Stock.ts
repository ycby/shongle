import {
    canConvertToBigNumber,
    canConvertToNumber
} from "#root/src/helpers/DBHelpers.js";
import {validate, ValidationRule} from "#root/src/utilities/Validator.js";
import {
    Category,
    CategoryKeys,
    CurrencyCode, CurrencyKeys,
    QueryType,
    QueryTypeKeys,
    Subcategory,
    SubcategoryKeys
} from "#root/src/types.js";
import {PAGINATION_VALIDATION} from "#root/src/validation/SharedRules.js";

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
        rule: (ticker_no: any): boolean => typeof ticker_no === 'string',
        errorMessage: 'Ticker No. is not a string?!?"'
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

const STOCK_PARAM_GET_VALIDATION: ValidationRule[] = [
    {
        name: 'ticker_no',
        isRequired: true,
        rule: (ticker_no: any): boolean => typeof ticker_no === 'string' && ticker_no.length === 5,
        errorMessage: 'Ticker No. is formatted incorrectly, it should be 5 characters long. E.g "00001"'
    }
];

const STOCK_PARAM_DELETE_VALIDATION: ValidationRule[] = [
    {
        name: 'id',
        isRequired: true,
        rule: (id: any): boolean => canConvertToBigNumber(id),
        errorMessage: 'Id cannot be converted to a BigNumber'
    }
];

const STOCK_DATA_VALIDATION: ValidationRule[] = [
    {
        name: 'id',
        isRequired: false,
        rule: (id: any): boolean => canConvertToBigNumber(id),
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
        rule: (full_name: any): boolean => full_name === null || typeof full_name === 'string',
        errorMessage: 'Full Name must be a string'
    },
    {
        name: 'description',
        isRequired: false,
        rule: (description: any): boolean => description === null || typeof description === 'string',
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
        rule: (currency: any): boolean => typeof currency === 'string' && Object.values(CurrencyCode).includes(currency as CurrencyKeys),
        errorMessage: 'Currency must be one of the following: ' + Object.values(CurrencyCode).join(', ')
    },
    {
        name: 'is_active',
        isRequired: false,
        rule: (isActive: any): boolean => typeof isActive === 'boolean',
        errorMessage: 'Is Active must be a boolean'
    },
];

const POTENTIAL_DUPLICATE_QUERY_VALIDATION = [...PAGINATION_VALIDATION];

const MERGE_DUPLICATE_VALIDATION: ValidationRule[] = [
    {
        name: 'survivor',
        isRequired: true,
        rule: (survivor: any): boolean => {

            //TODO: find a way to allow nesting of defined rules
            return validate(survivor, STOCK_DATA_VALIDATION).length === 0;
        },
        errorMessage: 'survivor is mandatory and must be Stock like'
    },
    {
        name: 'rejects',
        isRequired: true,
        rule: (rejects: any): boolean => {

            if (!Array.isArray(rejects)) return false;

            return rejects.reduce((errorAccumulator, reject) => {

                errorAccumulator.push(...validate(reject, STOCK_DATA_VALIDATION));
                return errorAccumulator;
            }, []).length === 0;
        },
        errorMessage: 'rejects is mandatory and must be a list of Stock likes'
    }
]

export {
    STOCK_PARAM_VALIDATION,
    STOCK_PARAM_GET_VALIDATION,
    STOCK_PARAM_DELETE_VALIDATION,
    STOCK_DATA_VALIDATION,
    POTENTIAL_DUPLICATE_QUERY_VALIDATION,
    MERGE_DUPLICATE_VALIDATION
}