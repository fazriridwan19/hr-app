# service-attendance

NestJS microservice untuk fitur absensi WFH — clock in, clock out, upload foto, dan monitoring.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env — pastikan JWT_SECRET SAMA dengan service-employee

npm run migration:run
npm run start:dev
```

**Swagger:** http://localhost:3001/api/docs

## Endpoint Utama

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | `/api/v1/attendance/clock-in` | Auth | Clock in + foto (multipart/form-data) |
| POST | `/api/v1/attendance/clock-out` | Auth | Clock out + foto |
| GET | `/api/v1/attendance/me` | Auth | Riwayat absensi saya |
| GET | `/api/v1/attendance` | ADMIN | Semua absensi (filter: date, employeeId, status) |
| GET | `/api/v1/attendance/:id` | Auth | Detail absensi |
| GET | `/api/v1/health` | Public | Health check |

## Event-Driven (BullMQ)

Clock in/out menggunakan pola async:
1. Insert record dengan status `PENDING`
2. Push job ke queue `attendance-events`
3. Consumer di background update status ke `COMPLETED` atau `FAILED`
4. Status absensi hari ini di-cache di Redis

## Environment Variables

Lihat `.env.example` untuk daftar lengkap. Yang wajib sama dengan `service-employee`:
- `JWT_SECRET` — **harus identik** agar token dari service-employee bisa diverifikasi
