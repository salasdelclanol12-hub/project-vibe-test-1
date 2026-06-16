---
name: Notibot Form Integration & Debugging Guide
description: Инструкция по правильному подключению форм, обходу ограничений деструктуризации SDK и предотвращению ошибок валидации на сервере Notibot.
---

# Скилл: Интеграция и надежная отладка форм Notibot

> [!IMPORTANT]
> Этот скилл содержит критически важные архитектурные решения по работе с формами Notibot. Прочитайте его полностью перед изменением файлов `bridge.js` или компонентов шторки/форм.

---

## 🔒 1. Локальная загрузка SDK (Content Security Policy)

> [!WARNING]
> Никогда не используйте внешние CDN-ссылки вроде `https://list.notibot.ru/notibot-bridge.js` в проектах со строгими политиками безопасности. Скрипт будет заблокирован директивой CSP `script-src 'self'`.

* **Правильное решение**: Скачайте SDK локально в `js/notibot-bridge.js` и подключайте его в `<head>` в `index.html` как локальный ресурс:
  ```html
  <script src="./js/notibot-bridge.js"></script>
  ```
  Это гарантирует полную совместимость с CSP и мгновенный старт.

---

## 📊 2. Правила валидации схемы и отправки ответов

При работе с методом `window.notibot.submitForm(formId, answers)` бэкенд Notibot сверяет структуру с JSON-схемой формы.

### 2.1. Строгое совпадение названий вопросов
Названия полей (ключ `title` в объекте ответа) должны **символ в символ** совпадать с заголовками вопросов из схемы на сервере.
* Обратите внимание на пробелы! Например, если в схеме вопрос называется `"Имя "` (с пробелом на конце), отправка ключа `"Имя"` (без пробела) приведет к ошибке `Failed to submit form`.
* Отправка полей, которых нет в схеме (например, попытка продублировать или отправить лишний лог), вызовет ошибку валидации.

### 2.2. Заполнение необязательных полей
Если поле не заполнено пользователем и оно не является обязательным (`required: false`):
* **Правильно**: Отправлять пустой массив в значении ответов:
  ```javascript
  { title: "Имя ", answers: name ? [name] : [] }
  ```
* **Неправильно**: Отправлять пустую строку `answers: [""]` или опускать/передавать `undefined`. Это приведет к ошибке формата данных на бэкенде.

---

## 🛠️ 3. Решение проблемы с потерей деталей ошибок в SDK

### 3.1. Суть проблемы
По умолчанию локальный SDK Notibot при обработке ответов от родительского окна делает деструктуризацию сообщения:
`const { requestId, success, data, error } = event.data;`
И передает дальше только эти свойства. Если сервер присылает детальные ошибки валидации (например, в свойствах `details` или `message`), они **полностью теряются**, а разработчик видит лишь дефолтное `Failed to submit form`.

### 3.2. Архитектурное решение (Capturing + Proxy + Getter/Setter)
Для того чтобы прокинуть сырой ответ сервера на форму без модификации исходного SDK, используйте следующий шаблон в `js/bridge.js`:

```javascript
const _rawResponses = new Map();

// 1. Захватываем оригинальное событие на фазе capturing (до обработчика SDK)
window.addEventListener('message', (event) => {
  if (event.data?.source === 'vibe-parent' && event.data?.requestId) {
    _rawResponses.set(event.data.requestId, event.data);
  }
}, true);

// 2. Оборачиваем _responseHandlers в Proxy для подмены поля error полным JSON
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

// 3. Устраняем гонку загрузки скриптов с помощью геттера/сеттера на window.notibot
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
```

---

## 🚀 4. Шаблон реализации отправки форм в `js/bridge.js`

Используйте этот компактный и отказоустойчивый метод для обертки `submitForm`. Он содержит безопасный 10-секундный таймаут и возвращает полную ошибку:

```javascript
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
          // Выводим ошибку, которая благодаря Proxy содержит полный JSON ответа
          reject(err);
        });
    });
  }
  console.log("Mock submitForm call:", formId, answers);
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 800));
}
```

---

## 📝 5. Вывод ошибок в UI для быстрой отладки (Обязательное требование)

> [!IMPORTANT]
> При запуске приложения внутри Notibot (в клиенте или в веб-вью) разработчик **не видит консоль лог (`console.error`/`console.log`)**.
> Любые скрытые ошибки усложняют отладку. Поэтому **ОБЯЗАТЕЛЬНО** выводите полный текст пойманной ошибки (который благодаря нашему Proxy содержит детальный JSON-ответ сервера с кодами и полями валидации) на экран прямо в форму.

Используйте `textContent` (для защиты от XSS) при выводе ошибки в блок:

```javascript
try {
  await submitForm(formSchema.formId, answers);
  // Показываем экран успешной отправки
} catch (err) {
  // Выводим полный JSON ошибки от сервера прямо в интерфейс
  const errorEl = document.getElementById('error-box');
  errorEl.textContent = `Ошибка при отправке: ${err.message}`;
  errorEl.classList.remove('hidden');
}
```
