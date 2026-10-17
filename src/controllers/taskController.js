const taskStore = require('../models/taskStore');
const { sendSuccess } = require('../utils/responseHandler');
const { NotFoundError } = require('../utils/errors');

// Priority weight mapping for custom numerical comparator (Step 3)
const PRIORITY_WEIGHTS = {
  high: 3,
  medium: 2,
  low: 1
};

/**
 * GET /tasks - Filter, search, sort, and paginate tasks.
 */
function getTasks(req, res, next) {
  try {
    let results = taskStore.findAll();
    const { status, priority, search, sortBy, order = 'desc', page = 1, limit = 10 } = req.query;

    // 1. Status filtering (Step 3 + Step 6 Chain-of-Thought fix)
    // Handles single value or comma-separated list e.g. "pending,completed"
    if (status) {
      const statusList = String(status)
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      if (statusList.length > 0) {
        results = results.filter((task) => statusList.includes(task.status.toLowerCase()));
      }
    }

    // 2. Priority filtering
    if (priority) {
      const priorityList = String(priority)
        .split(',')
        .map((p) => p.trim().toLowerCase())
        .filter(Boolean);

      if (priorityList.length > 0) {
        results = results.filter((task) => priorityList.includes(task.priority.toLowerCase()));
      }
    }

    // 3. Substring full-text search across title and description
    if (search && search.trim()) {
      const query = search.trim().toLowerCase();
      results = results.filter((task) => {
        const titleMatch = task.title && task.title.toLowerCase().includes(query);
        const descMatch = task.description && task.description.toLowerCase().includes(query);
        return titleMatch || descMatch;
      });
    }

    // 4. Custom sorting (Solves alphabetical string sort bug)
    const sortField = sortBy || 'createdAt';
    const isAsc = order.toLowerCase() === 'asc';

    results.sort((a, b) => {
      let comparison = 0;

      if (sortField === 'priority') {
        const weightA = PRIORITY_WEIGHTS[a.priority] || 0;
        const weightB = PRIORITY_WEIGHTS[b.priority] || 0;
        comparison = weightA - weightB;
      } else if (sortField === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        comparison = dateA - dateB;
      } else if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else {
        // Default: createdAt
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        comparison = dateA - dateB;
      }

      return isAsc ? comparison : -comparison;
    });

    // 5. Pagination slicing
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const totalItems = results.length;
    const totalPages = Math.ceil(totalItems / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedItems = results.slice(startIndex, startIndex + limitNum);

    const paginationMeta = {
      page: pageNum,
      limit: limitNum,
      totalItems,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    };

    return sendSuccess(res, 200, paginatedItems, { pagination: paginationMeta });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /tasks/:id - Retrieve single task by id.
 */
function getTaskById(req, res, next) {
  try {
    const task = taskStore.findById(req.params.id);
    if (!task) {
      throw new NotFoundError(`Task with id ${req.params.id} not found`);
    }
    return sendSuccess(res, 200, task);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /tasks - Create a new task.
 */
function createTask(req, res, next) {
  try {
    const task = taskStore.create(req.body);
    return sendSuccess(res, 201, task);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /tasks/:id - Update task fields.
 */
function updateTask(req, res, next) {
  try {
    const task = taskStore.update(req.params.id, req.body);
    if (!task) {
      throw new NotFoundError(`Task with id ${req.params.id} not found`);
    }
    return sendSuccess(res, 200, task);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /tasks/:id - Delete a task.
 */
function deleteTask(req, res, next) {
  try {
    const deleted = taskStore.delete(req.params.id);
    if (!deleted) {
      throw new NotFoundError(`Task with id ${req.params.id} not found`);
    }
    return sendSuccess(res, 200, { deletedId: Number(req.params.id), message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
