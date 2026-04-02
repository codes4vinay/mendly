const buildResponse = (statusCode, message, data = null) => {
    const response = { success: statusCode < 400, message };
    if (data !== null) response.data = data;
    return response;
};

const isExpressResponse = (value) =>
    value &&
    typeof value.status === "function" &&
    typeof value.json === "function";

const apiResponse = (resOrStatusCode, statusCodeOrMessage, messageOrData = null, data = null) => {
    if (isExpressResponse(resOrStatusCode)) {
        const response = buildResponse(statusCodeOrMessage, messageOrData, data);
        return resOrStatusCode.status(statusCodeOrMessage).json(response);
    }

    return buildResponse(resOrStatusCode, statusCodeOrMessage, messageOrData);
};

export default apiResponse;
