export default class DatabaseObject {
	
	private readonly _operation?: string;
	private readonly _created_datetime: Date | undefined;
	private readonly _last_modified_datetime: Date;

	constructor(operationType: string) {

		this._operation = operationType;
		this._last_modified_datetime = new Date();

		switch (this.operation) {
			case 'INSERT':
				this._created_datetime = new Date();
				break;
			default:
				break;
		}
	}

	get operation(): string {

		return this._operation ?? '';
	}

	get created_datetime(): Date | undefined{

		return this._created_datetime;
	}

	get last_modified_datetime(): Date {

		return this._last_modified_datetime;
	}
}