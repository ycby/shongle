const Category = {
    EQUITY: 'equity',
    ETP: 'exchange_traded_products',
    REIT: 'reit'
} as const;
const Subcategory = {
    DR: 'depository_receipts',
    EQUITY_GEM: 'equity_securities_gem',
    EQUITY_MAIN: 'equity_securities_main',
    ETF: 'etf',
    INVESTMENT_COMPANIES: 'investment_companies',
    LEVERAGED_AND_INVERSE: 'leveraged_and_inverse',
    TRADING_ONLY: 'trading_only_securities',
    OTHERS: 'others'
} as const;
const CurrencyCode = {
    HKD: 'HKD',
    RMB: 'RMB',
    USD: 'USD',
} as const;
const TransactionType = {
    BUY: 'buy',
    SELL: 'sell',
    CASH_DIVIDEND: 'cash_dividend',
    SCRIP_DIVIDEND: 'scrip_dividend',
} as const;

//****************************************************
//Query
//****************************************************
const QueryType = {
    AND: 'AND',
    OR: 'OR'
} as const;

//Dump Currency here first
export type Currency = {
    ISO_code: string,
    decimal_places: number,
}

export type CategoryKeys = typeof Category[keyof typeof Category];
export type SubcategoryKeys = typeof Subcategory[keyof typeof Subcategory];
export type CurrencyKeys = typeof CurrencyCode[keyof typeof CurrencyCode];
export type TransactionTypeKeys = typeof TransactionType[keyof typeof TransactionType];
export type QueryTypeKeys = typeof QueryType[keyof typeof QueryType];

export {
    Category,
    Subcategory,
    CurrencyCode,
    TransactionType,
    QueryType
}