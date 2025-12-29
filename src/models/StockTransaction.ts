import DatabaseObject from "#root/src/models/DatabaseObject.js";
import {CurrencyKeys} from "#root/src/types.js";

export default class StockTransaction extends DatabaseObject {

    private _id?: number;
    private _stock_id?: number;
    private _type?: string;
    private _amount?: number;
    private _quantity?: number;
    private _fee?: number
    private _amount_per_share?: number;
    private _currency?: CurrencyKeys;

    constructor(operationType: string) {

        super(operationType);
    }

    get id(): number | undefined {

        return this._id;
    }

    set id(id: number) {

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

    get amount(): number | undefined {

        return this._amount;
    }

    set amount(amount: number) {

        this._amount = amount;
    }

    get quantity(): number | undefined {

        return this._quantity;
    }

    set quantity(quantity: number) {

        this._quantity = quantity;
    }

    get fee(): number | undefined {

        return this._fee;
    }

    set fee(fee: number) {

        this._fee = fee;
    }

    get amount_per_share(): number {

        return this._amount_per_share ?? 0;
    }

    set amount_per_share(amountPerShare: number | undefined) {

        this._amount_per_share = amountPerShare;
    }

    get currency(): CurrencyKeys | undefined {

        return this._currency;
    }

    set currency(currency: CurrencyKeys) {

        this._currency = currency;
    }
}