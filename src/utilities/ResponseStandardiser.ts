const generateStandardResponse = (responseObject: any, statusCode: number, statusDescription: string) => {

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