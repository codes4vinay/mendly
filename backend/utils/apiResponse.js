const apiResponse = (statusCode, message, data = null) => {
    const response = { success: statusCode < 400, message };
    if (data !== null) response.data = data;
    return response;
};

export default apiResponse;