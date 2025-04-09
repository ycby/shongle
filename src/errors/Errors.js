class DuplicateFoundError extends Error {

    constructor(message) {
        super(message);
        this.code = 422;
    }
}

export {
    DuplicateFoundError
}