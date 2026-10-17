const request = require('supertest');
const app = require('../src/app');
const taskStore = require('../src/models/taskStore');

describe('Task Management REST API Test Suite', () => {
  beforeEach(() => {
    // Reset and seed data before each test for predictable test state
    taskStore.seed();
  });

  describe('Root and Health Endpoints', () => {
    it('GET / should return unified envelope with API metadata', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Task Management REST API');
      expect(res.body.error).toBeNull();
      expect(res.body.meta).toHaveProperty('timestamp');
    });

    it('GET /health should return 200 with OK status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('OK');
    });

    it('GET /undefined-route should return 404 in standardized error envelope', async () => {
      const res = await request(app).get('/undefined-route');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.data).toBeNull();
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(res.body.meta).toHaveProperty('timestamp');
    });
  });

  describe('POST /tasks (Task Creation & Validation)', () => {
    it('should create a task successfully with valid payload (201)', async () => {
      const newTask = {
        title: 'Implement Unit Tests',
        description: 'Write Jest and Supertest suites',
        priority: 'high',
        status: 'pending',
        dueDate: '2026-10-30T10:00:00.000Z'
      };

      const res = await request(app).post('/tasks').send(newTask);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.error).toBeNull();
      expect(res.body.data.title).toBe(newTask.title);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.priority).toBe('high');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('createdAt');
      expect(res.body.meta).toHaveProperty('timestamp');
    });

    it('should assign default status "pending" and priority "medium" if omitted', async () => {
      const res = await request(app).post('/tasks').send({
        title: 'Quick Task'
      });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.priority).toBe('medium');
    });

    it('should reject request when title is missing (400)', async () => {
      const res = await request(app).post('/tasks').send({
        description: 'Missing title'
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details.some((d) => d.field === 'title')).toBe(true);
    });

    it('should reject request when status is invalid (400)', async () => {
      const res = await request(app).post('/tasks').send({
        title: 'Task with bad status',
        status: 'in_the_future'
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details.some((d) => d.field === 'status')).toBe(true);
    });

    it('should reject request when priority is invalid (400)', async () => {
      const res = await request(app).post('/tasks').send({
        title: 'Task with bad priority',
        priority: 'urgent'
      });

      expect(res.status).toBe(400);
      expect(res.body.error.details.some((d) => d.field === 'priority')).toBe(true);
    });

    it('should reject request when dueDate is not valid ISO8601 (400)', async () => {
      const res = await request(app).post('/tasks').send({
        title: 'Task with bad date',
        dueDate: 'tomorrow-afternoon'
      });

      expect(res.status).toBe(400);
      expect(res.body.error.details.some((d) => d.field === 'dueDate')).toBe(true);
    });
  });

  describe('GET /tasks (Querying, Filtering, Sorting & Pagination)', () => {
    it('should return all seeded tasks with pagination meta', async () => {
      const res = await request(app).get('/tasks');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(3);
      expect(res.body.meta.pagination).toEqual({
        page: 1,
        limit: 10,
        totalItems: 3,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      });
    });

    it('should filter by single status', async () => {
      const res = await request(app).get('/tasks?status=completed');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].status).toBe('completed');
    });

    it('should filter by comma-separated multi-status (Step 6 CoT fix)', async () => {
      const res = await request(app).get('/tasks?status=pending,completed');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      const statuses = res.body.data.map((t) => t.status);
      expect(statuses).toContain('pending');
      expect(statuses).toContain('completed');
      expect(statuses).not.toContain('in_progress');
    });

    it('should filter by priority', async () => {
      const res = await request(app).get('/tasks?priority=high');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].priority).toBe('high');
    });

    it('should perform case-insensitive substring search on title and description', async () => {
      const res = await request(app).get('/tasks?search=unit');

      expect(res.status).toBe(200);
      // 'Review Unit 2 Lecture Slides' matches title, 'Assignment A1 Documentation' matches description
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      res.body.data.forEach((task) => {
        const text = `${task.title} ${task.description}`.toLowerCase();
        expect(text).toContain('unit');
      });
    });

    it('should sort by custom priority weights (high > medium > low)', async () => {
      const res = await request(app).get('/tasks?sortBy=priority&order=desc');

      expect(res.status).toBe(200);
      const priorities = res.body.data.map((t) => t.priority);
      // High should come first, then medium, then low
      expect(priorities).toEqual(['high', 'medium', 'low']);
    });

    it('should sort by custom priority ascending (low < medium < high)', async () => {
      const res = await request(app).get('/tasks?sortBy=priority&order=asc');

      expect(res.status).toBe(200);
      const priorities = res.body.data.map((t) => t.priority);
      expect(priorities).toEqual(['low', 'medium', 'high']);
    });

    it('should paginate results correctly with limit and page', async () => {
      const res = await request(app).get('/tasks?page=1&limit=2');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta.pagination.totalItems).toBe(3);
      expect(res.body.meta.pagination.totalPages).toBe(2);
      expect(res.body.meta.pagination.hasNextPage).toBe(true);

      const page2 = await request(app).get('/tasks?page=2&limit=2');
      expect(page2.status).toBe(200);
      expect(page2.body.data.length).toBe(1);
      expect(page2.body.meta.pagination.hasNextPage).toBe(false);
      expect(page2.body.meta.pagination.hasPrevPage).toBe(true);
    });

    it('should reject invalid pagination parameters (400)', async () => {
      const res = await request(app).get('/tasks?page=-1&limit=0');

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /tasks/:id (Single Task Retrieval)', () => {
    it('should return a task by valid id (200)', async () => {
      const res = await request(app).get('/tasks/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
      expect(res.body.error).toBeNull();
    });

    it('should return 404 when task does not exist', async () => {
      const res = await request(app).get('/tasks/999');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.data).toBeNull();
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PATCH /tasks/:id (Task Update)', () => {
    it('should update task status and title successfully (200)', async () => {
      const updates = {
        title: 'Updated Documentation Name',
        status: 'completed'
      };

      const res = await request(app).patch('/tasks/1').send(updates);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(updates.title);
      expect(res.body.data.status).toBe('completed');
      expect(new Date(res.body.data.updatedAt).getTime()).toBeGreaterThan(
        new Date(res.body.data.createdAt).getTime()
      );
    });

    it('should reject update if payload is empty (400)', async () => {
      const res = await request(app).patch('/tasks/1').send({});

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject update with disallowed fields (400)', async () => {
      const res = await request(app).patch('/tasks/1').send({
        unauthorizedField: 'hack'
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when updating non-existent task', async () => {
      const res = await request(app).patch('/tasks/999').send({
        status: 'completed'
      });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /tasks/:id (Task Deletion)', () => {
    it('should delete existing task successfully (200)', async () => {
      const res = await request(app).delete('/tasks/2');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deletedId).toBe(2);

      // Verify task is gone
      const check = await request(app).get('/tasks/2');
      expect(check.status).toBe(404);
    });

    it('should return 404 when deleting non-existent task', async () => {
      const res = await request(app).delete('/tasks/999');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
