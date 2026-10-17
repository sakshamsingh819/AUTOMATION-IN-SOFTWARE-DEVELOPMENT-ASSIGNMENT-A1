const { ValidationError } = require('../utils/errors');

const VALID_STATUSES = ['pending', 'in_progress', 'completed'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];
const VALID_SORT_FIELDS = ['priority', 'dueDate', 'createdAt', 'title'];
const VALID_ORDERS = ['asc', 'desc'];

/**
 * Validates ISO8601 date string.
 */
function isValidISO8601(str) {
  if (typeof str !== 'string') return false;
  const date = new Date(str);
  return !isNaN(date.getTime()) && str.includes('T');
}

/**
 * Validation middleware for POST /tasks (Task creation).
 */
function validateCreateTask(req, res, next) {
  const errors = [];
  const { title, description, status, priority, dueDate } = req.body || {};

  // Title validation
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Title is required and must be a non-empty string' });
  }

  // Description validation (optional)
  if (description !== undefined && typeof description !== 'string') {
    errors.push({ field: 'description', message: 'Description must be a string if provided' });
  }

  // Status validation (optional, default 'pending')
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push({
      field: 'status',
      message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
    });
  }

  // Priority validation (optional, default 'medium')
  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push({
      field: 'priority',
      message: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}`
    });
  }

  // Due date validation (optional)
  if (dueDate !== undefined && dueDate !== null && !isValidISO8601(dueDate)) {
    errors.push({
      field: 'dueDate',
      message: 'dueDate must be a valid ISO8601 date string (e.g. 2026-10-25T18:00:00.000Z)'
    });
  }

  if (errors.length > 0) {
    return next(new ValidationError('Task creation validation failed', errors));
  }

  next();
}

/**
 * Validation middleware for PATCH /tasks/:id (Task update).
 */
function validateUpdateTask(req, res, next) {
  const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate'];
  const bodyKeys = Object.keys(req.body || {});

  if (bodyKeys.length === 0) {
    return next(new ValidationError('Request body must contain at least one field to update', []));
  }

  const disallowedKeys = bodyKeys.filter((key) => !allowedFields.includes(key));
  if (disallowedKeys.length > 0) {
    return next(
      new ValidationError('Payload contains disallowed fields', [
        { disallowedFields: disallowedKeys, allowedFields }
      ])
    );
  }

  const errors = [];
  const { title, description, status, priority, dueDate } = req.body;

  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
    errors.push({ field: 'title', message: 'Title must be a non-empty string' });
  }

  if (description !== undefined && typeof description !== 'string') {
    errors.push({ field: 'description', message: 'Description must be a string' });
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push({
      field: 'status',
      message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
    });
  }

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    errors.push({
      field: 'priority',
      message: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}`
    });
  }

  if (dueDate !== undefined && dueDate !== null && !isValidISO8601(dueDate)) {
    errors.push({
      field: 'dueDate',
      message: 'dueDate must be a valid ISO8601 date string'
    });
  }

  if (errors.length > 0) {
    return next(new ValidationError('Task update validation failed', errors));
  }

  next();
}

/**
 * Validation middleware for GET /tasks query params.
 */
function validateQueryParams(req, res, next) {
  const errors = [];
  const { page, limit, sortBy, order } = req.query;

  if (page !== undefined) {
    const pageNum = Number(page);
    if (!Number.isInteger(pageNum) || pageNum < 1) {
      errors.push({ field: 'page', message: 'page query parameter must be a positive integer >= 1' });
    }
  }

  if (limit !== undefined) {
    const limitNum = Number(limit);
    if (!Number.isInteger(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push({ field: 'limit', message: 'limit query parameter must be an integer between 1 and 100' });
    }
  }

  if (sortBy !== undefined && !VALID_SORT_FIELDS.includes(sortBy)) {
    errors.push({
      field: 'sortBy',
      message: `sortBy must be one of: ${VALID_SORT_FIELDS.join(', ')}`
    });
  }

  if (order !== undefined && !VALID_ORDERS.includes(order.toLowerCase())) {
    errors.push({
      field: 'order',
      message: `order must be one of: ${VALID_ORDERS.join(', ')}`
    });
  }

  if (errors.length > 0) {
    return next(new ValidationError('Invalid query parameters', errors));
  }

  next();
}

module.exports = {
  validateCreateTask,
  validateUpdateTask,
  validateQueryParams,
  VALID_STATUSES,
  VALID_PRIORITIES
};
