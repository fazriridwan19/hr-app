# HR System - Deployment & CI/CD

## Containerization

The project is designed to run through Docker Compose. The main stack is defined in `docker-compose.yml` and includes:

- MySQL
- Employee service
- Attendance service
- Frontend

## Service Topology

### MySQL

- Container: `hr-mysql`
- Image: `mysql:8.0`
- Port: `3306`
- Shared across employee and attendance services

### service-employee

- Container: `hr-service-employee`
- Port: `3000`
- Exposed through Dockerfile in `service-employee/Dockerfile`

### service-attendance

- Container: `hr-service-attendance`
- Port: `3001`
- Exposed through Dockerfile in `service-attendance/Dockerfile`

### frontend

- Container: `hr-frontend`
- Port: `80`
- Served as production build via nginx

## Environment Configuration

Each service is configured via environment variables inside docker-compose. The default values are designed for local development and should be replaced in production.

Examples:

- database credentials
- JWT secret values
- CORS origins
- upload directories

## Build and Start Commands

```bash
docker-compose up --build
```

This starts the infrastructure and services together. The frontend is served from port 80 while backend APIs are available on 3000 and 3001.

## Database Initialization

MySQL initializes from the mounted SQL script in `docker/mysql/init.sql` (defined in the compose file). This is used to boot the required databases for the employee and attendance services.

## File Upload Persistence

The attendance service mounts upload storage to a named Docker volume:

- `attendance_uploads`

This ensures uploaded attendance photos persist beyond the container lifecycle.

## Logging Persistence

The services mount log folders as Docker volumes:

- `employee_logs`
- `attendance_logs`

This allows logs to remain available after container restarts.

## Deployment Notes

- Secrets should be moved to a secure environment variable manager for production.
- JWT secrets and cookie secrets must be unique across environments.
- Database and Redis ports should be closed or restricted in non-local deployments.
- The frontend CORS origin should match the actual deployed domain.

## CI/CD Observations

The repository currently contains build scripts but no explicit GitHub Actions or CI pipeline files in the visible workspace structure. The expected deployment pattern is local Docker-based deployment plus environment configuration via `.env` or orchestrator-level secrets.
