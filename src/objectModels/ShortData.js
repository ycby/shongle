import DatabaseObject from './DatabaseObject.js'

export default class ShortData extends DatabaseObject {

	#stock_code
	#reporting_date
	#shorted_shares
	#shorted_amount

	constructor(operationType) {

		super(operationType)
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

		const splitDate = reportingDate.split('/')
		splitDate[1] = (parseInt(splitDate[1]) - 1).toString()
		this._reporting_date = new Date(...splitDate.reverse())
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

	*getFields() {

		yield this._stock_code
		yield this._reporting_date
		yield this._shorted_shares
		yield this._shorted_amount
		yield this._created_datetime
		yield this._last_modified_datetime
	}
}