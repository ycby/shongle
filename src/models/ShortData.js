import DatabaseObject from './DatabaseObject.js'

export default class ShortData extends DatabaseObject {

	#id
	#stock_code
	#reporting_date
	#shorted_shares
	#shorted_amount

	constructor(operationType) {

		super(operationType)
	}

	get id() {

		return this._stock_code;
	}

	set id(id) {

		this._id = id;
	}

	get stock_code() {

		return this._stock_code
	}

	set stock_code(stockCode) {

		switch (typeof stockCode) {
		case 'number' :
			this._stock_code = stockCode.toString().padStart(5, '0')
			break
		case 'string' :
			this._stock_code = stockCode.padStart(5, '0')
			break
		default:
			throw new Error('Unexpected Stock Code type')
		}
	}

	get reporting_date() {

		return this._reporting_date
	}

	set reporting_date(reportingDate) {

		this._reporting_date = new Date(reportingDate);
	}

	get shorted_shares() {

		return this._shorted_shares
	}

	set shorted_shares(shortedShares) {

		this._shorted_shares = shortedShares
	}

	get shorted_amount() {

		return this._shorted_amount
	}

	set shorted_amount(shortedAmount) {

		this._shorted_amount = shortedAmount
	}

	getPlainObject() {

		return {
			id: this._id,
			stock_code: this._stock_code,
			reporting_date: this._reporting_date,
			shorted_shares: this._shorted_shares,
			shorted_amount: this._shorted_amount,
			created_datetime: this._created_datetime,
			last_modified_datetime: this._last_modified_datetime
		}
	}

	*getFields() {

		yield this._id
		yield this._stock_code
		yield this._reporting_date
		yield this._shorted_shares
		yield this._shorted_amount
		yield this._created_datetime
		yield this._last_modified_datetime
	}

	toString() {

		return `
		Id: ${this._id},
		Stock Code: ${this._stock_code},
		Reporting Date: ${this._reporting_date},
		Shorted Shares: ${this._shorted_shares},
		Shorted Amount: ${this._shorted_amount},
		Created Date: ${this._created_datetime},
		Last Modified Date: ${this._last_modified_datetime}`
	}
}