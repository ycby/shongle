import DatabaseObject from './DatabaseObject.ts'

export default class ShortData extends DatabaseObject {

	private _id?: number;
	private _stock_id?: number;
	private _reporting_date?: Date;
	private _shorted_shares?: number;
	private _shorted_amount?: number;

	constructor(operationType: string) {

		super(operationType)
	}

	get id(): number | undefined{

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

	get reporting_date(): Date | undefined {

		return this._reporting_date;
	}

	set reporting_date(date: Date) {

		this._reporting_date = date;
	}

	get shorted_shares(): number | undefined {

		return this._shorted_shares;
	}

	set shorted_shares(shorted_shares: number) {

		this._shorted_shares = shorted_shares;
	}

	get shorted_amount(): number | undefined {

		return this._shorted_amount;
	}

	set shorted_amount(shorted_amount: number) {

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
Last Modified Date: ${this.last_modified_datetime}`
	}
}