class DuplicateFoundError extends Error {

    constructor(message) {
        super(message);
        this.code = 422;
    }
}

class RecordNotFoundError extends Error {

    constructor(message) {
        super(message);
        this.code = 422;
    }
}

class UnexpectedFileError extends Error {

    constructor(message) {
        super(message);
        this.code = 500;
    }
}

export {
    DuplicateFoundError,
    RecordNotFoundError,
}