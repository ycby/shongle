import DatabaseObject from './DatabaseObject.ts'
import {CurrencyKeys} from "#root/src/types.ts";

export default class ShortData extends DatabaseObject {

    private _id?: number;
    private _ticker_no?: string;
    private _name?: string;
    private _full_name?: string;
    private _description?: string;
    private _category?: string;
    private _subcategory?: string;
    private _board_lot?: number;
    private _ISIN?: string;
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

    get ticker_no(): string {

        return this._ticker_no ?? '';
    }

    set ticker_no(ticker_no: string) {

        this._ticker_no = ticker_no;
    }

    get name(): string {

        return this._name ?? '';
    }

    set name(name: string) {

        this._name = name;
    }

    get full_name(): string {

        return this._full_name ?? '';
    }

    set full_name(full_name: string) {

        this._full_name = full_name;
    }

    get description(): string {

        return this._description ?? '';
    }

    set description(description: string) {

        this._description = description;
    }

    get category(): string {

        return this._category ?? '';
    }

    set category(category: string) {

        this._category = category;
    }

    get subcategory(): string {

        return this._subcategory ?? '';
    }

    set subcategory(subcategory: string) {

        this._subcategory = subcategory;
    }

    get board_lot(): number {

        return this._board_lot ?? 0;
    }

    set board_lot(board_lot: number) {

        this._board_lot = board_lot;
    }

    get ISIN(): string {

        return this._ISIN ?? '';
    }

    set ISIN(ISIN: string) {

        this._ISIN = ISIN;
    }

    get currency(): CurrencyKeys | undefined {

        return this._currency;
    }

    set currency(currency: CurrencyKeys) {

        this._currency = currency;
    }

    toString() {

        return `Ticker Number: ${this.ticker_no},
Name: ${this.name},
Full Name: ${this.full_name},
Description: ${this.description},
Category: ${this.category},
Subcategory: ${this.subcategory},
Board Lot: ${this.board_lot},
ISIN: ${this.ISIN},
Currency: ${this.currency},
Created Date: ${this.created_datetime},
Last Modified Date: ${this.last_modified_datetime}`
    }
}