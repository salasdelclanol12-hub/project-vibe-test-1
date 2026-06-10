---
name: Notibot Bridge Integration
description: Инструкция по подключению и использованию Notibot Bridge в существующем Vibe HTML Kit проекте. Используй этот скилл когда пользователь хочет интегрировать приложение с платформой Notibot.
---

# Скилл: Подключение Notibot Bridge

> [!IMPORTANT]
> Этот скилл — расширение для базового HTML Kit.
> Перед выполнением прочитай правила проекта в `skills/rules/SKILL.md`.

> [!NOTE]
> Полная документация по API Notibot Bridge (методы, данные, формы, примеры кода) —
> в файле [`SDK-reference.md`](./SDK-reference.md). Прочитай его перед интеграцией.

---

## Что такое Notibot Bridge

Notibot Bridge — это SDK, который позволяет Vibe-приложению (работающему в iframe внутри Notibot) получать данные пользователя, управлять навигацией и отправлять формы.

Данные приходят через `postMessage` от родительского фрейма.

---

## Шаг 1. Подключение скрипта через CDN

Открой `index.html` и добавь строку **синхронно** в `<head>`, **до любых других скриптов**:

```html
<!-- Notibot Bridge — СИНХРОННО, без defer/async -->
<script src="https://list.notibot.ru/notibot-bridge.js"></script>
```

Найди в `index.html` комментарий `💡 Notibot Bridge подключается здесь` и замени его на строку выше.

> [!WARNING]
> Никогда не подключать Bridge через `import`, `defer` или `async`.
> Только синхронный `<script>` в `<head>`. Иначе приложение пропустит
> первое сообщение `NOTIBOT_INIT` и зависнет на загрузке.

---

## Шаг 2. Создание js/bridge.js

Создай файл `js/bridge.js` — единственное место в проекте где используется `window.notibot`:

```javascript
// js/bridge.js
// Все вызовы Notibot Bridge — только отсюда.

let _state = { user: null, app: null, colors: null };
const _listeners = [];

/**
 * Инициализация Bridge. Вызывается один раз из app.js.
 * @param {Function} onReady — коллбэк { user, app, colors }
 */
export function initBridge(onReady) {
  window.notibot.onUpdate(function(data) {
    _state = { user: data.user, app: data.app, colors: data.app.colors };
    _applyTheme(_state.colors);

    if (onReady) { onReady(_state); onReady = null; }
    _listeners.forEach(fn => fn(_state));
  });
}

/** Подписаться на обновления (баланс, тема) */
export function onStateUpdate(fn) { _listeners.push(fn); }

/** Текущее состояние */
export function getState() { return _state; }

// Навигация
export function goToProduct(id)   { id ? window.notibot.openProduct(id)  : window.notibot.openStorefront(); }
export function goToArticle(id)   { id ? window.notibot.openArticle(id)  : window.notibot.openStorefront(); }
export function goToStorefront()  { window.notibot.openStorefront(); }
export function goToUserCard()    { window.notibot.openUserCard(); }

// Формы
export async function submitForm(formId, answers) {
  return window.notibot.submitForm(formId, answers);
}

// Тема
function _applyTheme(colors) {
  const r = document.documentElement;
  r.style.setProperty('--color-bg',     colors.background);
  r.style.setProperty('--color-text',   colors.textPrimary);
  r.style.setProperty('--color-muted',  colors.textSecondary);
  r.style.setProperty('--color-accent', colors.primaryMain);
  document.body.style.backgroundColor = colors.background;
  document.body.style.color           = colors.textPrimary;
}
```

---

## Шаг 3. Обновление app.js

Оберни `initApp` в `initBridge` вместо прямого вызова:

```javascript
// Было:
initApp();

// Стало:
import { initBridge } from './bridge.js';
initBridge(function(state) {
  initApp(state); // state содержит { user, app, colors }
});
```

Также добавь в `index.html` loading-экран, если его нет:
```html
<div id="loading" class="loader-screen">
  <div class="loader-spinner"></div>
</div>
```

И в `css/styles.css`:
```css
.loader-screen {
  display: flex; align-items: center;
  justify-content: center; min-height: 100svh;
}
.loader-spinner {
  width: 32px; height: 32px; border-radius: 50%;
  border: 3px solid rgba(128,128,128,0.2);
  border-top-color: var(--color-accent);
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

---

## Шаг 4. Данные из Bridge

После подключения в `state` доступно:

```javascript
state.user.displayName  // Имя пользователя
state.user.photoURL     // Аватар
state.user.balance      // Баланс
state.user.id           // ID пользователя

state.app.shopId        // ID магазина
state.app.platform      // Платформа
state.colors.background // Фон (уже применён в CSS)
state.colors.primaryMain // Акцентный цвет
```

---

## Шаг 5. Чеклист после интеграции

- [ ] Bridge подключён синхронно в `<head>` через CDN URL
- [ ] Создан `js/bridge.js`, все `window.notibot.*` — только в нём
- [ ] `app.js` обёрнут в `initBridge()`
- [ ] Компоненты получают user/colors как параметры, не из глобала
- [ ] CSS-переменные `--color-*` обновляются из `app.colors`
- [ ] Есть loading-экран, который скрывается после получения данных

---

## Справка по методам навигации

| Что нужно | Метод |
|---|---|
| Открыть витрину | `goToStorefront()` |
| Открыть товар | `goToProduct('ID')` |
| Открыть статью | `goToArticle('ID')` |
| Профиль пользователя | `goToUserCard()` |
| Отправить форму | `submitForm('formId', answers)` |

Если ID товара/статьи неизвестен — всегда fallback на `goToStorefront()`.

---

## 📚 Полная документация SDK

Все детали API, форматы данных, примеры работы с формами — в файле:
👉 [`SDK-reference.md`](./SDK-reference.md)

Читай его если нужно:
- Узнать точный формат `answers` для `submitForm`
- Посмотреть полный список полей `user` и `app`
- Понять как работает `onUpdate` и реактивные обновления баланса
