import DatabaseObject from './DatabaseObject.js'

export default class ShortData extends DatabaseObject {

	id
	stock_code
	reporting_date
	shorted_shares
	shorted_amount

	constructor(operationType) {

		super(operationType)
	}

	get id() {

		return this.stock_code;
	}

	set id(id) {

		this.id = id;
	}

	get stock_code() {

		return this.stock_code
	}

	set stock_code(stockCode) {

		switch (typeof stockCode) {
		case 'number' :
			this.stock_code = stockCode.toString().padStart(5, '0')
			break
		case 'string' :
			this.stock_code = stockCode.padStart(5, '0')
			break
		default:
			throw new Error('Unexpected Stock Code type')
		}
	}

	get reporting_date() {

		return this.reporting_date
	}

	set reporting_date(reportingDate) {

		this.reporting_date = new Date(reportingDate);
	}

	get shorted_shares() {

		return this.shorted_shares
	}

	set shorted_shares(shortedShares) {

		this.shorted_shares = shortedShares
	}

	get shorted_amount() {

		return this.shorted_amount
	}

	set shorted_amount(shortedAmount) {

		this.shorted_amount = shortedAmount
	}

	*getFields() {

		yield this.id
		yield this.stock_code
		yield this.reporting_date
		yield this.shorted_shares
		yield this.shorted_amount
		yield this.created_datetime
		yield this.last_modified_datetime
	}

	toString() {

		return `
		Id: ${this.id},
		Stock Code: ${this.stock_code},
		Reporting Date: ${this.reporting_date},
		Shorted Shares: ${this.shorted_shares},
		Shorted Amount: ${this.shorted_amount},
		Created Date: ${this.created_datetime},
		Last Modified Date: ${this.last_modified_datetime}`
	}
}