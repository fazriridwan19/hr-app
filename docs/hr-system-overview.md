# HR System - Overview

## Project Description
HR System is a full-stack employee management and attendance application built for internal human-resource operations. The system is composed of three main parts:

- Frontend: React + Vite + TypeScript single-page app
- Employee service: NestJS backend for employee and authentication management
- Attendance service: NestJS backend for attendance recording and reporting

The application supports employee CRUD, user account creation, role and account access updates, attendance clock-in/clock-out flows, and administrative monitoring of attendance records.

## Tech Stack
- Language: TypeScript
- Frontend framework: React 18 + Vite
- Frontend state/data layer: TanStack React Query, Zustand, React Router
- Backend framework: NestJS (Node.js)
- Database: MySQL
- Authentication: JWT access tokens + refresh token cookie
- Validation: class-validator / class-transformer
- Deployment: Docker + docker-compose

## Dependencies Utama
| Library | Version | Purpose |
|---------|---------|---------|
| react | 18.2.0 | Frontend UI |
| @tanstack/react-query | 5.28.0 | Server-state caching and synchronization |
| @tanstack/react-router | 1.32.0 | App routing |
| axios | 1.6.8 | HTTP client |
| zustand | ^4.5.2 | Client auth state |
| @nestjs/common | 10.3.0 | NestJS core |
| @nestjs/typeorm | 10.0.1 | ORM integration |
| mysql2 | 3.9.2 | MySQL driver |
| passport-jwt | 4.0.1 | JWT authentication |
| class-validator | 0.14.1 | DTO validation |
| multer | 1.4.5-lts.1 | File upload handling |

## Project Structure
```text
hr-system/
├── docker-compose.yml
├── docs/
├── docker/
│   └── mysql/
│       └── init.sql
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── service-employee/
│   ├── src/
│   ├── package.json
│   ├── jest.config.js
│   └── Dockerfile
└── service-attendance/
    ├── src/
    ├── package.json
    ├── jest.config.js
    └── Dockerfile

```

## Main Functional Areas
### Frontend
- Employee management page
- Attendance page for user self-service
- Admin attendance monitoring page
- Login, reset password, and forgot password flows

### Employee Service
- Auth and token lifecycle
- Employee CRUD and soft-delete logic
- User account creation and access management
- Role management for ADMIN / USER
- Password reset support

### Attendance Service
- Clock-in and clock-out actions
- Photo upload support for attendance proof
- Attendance history retrieval for users and admin
- Attendance monitoring by admin

## How to Run
### Development
```bash
# from project root
cd frontend && npm install && npm run dev
cd service-employee && npm install && npm run start:dev
cd service-attendance && npm install && npm run start:dev
```

### Docker
```bash
docker-compose up --build
```

### Build
```bash
cd frontend && npm run build
cd service-employee && npm run build
cd service-attendance && npm run build
```

### Tests
```bash
cd service-employee && npm test
cd service-attendance && npm test
```

## Environment Variables
The project relies on `.env.example` files under each backend service and the docker-compose environment block. The main keys are:

### service-employee
- `APP_PORT`
- `APP_ENV`
- `APP_NAME`
- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USERNAME`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
- `JWT_SECRET`, `JWT_ACCESS_EXPIRATION`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRATION`, `JWT_PASSWORD_RESET_SECRET`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`, `REDIS_KEY_PREFIX`
- `BULLMQ_REDIS_HOST`, `BULLMQ_REDIS_PORT`, `BULLMQ_REDIS_PASSWORD`
- `CORS_ORIGIN`
- `COOKIE_SECRET`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`

### service-attendance
- `APP_PORT`
- `APP_ENV`
- `APP_NAME`
- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USERNAME`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
- `JWT_SECRET`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`, `REDIS_KEY_PREFIX`
- `BULLMQ_REDIS_HOST`, `BULLMQ_REDIS_PORT`, `BULLMQ_REDIS_PASSWORD`
- `CORS_ORIGIN`
- `UPLOAD_DIR`
- `MAX_FILE_SIZE`

## Runtime Notes
- The frontend stores auth state in `localStorage` using Zustand persist middleware.
- The employee and attendance services are independent NestJS apps, each with their own database and Redis configuration.
- The docker-compose setup defines MySQL and Redis as shared infrastructure services for both backend apps.