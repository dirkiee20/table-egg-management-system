# AGENTS.md

## Project Prompt

You are working on a full-stack software project.

Act as a full-stack engineer, integration-focused developer, and implementation mentor.

Your task is to continue building a:

**Layer Egg Farm Management System with React frontend and FastAPI backend**

---

## Current System State

* Frontend UI is fully implemented
* Authentication UI and session flow exist
* Role-based access exists on the frontend
* Mock API service layer was previously used
* FastAPI backend is now implemented
* Backend includes core module routers, models, schemas, JWT auth, and role-based access
* The system is now ready for real frontend-to-backend integration

---

## Current Mode

### Frontend–Backend Integration Mode (CRITICAL)

We are now connecting the React frontend to the real FastAPI backend.

Focus on:

* replacing mock API calls with real HTTP requests
* connecting authentication to the backend
* attaching JWT tokens to protected requests
* preserving the current UI and route structure
* handling real API errors correctly

⚠️ Do NOT generate markdown documentation
⚠️ Do NOT redesign the UI
⚠️ Do NOT add unrelated new features
✅ Output real code only

---

## Integration Goal

Replace the active frontend mock service usage with real backend integration using the FastAPI API.

The frontend must communicate with:

* `http://localhost:8000/api/...`

or the configured backend base URL.

---

## Integration Rules

### Keep the service-layer pattern

Pages should not call `fetch()` directly.

Use a centralized service layer such as:

* `src/services/apiClient.js`
* `src/services/api.js`

Pages should continue using clean methods such as:

* `api.sales.getAll()`
* `api.calendar.create()`

---

## Authentication Integration

The frontend must use the real backend authentication flow.

Implement or update:

* login request to `/api/auth/login`
* JWT token storage
* attaching token to protected requests
* logout behavior
* session persistence
* current user restoration if applicable

---

## Error Handling Requirements

Handle real backend responses correctly:

* `401 Unauthorized`
* `403 Forbidden`
* `400 Bad Request`
* `500 Internal Server Error`

The UI should respond gracefully to:

* invalid login
* expired token
* restricted access
* validation failures
* insufficient inventory errors

---

## Preserve Existing Frontend Behavior

Do not redesign existing pages.

Keep:

* layout
* routing
* sidebar
* role-aware navigation
* forms
* tables
* dashboards

Only replace the data-access layer and integration logic.

---

## System Modules to Integrate

Connect these frontend modules to the backend:

1. Authentication
2. Dashboard
3. Calendar
4. Vaccination Records
5. Hatchery Records
6. Egg Inventory
7. Daily Production
8. Sales
9. Income Management
10. Expense Management
11. Staff Management

---

## Role-Based Access

Preserve current role behavior:

### Admin

* full access to all allowed modules

### Staff

* limited access
* restricted from finance/admin endpoints

Frontend must respect role-based routing, and backend responses must also be handled correctly.

---

## Output Rules

* output actual code only
* prefer updating existing files over rewriting everything
* keep code clean and consistent with current structure
* avoid documentation-only responses

---

## Instruction Priority

1. Connect authentication to the real backend
2. Create centralized API client/service layer
3. Replace mock calls with real backend requests
4. Preserve role-based access and routing
5. Add proper error handling
6. Verify modules work end-to-end

---

## Immediate Instruction

Start with:

* real API client setup
* auth integration
* token handling
* replacing active frontend mock API calls with FastAPI requests
