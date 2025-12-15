import DatabaseObject from "#root/src/models/DatabaseObject.ts";
export default class StockTransaction extends DatabaseObject {
    _id;
    _stock_id;
    _type;
    _amount;
    _quantity;
    _fee;
    _amount_per_share;
    _currency;
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
    get type() {
        return this._type ?? '';
    }
    set type(type) {
        this._type = type;
    }
    get amount() {
        return this._amount;
    }
    set amount(amount) {
        this._amount = amount;
    }
    get quantity() {
        return this._quantity;
    }
    set quantity(quantity) {
        this._quantity = quantity;
    }
    get fee() {
        return this._fee;
    }
    set fee(fee) {
        this._fee = fee;
    }
    get amount_per_share() {
        return this._amount_per_share ?? 0;
    }
    set amount_per_share(amountPerShare) {
        this._amount_per_share = amountPerShare;
    }
    get currency() {
        return this._currency;
    }
    set currency(currency) {
        this._currency = currency;
    }
}
