# Layer Egg Farm Management System

A full-stack operational management system tailored for commercial layer egg farming. This robust application unites farm personnel, tracking daily egg counts, flock health, financial ledgers, and sales in an all-in-one cohesive system.

## 🚀 Tech Stack
*   **Frontend:** React (Vite), Lucide Icons, Recharts (Graphics)
*   **Backend:** Python 3, FastAPI, SQLAlchemy, SQLite (DB)
*   **Security:** JWT Token Authentication, Native SHA256 Hashing, Role-Based Access Control (RBAC)

---

## 🛠️ How to Run the Application

The system requires both the backend and frontend to actively run on local ports simultaneously. 

### 1. Start the Backend (FastAPI)
Open a terminal tab and run:

**First-Time Setup (Create Environment)**
```powershell
# Navigate to the backend directory
cd backend

# Create the virtual environment
python -m venv venv

# Activate the virtual environment
.\venv\Scripts\activate

# Install the required packages
pip install -r requirements.txt
```

**Run the Server**
```powershell
# Make sure your virtual environment is still activated
.\venv\Scripts\activate

# Start the server (runs on Port 8000)
uvicorn app.main:app --reload --port 8000
```
*Tip: You can view the live API documentation by visiting `http://127.0.0.1:8000/docs` in your browser!*

### 2. Database Migration (For Existing Users)
If you generated a `farm.db` database in an older version of the software, you **must run** the data migration script before using the application to create all the new table columns and size-based inventory tracking required by the latest patch.
```powershell
# While in the backend folder with the venv active
python app\migrate.py
```

### 3. Start the Frontend (React UI)
Open a **second** terminal tab and run:
```powershell
# Navigate to the frontend directory
cd frontend

# Install Node dependencies (if it's your first time)
npm install

# Start the development server (runs on Port 5173)
npm run dev
```
*Your frontend will be live at `http://localhost:5173`.*

---

## 🔐 Default Credentials

The background automatically seeds these two demo accounts whenever `farm.db` starts up empty:

| Role | Username (Email) | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@farm.com` | `admin123` | Full System Access (Finances, Sales, Staffing) |
| **Staff** | `staff@farm.com` | `staff123` | Operations Only (Egg Production, Vaccinations, Calendar) |

---

## 🏗️ System Modules

*   **Farm Dashboard:** Real-time metrics comparing total flocks against daily production. Algorithmically calculates 7-Day moving averages.
*   **Sales Point-of-Sale (POS):** Generates line item egg orders (`Jumbo`, `Large`, `Medium`) calculating automatic bulk totals and recording invoices.
*   **Egg Inventory Tracking:** Real-time stock counts that mechanically link to `Daily Production` (adding eggs) and `Sales` (deducting eggs).
*   **Income & Expense Ledgers:** Admin-only views tying directly into Farm P&L reports.
*   **Healthcare Scheduling:** Track vaccinations and mortality alongside hatchery statuses.

---

## 💡 Notes on Architecture
This application utilizes a strict **Service Pattern Layer**. Rather than React directly executing `fetch()` commands deep inside `useEffect`, all operations are centrally defined via `apiClient` mapping to endpoints structured directly against FastAPI's Pydantic schemas. 
