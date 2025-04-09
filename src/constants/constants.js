const HTTP_STATUS_CODES = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404
}

const APP_STATUS_CODES = {
    SUCCESS: 1,
    NO_RESULT: -1
}

const APP_STATUS_DESCRIPTORS = {
    RESULT_FOUND: "Result(s) found",
    RESULT_NOT_FOUND: "Results not found",
    SUCCESS: "Success",
    UNKNOWN_FAILURE: "Unknown failure"
}

export {
    HTTP_STATUS_CODES,
    APP_STATUS_CODES,
    APP_STATUS_DESCRIPTORS
}