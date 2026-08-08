# HR System - Security Implementation

## Authentication Strategy
The system uses JWT-based authentication in the backend services. Tokens are issued by `service-employee` and validated via `JwtAuthGuard` and `CurrentUser` decorators.

### Access token
- Used in the `Authorization` header as `Bearer <token>`
- Stored in the frontend auth store

### Refresh token
- Stored in an httpOnly cookie named `refresh_token`
- Set with `secure` flag in production and `sameSite: strict`
- Used for token refresh from `/auth/refresh`

## Authorization Model
Backend endpoints are protected by `@UseGuards(JwtAuthGuard, RolesGuard)` and role decorators such as `@Roles(UserRole.ADMIN)`.

The system distinguishes between:
- `ADMIN` role for employee management, access control, and attendance monitoring
- `USER` role for personal attendance and self-service flows

## Password Handling
Password hashing is performed using `bcrypt` in the employee service. The `UserService` uses a salt round value of `12` before storing passwords.

This means the system avoids plaintext password storage and uses a one-way hash before persistence.

## Input Validation
DTOs are validated using `class-validator` and `class-transformer`.

Examples of validation boundaries include:
- login request payload
- employee create/update data
- attendance request payloads
- user account and reset-password payloads

This is applied at the NestJS controller boundary and prevents malformed payloads from reaching business logic.

## File Upload Security
In the attendance service:
- only `image/jpeg`, `image/jpg`, and `image/png` are accepted
- file size limit is set to 5MB
- upload storage uses memory storage and the request is intercepted via a file filter

This prevents arbitrary file upload formats and mitigates abuse.

## Secret Management
Sensitive variables are expected to be stored in `.env` files or container environment variables and not hardcoded into source code. The project includes `.env.example` files as documentation templates.

Important examples:
- JWT secret
- refresh secret
- cookie secret
- database credentials
- Redis password
- SMTP credentials

## CORS and Web Access
The docker-compose and environment configuration intentionally expose the frontend origin via `CORS_ORIGIN` and allow communication from `http://localhost:5173` in the default setup.

## Security Notes and Considerations
- Refresh tokens are cookie-based and should be protected as sensitive credentials.
- Admin-only endpoints are explicitly restricted with role guards.
- Attendance photo uploads are restricted by MIME types and size.
- Frontend clears auth state and redirects to login if refresh token flow fails.
- The project relies on configured service boundaries; database credentials and tokens must remain out of repository files.
