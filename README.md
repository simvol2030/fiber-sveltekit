# Project Box: Go Fiber + SvelteKit

Production-ready starter template with **Go Fiber v2** + **GORM** backend and **SvelteKit** + **Svelte 5** frontend.

## Features

### Core
- **Authentication**: JWT access tokens + refresh tokens (httpOnly cookies)
- **Password Reset**: Forgot password flow with email tokens
- **User Roles**: Basic RBAC with user/admin roles
- **File Upload**: Storage interface (Local + S3/MinIO support)
- **Email Service**: SMTP sender with HTML templates (Mock in dev)
- **Soft Delete**: Built-in for User model (GORM DeletedAt)

### SEO Ready
- **robots.txt**: Dynamic route at `/robots.txt`
- **sitemap.xml**: Dynamic sitemap at `/sitemap.xml`
- **Meta Tags**: `HeadMeta.svelte` component for OG/Twitter cards
- **Schema.org**: `SchemaOrg.svelte` for structured data (JSON-LD)
- **Server-Side Auth**: Protected routes redirect server-side (no flash)

### Performance
- **Gzip Compression**: Backend middleware for all responses
- **SQLite WAL Mode**: ~256MB cache, concurrent reads
- **Connection Pooling**: 100 connections for PostgreSQL
- **Precompress**: SvelteKit builds with gzip/brotli

### Security
- **Helmet**: XSS, CSP, Frame options, Referrer policy
- **CORS**: Configurable allowed origins (no `*` in production)
- **Rate Limiting**: 100 req/min per IP
- **Input Validation**: go-playground/validator
- **CSP**: Relaxed in production for CDN, fonts, analytics

### Infrastructure
- **Database**: SQLite (dev) / PostgreSQL (production)
- **Docker**: Multi-stage builds, non-root users, health checks
- **Testing**: Unit tests for auth service
- **Linting**: ESLint + Prettier (frontend), go vet (backend)
- **Seeder**: Test data with `make seed`

---

## Quick Start

### 1. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Generate a secure JWT secret
make generate-secret
# Copy the output to JWT_SECRET in .env
```

### 2. Start Development

**Option A: Docker (recommended)**
```bash
make docker
# or manually:
docker-compose up --build
```

**Option B: Local Development**
```bash
# Install dependencies
make install

# Terminal 1: Start backend
make dev-backend

# Terminal 2: Start frontend
make dev-frontend
```

### 3. Access the App

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| Health Check | http://localhost:3001/health |

---

## Makefile Commands

```bash
make help              # Show all commands

# Development
make install           # Install all dependencies
make dev-backend       # Start Go backend
make dev-frontend      # Start SvelteKit frontend

# Build
make build             # Build for production
make build-backend     # Build Go binary
make build-frontend    # Build SvelteKit

# Testing
make test              # Run all tests
make test-backend      # Run Go tests
make test-backend-coverage  # Run with coverage report

# Docker
make docker            # Build and start containers
make docker-down       # Stop containers
make docker-logs       # View logs
make docker-postgres   # Start with PostgreSQL

# Database
make seed              # Seed with test data
make db-reset          # Reset SQLite database
make db-fresh          # Reset + seed

# Utilities
make lint              # Lint all code
make format            # Format all code
make clean             # Clean build artifacts
make generate-secret   # Generate JWT secret
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | - | Register new user |
| POST | `/api/auth/login` | - | Login, get tokens |
| POST | `/api/auth/refresh` | Cookie | Refresh access token |
| POST | `/api/auth/logout` | Cookie | Logout, clear tokens |
| GET | `/api/auth/me` | Bearer | Get current user |
| POST | `/api/auth/forgot-password` | - | Request password reset |
| POST | `/api/auth/validate-reset-token` | - | Validate reset token |
| POST | `/api/auth/reset-password` | - | Reset password with token |

### File Upload

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/upload` | Bearer | Upload single file |
| POST | `/api/upload/multiple` | Bearer | Upload multiple files (max 10) |
| DELETE | `/api/upload/*` | Bearer | Delete file by key |
| GET | `/uploads/*` | - | Serve uploaded files (local only) |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Basic health check |
| GET | `/ready` | Readiness (DB check) |

### Request/Response Format

```json
// Success Response
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-18T12:00:00Z",
    "requestId": "uuid"
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [{"field": "email", "message": "..."}]
  },
  "meta": { ... }
}
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | development | Environment mode |
| `PORT` | 3001 | Backend port |
| `DATABASE_URL` | sqlite:./data/... | Database connection |
| `JWT_SECRET` | - | **Required in production** (32+ chars) |
| `JWT_EXPIRES_IN` | 15m | Access token TTL |
| `REFRESH_TOKEN_EXPIRES_DAYS` | 7 | Refresh token TTL |
| `CORS_ORIGINS` | http://localhost:3000 | Allowed origins |
| `LOG_LEVEL` | info | debug/info/warn/error |
| `SMTP_HOST` | - | SMTP server for emails (production) |
| `S3_BUCKET` | - | S3 bucket for file storage |
| `FRONTEND_URL` | http://localhost:3000 | For password reset links |

See `.env.example` for complete list.

---

## Production Deployment

### Pre-deployment Checklist

```bash
make deploy-check  # Show checklist
```

- [ ] `NODE_ENV=production` in `.env`
- [ ] `JWT_SECRET` is 32+ random characters
- [ ] `CORS_ORIGINS` set to production domain(s)
- [ ] `DATABASE_URL` points to production database
- [ ] SSL/TLS configured (nginx)
- [ ] Backups configured

### Deploy with Docker

```bash
# 1. Build production images
docker-compose build

# 2. Start containers
docker-compose up -d

# 3. Check health
curl http://localhost:3001/health
```

### Deploy with Nginx (Reverse Proxy)

1. Copy `deploy/nginx.conf` to `/etc/nginx/sites-available/your-app.conf`
2. Update `server_name` and SSL certificate paths
3. Create symlink: `ln -s /etc/nginx/sites-available/your-app.conf /etc/nginx/sites-enabled/`
4. Test and reload: `nginx -t && systemctl reload nginx`

### SSL with Let's Encrypt

```bash
# Install certbot
apt install certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d your-domain.com

# Auto-renewal (cron)
0 0 * * * /usr/bin/certbot renew --quiet
```

---

## PostgreSQL Setup

### Development (Docker profile)

```bash
# Start with PostgreSQL
docker-compose --profile postgres up -d

# Update .env
DATABASE_URL=postgresql://app:secret@localhost:5432/app
```

### Production

```bash
# 1. Create database
createdb -U postgres app

# 2. Update .env
DATABASE_URL=postgresql://user:password@host:5432/app?sslmode=require

# 3. Run migrations (GORM auto-migrates on startup)
```

---

## Project Structure

```
project-box-go-fiber-sveltekit/
├── backend-go-fiber/
│   ├── cmd/server/main.go      # Entry point
│   ├── internal/
│   │   ├── handlers/           # HTTP handlers
│   │   ├── middleware/         # Auth, CORS, Security
│   │   ├── models/             # GORM models
│   │   ├── services/           # Business logic
│   │   └── utils/              # JWT, validation, helpers
│   ├── go.mod
│   └── Dockerfile
│
├── frontend-sveltekit/
│   ├── src/
│   │   ├── routes/             # Pages
│   │   └── lib/
│   │       ├── api/client.ts   # API client
│   │       └── stores/         # Auth store (Svelte 5 runes)
│   ├── package.json
│   └── Dockerfile
│
├── deploy/
│   └── nginx.conf              # Nginx reverse proxy config
│
├── data/                       # Persistent data (gitignored)
│   ├── db/sqlite/
│   ├── db/postgres/
│   └── logs/
│
├── docker-compose.yml
├── Makefile
├── .env.example
└── README.md
```

---

## Testing

### Backend (Go)

```bash
# Run all tests
make test-backend

# Run with coverage
make test-backend-coverage
# Open backend-go-fiber/coverage.html

# Run specific test
cd backend-go-fiber && go test -v ./internal/services/...
```

### Frontend (TypeScript)

```bash
# Type check
make test-frontend

# Lint
cd frontend-sveltekit && npm run lint

# Format check
cd frontend-sveltekit && npm run format:check
```

---

## Troubleshooting

### Docker: "JWT_SECRET is required"

```bash
# Create .env file
cp .env.example .env
# Edit .env and set JWT_SECRET
```

### Backend: "Failed to connect to database"

```bash
# Ensure data directory exists
mkdir -p data/db/sqlite

# Check permissions
chmod 755 data/db/sqlite
```

### Frontend: Build fails

```bash
# Clear cache and reinstall
rm -rf frontend-sveltekit/node_modules frontend-sveltekit/.svelte-kit
cd frontend-sveltekit && npm install
```

---

## License

MIT

---

*Built with [Box-App](https://github.com/your-repo/box-app) templates v2.0*
