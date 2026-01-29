import DatabaseObject from '#root/src/models/DatabaseObject.js'
import {stringToDateConverter} from "#root/src/helpers/DateHelper.js";

export default class ShortData extends DatabaseObject {

	private _id?: BigInt;
	private _stock_id?: BigInt;
	private _ticker_no?: string;
	private _reporting_date?: Date;
	private _shorted_shares?: number;
	private _shorted_amount?: number;

	constructor(data?: any) {

		super();

		this._id = BigInt(data?.id);
		this._stock_id = BigInt(data?.stock_id);
		this._ticker_no = data?.ticker_no;

		if (data?.reporting_date === undefined) {

			this._reporting_date = data?.reporting_date;
		} else if (data.reporting_date instanceof Date) {

			this._reporting_date = data.reporting_date;
		} else if (typeof data.reporting_date === 'string') {

			const convertedDate = stringToDateConverter(data.reporting_date);
			if (!convertedDate) throw new TypeError(`${data.reporting_date} cannot be cast to a date`);

			this._reporting_date = convertedDate;
		}

		this._shorted_shares = data?.shorted_shares;
		this._shorted_amount = data?.shorted_amount;
		this.created_datetime = data?.created_datetime ? data.created_datetime : this.created_datetime;
		this.last_modified_datetime = data?.last_modified_datetime ? data.last_modified_datetime : this.last_modified_datetime;
	}

	get id(): BigInt | undefined {

		return this._id;
	}

	set id(id: BigInt) {

		this._id = id;
	}

	get stock_id(): BigInt | undefined {

		return this._stock_id;
	}

	set stock_id(stock_id: BigInt) {

		this._stock_id = stock_id;
	}

	get ticker_no(): string | undefined {

		return this._ticker_no;
	}

	set ticker_no(ticker_no: string) {

		this._ticker_no = ticker_no;
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