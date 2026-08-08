# HR System - API Reference

## API Structure

The project exposes two backend API groups:

- `/api/employee` — employee and auth management service
- `/api/attendance` — attendance capture and monitoring service

The frontend uses Axios instances configured in `frontend/src/api/axios.ts` to communicate with both services.

## Authentication API (`service-employee`)

### Login

- Method: `POST`
- Path: `/api/employee/auth/login`
- Description: authenticates user by email and password, returns access token and user metadata

### Refresh Token

- Method: `POST`
- Path: `/api/employee/auth/refresh`
- Description: validates refresh token cookie and issues a new access token

### Logout

- Method: `POST`
- Path: `/api/employee/auth/logout`
- Description: invalidates auth state and clears refresh cookie

### Request Password Reset

- Method: `POST`
- Path: `/api/employee/auth/request-password-reset`
- Description: sends reset email if user exists

### Reset Password

- Method: `POST`
- Path: `/api/employee/auth/reset-password?token=...`
- Description: finalizes password reset flow

## Employee API (`service-employee`)

### Get All Employees

- Method: `GET`
- Path: `/api/employee/employees`
- Access: ADMIN only
- Query params: `page`, `limit`, `search`

### Get Employee By Id

- Method: `GET`
- Path: `/api/employee/employees/:id`
- Access: ADMIN only

### Create Employee

- Method: `POST`
- Path: `/api/employee/employees`
- Access: ADMIN only

### Update Employee

- Method: `PUT`
- Path: `/api/employee/employees/:id`
- Access: ADMIN only

### Delete Employee

- Method: `DELETE`
- Path: `/api/employee/employees/:id`
- Access: ADMIN only

### Get All Users

- Method: `GET`
- Path: `/api/employee/users`
- Access: ADMIN only

### Create User Account

- Method: `POST`
- Path: `/api/employee/users`
- Access: ADMIN only

### Update User Access

- Method: `PUT`
- Path: `/api/employee/users/:id/access`
- Access: ADMIN only
- Body:

```json
{
  "role": "ADMIN",
  "isActive": true
}
```

### Update User Role

- Method: `PATCH`
- Path: `/api/employee/users/:id/role`
- Access: ADMIN only

### Update User Status

- Method: `PATCH`
- Path: `/api/employee/users/:id/status`
- Access: ADMIN only

### Update Password

- Method: `PATCH`
- Path: `/api/employee/users/:id/password`
- Access: ADMIN or same user

## Attendance API (`service-attendance`)

### Clock In

- Method: `POST`
- Path: `/api/attendance/attendance/clock-in`
- Content-Type: `multipart/form-data`
- Fields: `photo` (optional), `notes` (optional)

### Clock Out

- Method: `POST`
- Path: `/api/attendance/attendance/clock-out`
- Content-Type: `multipart/form-data`
- Fields: `photo` (optional), `notes` (optional)

### Get My Attendance

- Method: `GET`
- Path: `/api/attendance/attendance/me`
- Description: returns own attendance history for current user

### Get All Attendance

- Method: `GET`
- Path: `/api/attendance/attendance`
- Access: ADMIN only

### Get Attendance By ID

- Method: `GET`
- Path: `/api/attendance/attendance/:id`
- Description: fetch one attendance record

## Standard Response Shape

The backend returns a standard wrapped response object, typically shaped like this:

```json
{
  "meta": {
    "code": 200,
    "message": "OK"
  },
  "data": {
    "...": "payload"
  }
}
```

For paginated responses, the list is under `data` and metadata is included in `meta` with page information.

## Authentication Model

- Access token is passed in `Authorization: Bearer <token>` header.
- Refresh token uses a cookie called `refresh_token`.
- Role checks are enforced by `JwtAuthGuard` and `RolesGuard` on backend endpoints.

## Error Behavior

Common HTTP error codes in this project include:

- `400` — validation errors / invalid input
- `401` — invalid or expired token
- `403` — forbidden access for role mismatch
- `404` — resource not found
- `409` — conflict, e.g., duplicate email or duplicate attendance status
