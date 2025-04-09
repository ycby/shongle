const generateStandardResponse = (responseObject, statusCode, statusDescription) => {

    return {
        "status": statusCode,
        "message": statusDescription,
        "data": responseObject
    }
}

const generateErrorResponse = (statusCode, statusDescription) => {

    return {
        "status": statusCode,
        "message": statusDescription
    }
}

export {
    generateStandardResponse,
    generateErrorResponse
}