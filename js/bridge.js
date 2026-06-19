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
export function openLink(url) {
  if (window.notibot && typeof window.notibot.openLink === 'function') {
    window.notibot.openLink(url);
  } else {
    console.log("Mock openLink call:", url);
    window.open(url, '_blank');
  }
}
window.openLink = openLink;

export function goToStorefront() {
  if (window.notibot && typeof window.notibot.openStorefront === 'function') {
    window.notibot.openStorefront();
  }
}

export function goToProduct(id) {
  if (window.notibot && typeof window.notibot.openProduct === 'function') {
    window.notibot.openProduct(id);
  } else {
    console.log("Mock openProduct call for ID:", id);
    alert(`Переход к товару: ${id}`);
  }
}

export function goToArticle(id) {
  if (window.notibot && typeof window.notibot.openArticle === 'function') {
    window.notibot.openArticle(id);
  } else {
    console.log("Mock openArticle call for ID:", id);
    alert(`Переход к статье: ${id}`);
  }
}

// Формы
export async function submitForm(formId, answers) {
  if (window.notibot && typeof window.notibot.submitForm === 'function') {
    return window.notibot.submitForm(formId, answers);
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
