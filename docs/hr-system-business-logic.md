# HR System - Business Logic & Domain Rules

## Core Business Rules
The project manages two primary domains:

1. Employee lifecycle and user access management
2. Attendance recording and status verification

### Employee rules
- Each employee can be created and later soft-deleted.
- One employee may have at most one user account.
- A user account is associated with a role (`ADMIN` or `USER`).
- User account can be active or inactive through `isActive` status.
- Admin can update user access in one operation via combined `role + isActive` update.

### Attendance rules
- An employee may clock in once per day.
- An employee may clock out only after clocking in.
- A completed attendance cycle consists of both clock-in and clock-out entries for the same day.
- Optional photo and notes are accepted for attendance proof.

## Use Cases
### Employee management
- create employee record
- update employee details
- soft delete employee
- assign user account to employee
- update employee role and account activity status

### Authentication
- login using email/password
- token refresh via refresh cookie
- logout
- password reset flow via requested token

### Attendance management
- clock in for current day
- clock out for same day
- review personal attendance history
- review all attendance records as admin

## Account Lifecycle Rules
The employee service uses a clear separation between an employee entity and a user account entity.

This means an employee may exist without having an account, and a user account must be connected to an employee record if present. The `hasAccount` boolean is used to indicate whether a user account exists for a specific employee and is surfaced through the employee listing API.

## Role Rules
Role logic is enforced in the backend through guards:
- `ADMIN` — administrative access to employee and attendance monitoring
- `USER` — personal attendance flows and non-admin operations

Administrative actions are restricted to admin-only endpoints, while user-specific actions like password updates are allowed only for the current user or admin.

## Validation Rules
Examples of rule checks in source:
- duplicate email is blocked during user registration
- inactive users may not perform password update actions
- clock-in conflicts are blocked when the user already clocked in today
- clock-out conflicts are blocked when the user has not clocked in yet or already clocked out

## State Management Patterns
The frontend uses React Query for remote data synchronization and state invalidation after mutations. This ensures the UI refreshes after actions such as:
- clock in / out
- create employee
- update user access
- create user account

The auth store persists login state in localStorage and is used to inject the bearer token into each request.

## Operational Domain Notes
- Attendance and employee domains are separated into different services and databases.
- Role and account activity updates are intentionally treated as access-control concerns.
- The UI uses a single save action to submit both role and status so that access updates are consistent and less error-prone.
