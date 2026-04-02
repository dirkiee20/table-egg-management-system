# TASKS.md

## Current Phase: Frontend–Backend Integration

### Current Focus

Connect the React frontend to the real FastAPI backend.

⚠️ Output actual code only
⚠️ No markdown documentation
⚠️ Do not redesign the UI
⚠️ Do not add unrelated features

---

# Phase 1: Real API Client Setup

## Task 1: Create API Client

Create a centralized API client/service layer.

Requirements:

* define backend base URL
* support JSON requests
* attach JWT token automatically
* centralize request/response handling
* centralize error handling

Suggested files:

* `src/services/apiClient.js`
* `src/services/api.js`

---

## Task 2: Keep Service Layer Structure

Preserve clean frontend usage such as:

* `api.sales.getAll()`
* `api.sales.create(data)`
* `api.calendar.getAll()`

Do not move raw fetch logic into page components.

---

# Phase 2: Authentication Integration

## Task 3: Connect Login to Backend

Replace mock login with real backend login:

* `POST /api/auth/login`

Requirements:

* send credentials to backend
* receive JWT token
* store token
* store current user/role if returned or derived
* handle invalid credentials

---

## Task 4: Persist Session

* store auth session in localStorage or existing storage
* restore session on app startup
* keep user logged in after refresh

---

## Task 5: Attach Token to Requests

* include JWT token in protected API calls
* use `Authorization: Bearer <token>`

---

## Task 6: Update Logout Flow

* clear token and user session
* redirect to login if needed

---

# Phase 3: Replace Mock API Calls

## Task 7: Connect Dashboard

* replace mock summary data with real backend requests
* load dynamic values
* preserve loading/error states

---

## Task 8: Connect Calendar Page

* replace mock events with backend events
* load data from real API
* preserve calendar grid behavior

---

## Task 9: Connect Vaccination Records Page

* fetch records from backend
* create new vaccination records
* refresh data after create/update/delete

---

## Task 10: Connect Hatchery Records Page

* fetch hatchery data from backend
* support CRUD actions
* refresh UI after mutations

---

## Task 11: Connect Egg Inventory Page

* fetch inventory from backend
* reflect stock changes correctly

---

## Task 12: Connect Daily Production Page

* create production entries using backend
* refresh production/inventory-related data as needed

---

## Task 13: Connect Sales Page

* create sales using backend
* handle validation errors such as insufficient stock
* refresh related data after sale

---

## Task 14: Connect Income Management Page

* fetch income records from backend
* support create/update/delete if allowed

---

## Task 15: Connect Expense Management Page

* fetch expense records from backend
* support create/update/delete if allowed

---

## Task 16: Connect Staff Management Page

* fetch staff records from backend
* support admin-only CRUD actions

---

# Phase 4: Error Handling and Access Control

## Task 17: Handle API Errors

Support graceful UI handling for:

* 400 errors
* 401 errors
* 403 errors
* 500 errors

Examples:

* invalid login
* forbidden finance access
* insufficient inventory
* invalid form submission

---

## Task 18: Handle Unauthorized Sessions

* if token is invalid or expired:

  * clear session
  * redirect to login
  * prevent broken app state

---

## Task 19: Preserve Role-Based Routing

* keep existing protected routes
* keep existing role-based sidebar
* ensure backend authorization errors are also respected

---

# Phase 5: Integration Validation

## Task 20: Validate End-to-End Flow

Verify that:

* login works with real backend
* JWT-protected requests work
* all connected pages load real data
* create/update/delete works where expected
* role restrictions work
* logout works
* session persists after refresh

---

## Task 21: Keep Mock API as Temporary Fallback Only

* do not use mock API for active integrated pages
* retain it only temporarily if needed during transition

---

# Execution Rules

* implement one area at a time
* output actual code only
* preserve existing UI and structure
* do not rewrite unrelated working components
* keep code clean and consistent

---

# Immediate Instruction

Start with:

1. Task 1: Create API Client
2. Task 3: Connect Login to Backend
3. Task 5: Attach Token to Requests
4. Task 7: Connect Dashboard

Then continue page-by-page until all active modules use the real backend.
