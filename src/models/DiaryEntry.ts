import DatabaseObject from "#root/src/models/DatabaseObject.js";

export default class DiaryEntry extends DatabaseObject{

    private _id?: bigint;
    private _stock_id?: number;
    private _title?: string;
    private _content?: string;
    private _posted_date?: Date;

    constructor (data?: any) {

        super();

        this._id = data?.id;
        this._stock_id = data?.stock_id;
        this._title = data?.title;
        this._content = data?.content;
        this._posted_date = data?.posted_date;
    }

    get id(): bigint | undefined {

        return this._id;
    }

    set id(id: bigint) {

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

    get posted_date(): Date | undefined {

        return this._posted_date;
    }

    set posted_date(date: Date) {

        this._posted_date = date;
    }
}