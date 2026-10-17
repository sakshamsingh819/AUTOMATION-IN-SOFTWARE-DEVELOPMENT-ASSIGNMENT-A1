const express = require('express');
const router = express.Router();

const taskController = require('../controllers/taskController');
const {
  validateCreateTask,
  validateUpdateTask,
  validateQueryParams
} = require('../middleware/validation');

// GET /tasks - Filtered, sorted, paginated task list
router.get('/', validateQueryParams, taskController.getTasks);

// POST /tasks - Create a new task with validation
router.post('/', validateCreateTask, taskController.createTask);

// GET /tasks/:id - Retrieve single task by id
router.get('/:id', taskController.getTaskById);

// PATCH /tasks/:id - Update task fields
router.patch('/:id', validateUpdateTask, taskController.updateTask);

// DELETE /tasks/:id - Delete a task
router.delete('/:id', taskController.deleteTask);

module.exports = router;
