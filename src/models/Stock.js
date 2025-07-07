import DatabaseObject from './DatabaseObject.js'

export default class ShortData extends DatabaseObject {

    id
    ticker_no
    name
    full_name
    description
    category
    subcategory
    board_lot
    ISIN
    currency

    constructor(operationType) {

        super(operationType);
    }

    get ticker_no() {

        return this.ticker_no;
    }

    set ticker_no(ticker_no) {

        switch (typeof ticker_no) {
            case 'number' :
                this.ticker_no = ticker_no.toString().padStart(5, '0');
                break;
            case 'string' :
                this.ticker_no = ticker_no.padStart(5, '0');
                break;
            default:
                throw new Error('Unexpected Stock Ticker No type');
        }
    }

    get name() {

        return this.name;
    }

    set name(name) {

        this.name = name;
    }

    get full_name() {

        return this.full_name;
    }

    set full_name(full_name) {

        this.full_name = full_name;
    }

    get description() {

        return this.description;
    }

    set description(description) {

        this.description = description;
    }

    get category() {

        return this.category;
    }

    set category(category) {

        this.category = category;
    }

    get subcategory() {

        return this.subcategory;
    }

    set subcategory(subcategory) {

        this.subcategory = subcategory;
    }

    get board_lot() {

        return this.board_lot;
    }

    set board_lot(board_lot) {

        this.board_lot = board_lot;
    }

    get ISIN() {

        return this.ISIN;
    }

    set ISIN(ISIN) {

        this.ISIN = ISIN;
    }

    get currency() {

        return this.currency
    }

    set currency(currency) {

        this.currency = currency;
    }

    *getFields() {

        yield this.id;
        yield this.ticker_no;
        yield this.name;
        yield this.full_name;
        yield this.description;
        yield this.category;
        yield this.subcategory;
        yield this.board_lot;
        yield this.ISIN;
        yield this.currency;
        yield this.created_datetime;
        yield this.last_modified_datetime;
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