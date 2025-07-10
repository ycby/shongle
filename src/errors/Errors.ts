class ShongleError extends Error {

    public code: number;

    constructor(code: number, message: string) {
        super(message);
        this.code = code;
    }
}

class DuplicateFoundError extends ShongleError {

    constructor(message: string) {
        super(422, message);
        this.code = 422;
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

    constructor(message: string) {
        super(-1, message);
    }
}

export {
    ShongleError,
    DuplicateFoundError,
    RecordNotFoundError,
    UnexpectedFileError,
    InvalidRequestError
}