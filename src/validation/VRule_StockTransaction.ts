import {ValidationRule} from "#root/src/utilities/Validator.js";
import {Currency, CurrencyKeys, TransactionType, TransactionTypeKeys} from "#root/src/types.js";
import {stringToDateConverter} from "#root/src/helpers/DateHelper.js";

const TRANSACTION_PARAM_VALIDATION: ValidationRule[] = [
    {
        name: 'id',
        isRequired: false,
        rule: (id: any): boolean => !isNaN(Number(id)),
        errorMessage: 'Id must be a number',
    },
    {
        name: 'stock_id',
        isRequired: false,
        rule: (stock_id: any): boolean => !isNaN(Number(stock_id)),
        errorMessage: 'Stock Id must be a number'
    },
    {
        name: 'type',
        isRequired: false,
        rule: (transactionTypes: any): boolean => transactionTypes instanceof Array &&
            transactionTypes.reduce(
                (accumulator, currentValue) => accumulator && Object.values(TransactionType).includes(currentValue)
                , true),
        errorMessage: 'Type must be an array and must only have the following values if included: "buy", "sell", "dividend"'
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

const TRANSACTION_PARAM_SINGLE_VALIDATION: ValidationRule[] = [
    {
        name: 'id',
        isRequired: true,
        rule: (id: any): boolean => !isNaN(Number(id)),
        errorMessage: 'Id must be a number'
    }
]

const TRANSACTION_BODY_VALIDATION: ValidationRule[] = [
    {
        name: 'id',
        isRequired: false,
        rule: (id: any): boolean => typeof id === 'number',
        errorMessage: 'Id must be a number'
    },
    {
        name: 'stock_id',
        isRequired: true,
        rule: (stock_id: any): boolean => typeof stock_id === 'number',
        errorMessage: 'Stock Id must be a number'
    },
    {
        name: 'type',
        isRequired: true,
        rule: (transactionType: any): boolean => typeof transactionType === 'string' && Object.values(TransactionType).includes(transactionType as TransactionTypeKeys),
        errorMessage: 'Type must be an array and must only have the following values if included: "buy", "sell", "dividend"'
    },
    {
        name: 'amount',
        isRequired: true,
        rule: (amount: any): boolean => typeof amount === 'number',
        errorMessage: 'Amount must be a number'
    },
    {
        name: 'quantity',
        isRequired: true,
        rule: (quantity: any): boolean => typeof quantity === 'number' && quantity >= 0,
        errorMessage: 'Quantity must be a number and be a positive value'
    },
    {
        name: 'fee',
        isRequired: true,
        rule: (fee: any): boolean => typeof fee === 'number',
        errorMessage: 'Fee must be a number'
    },
    {
        name: 'transaction_date',
        isRequired: true,
        rule: (transactionDate: any): boolean => typeof transactionDate === 'string' && stringToDateConverter(transactionDate) !== null,
        errorMessage: 'Transaction Date must be formatted like so: yyyy-MM-dd'
    },
    {
        name: 'currency',
        isRequired: true,
        rule: (currency: any): boolean => typeof currency === 'string' && Object.values(Currency).includes(currency as CurrencyKeys),
        errorMessage: 'Currency must be one of the following: ' + Object.values(Currency).join(', ')
    },
];

export {
    TRANSACTION_PARAM_VALIDATION,
    TRANSACTION_PARAM_SINGLE_VALIDATION,
    TRANSACTION_BODY_VALIDATION
}