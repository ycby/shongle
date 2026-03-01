import DatabaseObject from "#root/src/models/DatabaseObject.js";
import {CurrencyKeys} from "#root/src/types.js";
import Money from "money-type";

export default class StockTransaction extends DatabaseObject {

    private _id?: bigint;
    private _stock_id?: number;
    private _type?: string;
    private _amount?: Money;
    private _quantity?: number;
    private _fee?: Money;
    private _amount_per_share?: number;
    private _transaction_date?: Date;
    private _currency?: CurrencyKeys;

    constructor(data?: any) {

        super();

        this.created_datetime = data?.created_datetime ? data.created_datetime : this.created_datetime;
        this.last_modified_datetime = data?.last_modified_datetime ? data.last_modified_datetime : this.last_modified_datetime;
    }

    static fromDB(data: any): StockTransaction {

        const stockTransaction = new StockTransaction();

        stockTransaction.id = data?.id;
        stockTransaction.stock_id = data?.stock_id;
        stockTransaction.type = data?.type;
        stockTransaction.quantity = data?.quantity;
        stockTransaction.amount_per_share = data?.amount_per_share;
        stockTransaction.transaction_date = data?.transaction_date;
        stockTransaction.currency = data?.currency;

        stockTransaction.amount = Money.fromSmallestDenomination(data?.amount, data.decimal_places, data.currency);
        stockTransaction.fee = Money.fromSmallestDenomination(data?.fee, data.decimal_places, data.currency);

        return stockTransaction;
    }

    static fromAPI(data: any): StockTransaction {

        const stockTransaction = new StockTransaction();

        stockTransaction.id = data?.id;
        stockTransaction.stock_id = data?.stock_id;
        stockTransaction.type = data?.type;
        stockTransaction.quantity = data?.quantity;
        stockTransaction.amount_per_share = data?.amount_per_share;
        stockTransaction.transaction_date = data?.transaction_date;
        stockTransaction.currency = data?.currency;
        stockTransaction.created_datetime = data?.created_datetime ? data.created_datetime : stockTransaction.created_datetime;
        stockTransaction.last_modified_datetime = data?.last_modified_datetime ? data.last_modified_datetime : stockTransaction.last_modified_datetime;

        stockTransaction.amount = new Money(data?.amount.whole, data?.amount.fractional, data?.amount.decimal_places, data?.amount.iso_code);
        stockTransaction.fee = new Money(data?.fee.whole, data?.fee.fractional, data?.fee.decimal_places, data?.fee.iso_code);

        return stockTransaction;
    }

    get id(): bigint | undefined {

        return this._id;
    }

    set id(id: bigint) {

        this._id = id;
    }

    get stock_id(): number | undefined {

        return this._stock_id;
    }

    set stock_id(stock_id: number) {

        this._stock_id = stock_id;
    }

    get type(): string {

        return this._type ?? '';
    }

    set type(type: string) {

        this._type = type;
    }

    get amount(): Money | undefined {

        return this._amount;
    }

    set amount(amount: Money) {

        this._amount = amount;
    }

    get quantity(): number | undefined {

        return this._quantity;
    }

    set quantity(quantity: number) {

        this._quantity = quantity;
    }

    get fee(): Money | undefined {

        return this._fee;
    }

    set fee(fee: Money) {

        this._fee = fee;
    }

    get amount_per_share(): number {

        return this._amount_per_share ?? 0;
    }

    set amount_per_share(amountPerShare: number | undefined) {

        this._amount_per_share = amountPerShare;
    }

    get transaction_date(): Date | undefined {

        return this._transaction_date;
    }

    set transaction_date(date: Date) {

        this._transaction_date = date;
    }

    get currency(): CurrencyKeys | undefined {

        return this._currency;
    }

    set currency(currency: CurrencyKeys) {

        this._currency = currency;
    }

    getPlainObject(this: any): any {

        const result = super.getPlainObject();

        result.amount = this._amount.getValueInSmallestDenomination();
        result.fee = this._fee.getValueInSmallestDenomination()

        return result;
    }
}