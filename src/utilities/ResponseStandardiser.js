const generateStandardResponse = (statusCode, statusDescription, responseObject) => {
    return {
        "status": statusCode,
        "message": statusDescription,
        "data": responseObject
    };
};
const generateErrorResponse = (statusCode, statusDescription, supportingObject) => {
    return {
        "status": statusCode,
        "message": statusDescription,
        "data": supportingObject
    };
};
export { generateStandardResponse, generateErrorResponse };
