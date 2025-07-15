export default class DatabaseObject {
	
	private readonly _operation?: string;
	private readonly _created_datetime: Date;
	private readonly _last_modified_datetime: Date;

	constructor(operationType: string) {

		this._operation = operationType;
		this._last_modified_datetime = new Date();

		switch (this.operation) {
			case 'INSERT':
				this._created_datetime = new Date();
				break;
			default:
				this._created_datetime = new Date(0, 0, 0);
				break;
		}
	}

	get operation(): string {

		return this._operation ?? '';
	}

	get created_datetime(): Date{

		return this._created_datetime;
	}

	get last_modified_datetime(): Date {

		return this._last_modified_datetime;
	}

	getPlainObject(this: any) {

		let result: any = {};
		Object.getOwnPropertyNames(this).forEach((key:string) => {

			const slicedKey = key.slice(1);

			result[slicedKey] = this[key];
		});

		return result;
	}
}