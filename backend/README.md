# Backend API - Industry Simulation Career Platform

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start Database
```bash
# From project root
docker-compose up -d
```

### 3. Run Backend
```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:3001`

### Dockerized Dev Backend (Backend + Postgres)
If you want the backend and database to run inside Docker:

```bash
# From project root
docker-compose up -d --build
```

## Redis

Redis is not used in the current codebase and is intentionally removed from dev/prod configs.

## Environment

- Development uses `backend/.env.development` and local Docker Postgres.
- Production uses Azure App Service environment variables (no .env file).
- Postgres-only is enforced. Set `DATABASE_URL` or `PG*` variables.

## Authentication Endpoints

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Get Profile (Protected)
```http
GET /users/profile
Authorization: Bearer <your_jwt_token>
```

## Security Features
- ✅ Bcrypt password hashing
- ✅ JWT authentication
- ✅ Role-based access control (RBAC)
- ✅ Request validation
- ✅ Environment-based configuration
