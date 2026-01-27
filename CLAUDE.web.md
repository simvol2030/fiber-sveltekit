# CLAUDE.web.md — Developer Workflow

> Workflow для Claude Code Web (Developer роль)

---

## Фазы работы

### Фаза 2: Research
1. Изучить спецификацию в `project-doc/session-N/`
2. Исследовать кодовую базу
3. Задокументировать findings

### Фаза 3: Implementation
1. Создать ветку: `claude/session-N-implementation`
2. Реализовать изменения
3. Commit с понятными сообщениями
4. Push и уведомить через hooks

---

## Git Workflow

```bash
# Создать ветку
git checkout -b claude/session-N-implementation

# Commit
git add .
git commit -m "feat: описание изменений"

# Push
git push origin claude/session-N-implementation
```

---

## Правила коммитов

- `feat:` — новая функциональность
- `fix:` — исправление бага
- `docs:` — документация
- `refactor:` — рефакторинг
- `test:` — тесты

---

## Чек-лист перед push

- [ ] Код компилируется без ошибок
- [ ] Тесты проходят
- [ ] Линтер не ругается
- [ ] Документация обновлена
- [ ] Commit message понятный

---

*Workflow v6.0*
