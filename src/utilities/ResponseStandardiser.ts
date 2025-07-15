const generateStandardResponse = (statusCode: number, statusDescription: string, responseObject: any) => {

    return {
        "status": statusCode,
        "message": statusDescription,
        "data": responseObject
    }
}

const generateErrorResponse = (statusCode: number, statusDescription: string, supportingObject?: any) => {

    return {
        "status": statusCode,
        "message": statusDescription,
        "data": supportingObject
    }
}

export {
    generateStandardResponse,
    generateErrorResponse
}