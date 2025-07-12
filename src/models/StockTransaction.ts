import DatabaseObject from "#root/src/models/DatabaseObject.ts";

export default class StockTransaction extends DatabaseObject {

    private _id: number;
    private _stock_id: number;
    private _type: string;
    private _amount: number;
    private _quantity: number;
    private _fee: number
    private _amount_per_share: number;
    private _currency: string;
}