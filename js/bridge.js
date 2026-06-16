// js/bridge.js
// Все вызовы Notibot Bridge — только отсюда.
let _state = { user: null, app: null, colors: null };
const _listeners = [];
const _rawResponses = new Map();
const defColors = { background: "#ffffff", textPrimary: "#0f172a", textSecondary: "#64748b", primaryMain: "#6366f1" };

window.addEventListener('message', (event) => {
  if (event.data?.source === 'vibe-parent' && event.data?.requestId) {
    _rawResponses.set(event.data.requestId, event.data);
  }
}, true);

function _wrap(inst) {
  if (inst?._responseHandlers && !inst._responseHandlers.__isProxy) {
    inst._responseHandlers = new Proxy(inst._responseHandlers, {
      set(target, prop, val) {
        if (typeof val === 'function') {
          const orig = val;
          val = (resp) => {
            if (resp && !resp.success) {
              const raw = _rawResponses.get(prop) || resp;
              try { resp.error = JSON.stringify(raw); } catch (e) { resp.error = String(raw); }
            }
            _rawResponses.delete(prop);
            return orig(resp);
          };
        }
        return Reflect.set(target, prop, val);
      },
      get(t, p) { return p === '__isProxy' ? true : Reflect.get(t, p); }
    });
  }
}

if (window.notibot) {
  _wrap(window.notibot);
} else {
  let _temp;
  Object.defineProperty(window, 'notibot', {
    configurable: true, enumerable: true,
    get() { return _temp; },
    set(val) { _temp = val; _wrap(val); }
  });
}

// Инициализация Bridge (вызывается один раз из app.js)
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

export function onStateUpdate(fn) { _listeners.push(fn); }
export function getState() { return _state; }

// Навигация
export function goToStorefront() { window.notibot?.openStorefront?.(); }
export function goToArticle(id) {
  if (id && window.notibot && typeof window.notibot.openArticle === 'function') {
    window.notibot.openArticle(id);
  } else {
    window.notibot?.openStorefront?.();
  }
}

// Формы
export async function submitForm(formId, answers) {
  if (window.notibot && typeof window.notibot.submitForm === 'function') {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const ErrClass = window.NotibotBridgeError || Error;
        reject(new ErrClass({
          origin: 'client',
          code: 'ERR_RATE_LIMIT',
          message: 'Превышено время ожидания ответа от Notibot (10 сек)'
        }));
      }, 10000);
      window.notibot.submitForm(formId, answers)
        .then((res) => { clearTimeout(timeout); resolve(res); })
        .catch((err) => { clearTimeout(timeout); reject(err); });
    });
  }
  console.log("Mock submitForm call:", formId, answers);
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 800));
}

// Haptics / Виброотклик
export function triggerHapticImpact(style = 'medium') { window.notibot?.hapticImpact?.(style); }
export function triggerHapticSelection() { window.notibot?.hapticSelection?.(); }

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
