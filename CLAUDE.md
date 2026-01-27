# project-box-go-fiber-sveltekit

> Production-ready starter: Go Fiber + SvelteKit

---

## Технологии

| Компонент | Технология | Версия |
|-----------|------------|--------|
| Backend | Go Fiber | v2 |
| ORM | GORM | v1.25 |
| Database | SQLite / PostgreSQL | - |
| Frontend | SvelteKit | v2 |
| UI | Svelte 5 Runes | v5.x |
| Auth | JWT + Refresh Tokens | - |

---

## Структура

```
project-box-go-fiber-sveltekit/
├── backend-go-fiber/          # Go Fiber API
│   ├── cmd/server/            # Entry point
│   ├── internal/
│   │   ├── handlers/          # HTTP handlers
│   │   ├── middleware/        # Auth, CORS, Rate limit
│   │   ├── models/            # GORM models
│   │   ├── services/          # Business logic
│   │   └── utils/             # Helpers
│   ├── go.mod
│   └── Dockerfile
│
├── frontend-sveltekit/        # SvelteKit app
│   ├── src/
│   │   ├── routes/            # Pages
│   │   └── lib/               # Components, stores
│   ├── package.json
│   └── Dockerfile
│
├── data/                      # Persistent data (gitignored)
│   ├── db/sqlite/
│   └── logs/
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Команды

```bash
# Разработка (без Docker)
cd backend-go-fiber && go run cmd/server/main.go
cd frontend-sveltekit && npm run dev

# Docker
docker-compose up --build

# С PostgreSQL
docker-compose --profile postgres up --build
```

---

## API Endpoints

| Method | Endpoint | Auth | Описание |
|--------|----------|------|----------|
| GET | /health | - | Health check |
| GET | /ready | - | Readiness (DB check) |
| POST | /api/auth/register | - | Регистрация |
| POST | /api/auth/login | - | Вход |
| POST | /api/auth/refresh | Cookie | Обновление токена |
| POST | /api/auth/logout | Cookie | Выход |
| GET | /api/auth/me | Bearer | Текущий пользователь |

---

## Environment Variables

| Переменная | Default | Описание |
|------------|---------|----------|
| PORT | 3001 | Порт backend |
| DATABASE_URL | sqlite:./data/db/sqlite/app.db | БД |
| JWT_SECRET | dev-secret... | Секрет JWT (ИЗМЕНИТЬ!) |
| JWT_EXPIRES_IN | 15m | Время жизни access token |
| REFRESH_TOKEN_EXPIRES_DAYS | 7 | Дни жизни refresh token |
| CORS_ORIGINS | http://localhost:3000 | Разрешённые origins |

---

*Версия: 1.0*
*Создано: 2025-01-18*
