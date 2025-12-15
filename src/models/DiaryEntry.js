import DatabaseObject from "#root/src/models/DatabaseObject.ts";
export default class DiaryEntry extends DatabaseObject {
    _id;
    _stock_id;
    _title;
    _content;
    _posted_date;
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
    get title() {
        return this._title ?? '';
    }
    set title(title) {
        this._title = title;
    }
    get content() {
        return this._content ?? '';
    }
    set content(content) {
        this._content = content;
    }
    get posted_date() {
        return this._posted_date;
    }
    set posted_date(date) {
        this._posted_date = date;
    }
}
