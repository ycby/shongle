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

export {
    DuplicateFoundError,
    RecordNotFoundError,
}