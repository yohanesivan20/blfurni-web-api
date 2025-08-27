export const successResponse = (res, message, data = null, status = 200) => {
    return res.status(status).json({
        success:true,
        message,
        data
    });
}

export const failedResponse = (res, message, data = null, status = 400) => {
    return res.status(status).json({
        success: false,
        message,
        data
    });
}