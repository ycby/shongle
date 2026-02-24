import DatabaseObject from "#root/src/models/DatabaseObject.js";
import {CurrencyKeys} from "#root/src/types.js";
import Money from "#root/src/models/Money.js";

export default class StockTransaction extends DatabaseObject {

    private _id?: bigint;
    private _stock_id?: number;
    private _type?: string;
    private _amount?: Money;
    private _quantity?: number;
    private _fee?: Money;
    private _amount_per_share?: number;
    private _transaction_date: Date;
    private _currency?: CurrencyKeys;

    constructor(data?: any) {

        super();

        this._id = data?.id;
        this._stock_id = data?.stock_id;
        this._type = data?.type;
        this._quantity = data?.quantity;
        this._amount_per_share = data?.amount_per_share;
        this._transaction_date = data?.transaction_date;
        this._currency = data?.currency;
        this.created_datetime = data?.created_datetime ? data.created_datetime : this.created_datetime;
        this.last_modified_datetime = data?.last_modified_datetime ? data.last_modified_datetime : this.last_modified_datetime;

        this._amount = new Money(data?.amount, data.decimal_places, data.currency);
        this._fee = new Money(data?.fee, data.decimal_places, data.currency);
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
}