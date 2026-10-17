const { AppError, NotFoundError } = require('../utils/errors');
const { sendError } = require('../utils/responseHandler');

/**
 * 404 Not Found Middleware for unmatched routes.
 */
function notFoundHandler(req, res, next) {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
}

/**
 * Centralized error-handling middleware.
 */
function errorHandler(err, req, res, next) {
  // Handle JSON parse errors from body-parser / express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 400, 'INVALID_JSON', 'Malformed JSON payload provided in request body');
  }

  // Handle custom AppErrors
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.code, err.message, err.details);
  }

  // Handle unexpected internal errors
  console.error('[UNCAUGHT_ERROR]', err);
  return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'An unexpected internal server error occurred');
}

module.exports = {
  notFoundHandler,
  errorHandler
};
