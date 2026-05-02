import { validationResult } from 'express-validator';

const validateRequest = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error('Validation failed');
    err.statusCode = 422;
    err.details = errors.array();
    throw err;
  }
  next();
};

export default validateRequest;
