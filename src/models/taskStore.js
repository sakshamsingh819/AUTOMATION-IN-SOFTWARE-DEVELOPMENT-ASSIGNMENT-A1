/**
 * In-memory data store for Task management.
 */
class TaskStore {
  constructor() {
    this.tasks = [];
    this.nextId = 1;
    this.seed();
  }

  seed() {
    this.tasks = [
      {
        id: 1,
        title: 'Complete Assignment A1 Documentation',
        description: 'Document prompt logs, screenshots, and reflection for AI practicum',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2026-10-20T18:30:00.000Z',
        createdAt: '2026-10-15T10:00:00.000Z',
        updatedAt: '2026-10-15T10:00:00.000Z'
      },
      {
        id: 2,
        title: 'Review Unit 2 Lecture Slides',
        description: 'Review zero-shot, few-shot, and chain-of-thought prompting concepts',
        status: 'completed',
        priority: 'medium',
        dueDate: '2026-10-18T12:00:00.000Z',
        createdAt: '2026-10-14T09:00:00.000Z',
        updatedAt: '2026-10-16T14:00:00.000Z'
      },
      {
        id: 3,
        title: 'Set up GitHub Repository and CI',
        description: 'Initialize Git repo with clean commit history and documentation',
        status: 'pending',
        priority: 'low',
        dueDate: '2026-10-22T23:59:59.000Z',
        createdAt: '2026-10-16T11:00:00.000Z',
        updatedAt: '2026-10-16T11:00:00.000Z'
      }
    ];
    this.nextId = 4;
  }

  reset() {
    this.tasks = [];
    this.nextId = 1;
  }

  findAll() {
    return [...this.tasks];
  }

  findById(id) {
    const numId = Number(id);
    return this.tasks.find((t) => t.id === numId) || null;
  }

  create(data) {
    const now = new Date().toISOString();
    const task = {
      id: this.nextId++,
      title: data.title.trim(),
      description: data.description ? data.description.trim() : '',
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      dueDate: data.dueDate || null,
      createdAt: now,
      updatedAt: now
    };
    this.tasks.push(task);
    return task;
  }

  update(id, data) {
    const task = this.findById(id);
    if (!task) return null;

    if (data.title !== undefined) task.title = data.title.trim();
    if (data.description !== undefined) task.description = data.description.trim();
    if (data.status !== undefined) task.status = data.status;
    if (data.priority !== undefined) task.priority = data.priority;
    if (data.dueDate !== undefined) task.dueDate = data.dueDate;
    task.updatedAt = new Date().toISOString();

    return task;
  }

  delete(id) {
    const numId = Number(id);
    const index = this.tasks.findIndex((t) => t.id === numId);
    if (index === -1) return false;
    this.tasks.splice(index, 1);
    return true;
  }
}

const taskStore = new TaskStore();
module.exports = taskStore;
