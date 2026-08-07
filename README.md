# HR System — Aplikasi Absensi WFH & Monitoring Karyawan

Sistem terdiri dari **2 backend service** (NestJS) + **1 frontend** (React), berkomunikasi via REST API dengan arsitektur microservices.

```
frontend (React + Vite)   →   service-employee (port 3000)
                          →   service-attendance (port 3001)
                                    ↕
                              MySQL + Redis + BullMQ
```

---

## Struktur Project

```
hr-system/
├── service-employee/    # Auth, employee CRUD, user management
├── service-attendance/  # Clock in/out, foto, monitoring absensi
├── frontend/            # React + Tailwind + TanStack Query
├── docker/
│   └── mysql/init.sql   # Inisialisasi database
├── docker-compose.yml
└── README.md
```

---

## Prasyarat

- **Node.js** >= 20
- **MySQL** 8.0
- **Redis** 7
- (Opsional) **Docker** + **Docker Compose** untuk menjalankan seluruh stack

---

## Cara Menjalankan (Lokal / Manual)

### 1. Siapkan MySQL & Redis

Jalankan MySQL dan Redis secara lokal, atau gunakan Docker:

```bash
# MySQL
docker run -d --name hr-mysql -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=secret \
  mysql:8.0

# Redis
docker run -d --name hr-redis -p 6379:6379 redis:7-alpine
```

Buat dua database di MySQL:

```sql
CREATE DATABASE db_employee CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE db_attendance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### 2. service-employee

```bash
cd service-employee

# Install dependencies
npm install

# Salin dan sesuaikan .env
cp .env.example .env
# Edit .env: isi DB_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET, REDIS_PASSWORD

# Jalankan migrasi database
npm run migration:run

# Jalankan dev server
npm run start:dev
```

Swagger tersedia di: **http://localhost:3000/api/docs**

---

### 3. service-attendance

```bash
cd service-attendance

npm install
cp .env.example .env
# Edit .env: pastikan JWT_SECRET SAMA dengan service-employee

npm run migration:run
npm run start:dev
```

Swagger tersedia di: **http://localhost:3001/api/docs**

---

### 4. Frontend

```bash
cd frontend

npm install
cp .env.example .env

npm run dev
```

Buka: **http://localhost:5173**

---

## Cara Menjalankan dengan Docker Compose

```bash
# Clone / masuk ke root project
cd hr-system

# Build & jalankan semua service
docker-compose up --build -d

# Lihat log
docker-compose logs -f

# Jalankan migrasi (setelah container berjalan)
docker exec hr-service-employee node dist/database/migrations/run
# Atau gunakan migration:run via ts-node sebelum build production

# Stop semua
docker-compose down
```

Setelah docker-compose up:
| Service | URL |
|---|---|
| Frontend | http://localhost |
| service-employee API | http://localhost:3000/api/v1 |
| service-attendance API | http://localhost:3001/api/v1 |
| Swagger employee | http://localhost:3000/api/docs |
| Swagger attendance | http://localhost:3001/api/docs |

> **Catatan:** Saat production (docker-compose), jalankan migrasi secara manual sebelum memulai service, atau tambahkan migration run ke CMD di Dockerfile.

---

## Environment Variables

### service-employee `.env`

| Variable | Default | Keterangan |
|---|---|---|
| `APP_PORT` | 3000 | Port HTTP |
| `DB_HOST` | localhost | MySQL host |
| `DB_DATABASE` | db_employee | Nama database |
| `JWT_SECRET` | — | **Wajib diisi**, rahasia JWT |
| `JWT_REFRESH_SECRET` | — | **Wajib diisi**, rahasia refresh token |
| `REDIS_HOST` | localhost | Redis host |

### service-attendance `.env`

| Variable | Default | Keterangan |
|---|---|---|
| `APP_PORT` | 3001 | Port HTTP |
| `DB_DATABASE` | db_attendance | Nama database |
| `JWT_SECRET` | — | **Harus sama** dengan service-employee |
| `UPLOAD_DIR` | uploads/attendance | Direktori upload foto |

---

## API Endpoints Ringkasan

### service-employee (`:3000/api/v1`)

| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| POST | `/auth/login` | Public | Login |
| POST | `/auth/refresh` | Public (cookie) | Refresh access token |
| POST | `/auth/logout` | Auth | Logout |
| GET | `/employees` | ADMIN | List karyawan |
| POST | `/employees` | ADMIN | Tambah karyawan |
| PUT | `/employees/:id` | ADMIN | Update karyawan |
| DELETE | `/employees/:id` | ADMIN | Soft delete |
| POST | `/users` | ADMIN | Buat akun login |
| PATCH | `/users/:id/role` | ADMIN | Update role |
| PATCH | `/users/:id/status` | ADMIN | Aktif/nonaktif |
| GET | `/health` | Public | Health check |

### service-attendance (`:3001/api/v1`)

| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| POST | `/attendance/clock-in` | Auth | Clock in + foto |
| POST | `/attendance/clock-out` | Auth | Clock out + foto |
| GET | `/attendance/me` | Auth | Riwayat saya |
| GET | `/attendance` | ADMIN | Semua absensi |
| GET | `/attendance/:id` | Auth | Detail absensi |
| GET | `/health` | Public | Health check |

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | NestJS 10, TypeScript, TypeORM, MySQL |
| Auth | JWT (access 15m) + Refresh Token (7d, HTTP-only cookie, Redis) |
| Queue | BullMQ + Redis |
| Frontend | React 18, Vite, Tailwind CSS, TanStack Query v5 |
| State | Zustand + persist |
| Forms | React Hook Form + Zod |
| HTTP | Axios (dengan interceptor auto-refresh) |
| Docs | Swagger/OpenAPI |
| Logging | Winston |
| Container | Docker + Docker Compose |

---

## Menjalankan Tests

```bash
# service-employee
cd service-employee
npm test

# service-attendance
cd service-attendance
npm test
```

---

## Akun Default

Tidak ada seeding otomatis. Buat akun pertama langsung via MySQL:

```sql
USE db_employee;

-- 1. Buat data employee
INSERT INTO employees (employee_code, name, position, created_at, updated_at)
VALUES ('EMP-0001', 'Administrator', 'HRD Manager', NOW(), NOW());

-- 2. Buat user ADMIN (password: Admin@123)
-- Hash bcrypt dari 'Admin@123' — generate dengan: node -e "require('bcrypt').hash('Admin@123',10).then(console.log)"
INSERT INTO users (email, password, role, employee_id, is_active, created_at, updated_at)
VALUES ('admin@hrapp.com', '<bcrypt_hash>', 'ADMIN', 1, true, NOW(), NOW());
```

Atau gunakan endpoint `POST /api/v1/users` setelah login sebagai admin pertama.
