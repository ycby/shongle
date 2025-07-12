import DatabaseObject from "#root/src/models/DatabaseObject.ts";

export default class DiaryEntry extends DatabaseObject{

    private _id: number;
    private _stock_id: number;
    private _title: string;
    private _content: string;
}