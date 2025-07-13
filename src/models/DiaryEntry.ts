import DatabaseObject from "#root/src/models/DatabaseObject.ts";

export default class DiaryEntry extends DatabaseObject{

    private _id?: number;
    private _stock_id?: number;
    private _title?: string;
    private _content?: string;

    constructor (operationType: string) {

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

    get title(): string {

        return this._title ?? '';
    }

    set title(title: string) {

        this._title = title;
    }

    get content(): string {

        return this._content ?? '';
    }

    set content(content: string) {

        this._content = content;
    }
}