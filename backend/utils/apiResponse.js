export const successResponse = (res, message, data = {}, statusCode = 200) => res.status(statusCode).json({ success: true, message, data });

export const errorResponse = (res, message, statusCode = 400, errors = null) => res.status(statusCode).json({ success: false, message, errors });
