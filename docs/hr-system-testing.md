# HR System - Testing Documentation

## Test Framework
The backend services use Jest as their standard testing framework.

Relevant scripts from package.json:

```bash
npm test
npm run test:watch
npm run test:cov
```

## Service Test Status
The visible workspace structure includes Jest configuration files in both backend services:

- `service-employee/jest.config.js`
- `service-attendance/jest.config.js`

This indicates unit and integration test infrastructure is expected to be present for both services.

## Test Structure
The test structure is not fully enumerated in the initial workspace listing, but the backend project configuration suggests a standard NestJS layout with tests colocated near modules or under a dedicated `src/**/*.spec.ts` pattern.

## Test Patterns
The project architecture suggests common NestJS testing patterns:
- service-unit tests for business logic
- controller tests for HTTP contract validation
- repository or database tests for persistence logic
- mocking of dependencies such as repositories, services, and token logic

## Coverage Command
```bash
npm run test:cov
```

This command is available in both backend services and is intended to generate coverage output.

## How to Run Tests
```bash
cd service-employee && npm test
cd service-attendance && npm test
```

## Testing Considerations
- Authentication-related flows should be tested for valid and invalid token scenarios.
- Employee and user account flows should validate duplicate-email and role restrictions.
- Attendance flows should validate clock-in/clock-out state transitions and conflict cases.
- File upload behavior should be tested for valid image types and invalid file sizes.

## Current Gap
No explicit test files or coverage report were visible in the workspace snapshot, so this documentation reflects the configured framework and intended testing patterns rather than an audited current coverage result.
