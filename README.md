# HR System

HR System is an internal employee management and attendance platform composed of a React frontend, a NestJS employee service, and a NestJS attendance service.

## Project summary
- Frontend: React + Vite + TypeScript
- Employee service: NestJS for authentication, employee management, user accounts, roles, and access control
- Attendance service: NestJS for clock-in / clock-out, photo uploads, and attendance monitoring
- Database: MySQL
- Cache / queue: Redis + BullMQ
- Deployment: Docker Compose

## Full documentation
The complete technical documentation for this project is available in the [docs](docs) folder, including:

- [docs/hr-system-overview.md](docs/hr-system-overview.md)
- [docs/hr-system-architecture.md](docs/hr-system-architecture.md)
- [docs/hr-system-api-reference.md](docs/hr-system-api-reference.md)
- [docs/hr-system-security.md](docs/hr-system-security.md)
- [docs/hr-system-error-handling.md](docs/hr-system-error-handling.md)
- [docs/hr-system-business-logic.md](docs/hr-system-business-logic.md)
- [docs/hr-system-deployment.md](docs/hr-system-deployment.md)
- [docs/hr-system-testing.md](docs/hr-system-testing.md)

## Project structure
```text
hr-system/
├── frontend/
├── service-employee/
├── service-attendance/
├── docs/
├── docker-compose.yml
├── README.md
└── .git/
```

## Prerequisites
Before running the project, make sure your machine has:

- Node.js 18+
- npm
- Docker Desktop / Docker Engine (optional for Docker Compose mode)
- MySQL and Redis (if running manually without Docker)

## Running the project locally

### Option 1: Run with Docker Compose (recommended)
This is the fastest way to run the full stack together.

1. Open a terminal in the project root.
2. Make sure the environment files are available.

   For the employee service:
   ```bash
   cp service-employee/.env.example service-employee/.env
   ```

   For the attendance service:
   ```bash
   cp service-attendance/.env.example service-attendance/.env
   ```

   If the `.env` files are not created yet, Docker Compose can still run with environment variables already defined in `docker-compose.yml`, but backend apps normally still need local `.env` files for normal development and debugging.

3. Start all services:
   ```bash
   docker compose up --build
   ```

4. Wait until all containers are ready.

5. Access the application:
   - Frontend: http://localhost
   - Employee Service Swagger: http://localhost:3000/api/docs
   - Attendance Service Swagger: http://localhost:3001/api/docs

6. To stop the services:
   ```bash
   docker compose down
   ```

7. To remove all volumes and reset data:
   ```bash
   docker compose down -v
   ```

Notes:
- The frontend is usually exposed on port 80 in Docker Compose.
- The backend services run on ports 3000 and 3001.
- For local development mode, the frontend is typically run with Vite on port 5173.

### Option 2: Run manually without Docker
This is useful when you want to debug the application directly in your local environment.

#### 1) Prepare MySQL and Redis
Use Docker only for the infrastructure dependencies:

```bash
docker compose up mysql redis -d
```

If you already have MySQL and Redis running locally, you can skip this step.

#### 2) Set up the employee service
```bash
cd service-employee
cp .env.example .env
npm install
npm run start:dev
```

Once the server is ready, the employee service will run at:
- http://localhost:3000
- Swagger: http://localhost:3000/api/docs

#### 3) Set up the attendance service
```bash
cd ../service-attendance
cp .env.example .env
npm install
npm run start:dev
```

Once the server is ready, the attendance service will run at:
- http://localhost:3001
- Swagger: http://localhost:3001/api/docs

#### 4) Set up the frontend
```bash
cd ../frontend
npm install
npm run dev
```

Once the frontend is ready, open:
- http://localhost:5173

## Swagger URLs
This project exposes Swagger UI for each backend service:

- Employee Service: http://localhost:3000/api/docs
- Attendance Service: http://localhost:3001/api/docs

If you run the frontend through Docker Compose, access the app via http://localhost, but the Swagger UI will still be available on each backend service port.

## Common environment setup
These are the default environment setups used by the project:

### Employee Service
- Database: MySQL (`db_employee`)
- Port: 3000
- JWT: enabled
- Redis: enabled
- Refresh token cookie: enabled

### Attendance Service
- Database: MySQL (`db_attendance`)
- Port: 3001
- JWT: enabled
- Redis: enabled
- Upload directory: `uploads/attendance`

## Troubleshooting

### Port already in use
Check whether ports 3000, 3001, 5173, or 80 are already occupied by other services, then change the config or stop the conflicting process.

### MySQL / Redis not ready
Make sure the database and Redis are running before starting the backend services:
```bash
docker compose up mysql redis -d
```

### Login fails / token expired
Ensure the `JWT_SECRET` and cookie secret values are consistent across the relevant services, and that the request is still using a valid access token.

### Swagger is not visible
Make sure `APP_ENV` is not set to `production`, because Swagger is enabled only in non-production environments.

## Developer notes
- The frontend communicates with the backend through the configured API base URLs and Axios interceptors.
- More detailed technical documentation is available in [docs](docs).
- For module-level implementation details, read the relevant markdown files in the docs folder.

## Quick start
If you want to try it as quickly as possible:

```bash
docker compose up --build
```

Then open:
- Frontend: http://localhost
- Employee Swagger: http://localhost:3000/api/docs
- Attendance Swagger: http://localhost:3001/api/docs
