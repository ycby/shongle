import DatabaseObject from './DatabaseObject.ts';
export default class ShortData extends DatabaseObject {
    _id;
    _stock_id;
    _reporting_date;
    _shorted_shares;
    _shorted_amount;
    constructor(operationType) {
        super(operationType);
    }
    get id() {
        return this._id;
    }
    set id(id) {
        this._id = id;
    }
    get stock_id() {
        return this._stock_id;
    }
    set stock_id(stock_id) {
        this._stock_id = stock_id;
    }
    get reporting_date() {
        return this._reporting_date;
    }
    set reporting_date(date) {
        this._reporting_date = date;
    }
    get shorted_shares() {
        return this._shorted_shares;
    }
    set shorted_shares(shorted_shares) {
        this._shorted_shares = shorted_shares;
    }
    get shorted_amount() {
        return this._shorted_amount;
    }
    set shorted_amount(shorted_amount) {
        this._shorted_amount = shorted_amount;
    }
    toString() {
        return `
Id: ${this.id},
Stock Code: ${this.stock_id},
Reporting Date: ${this.reporting_date},
Shorted Shares: ${this.shorted_shares},
Shorted Amount: ${this.shorted_amount},
Created Date: ${this.created_datetime},
Last Modified Date: ${this.last_modified_datetime}`;
    }
}
