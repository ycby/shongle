import DatabaseObject from './DatabaseObject.js'

export default class ShortData extends DatabaseObject {

    #code
    #name
    #full_name
    #description
    #category
    #subcategory
    #board_lot
    #ISIN
    #currency

    constructor(operationType) {

        super(operationType);
    }

    get code() {

        return this._code;
    }

    set code(code) {

        switch (typeof code) {
            case 'number' :
                this._code = code.toString().padStart(5, '0');
                break;
            case 'string' :
                this._code = code.padStart(5, '0');
                break;
            default:
                throw new Error('Unexpected Stock Code type');
        }
    }

    get name() {

        return this._name;
    }

    set name(name) {

        this._name = name;
    }

    get full_name() {

        return this._full_name;
    }

    set full_name(full_name) {

        this._full_name = full_name;
    }

    get description() {

        return this._description;
    }

    set description(description) {

        this._description = description;
    }

    get category() {

        return this._category;
    }

    set category(category) {

        this._category = category;
    }

    get subcategory() {

        return this._subcategory;
    }

    set subcategory(subcategory) {

        this._subcategory = subcategory;
    }

    get board_lot() {

        return this._board_lot;
    }

    set board_lot(board_lot) {

        this._board_lot = board_lot;
    }

    get ISIN() {

        return this._ISIN;
    }

    set ISIN(ISIN) {

        this._ISIN = ISIN;
    }

    get currency() {

        return this._currency
    }

    set currency(currency) {

        this._currency = currency;
    }

    *getFields() {

        yield this._code;
        yield this._name;
        yield this._full_name;
        yield this._description;
        yield this._category;
        yield this._subcategory;
        yield this._board_lot;
        yield this._ISIN;
        yield this._currency;
        yield this._created_datetime;
        yield this._last_modified_datetime;
    }

    toString() {

        return `Code: ${this._code},
Name: ${this._name},
Full Name: ${this._full_name},
Description: ${this._description},
Category: ${this._category},
Subcategory: ${this._subcategory},
Board Lot: ${this._board_lot},
ISIN: ${this._ISIN},
Currency: ${this._currency},
Created Date: ${this._created_datetime},
Last Modified Date: ${this._last_modified_datetime}`
    }
}