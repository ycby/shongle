import DatabaseObject from '#root/src/models/DatabaseObject.js'
import {CurrencyKeys} from "#root/src/types.js";

export default class Stock extends DatabaseObject {

    private _id?: BigInt;
    private _ticker_no?: string;
    private _name?: string;
    private _full_name?: string;
    private _description?: string;
    private _category?: string;
    private _subcategory?: string;
    private _board_lot?: number;
    private _ISIN?: string;
    private _currency?: CurrencyKeys;
    private _is_active?: boolean;
    private _is_tracked?: boolean;

    constructor(data?: any) {

        super();

        this._id = data?.id;
        this._ticker_no = data?.ticker_no;
        this._name = data?.name;
        this._full_name = data?.full_name;
        this._description = data?.description;
        this._category = data?.category;
        this._subcategory = data?.subcategory;
        this._board_lot = data?.board_lot;
        this._ISIN = data?.ISIN;
        this._currency = data?.currency;
        this._is_active = data?.is_active;
        this._is_tracked = data?.is_tracked;
        this.created_datetime = data?.created_datetime ? data.created_datetime : this.created_datetime;
        this.last_modified_datetime = data?.last_modified_datetime ? data.last_modified_datetime : this.last_modified_datetime;
    }

    get id(): BigInt | undefined {

        return this._id;
    }

    set id(id: BigInt) {

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

    get is_active(): boolean | undefined {

        return this._is_active;
    }

    set is_active(is_active: boolean) {

        this._is_active = is_active;
    }

    get is_tracked(): boolean | undefined {

        return this._is_tracked;
    }

    set is_tracked(is_tracked: boolean) {

        this._is_tracked = is_tracked;
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