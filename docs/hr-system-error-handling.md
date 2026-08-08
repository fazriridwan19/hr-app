# HR System - Error Handling & Logging

## Error Handling Strategy
The NestJS services rely on standard exception-driven error handling. Controllers accept DTOs and then delegate execution to services. Services throw framework exceptions when validation or business rules fail.

Examples of common exceptions used in the codebase:
- `ConflictException` for duplicate email or conflicting state
- `NotFoundException` for missing employee or user
- `UnauthorizedException` for token or credentials issues
- `ForbiddenException` for forbidden password or access updates
- `NotAcceptableException` for invalid business state such as inactive user action

## Error Response Pattern
The API uses NestJS default error replies with HTTP status codes and error payloads. The frontend uses Axios error handlers to interpret status codes and show UI messages.

Common patterns:
- `401` for invalid token/refresh failure
- `403` for access restrictions
- `404` for missing resource
- `409` for duplicate email or conflicting state
- `400` for validation or bad request input

## Logging
The backend modules include a logging module and use NestJS logger patterns. Services define a `private readonly logger = new Logger(...)` and emit logs for important actions like:

- user creation
- user access update
- password update
- attendance clock in/out
- app-level health or resource operations

The project also includes `winston` support in the backend dependencies, indicating structured logging is expected in deployment scenarios.

## Error Categories
### Authentication errors
- invalid credentials
- expired access token
- invalid refresh token
- forbidden password update by another user

### Employee errors
- employee not found
- duplicate user account for same employee
- email already registered

### Attendance errors
- must clock in before clock out
- already clocked in today
- already clocked out today

## Local Error Handling in Frontend
The frontend uses helpers such as `getErrorMessage()` to turn API exceptions into UI-friendly messages. Axios interceptors manage token refresh and redirect to login on repeated authentication failure.

## Monitoring and Health Check
The project includes health modules in both backend services. This allows app-level health endpoints to be used by operational monitoring tools or deployment platforms.

The current service structure includes:
- `HealthModule`
- `HealthController`
- `@nestjs/terminus` dependency

This indicates the project is structured to support health checking and operational observability.

## Known Operational Considerations
- Missing or invalid environment variables can lead to startup failures.
- Redis/MySQL failures may prevent authentication, attendance, or employee-dependent workflows.
- Photo upload issues may surface through file validation errors and should be handled gracefully in UI.
- refresh-token problems can force the browser to log out and redirect to login.