const Category = {
    EQUITY: 'equity',
    ETP: 'exchange_traded_products',
    REIT: 'reit'
};
const Subcategory = {
    DR: 'depository_receipts',
    EQUITY_GEM: 'equity_securities_gem',
    EQUITY_MAIN: 'equity_securities_main',
    ETF: 'etf',
    INVESTMENT_COMPANIES: 'investment_companies',
    LEVERAGED_AND_INVERSE: 'leveraged_and_inverse',
    TRADING_ONLY: 'trading_only_securities',
    OTHERS: 'others'
};
const Currency = {
    HKD: 'HKD',
    RMB: 'RMB',
    USD: 'USD',
};
const TransactionType = {
    BUY: 'buy',
    SELL: 'sell',
    CASH_DIVIDEND: 'cash_dividend',
    SCRIP_DIVIDEND: 'scrip_dividend',
};
//****************************************************
//Query
//****************************************************
const QueryType = {
    AND: 'AND',
    OR: 'OR'
};
export { Category, Subcategory, Currency, TransactionType, QueryType };
