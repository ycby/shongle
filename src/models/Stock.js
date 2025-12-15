import DatabaseObject from './DatabaseObject.ts';
export default class ShortData extends DatabaseObject {
    _id;
    _ticker_no;
    _name;
    _full_name;
    _description;
    _category;
    _subcategory;
    _board_lot;
    _ISIN;
    _currency;
    _is_active;
    constructor(operationType) {
        super(operationType);
    }
    get id() {
        return this._id;
    }
    set id(id) {
        this._id = id;
    }
    get ticker_no() {
        return this._ticker_no ?? '';
    }
    set ticker_no(ticker_no) {
        this._ticker_no = ticker_no;
    }
    get name() {
        return this._name ?? '';
    }
    set name(name) {
        this._name = name;
    }
    get full_name() {
        return this._full_name ?? '';
    }
    set full_name(full_name) {
        this._full_name = full_name;
    }
    get description() {
        return this._description ?? '';
    }
    set description(description) {
        this._description = description;
    }
    get category() {
        return this._category ?? '';
    }
    set category(category) {
        this._category = category;
    }
    get subcategory() {
        return this._subcategory ?? '';
    }
    set subcategory(subcategory) {
        this._subcategory = subcategory;
    }
    get board_lot() {
        return this._board_lot ?? 0;
    }
    set board_lot(board_lot) {
        this._board_lot = board_lot;
    }
    get ISIN() {
        return this._ISIN ?? '';
    }
    set ISIN(ISIN) {
        this._ISIN = ISIN;
    }
    get currency() {
        return this._currency;
    }
    set currency(currency) {
        this._currency = currency;
    }
    get is_active() {
        return this._is_active;
    }
    set is_active(is_active) {
        this._is_active = is_active;
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
Last Modified Date: ${this.last_modified_datetime}`;
    }
}
