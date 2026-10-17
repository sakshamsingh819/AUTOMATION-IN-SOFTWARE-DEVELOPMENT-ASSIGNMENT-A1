# Automation in Software Development — Unit 2 (Assignment A1)

**Student Name:** Saksham Singh  
**Roll Number:** 24BTRAO035  
**Course & Semester:** Automation in Software Development • V Semester • Unit 2  
**Chosen Task:** Option C — Task Management REST API with Filtering, Sorting & Pagination  
**Tool Evaluated:** Google Gemini AI Assistant (Free Tier)  
**Repository Link:** [https://github.com/sakshamsingh819/AUTOMATION-IN-SOFTWARE-DEVELOPMENT-ASSIGNMENT-A1.git](https://github.com/sakshamsingh819/AUTOMATION-IN-SOFTWARE-DEVELOPMENT-ASSIGNMENT-A1.git)

---

## 1. Executive Summary & Prompting Techniques Applied

This project demonstrates the practical application of three core prompt engineering techniques (Zero-shot, Few-shot, and Chain-of-thought) to design, build, test, and debug an Express.js REST API from scratch:

1. **Zero-Shot Prompting:** Used for unambiguous structural and boilerplate generation — creating the initial Express server and CRUD route scaffolding (Step 1), and defining field-level request validation middleware for task creation (Step 4).
2. **Few-Shot Prompting:** Used where strict structural output consistency and schema adherence were critical — standardizing a unified `{ success, data, error, meta }` response envelope and custom `AppError` classes with 3 concrete input/output examples (Step 2), and generating the Jest/Supertest integration test harness with 2 exemplar assertion shapes (Step 5).
3. **Chain-of-Thought (CoT) Prompting:** Used for non-trivial multi-step algorithmic reasoning and debugging — orchestrating a 5-stage query processing pipeline with numerical priority weighting (`high` > `medium` > `low`) to avoid alphabetical sorting pitfalls (Step 3), and diagnosing query parsing bugs where comma-separated query parameters returned empty datasets (Step 6).

Full prompt logs, responses, screenshots, and comparative evaluation against GitHub Copilot are available in [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md).

---

## 2. Project Architecture

```
.
├── docs/
│   ├── DOCUMENTATION.md                               # Complete prompt logs, evaluations & reflection
│   ├── AIDD_Assignment_A1_Documentation_Saksham_Singh.pdf
│   ├── AIDD_Assignment_A1_Documentation_Saksham_Singh.docx
│   └── screenshots/
│       ├── Screenshot From 2026-08-30 08-54-31.png    # Step 1: Zero-shot scaffolding
│       ├── Screenshot From 2026-08-30 08-55-04.png    # Step 2: Few-shot response envelope
│       └── Screenshot From 2026-08-30 08-55-57.png    # Step 3: Chain-of-thought query pipeline
├── src/
│   ├── app.js                                         # Express application setup & middleware assembly
│   ├── server.js                                      # HTTP server listener
│   ├── controllers/
│   │   └── taskController.js                          # Route controllers & 5-phase query processing
│   ├── middleware/
│   │   ├── errorHandler.js                            # Centralized 404 & AppError envelope handler
│   │   └── validation.js                              # Schema validation for POST/PATCH & query params
│   ├── models/
│   │   └── taskStore.js                               # In-memory Task model with seed data & CRUD methods
│   └── utils/
│       ├── errors.js                                  # Custom AppError, NotFoundError, ValidationError
│       └── responseHandler.js                         # Standardized { success, data, error, meta } helpers
├── tests/
│   └── tasks.test.js                                  # 26 automated unit & integration tests (Supertest + Jest)
├── package.json
└── README.md
```

---

## 3. Installation & Quick Start

### Prerequisites
- **Node.js**: v18.x or later (developed and tested on v22)
- **npm**: v9.x or later

### Setup
```bash
# Clone the repository
git clone https://github.com/sakshamsingh819/AUTOMATION-IN-SOFTWARE-DEVELOPMENT-ASSIGNMENT-A1.git
cd AUTOMATION-IN-SOFTWARE-DEVELOPMENT-ASSIGNMENT-A1

# Install dependencies
npm install

# Start the server (runs on port 3000 by default)
npm start
```

### Running Automated Tests
```bash
# Execute Jest + Supertest integration test suite
npm test
```
All 26 test cases cover route handling, request validation, query filtering, priority sorting, pagination slicing, and error envelopes.

---

## 4. API Endpoints Specification

All endpoints enforce a standardized JSON response envelope:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "2026-10-17T14:15:00.000Z"
  }
}
```

### Summary of Endpoints

| Method | Endpoint | Description | Query / Body Parameters |
|---|---|---|---|
| `GET` | `/` | API Information | None |
| `GET` | `/health` | Health Check & Uptime | None |
| `GET` | `/tasks` | Filtered, sorted, paginated task list | `status`, `priority`, `search`, `sortBy`, `order`, `page`, `limit` |
| `POST` | `/tasks` | Create a new task | `{ title, description?, status?, priority?, dueDate? }` |
| `GET` | `/tasks/:id` | Retrieve single task by ID | `id` in path |
| `PATCH` | `/tasks/:id` | Update task fields | Allowed: `title`, `description`, `status`, `priority`, `dueDate` |
| `DELETE` | `/tasks/:id` | Delete a task | `id` in path |

### Query Capabilities for `GET /tasks`
- **Multi-Status Filter:** Comma-separated status query: `GET /tasks?status=pending,completed`
- **Priority Filter:** Filter by priority level: `GET /tasks?priority=high`
- **Full-Text Search:** Substring match across title and description: `GET /tasks?search=documentation`
- **Weighted Priority Sorting:** Custom numeric weighting (`high: 3, medium: 2, low: 1`): `GET /tasks?sortBy=priority&order=desc`
- **Pagination:** 1-based page index with total metadata: `GET /tasks?page=1&limit=2`

---

## 5. Course & Submission Details
- **Course:** Automation in Software Development (AIDD) • Unit 2
- **Instructor GitHub:** [https://github.com/shivaprasad-munukuntla](https://github.com/shivaprasad-munukuntla)
- **Student GitHub:** [https://github.com/sakshamsingh819](https://github.com/sakshamsingh819)
