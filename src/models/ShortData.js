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