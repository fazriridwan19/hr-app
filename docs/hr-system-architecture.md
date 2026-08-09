# HR System - Architecture & Code Flow

## Architecture Pattern
This project follows a microservices style across two separate NestJS services, with a React frontend consuming both APIs. Each backend service maintains its own domain boundaries and persistence layer, rather than sharing one monolithic database.

The practical architecture is:

```text
Frontend (React + Vite)
        |
        v
Axios API client
        |
        +--> service-employee (auth, employee, user account management)
        |
        +--> service-attendance (attendance clock-in/out and monitoring)

service-employee --> MySQL (db_employee)

service-attendance --> MySQL (db_attendance)
```

## Layer Structure
Each backend service follows a layered structure similar to Clean Architecture:

```text
Controller
   |
   v
Service / Use case layer
   |
   v
Repository / Data access layer
   |
   v
Database / External service
```

### service-employee
Examples from the codebase:
- `src/modules/auth/...` for login, refresh, logout, reset-password
- `src/modules/employee/...` for employee and user management
- `src/modules/shared/...` for database and queue support
- `src/config/...` for environment configuration

### service-attendance
Examples from the codebase:
- `src/modules/attendance/...` for session attendance logic
- `src/modules/health/...` for health endpoints
- `src/modules/shared/...` for shared infrastructure

## Module Map
### Frontend
- `src/pages/` — route-level pages
- `src/features/` — feature modules, including employee and attendance logic
- `src/components/ui/` — reusable UI primitives
- `src/hooks/` — shared hooks
- `src/store/` — Zustand stores
- `src/api/` — Axios service wrappers

### Employee Service
- `AuthModule` — authentication and token flow
- `EmployeeModule` — employees, users, and role handling
- `HealthModule` — health check endpoint

### Attendance Service
- `AttendanceModule` — clock-in/out, my attendances, attendance listing
- `HealthModule` — health check endpoint

## Authentication Flow
The frontend uses `useAuthStore` to persist auth state in localStorage. The auth token is attached to every request through the Axios interceptor in `frontend/src/api/axios.ts`.

When a request returns `401 Unauthorized`, the interceptor tries to refresh the token using the refresh endpoint and then retries the original request. If refresh fails, the app clears auth and redirects to login.

## Employee Management Flow
1. Admin opens employee management screen.
2. Frontend calls `GET /employees` to load paginated data.
3. Each employee row may include `hasAccount` from the backend, used to decide whether to show detail or create-account action.
4. Admin can create employee, edit employee, delete employee, or create user account.
5. User access updates use dedicated access endpoint: `PUT /users/:id/access`.

## Attendance Flow
1. User opens attendance page.
2. Frontend loads the authenticated user's attendance history via `GET /attendance/me`.
3. User may create a clock-in or clock-out record.
4. Optional photo is uploaded as multipart-form-data.
5. Admin may view all attendance records through `GET /attendance`.

## Data Flow Example
```text
User action in UI
  -> React Query mutation or query
  -> Axios instance
  -> NestJS controller
  -> Service layer
  -> Repository / TypeORM
  -> MySQL or Redis
  -> DTO transformation
  -> response back to frontend
```

## Database Boundaries
The architecture intentionally separates databases by service:

- `db_employee` for employee and auth/user data
- `db_attendance` for attendance data

This gives each service a clear ownership boundary and reduces coupling between employee and attendance domain logic.

## External Integrations
- MySQL for persistence
- Redis for queue/cache support
- Email support for password reset flow via SMTP configuration
- File upload support for attendance photos stored under upload directories

## Key Design Observations
- The project uses DTO-driven request validation at controller boundaries.
- Controllers are thin and delegate logic to services.
- Query keys are user-scoped in the frontend to avoid stale attendance data when switching users.
- Access control is enforced using JWT + roles guard on backend and route-level role checks in frontend patterns.