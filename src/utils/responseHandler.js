/**
 * Standardized API response helper implementing unified envelope:
 * {
 *   success: boolean,
 *   data: object | array | null,
 *   error: { code: string, message: string, details?: any } | null,
 *   meta: { timestamp: string, ...extra }
 * }
 */
function sendSuccess(res, statusCode = 200, data = null, meta = {}) {
  return res.status(statusCode).json({
    success: true,
    data,
    error: null,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  });
}

function sendError(res, statusCode = 500, code = 'INTERNAL_ERROR', message = 'An unexpected error occurred', details = null, meta = {}) {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  });
}

module.exports = {
  sendSuccess,
  sendError
};
