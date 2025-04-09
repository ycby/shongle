export default class DatabaseObject {
	
	#operation
	#created_datetime
	#last_modified_datetime

	constructor(operationType) {

		this._operation = operationType
		this._last_modified_datetime = new Date()

		switch (this._operation) {
		case 'INSERT':
			this._created_datetime = new Date()
			break
		default:
			break
		}
	}

	get operation() {

		return this._operation
	}

	get created_datetime() {

		return this._created_datetime
	}

	get last_modified_datetime() {

		return this._last_modified_datetime
	}

	*getFields() {

		yield created_datetime
		yield last_modified_datetime
	}
}