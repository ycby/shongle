class ShongleError extends Error {

    public code: number;
    public supportingData?: Object;

    constructor(code: number, message: string, supportingData?: Object) {
        super(message);
        this.code = code;
        this.supportingData = supportingData;
    }
}

class DuplicateFoundError extends ShongleError {

    constructor(message: string) {
        super(422, message);
    }
}

class RecordNotFoundError extends ShongleError {

    constructor(message: string) {
        super(422, message);
    }
}

class UnexpectedFileError extends ShongleError {

    constructor(message: string) {
        super(500, message);
    }
}

class InvalidRequestError extends ShongleError {

    constructor(supportingData?: any) {
        super(-1, 'Request failed because one or more parameters were formatted incorrectly', supportingData);
    }
}

class RecordMissingDataError extends ShongleError {

    constructor(supportingData?: any) {
        super(-1, 'Request failed because record is missing essential data. Please fix the data first.', supportingData);
    }
}

export {
    ShongleError,
    DuplicateFoundError,
    RecordNotFoundError,
    UnexpectedFileError,
    InvalidRequestError,
    RecordMissingDataError
}