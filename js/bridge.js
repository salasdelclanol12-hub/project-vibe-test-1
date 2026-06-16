// js/bridge.js
// Все вызовы Notibot Bridge — только отсюда.

let _state = { user: null, app: null, colors: null };
const _listeners = [];
const _rawResponses = new Map();
const defColors = {
  background: "#ffffff",
  textPrimary: "#0f172a",
  textSecondary: "#64748b",
  primaryMain: "#6366f1"
};

// Сохраняем исходное сообщение от сервера в capturing фазе (до деструктуризации в SDK)
window.addEventListener('message', (event) => {
  if (event.data?.source === 'vibe-parent' && event.data?.requestId) {
    _rawResponses.set(event.data.requestId, event.data);
  }
}, true);

// Перехватываем ответы бэкенда Notibot, чтобы сохранять исходный объект ответа в ошибке
if (window.notibot && window.notibot._responseHandlers) {
  window.notibot._responseHandlers = new Proxy(window.notibot._responseHandlers, {
    set(target, prop, value) {
      if (typeof value === 'function') {
        const original = value;
        value = (response) => {
          if (response && !response.success) {
            const raw = _rawResponses.get(prop) || response;
            try {
              response.error = JSON.stringify(raw);
            } catch (e) {
              response.error = String(raw);
            }
          }
          _rawResponses.delete(prop);
          return original(response);
        };
      }
      return Reflect.set(target, prop, value);
    }
  });
}

/**
 * Инициализация Bridge. Вызывается один раз из app.js.
 * @param {Function} onReady — коллбэк { user, app, colors }
 */
export function initBridge(onReady) {
  let initialized = false;

  const timeout = setTimeout(() => {
    if (!initialized) {
      console.warn("Notibot Bridge timeout, loading mock state...");
      _state = {
        user: { displayName: "Иван Иванов", photoURL: "", balance: 1000, id: "mock_user_123" },
        app: { shopId: "mock_shop_abc", platform: "web", theme: "light", colors: defColors },
        colors: defColors
      };
      _applyTheme(_state.colors);
      if (onReady) { onReady(_state); onReady = null; }
      initialized = true;
    }
  }, 1000);

  if (window.notibot && typeof window.notibot.onUpdate === 'function') {
    window.notibot.onUpdate(function(user, app) {
      clearTimeout(timeout);
      initialized = true;
      _state = { user, app, colors: app?.colors || defColors };
      _applyTheme(_state.colors);
      if (onReady) { onReady(_state); onReady = null; }
      _listeners.forEach(fn => fn(_state));
    });
  } else {
    console.warn("window.notibot.onUpdate not found, fallback enabled.");
  }
}

/** Подписаться на обновления (баланс, тема) */
export function onStateUpdate(fn) { _listeners.push(fn); }

/** Текущее состояние */
export function getState() { return _state; }

// Навигация
export function goToStorefront() {
  window.notibot?.openStorefront?.();
}

// Формы
export async function submitForm(formId, answers) {
  if (window.notibot && typeof window.notibot.submitForm === 'function') {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Превышено время ожидания ответа от Notibot (10 сек)"));
      }, 10000);

      window.notibot.submitForm(formId, answers)
        .then((res) => {
          clearTimeout(timeout);
          resolve(res);
        })
        .catch((err) => {
          clearTimeout(timeout);
          reject(err);
        });
    });
  }
  console.log("Mock submitForm call:", formId, answers);
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 800));
}

// Haptics / Виброотклик
export function triggerHapticImpact(style = 'medium') {
  window.notibot?.hapticImpact?.(style);
}

export function triggerHapticSelection() {
  window.notibot?.hapticSelection?.();
}

// Применение темы
function _applyTheme(colors) {
  if (!colors) return;
  const r = document.documentElement;
  r.style.setProperty('--color-bg',      colors.background || '#ffffff');
  r.style.setProperty('--color-text',    colors.textPrimary || '#0f172a');
  r.style.setProperty('--color-muted',   colors.textSecondary || '#64748b');
  r.style.setProperty('--color-accent',  colors.primaryMain || '#6366f1');
  document.body.style.backgroundColor = colors.background || '#ffffff';
  document.body.style.color           = colors.textPrimary || '#0f172a';
}
