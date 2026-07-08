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

## GitHub App Repo Linking

Company admins can connect read-only repositories from the assessment context wizard. This uses a GitHub App installation, not a personal access token.

### 1. Create the GitHub App

In GitHub developer settings, create a GitHub App with:

- Homepage URL: your frontend URL, for example `http://localhost:4000`
- Callback URL: backend callback, for example `http://localhost:4001/integrations/github/callback`
- Setup URL: same backend callback, for example `http://localhost:4001/integrations/github/callback`
- Enable `Request user authorization (OAuth) during installation`
- Enable `Redirect on update` so adding or changing repository access returns to Emble
- Webhooks: disabled for this MVP

Repository permissions:

- Contents: Read-only
- Metadata: Read-only

After creating the app, generate a private key and client secret.

### 2. Configure backend env

Add these to `backend/.env.development` locally and to production app settings:

```env
GITHUB_APP_SLUG=your-github-app-slug
GITHUB_APP_ID=123456
GITHUB_APP_CLIENT_ID=Iv1.yourclientid
GITHUB_APP_CLIENT_SECRET=your-client-secret
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_APP_STATE_SECRET=use-a-long-random-secret
FRONTEND_URL=http://localhost:4000
```

`GITHUB_APP_PRIVATE_KEY` may be stored as a single line with escaped `\n`; the backend converts it before signing the app JWT. If you paste the key as multiple lines, keep the `BEGIN` and `END` markers on their own lines.

### 3. Local flow

1. Start backend on `http://localhost:4001`.
2. Start frontend on `http://localhost:4000`.
3. Log in as a company admin.
4. Open `/industry/assessments/new`.
5. Go to repository context and click `Install on GitHub`.
6. Select repositories during installation.
7. GitHub redirects back to `/integrations/github/callback`; Emble verifies the OAuth install user, stores the installation, syncs accessible repos, and returns to the assessment wizard.

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
