export default class DatabaseObject {
    _operation;
    _created_datetime;
    _last_modified_datetime;
    constructor(operationType) {
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
    get operation() {
        return this._operation ?? '';
    }
    get created_datetime() {
        return this._created_datetime;
    }
    get last_modified_datetime() {
        return this._last_modified_datetime;
    }
    getPlainObject() {
        let result = {};
        Object.getOwnPropertyNames(this).forEach((key) => {
            const slicedKey = key.slice(1);
            result[slicedKey] = this[key];
        });
        return result;
    }
}
