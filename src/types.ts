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
const Currency = {
    HKD: 'HKD',
    RMB: 'RMB',
    USD: 'USD',
} as const;
const TransactionType = {
    BUY: 'buy',
    SELL: 'sell',
    DIVIDEND: 'dividend'
} as const;

export type CategoryKeys = typeof Category[keyof typeof Category];
export type SubcategoryKeys = typeof Subcategory[keyof typeof Subcategory];
export type CurrencyKeys = typeof Currency[keyof typeof Currency];
export type TransactionTypeKeys = typeof TransactionType[keyof typeof TransactionType];

export {
    Category,
    Subcategory,
    Currency,
    TransactionType,
}