# Документация: Go Fiber + SvelteKit

## Содержание

1. [Быстрый старт](#быстрый-старт)
2. [Архитектура](#архитектура)
3. [API Reference](#api-reference)
4. [Безопасность](#безопасность)
5. [Deployment](#deployment)

---

## Быстрый старт

```bash
# Clone и настройка
cp .env.example .env
# Изменить JWT_SECRET в .env!

# Запуск с Docker
docker-compose up --build

# Или без Docker
# Terminal 1
cd backend-go-fiber && go run cmd/server/main.go

# Terminal 2
cd frontend-sveltekit && npm install && npm run dev
```

**Доступ:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

---

## Архитектура

```
┌─────────────────┐     ┌─────────────────┐
│    SvelteKit    │────▶│   Go Fiber API  │
│   :3000         │     │   :3001         │
└─────────────────┘     └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │    SQLite/PG    │
                        └─────────────────┘
```

---

## API Reference

Смотри [CLAUDE.md](../CLAUDE.md) для полного списка endpoints.

---

## Безопасность

- JWT access tokens (15 min)
- Refresh tokens в httpOnly cookies (7 days)
- Helmet security headers
- CORS whitelist
- Rate limiting (100 req/min)
- bcrypt password hashing

---

## Deployment

### Production checklist

- [ ] Изменить JWT_SECRET (минимум 32 символа)
- [ ] Настроить CORS_ORIGINS
- [ ] Включить HTTPS
- [ ] Настроить логирование
- [ ] Использовать PostgreSQL

```bash
# Production build
docker-compose up --build

# С PostgreSQL
docker-compose --profile postgres up --build
```
