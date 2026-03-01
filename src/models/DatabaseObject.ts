export default class DatabaseObject {

	private _created_datetime: Date;
	private _last_modified_datetime: Date;

	constructor() {

		this._created_datetime = new Date();
		this._last_modified_datetime = new Date();
	}

	get created_datetime(): Date{

		return this._created_datetime;
	}

	set created_datetime(value: Date){
		this._created_datetime = value;
	}

	get last_modified_datetime(): Date {

		return this._last_modified_datetime;
	}

	set last_modified_datetime(value: Date) {

		this._last_modified_datetime = value;
	}

	getPlainObject(this: any): any {

		let result: any = {};
		Object.getOwnPropertyNames(this).forEach((key: string) => {

			if (this[key] === undefined) return;
			const slicedKey = key.slice(1);

			result[slicedKey] = this[key];
		});

		return result;
	}

	toJSON() {

		let result: any = this.getPlainObject();

		return result;
	}
}