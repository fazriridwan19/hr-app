# service-employee

HR System — Employee Service built with NestJS following Clean Architecture principles.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: NestJS 10
- **Database**: MySQL 8 + TypeORM
- **Cache / Session**: Redis (ioredis)
- **Auth**: JWT (access token) + Refresh Token (HTTP-only cookie, stored in Redis)
- **Queue**: BullMQ
- **Documentation**: Swagger / OpenAPI
- **Logger**: Winston + nest-winston
- **Validation**: class-validator + class-transformer
- **Password hashing**: bcrypt

---

## Prerequisites

- Node.js >= 18
- MySQL 8
- Redis 7+
- npm or yarn

---

## Setup

### 1. Clone and install dependencies

```bash
cd service-employee
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` to match your local environment:

```env
# Application
APP_PORT=3000
APP_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=hr_system

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRATION=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 3. Create database

```sql
CREATE DATABASE hr_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run migrations

```bash
npm run migration:run
```

### 5. Start the application

```bash
# Development (hot reload)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

---

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Authentication

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/auth/login` | Login, returns access token + sets refresh token cookie | Public |
| POST | `/auth/refresh` | Refresh access token using HTTP-only cookie | Public |
| POST | `/auth/logout` | Logout and revoke refresh token | JWT |

### Employees

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/employees` | List all employees (pagination + search) | JWT + ADMIN |
| GET | `/employees/:id` | Get employee details | JWT + ADMIN |
| POST | `/employees` | Create new employee | JWT + ADMIN |
| PUT | `/employees/:id` | Update employee | JWT + ADMIN |
| DELETE | `/employees/:id` | Soft delete employee | JWT + ADMIN |

**Query params for GET /employees:**
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 100)
- `search` (string, searches name/code/position)

### Users

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/users` | List all users | JWT + ADMIN |
| POST | `/users` | Create user account | JWT + ADMIN |
| PATCH | `/users/:id/role` | Update user role | JWT + ADMIN |
| PATCH | `/users/:id/status` | Activate/deactivate user | JWT + ADMIN |

### Health

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/health` | Health check | Public |

---

## Auth Flow

```
1. POST /auth/login
   → Returns: { accessToken, tokenType, expiresIn, user }
   → Sets: HTTP-only cookie "refresh_token" (7 days)
   → Redis key: hr:refresh-token:<userId>:<jti>

2. Use accessToken in Authorization header:
   Authorization: Bearer <accessToken>  (expires 15 min)

3. POST /auth/refresh (when access token expires)
   → Reads cookie "refresh_token"
   → Validates against Redis
   → Rotates refresh token (delete old, issue new)
   → Returns new accessToken

4. POST /auth/logout
   → Deletes Redis key for this session jti
   → Clears cookie
```

---

## Project Structure

```
src/
├── modules/
│   ├── auth/
│   │   ├── domain/entities/         # Token, JwtPayload interfaces
│   │   ├── application/
│   │   │   ├── services/auth.service.ts
│   │   │   └── dto/
│   │   ├── infrastructure/
│   │   │   ├── cache/redis-token.service.ts
│   │   │   └── strategies/jwt.strategy.ts
│   │   └── presentation/controllers/
│   ├── employee/
│   │   ├── domain/
│   │   │   ├── entities/employee.entity.ts
│   │   │   └── repositories/employee.repository.interface.ts
│   │   ├── application/
│   │   │   ├── services/employee.service.ts
│   │   │   └── dto/
│   │   ├── infrastructure/persistence/typeorm/
│   │   └── presentation/controllers/
│   ├── user/
│   │   ├── domain/
│   │   │   ├── entities/user.entity.ts
│   │   │   └── repositories/user.repository.interface.ts
│   │   ├── application/
│   │   │   ├── services/user.service.ts
│   │   │   └── dto/
│   │   ├── infrastructure/persistence/typeorm/
│   │   └── presentation/controllers/
│   └── health/
├── common/
│   ├── decorators/        # @Roles, @CurrentUser
│   ├── filters/           # HttpExceptionFilter
│   ├── guards/            # JwtAuthGuard, RolesGuard
│   └── interceptors/      # ResponseInterceptor
├── config/                # app, database, redis, jwt configs
├── database/migrations/
└── main.ts
```

---

## Clean Architecture Layers

| Layer | Responsibility |
|-------|---------------|
| **Domain** | Business entities, repository interfaces (no framework deps) |
| **Application** | Use cases (services), DTOs |
| **Infrastructure** | TypeORM entities/repos, Redis cache, JWT strategy |
| **Presentation** | NestJS controllers |

---

## Migration Commands

```bash
# Generate a new migration (after changing TypeORM entities)
npm run migration:generate -- src/database/migrations/MigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

---

## Testing

```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:cov

# Watch mode
npm run test:watch
```

---

## Response Format

All responses are wrapped in a standard envelope:

```json
{
  "success": true,
  "data": { ... },
  "message": "Request processed successfully",
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Errors:

```json
{
  "success": false,
  "statusCode": 404,
  "error": "NotFoundException",
  "message": "Employee with id 999 not found",
  "path": "/api/v1/employees/999",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Swagger

Available at: `http://localhost:3000/api/docs` (development only)

---

## Logs

Log files are written to the `logs/` directory:
- `logs/combined.log` — all levels
- `logs/error.log` — errors only
