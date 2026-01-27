# Спецификация: Универсальная админка (Admin Panel)

**Версия:** v1-final
**Дата:** 2025-01-27
**Вариант:** B (расширяемые компоненты)
**Стили:** CSS variables (без Tailwind)

---

## 1. Общее описание

Создать универсальную админку которая:
- Работает из коробки (Users CRUD, Dashboard, Settings)
- Легко расширяется (добавление новых сущностей через компоненты)
- Использует существующую auth систему (JWT + roles)
- Стилизована через CSS variables (light/dark theme ready)

---

## 2. Структура файлов

### Backend (Go Fiber)

```
backend-go-fiber/
├── internal/
│   ├── handlers/
│   │   └── admin/
│   │       ├── dashboard.go      # GET /api/admin/dashboard (stats)
│   │       ├── users.go          # CRUD /api/admin/users
│   │       ├── files.go          # GET /api/admin/files (list uploads)
│   │       └── settings.go       # GET/PUT /api/admin/settings
│   ├── middleware/
│   │   └── admin.go              # AdminOnly middleware (role check)
│   ├── models/
│   │   └── settings.go           # AppSettings model
│   └── services/
│       └── admin/
│           ├── dashboard.go      # Dashboard stats logic
│           ├── users.go          # Users CRUD logic
│           └── settings.go       # Settings logic
```

### Frontend (SvelteKit)

```
frontend-sveltekit/
├── src/
│   ├── routes/
│   │   └── admin/
│   │       ├── +layout.svelte    # Admin layout (sidebar + header)
│   │       ├── +layout.server.ts # Admin auth guard (role check)
│   │       ├── +page.svelte      # Dashboard
│   │       ├── users/
│   │       │   ├── +page.svelte  # Users list
│   │       │   ├── [id]/
│   │       │   │   └── +page.svelte  # Edit user
│   │       │   └── new/
│   │       │       └── +page.svelte  # Create user
│   │       ├── files/
│   │       │   └── +page.svelte  # File manager
│   │       ├── settings/
│   │       │   └── +page.svelte  # App settings
│   │       └── profile/
│   │           └── +page.svelte  # Admin profile
│   └── lib/
│       ├── components/
│       │   └── admin/
│       │       ├── AdminLayout.svelte    # Layout wrapper
│       │       ├── Sidebar.svelte        # Navigation sidebar
│       │       ├── Header.svelte         # Top header
│       │       ├── DataTable.svelte      # Universal table
│       │       ├── FormBuilder.svelte    # Form from schema
│       │       ├── Modal.svelte          # Modal dialog
│       │       ├── Toast.svelte          # Notifications
│       │       ├── ConfirmDialog.svelte  # Confirm actions
│       │       ├── StatCard.svelte       # Dashboard stat card
│       │       ├── Pagination.svelte     # Table pagination
│       │       └── SearchInput.svelte    # Search field
│       ├── stores/
│       │   └── admin.svelte.ts   # Admin state (sidebar, theme)
│       └── api/
│           └── admin.ts          # Admin API client
```

---

## 3. API Endpoints

### Dashboard
| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | `/api/admin/dashboard` | Статистика (users count, recent activity) |

### Users CRUD
| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | `/api/admin/users` | Список пользователей (pagination, search, sort) |
| GET | `/api/admin/users/:id` | Один пользователь |
| POST | `/api/admin/users` | Создать пользователя |
| PUT | `/api/admin/users/:id` | Обновить пользователя |
| DELETE | `/api/admin/users/:id` | Удалить пользователя (soft delete) |

### Files
| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | `/api/admin/files` | Список загруженных файлов |
| DELETE | `/api/admin/files/:path` | Удалить файл |

### Settings
| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | `/api/admin/settings` | Получить настройки |
| PUT | `/api/admin/settings` | Обновить настройки |

---

## 4. Компоненты

### 4.1 DataTable.svelte

**Props:**
```typescript
interface DataTableProps {
  endpoint: string;           // API endpoint
  columns: Column[];          // Column definitions
  searchable?: boolean;       // Enable search
  sortable?: boolean;         // Enable sorting
  pageSize?: number;          // Items per page (default: 10)
  actions?: Action[];         // Row actions (edit, delete)
}

interface Column {
  key: string;               // Field name
  label: string;             // Display label
  sortable?: boolean;        // Allow sorting
  format?: 'text' | 'date' | 'currency' | 'badge';
  width?: string;            // CSS width
}
```

**Features:**
- Server-side pagination
- Sorting by column
- Search with debounce
- Row actions (edit, delete, custom)
- Loading states
- Empty state
- Export CSV button

### 4.2 FormBuilder.svelte

**Props:**
```typescript
interface FormBuilderProps {
  schema: FormField[];        // Field definitions
  initialData?: object;       // For edit mode
  submitLabel?: string;       // Submit button text
  onSubmit: (data) => void;   // Submit handler
  onCancel?: () => void;      // Cancel handler
}

interface FormField {
  name: string;              // Field name
  label: string;             // Display label
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];  // For select
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}
```

**Features:**
- Validation on blur and submit
- Error messages
- Loading state on submit
- Responsive layout

### 4.3 Modal.svelte

**Props:**
```typescript
interface ModalProps {
  open: boolean;
  title: string;
  size?: 'sm' | 'md' | 'lg';
  onClose: () => void;
}
```

### 4.4 Toast.svelte

**Usage:**
```typescript
import { toast } from '$lib/stores/admin.svelte';

toast.success('User created');
toast.error('Failed to delete');
toast.info('Processing...');
```

### 4.5 ConfirmDialog.svelte

**Props:**
```typescript
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}
```

---

## 5. Модели данных

### AppSettings (новая)

```go
type AppSettings struct {
    ID        string    `gorm:"primaryKey;type:uuid"`
    Key       string    `gorm:"uniqueIndex;not null"`
    Value     string    `gorm:"type:text"`
    Type      string    `gorm:"default:'string'"` // string, number, boolean, json
    UpdatedAt time.Time
}
```

### User (обновить)

Добавить поля:
```go
LastLoginAt  *time.Time  // Последний вход
IsActive     bool        `gorm:"default:true"` // Активен ли аккаунт
```

---

## 6. Стили (CSS Variables)

```css
/* Admin theme variables */
:root {
  /* Sidebar */
  --admin-sidebar-width: 260px;
  --admin-sidebar-bg: #1a1a2e;
  --admin-sidebar-text: #a0aec0;
  --admin-sidebar-active: #4f46e5;

  /* Header */
  --admin-header-height: 64px;
  --admin-header-bg: #ffffff;
  --admin-header-border: #e2e8f0;

  /* Content */
  --admin-content-bg: #f7fafc;

  /* Cards */
  --admin-card-bg: #ffffff;
  --admin-card-border: #e2e8f0;
  --admin-card-shadow: 0 1px 3px rgba(0,0,0,0.1);

  /* Table */
  --admin-table-header-bg: #f7fafc;
  --admin-table-row-hover: #edf2f7;
  --admin-table-border: #e2e8f0;

  /* Status badges */
  --admin-badge-active: #48bb78;
  --admin-badge-inactive: #a0aec0;
  --admin-badge-admin: #4f46e5;
}

/* Dark theme */
[data-theme="dark"] {
  --admin-sidebar-bg: #0f0f1a;
  --admin-header-bg: #1a1a2e;
  --admin-content-bg: #0f0f1a;
  --admin-card-bg: #1a1a2e;
  /* ... */
}
```

---

## 7. Roadmap реализации

### Phase 1: Backend Foundation
1. [ ] Создать `middleware/admin.go` (AdminOnly)
2. [ ] Создать модель `AppSettings`
3. [ ] Обновить модель `User` (LastLoginAt, IsActive)
4. [ ] Миграция БД

### Phase 2: Backend Handlers
5. [ ] `handlers/admin/dashboard.go` - статистика
6. [ ] `handlers/admin/users.go` - CRUD
7. [ ] `handlers/admin/files.go` - список файлов
8. [ ] `handlers/admin/settings.go` - настройки
9. [ ] Зарегистрировать routes в main.go

### Phase 3: Frontend Components
10. [ ] Создать CSS variables для админки
11. [ ] `AdminLayout.svelte` - layout wrapper
12. [ ] `Sidebar.svelte` - navigation
13. [ ] `Header.svelte` - top bar
14. [ ] `DataTable.svelte` - universal table
15. [ ] `FormBuilder.svelte` - form generator
16. [ ] `Modal.svelte`, `Toast.svelte`, `ConfirmDialog.svelte`
17. [ ] `StatCard.svelte`, `Pagination.svelte`, `SearchInput.svelte`

### Phase 4: Frontend Pages
18. [ ] `/admin/+layout.svelte` + auth guard
19. [ ] `/admin/+page.svelte` - Dashboard
20. [ ] `/admin/users/*` - Users CRUD pages
21. [ ] `/admin/files/+page.svelte` - File manager
22. [ ] `/admin/settings/+page.svelte` - Settings
23. [ ] `/admin/profile/+page.svelte` - Admin profile

### Phase 5: Polish
24. [ ] Dark theme toggle
25. [ ] Export CSV functionality
26. [ ] Mobile responsive sidebar
27. [ ] Loading states everywhere
28. [ ] Error handling

---

## 8. Критерии готовности (DoD)

- [ ] Админка доступна по /admin только для role=admin
- [ ] Dashboard показывает статистику (users count, recent registrations)
- [ ] Users CRUD работает полностью (list, create, edit, delete)
- [ ] File manager показывает загруженные файлы
- [ ] Settings сохраняются в БД
- [ ] Dark/light theme переключается
- [ ] Все компоненты переиспользуемы
- [ ] Нет ошибок в консоли
- [ ] Mobile responsive

---

## 9. Как расширять (пример)

После реализации, добавить новую сущность (например Products):

**1. Backend:**
```go
// handlers/admin/products.go
// Скопировать users.go, заменить User на Product
```

**2. Frontend:**
```svelte
<!-- routes/admin/products/+page.svelte -->
<script>
  import DataTable from '$lib/components/admin/DataTable.svelte';

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'price', label: 'Price', format: 'currency' },
    { key: 'createdAt', label: 'Created', format: 'date' }
  ];
</script>

<DataTable
  endpoint="/api/admin/products"
  {columns}
  searchable
/>
```

**3. Sidebar:**
```svelte
<!-- Добавить в menuItems -->
{ icon: 'package', label: 'Products', href: '/admin/products' }
```

---

## 10. Промт для Developer (Claude Code Web)

```
Прочитай:
- CLAUDE.md (codebase context)
- CLAUDE.web.md (workflow)
- feedbacks/admin-panel-spec.md (эта спецификация)

Реализуй админку по спецификации.

Порядок:
1. Phase 1: Backend Foundation
2. Phase 2: Backend Handlers
3. Phase 3: Frontend Components
4. Phase 4: Frontend Pages
5. Phase 5: Polish

После каждой фазы - commit с описанием.

Стили: CSS variables (НЕ Tailwind).
Svelte: Используй Svelte 5 runes ($state, $derived, $effect).
```

---

*Создано: 2025-01-27*
*Статус: Ready for implementation*
