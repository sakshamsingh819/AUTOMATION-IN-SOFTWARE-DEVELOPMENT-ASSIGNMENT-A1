const express = require('express');
const taskRoutes = require('./routes/taskRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { sendSuccess } = require('./utils/responseHandler');

const app = express();

// Body parser
app.use(express.json());

// Base health / root endpoint
app.get('/', (req, res) => {
  return sendSuccess(res, 200, {
    name: 'Task Management REST API',
    version: '1.0.0',
    endpoints: {
      tasks: '/tasks',
      health: '/health'
    }
  });
});

app.get('/health', (req, res) => {
  return sendSuccess(res, 200, { status: 'OK', uptime: process.uptime() });
});

// Tasks resource routes
app.use('/tasks', taskRoutes);

// Catch-all 404 handler for undefined routes
app.use(notFoundHandler);

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
