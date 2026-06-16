// js/bridge.js
// Все вызовы Notibot Bridge — только отсюда.

let _state = { user: null, app: null, colors: null };
const _listeners = [];

/**
 * Инициализация Bridge. Вызывается один раз из app.js.
 * @param {Function} onReady — коллбэк { user, app, colors }
 */
export function initBridge(onReady) {
  let initialized = false;

  // Безопасный таймаут-фолбек для локального тестирования вне Notibot
  const timeout = setTimeout(() => {
    if (!initialized) {
      console.warn("Notibot Bridge timeout, loading mock state...");
      _state = {
        user: { displayName: "Иван Иванов", photoURL: "", balance: 1000, id: "mock_user_123" },
        app: { shopId: "mock_shop_abc", platform: "web", theme: "light", colors: {
          background: "#ffffff",
          textPrimary: "#0f172a",
          textSecondary: "#64748b",
          primaryMain: "#6366f1"
        }},
        colors: {
          background: "#ffffff",
          textPrimary: "#0f172a",
          textSecondary: "#64748b",
          primaryMain: "#6366f1"
        }
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
      _state = {
        user: user,
        app: app,
        colors: app?.colors || {
          background: "#ffffff",
          textPrimary: "#0f172a",
          textSecondary: "#64748b",
          primaryMain: "#6366f1"
        }
      };
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
  if (window.notibot && typeof window.notibot.openStorefront === 'function') {
    window.notibot.openStorefront();
  }
}

// Формы
export async function submitForm(formId, answers) {
  if (window.notibot && typeof window.notibot.submitForm === 'function') {
    return new Promise((resolve, reject) => {
      const handleMessage = (event) => {
        if (event.data?.source === 'vibe-parent' && event.data?.requestId) {
          if (event.data.success) {
            cleanup();
            resolve(event.data.data);
          } else {
            let errorText;
            try {
              errorText = JSON.stringify(event.data);
            } catch (e) {
              errorText = String(event.data);
            }
            cleanup();
            reject(new Error(errorText));
          }
        }
      };
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("Превышено время ожидания ответа от Notibot (10 сек)"));
      }, 10000);
      const cleanup = () => {
        window.removeEventListener('message', handleMessage);
        clearTimeout(timeout);
      };
      window.addEventListener('message', handleMessage);
      window.notibot.submitForm(formId, answers).catch((err) => {
        cleanup();
        reject(err);
      });
    });
  }
  console.log("Mock submitForm call:", formId, answers);
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 800));
}

// Haptics / Виброотклик
export function triggerHapticImpact(style = 'medium') {
  if (window.notibot && typeof window.notibot.hapticImpact === 'function') {
    window.notibot.hapticImpact(style);
  } else {
    console.log(`[Haptic Mock] Impact: ${style}`);
  }
}

export function triggerHapticSelection() {
  if (window.notibot && typeof window.notibot.hapticSelection === 'function') {
    window.notibot.hapticSelection();
  } else {
    console.log("[Haptic Mock] Selection");
  }
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
