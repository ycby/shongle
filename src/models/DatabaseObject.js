export default class DatabaseObject {
	
	operation
	created_datetime
	last_modified_datetime

	constructor(operationType) {

		this.operation = operationType
		this.last_modified_datetime = new Date()

		switch (this.operation) {
		case 'INSERT':
			this.created_datetime = new Date()
			break
		default:
			break
		}
	}

	get operation() {

		return this.operation
	}

	get created_datetime() {

		return this.created_datetime
	}

	get last_modified_datetime() {

		return this.last_modified_datetime
	}

	*getFields() {

		yield this.created_datetime
		yield this.last_modified_datetime
	}
}