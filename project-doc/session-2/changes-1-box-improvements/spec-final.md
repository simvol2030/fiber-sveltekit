# Session-2: Box Improvements — Production-Ready Boilerplate

**Версия:** spec-final
**Дата:** 2025-01-30
**Приоритет:** HIGH
**Оценка:** 7 задач, одна сессия

---

## ВАЖНО: Перед началом работы

1. **Обнови репозиторий до последней версии:**
   ```bash
   git pull origin main
   ```
   Последний коммит должен быть: `d716b9b refactor: rename /loginadmin to /admin + fix server-side auth + add PM2 config template`

2. **Прочитай контекст:**
   - `CLAUDE.md` — общая структура проекта
   - `project-doc/session-2/` — эта спецификация
   - `BUGFIX-SESSION-ADMIN-PANEL.md` — что было сделано в session-1

3. **Создай ветку:**
   ```bash
   git checkout -b claude/session-2-box-improvements
   ```

---

## Общий контекст

Это коробка (boilerplate) Go Fiber + SvelteKit. Всё основное работает: auth, admin panel, file upload backend, user management. Нужно доработать 7 задач, чтобы коробка была полностью готова к использованию как основа для веб-приложений (CMS, SaaS, Telegram Web App, агрегаторы).

**Стек:**
- Backend: Go Fiber v2, GORM, SQLite (WAL mode)
- Frontend: SvelteKit v2, Svelte 5 (runes: $state, $derived, $effect, $props)
- Auth: JWT access token (15m) + refresh token (7d, httpOnly cookie)
- Роли: `admin` и `user` (поле `role` в модели User)

**Архитектура auth (КРИТИЧЕСКИ ВАЖНО понимать):**
- Backend auth middleware (`middleware/auth.go`) проверяет ТОЛЬКО заголовок `Authorization: Bearer <token>`, НЕ cookies
- Cookies отправляются при `POST /api/auth/refresh` — этот endpoint читает `refresh_token` из cookie и возвращает новый `accessToken` в JSON
- Server-side SvelteKit код (`+layout.server.ts`, `+page.server.ts`) должен СНАЧАЛА вызвать `/api/auth/refresh`, получить accessToken, ПОТОМ вызвать `/api/auth/me` с `Authorization: Bearer` заголовком
- Пример правильной реализации: `frontend-sveltekit/src/routes/admin/+layout.server.ts`

---

## Задача A1: Fix redirect после login

### Есть сейчас
Страница `/login` (`src/routes/login/+page.svelte`) после успешного логина ВСЕГДА делает `goto('/dashboard')`, игнорируя:
- query параметр `?redirect=` (который ставят protected pages при редиректе на login)
- роль пользователя (admin должен идти в `/admin`, а не `/dashboard`)

### Должно быть
1. Если есть `?redirect=/some/path` — перейти на этот path после логина
2. Если нет redirect И role=admin — перейти на `/admin`
3. Если нет redirect И role=user — перейти на `/dashboard`

### Что сделать
Изменить файл: `frontend-sveltekit/src/routes/login/+page.svelte`

1. Прочитать `?redirect=` из URL (через `$page.url.searchParams` или `$app/stores`)
2. После успешного `login()` — API возвращает данные пользователя включая `role`
3. Определить куда перейти:
   ```typescript
   const redirectTo = $page.url.searchParams.get('redirect');
   if (redirectTo && redirectTo.startsWith('/')) {
     goto(redirectTo);
   } else if (user.role === 'admin') {
     goto('/admin');
   } else {
     goto('/dashboard');
   }
   ```
4. Валидация: redirect должен начинаться с `/` (защита от open redirect)

### Проверить
- [ ] Login как admin без redirect → попадаем на `/admin`
- [ ] Login как user без redirect → попадаем на `/dashboard`
- [ ] Открыть `/admin` без авторизации → redirect на `/login?redirect=/admin` → login → попадаем на `/admin`
- [ ] redirect с подозрительным URL (https://evil.com) → игнорируется, идём по role

### Файл для проверки auth store
Посмотри `frontend-sveltekit/src/lib/stores/auth.svelte.ts` — функция `login()` возвращает объект с данными пользователя, включая `role`.

---

## Задача A2: Ссылка "Admin Panel" на dashboard

### Есть сейчас
На странице `/dashboard` нет никакой ссылки на админку. Admin-пользователь должен вручную вводить `/admin` в URL.

### Должно быть
На странице `/dashboard` для пользователей с ролью `admin` показать кнопку/ссылку "Admin Panel → /admin".

### Что сделать
Изменить файл: `frontend-sveltekit/src/routes/dashboard/+page.svelte`

1. Получить данные пользователя (через layout data или auth store)
2. Если `user.role === 'admin'` — показать блок:
   ```html
   <a href="/admin" class="admin-panel-link">Admin Panel →</a>
   ```
3. Стилизовать как заметную, но не кричащую кнопку. Использовать существующий CSS-стиль проекта (без Tailwind).

### Дополнительно (опционально)
Также добавить ссылку "Admin" в верхний навбар (`+layout.svelte`) для admin-пользователей, рядом с "Dashboard".

### Проверить
- [ ] Login как admin → на `/dashboard` видна кнопка "Admin Panel"
- [ ] Login как user → на `/dashboard` НЕТ кнопки "Admin Panel"

---

## Задача A3: Login rate limit (5 попыток / 5 мин на IP)

### Есть сейчас
Глобальный rate limiter: 100 req/min на IP для всех endpoints.
Файл: `backend-go-fiber/internal/middleware/security.go` — функция `RateLimiterMiddleware()`.

Никакой специальной защиты на login endpoint нет.

### Должно быть
Отдельный rate limiter для login и register:
- `/api/auth/login` — 5 попыток за 5 минут на IP
- `/api/auth/register` — 3 попытки за 1 час на IP

### Что сделать

**Вариант реализации: отдельный middleware**

1. В файле `backend-go-fiber/internal/middleware/security.go` добавить:
   ```go
   func LoginRateLimiter() fiber.Handler {
       return limiter.New(limiter.Config{
           Max:        5,
           Expiration: 5 * time.Minute,
           KeyGenerator: func(c *fiber.Ctx) string {
               return "login:" + c.IP()
           },
           LimitReached: func(c *fiber.Ctx) error {
               return utils.SendError(c, "RATE_LIMIT_EXCEEDED",
                   "Too many login attempts. Try again in 5 minutes.",
                   fiber.StatusTooManyRequests)
           },
       })
   }

   func RegisterRateLimiter() fiber.Handler {
       return limiter.New(limiter.Config{
           Max:        3,
           Expiration: 1 * time.Hour,
           KeyGenerator: func(c *fiber.Ctx) string {
               return "register:" + c.IP()
           },
           LimitReached: func(c *fiber.Ctx) error {
               return utils.SendError(c, "RATE_LIMIT_EXCEEDED",
                   "Too many registration attempts. Try again later.",
                   fiber.StatusTooManyRequests)
           },
       })
   }
   ```

2. В файле регистрации роутов (найди где вешаются auth routes, скорее всего `cmd/server/main.go` или отдельный файл routes) применить middleware:
   ```go
   auth.Post("/login", middleware.LoginRateLimiter(), authHandler.Login)
   auth.Post("/register", middleware.RegisterRateLimiter(), authHandler.Register)
   ```

### Проверить
- [ ] 6-й запрос на login за 5 минут → 429 Too Many Requests
- [ ] 4-й запрос на register за 1 час → 429 Too Many Requests
- [ ] Другие endpoints НЕ затронуты этим лимитом
- [ ] Ответ содержит стандартный error format с кодом `RATE_LIMIT_EXCEEDED`

---

## Задача B1: Страница password reset (frontend)

### Есть сейчас
Backend полностью реализован:
- `POST /api/auth/forgot-password` — отправляет reset token (сейчас логирует в консоль, email не настроен)
- `POST /api/auth/validate-reset-token` — проверяет токен
- `POST /api/auth/reset-password` — сбрасывает пароль

Frontend НЕ реализован — нет страниц для password reset.

### Должно быть
Две страницы:

**Страница 1: `/forgot-password`**
- Поле email
- Кнопка "Send Reset Link"
- После отправки: "Check your email for reset instructions" (сообщение)
- Ссылка "Back to Login"

**Страница 2: `/reset-password`**
- Принимает query параметр `?token=xxx`
- Два поля: New Password, Confirm Password
- Кнопка "Reset Password"
- После успеха: "Password reset successfully" + ссылка на `/login`
- Если token невалидный: показать ошибку

### Что сделать

1. Создать `frontend-sveltekit/src/routes/forgot-password/+page.svelte`:
   - Форма с полем email
   - Submit → `POST /api/auth/forgot-password` body: `{ "email": "..." }`
   - На 200 → показать success message
   - На error → показать ошибку

2. Создать `frontend-sveltekit/src/routes/reset-password/+page.svelte`:
   - Прочитать `?token=` из URL
   - Форма: newPassword, confirmPassword
   - Валидация: пароли совпадают, мин. 6 символов
   - Submit → `POST /api/auth/reset-password` body: `{ "token": "...", "password": "..." }`
   - На 200 → success message + link to login
   - На error → показать ошибку

3. Добавить ссылку "Forgot password?" на странице `/login` — под формой, перед "Don't have an account?"

### Стиль
Использовать тот же стиль, что на страницах `/login` и `/register` — центрированная карточка с формой. Без Tailwind, CSS variables из проекта.

### Проверить
- [ ] `/forgot-password` — отправляем email, видим success message
- [ ] Backend логирует reset token в консоль (email не настроен — это ОК для коробки)
- [ ] Скопировать token из логов → открыть `/reset-password?token=xxx`
- [ ] Ввести новый пароль → success → перейти на login → войти с новым паролем
- [ ] Невалидный token → ошибка

---

## Задача B2: Upload из админки (кнопка + drag-and-drop)

### Есть сейчас
- Backend upload: `POST /api/upload` и `POST /api/upload/multiple` — работает
- Admin file browser: `GET /api/admin/files` — работает, показывает файлы из `data/uploads/`
- НО: в файловом браузере админки нет кнопки "Upload". Файлы нельзя загрузить через UI.

### Текущая конфигурация upload
- Файлы загружаются в: `data/uploads/` (env: `UPLOAD_DIR`)
- Формат пути: `{year}/{month}/{day}/{uuid}.{ext}` (например `2025/01/30/abc-123.jpg`)
- Допустимые типы: JPG, PNG, GIF, WebP, PDF
- Макс. размер: 10MB
- Множественная загрузка: до 10 файлов за раз

### Должно быть
На странице `/admin/files` добавить:
1. Кнопка "Upload Files" в шапке (рядом с заголовком)
2. При нажатии — модальное окно или выезжающая панель с:
   - Зона drag-and-drop ("Drop files here or click to browse")
   - Кнопка выбора файлов (input type="file" multiple)
   - Отображение выбранных файлов (имя, размер)
   - Progress bar для каждого файла при загрузке
   - Кнопка "Upload" для старта
3. После загрузки — обновить список файлов

### Что сделать

Изменить файл: `frontend-sveltekit/src/routes/admin/files/+page.svelte`

1. Добавить кнопку "Upload" в заголовок страницы
2. Создать компонент загрузки (или встроить в страницу):
   - Drag-and-drop zone
   - File input (multiple)
   - Preview выбранных файлов
   - Progress при загрузке
3. API call: `POST /api/upload/multiple` с `FormData`, field name: `files`
4. Заголовок Authorization: Bearer token (получить через refresh, как в layout)
5. После успеха — re-fetch список файлов

### ВАЖНО: Authorization для upload
Upload endpoint защищён auth middleware. Нужен Bearer token. Посмотри как admin layout (`+layout.server.ts`) получает token через refresh — используй аналогичный подход на клиенте через auth store.

### Проверить
- [ ] Кнопка "Upload" видна на странице файлов
- [ ] Drag-and-drop работает
- [ ] Выбор файлов через кнопку работает
- [ ] Файл загружается, progress виден
- [ ] После загрузки файл появляется в списке
- [ ] Попытка загрузить .exe → ошибка валидации
- [ ] Попытка загрузить файл >10MB → ошибка

---

## Задача B3: Профиль пользователя (dashboard)

### Есть сейчас
Страница `/dashboard` показывает базовую информацию о пользователе (email, name). Нет возможности редактировать профиль или менять пароль.

### Должно быть
Страница `/dashboard/profile` с:
1. Отображение текущих данных (email, name, role, дата регистрации)
2. Форма редактирования имени
3. Форма смены пароля (текущий пароль + новый + подтверждение)

### Что сделать

**Backend — новые endpoints:**

1. В файле `backend-go-fiber/internal/handlers/auth.go` (или создать отдельный `profile.go`) добавить:
   - `PUT /api/auth/profile` — обновление name (protected, для текущего пользователя)
     - Body: `{ "name": "New Name" }`
     - Читает user ID из JWT token (c.Locals("user"))
   - `PUT /api/auth/change-password` — смена пароля (protected)
     - Body: `{ "currentPassword": "...", "newPassword": "..." }`
     - Проверяет текущий пароль перед сменой

2. Зарегистрировать роуты в группе auth (с auth middleware):
   ```go
   authProtected.Put("/profile", authHandler.UpdateProfile)
   authProtected.Put("/change-password", authHandler.ChangePassword)
   ```

**Frontend:**

3. Создать `frontend-sveltekit/src/routes/dashboard/profile/+page.server.ts`:
   - Server-side проверка авторизации (аналогично `/dashboard/+page.server.ts`)
   - Вернуть user data

4. Создать `frontend-sveltekit/src/routes/dashboard/profile/+page.svelte`:
   - Секция 1: Информация (email — readonly, role — readonly, дата регистрации)
   - Секция 2: Форма "Edit Name" — поле name + кнопка Save
   - Секция 3: Форма "Change Password" — currentPassword, newPassword, confirmPassword + кнопка Change
   - Использовать стиль карточек как в admin panel

5. Добавить ссылку на профиль в навигации dashboard.

### Стиль
Чистые CSS карточки, как в остальном проекте. Без Tailwind.

### О ролях (для контекста)
В коробке две роли: `admin` и `user`. Для конкретных проектов будут добавляться другие (manager и т.д.). В коробке НЕ нужно добавлять новые роли — это per-project.

### Проверить
- [ ] Страница `/dashboard/profile` загружается
- [ ] Отображаются email, name, role, дата регистрации
- [ ] Смена имени работает → имя обновляется
- [ ] Смена пароля: ввести неправильный текущий → ошибка
- [ ] Смена пароля: правильный текущий + новый → success
- [ ] Выход → вход с новым паролем → работает

---

## Задача B4: Register rate limit (включена в A3)

Эта задача уже включена в задачу A3 — там описан rate limiter для register: 3 попытки в час на IP.

---

## Общие требования

### Стиль кода
- **Frontend:** Svelte 5 runes ($state, $derived, $effect, $props). НЕ используй stores в старом стиле (writable/readable)
- **CSS:** Чистый CSS без Tailwind. Используй CSS variables из проекта
- **Backend:** Go стандарты, error handling через utils.SendError()
- **Типы:** TypeScript на фронте, строгая типизация

### Безопасность
- Все input валидируются на backend
- Rate limiters применяются на уровне middleware
- Redirect URL валидируется (только относительные пути)
- Password change требует текущий пароль
- Все endpoints с мутацией защищены auth middleware

### Коммиты
Делай отдельные коммиты по задачам:
```
feat: A1 — fix post-login redirect by role
feat: A2 — add admin panel link on dashboard
feat: A3 — add login and register rate limiters
feat: B1 — add password reset pages (frontend)
feat: B2 — add file upload UI in admin panel
feat: B3 — add user profile page with password change
```

### После завершения
1. Push ветку: `git push origin claude/session-2-box-improvements`
2. Сообщи о завершении

---

## Чек-лист финальный

- [ ] A1: Login redirect по роли и ?redirect= работает
- [ ] A2: Ссылка Admin Panel на dashboard для admin
- [ ] A3: Login rate limit 5/5min, Register rate limit 3/hour
- [ ] B1: /forgot-password и /reset-password страницы работают
- [ ] B2: Upload файлов из админки через UI работает
- [ ] B3: /dashboard/profile — редактирование имени и смена пароля
- [ ] Все коммиты в ветке claude/session-2-box-improvements
- [ ] Нет ошибок при `npm run build`
- [ ] Нет ошибок при `go build`
