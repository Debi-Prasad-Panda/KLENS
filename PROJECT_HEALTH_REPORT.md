# K-LENS Project Health Report

**Date:** 2025-12-07
**Status:** Critical Issues Found

## 🚨 Executive Summary
The project contains significant discrepancies between documentation, configuration, and implementation. The most critical issue is the existence of two conflicting backends (Node.js vs. Python) and configuration files that could inadvertently deploy the wrong one. Additionally, the Python backend (which appears to be the target architecture) has architectural flaws regarding database session management in asynchronous contexts and missing features. The Frontend Dashboard is currently a visual mockup with no real data connection.

---

## 1. 🏗️ Configuration & Deployment Architecture
**Severity: CRITICAL**

There is a major "split brain" situation regarding how the project is built and run.

*   **Conflicting Docker Composes**:
    *   `docker-compose.yml`: Points to a legacy `backend` (Node.js) running on port **3000**.
    *   `docker-compose.python.yml`: Points to `backend-python` running on port **8000**.
*   **The Trap**: A developer running standard `docker-compose up` will spin up the **wrong backend** (Node.js). The frontend is configured to look for the API at `localhost:8000` (in `src/lib/api.ts` fallback), but the default docker-compose starts it on 3000.
*   **Startup Scripts**: `start.bat` correctly uses the python yaml, but this relies on users ignoring standard docker commands.

**Recommendation**:
*   Rename `docker-compose.yml` to `docker-compose.node.legacy.yml` (or delete it if obsolete).
*   Rename `docker-compose.python.yml` to `docker-compose.yml` to make it the source of truth.

---

## 2. 🐍 Backend Architecture (Python)
**Severity: HIGH**

The Python backend (`backend-python`) has implementation patterns that will cause failures under load or race conditions.

### A. Async/Sync Blocking
*   **Code**: `app/api/documents.py` uses `async def upload_document`.
*   **Issue**: It calls blocking synchronous database operations (SQLAlchemy ORM without async driver/await).
*   **Impact**: This blocks the main event loop. A single heavy database query will freeze the *entire API* for all users until it completes.

### B. Background Task Session Management
*   **Code**: `upload_document` passes the request-scoped `db` session to `process_document` (a background task).
*   **Issue**: The `db` session is created via dependency injection (`Depends(get_db)`). FastAPI closes this session once the HTTP response is sent. The background task continues running *after* the response.
*   **Impact**: Race condition. The background task may crash with "Session is closed" errors, or behavior will be unpredictable. Background tasks must create their own new database session scope.

### C. Missing Features
*   **Neo4j**: `process_document` contains `# TODO: Save to Neo4j`. The key feature of the "Knowledge Graph" is currently not persisting automatic extractions to the graph database.

---

## 3. 🎨 Frontend Implementation
**Severity: MEDIUM**

*   **Dashboard Mockup**: `src/components/klens/DashboardView.tsx` consists entirely of hardcoded static data (`areaData`, `pieData`, `tasks`).
*   **Illusion of Functionality**: The dashboard looks complete but reflects no real system state. It does not fetch analytics from the backend.

---

## 4. 📚 Documentation Discrepancies
**Severity: MEDIUM**

*   **PROJECT-STRUCTURE.md**: Defines a Node.js backend structure (`server.ts`, `controllers`) which directly conflicts with `backend-python`.
*   **README.md**: Correctly identifies the Python backend but conflicts with the file structure described in `PROJECT-STRUCTURE.md`.

---

## ✅ Action Plan Recommendations

1.  **Fix Docker**: Make the Python backend the default `docker-compose.yml`.
2.  **Refactor Backend DB**: 
    *   Ensure `process_document` opens its own `SessionLocal()`.
    *   Verify SQLAlchemy setup supports the intended concurrency model (or switch to `AsyncSession`).
3.  **Implement Graph Storage**: Complete the TODO in `documents.py` to actually write to Neo4j.
4.  **Connect Frontend**: Write a hook to fetch dashboard stats from the API and replace the hardcoded usage in `DashboardView`.
5.  **Clean Documentation**: Delete or update `PROJECT-STRUCTURE.md` to match reality.
