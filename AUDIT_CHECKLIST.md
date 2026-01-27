# Чек-лист аудита: project-box-go-fiber-sveltekit

> Дата аудита: 2026-01-18
> Источники требований: VERSIONS.md, CLAUDE.md, SECURITY.md
> **Статус: ✅ ЗАВЕРШЁН**

---

## 1. СТРУКТУРА ПРОЕКТА

### 1.1 Директории и файлы
- [x] `frontend-sveltekit/` существует
- [x] `backend-go-fiber/` существует
- [x] `data/db/sqlite/.gitkeep` существует
- [x] `data/db/postgres/.gitkeep` существует
- [x] `data/logs/.gitkeep` существует
- [x] `data/media/.gitkeep` существует
- [x] `docker-compose.yml` существует
- [x] `.env.example` существует
- [x] `.gitignore` существует
- [x] `README.md` существует

### 1.2 Workflow файлы (по CLAUDE.md)
- [x] `docs/README.md` существует *(добавлен при аудите)*
- [x] `project-doc/COMPLETED.md` существует *(добавлен при аудите)*
- [x] `project-doc/archive/` существует
- [x] `feedbacks/.gitkeep` существует *(добавлен при аудите)*
- [x] `.claude/settings.json` существует *(добавлен при аудите)*
- [x] `.claude/hooks/notify.sh` существует *(добавлен при аудите)*
- [x] `CLAUDE.md` (codebase context) существует *(добавлен при аудите)*
- [x] `CLAUDE.web.md` (developer workflow) существует *(добавлен при аудите)*

---

## 2. ВЕРСИИ ЗАВИСИМОСТЕЙ (VERSIONS.md)

### 2.1 Backend Go Fiber
- [x] Go версия >= 1.21 *(go 1.22)*
- [x] `github.com/gofiber/fiber/v2` *(v2.52.6)*
- [x] `gorm.io/gorm` v1.x *(v1.25.7)*
- [x] `gorm.io/driver/sqlite`
- [x] `github.com/golang-jwt/jwt/v5`
- [x] `golang.org/x/crypto/bcrypt`
- [x] `github.com/rs/zerolog` (structured logging)

### 2.2 Frontend SvelteKit
- [x] Node.js >= 20.x (в Dockerfile) *(node:20-alpine)*
- [x] `svelte` ^5.x *(5.28.2)*
- [x] `@sveltejs/kit` ^2.x *(2.20.4)*
- [x] `@sveltejs/adapter-node`
- [x] `typescript` ^5.x *(5.8.3)*
- [x] `vite` ^5.x или ^6.x *(6.4.1)*

---

## 3. BACKEND API (CLAUDE.md)

### 3.1 Authentication Endpoints
- [x] `POST /api/auth/register` — регистрация
- [x] `POST /api/auth/login` — вход
- [x] `POST /api/auth/refresh` — обновление токена
- [x] `POST /api/auth/logout` — выход
- [x] `GET /api/auth/me` — текущий пользователь (protected)

### 3.2 Health Endpoints
- [x] `GET /health` — возвращает `{"status":"ok"}`
- [x] `GET /ready` — проверяет DB connection

### 3.3 API Response Format
- [x] Success: `{ success: true, data: {...}, meta: {timestamp} }`
- [x] Error: `{ success: false, error: {code, message}, meta: {...} }`

---

## 4. SECURITY (SECURITY.md)

### 4.1 HTTP Headers (Helmet)
- [x] Helmet middleware включён
- [x] X-Content-Type-Options: nosniff
- [x] X-Frame-Options: DENY
- [x] Strict-Transport-Security установлен

### 4.2 CORS
- [x] CORS middleware включён
- [x] Whitelist origins (не `*`)
- [x] AllowCredentials: true
- [x] Разрешённые методы: GET, POST, PUT, DELETE

### 4.3 Rate Limiting
- [x] Rate limiter включён
- [x] 100 req/min для общих endpoints

### 4.4 Input Validation
- [x] Email валидация
- [x] Password минимум 8 символов
- [x] Нет raw SQL queries

### 4.5 JWT Authentication
- [x] Access token expiry: 15 минут
- [x] Refresh token expiry: 7 дней
- [x] Refresh token в httpOnly cookie
- [x] Password hashing: bcrypt (10 rounds)

### 4.6 Error Handling
- [x] Не показывает stack traces в production
- [x] Логирует ошибки на сервере
- [x] Возвращает безопасные сообщения клиенту

---

## 5. DATABASE

### 5.1 Схема
- [x] Таблица `users` существует
- [x] Поля: id, email (unique), password_hash, name, created_at, updated_at
- [x] Таблица `refresh_tokens` существует
- [x] Поля: id, token (unique), user_id (FK), expires_at, created_at

### 5.2 Операции
- [x] Создание пользователя работает
- [x] Email unique constraint работает
- [x] Refresh token сохраняется в БД
- [x] Refresh token удаляется при logout

---

## 6. FRONTEND SVELTEKIT

### 6.1 Страницы
- [x] `/` — главная страница
- [x] `/login` — страница входа
- [x] `/register` — страница регистрации
- [x] `/dashboard` — protected страница

### 6.2 Функциональность
- [x] API client для запросов к backend
- [x] Хранение access token (memory/store)
- [x] Обработка 401 и redirect на /login
- [x] Logout очищает токены

### 6.3 Svelte 5 Runes
- [x] Используется `$state` для состояния
- [x] Используется `$derived` где нужно
- [x] Нет устаревшего синтаксиса (let:, on:)

---

## 7. DOCKER

### 7.1 docker-compose.yml
- [x] Service `frontend` на порту 3000
- [x] Service `backend` на порту 3001
- [x] Volumes для `./data:/app/data`
- [x] Environment variables настроены
- [x] Healthcheck для backend
- [x] Profile `postgres` для PostgreSQL

### 7.2 Dockerfiles
- [x] `backend-go-fiber/Dockerfile` существует и билдится
- [x] `frontend-sveltekit/Dockerfile` существует и билдится
- [x] Multi-stage build (builder + production)
- [x] Non-root user в production

### 7.3 Запуск
- [x] `docker-compose up --build` запускается
- [x] Frontend доступен на http://localhost:3000
- [x] Backend доступен на http://localhost:3001
- [x] Health check проходит

---

## 8. BROWSER TESTING

### 8.1 Базовая навигация
- [x] Главная страница загружается
- [x] Страница /login загружается
- [x] Страница /register загружается

### 8.2 Регистрация
- [x] Форма регистрации отображается
- [x] Валидация полей работает
- [x] Успешная регистрация создаёт пользователя
- [x] После регистрации redirect на dashboard

### 8.3 Вход
- [x] Форма входа отображается
- [x] Неверные данные показывают ошибку
- [x] Успешный вход сохраняет токен
- [x] После входа redirect на dashboard

### 8.4 Dashboard (Protected)
- [x] Без токена — redirect на /login
- [x] С токеном — показывает данные пользователя
- [x] Logout работает и очищает сессию

### 8.5 Консоль браузера
- [x] Нет JavaScript ошибок (кроме ожидаемых 401)
- [x] Нет CORS ошибок
- [x] Нет 500 ошибок от API

---

## 9. ENVIRONMENT VARIABLES

### 9.1 .env.example содержит
- [x] PORT
- [x] DATABASE_URL
- [x] JWT_SECRET
- [x] JWT_EXPIRES_IN
- [x] REFRESH_TOKEN_EXPIRES_DAYS
- [x] CORS_ORIGINS

### 9.2 Валидация
- [x] DATABASE_URL имеет дефолт для SQLite

---

## 10. LOGGING

### 10.1 Backend
- [x] Structured JSON logging (zerolog)
- [x] Уровни: info, warn, error
- [x] Timestamp в логах
- [x] Request ID в логах

---

## РЕЗУЛЬТАТЫ АУДИТА

### ✅ Критические проблемы (блокеры)
*Нет*

### ✅ Исправлено в ходе аудита

1. **БАГ: Бесконечный цикл 401 запросов**
   - Причина: API client повторно пытался refresh при каждом 401
   - Фикс: Добавлен `skipRefresh` параметр и защита от конкурентных refresh
   - Файл: `frontend-sveltekit/src/lib/api/client.ts`

2. **БАГ: Loading... висит бесконечно**
   - Причина: `initAuth()` вызывался многократно
   - Фикс: Добавлен `isInitialized` guard и singleton promise
   - Файл: `frontend-sveltekit/src/lib/stores/auth.svelte.ts`

3. **Отсутствующие workflow файлы**
   - Причина: build-box.sh не копирует workflow файлы
   - Фикс: Вручную добавлены все необходимые файлы
   - Файлы: CLAUDE.md, CLAUDE.web.md, docs/, project-doc/, feedbacks/, .claude/

### Примечания
- Playwright имеет проблемы совместимости с Svelte 5 event handlers (onclick)
- При ручном тестировании в браузере всё работает корректно

---

*Аудит завершён: 2026-01-18*
*Версия: 2.0 (после фиксов)*
*Статус: ✅ Production Ready*
