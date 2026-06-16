# Notibot Vibe SDK Handbook (Agent Edition) 🚀

## 🏗️ Architecture
Vibe Apps are rendered inside a secure `iframe`. Communication is via `postMessage`.

---

## 🚀 Crucial Principles for Developers

1. **Reactive Balance & Theme Sync**:
   Always use `onUpdate(callback)`. Notibot sends not only user data but also **actual CSS colors** from its theme.
   
2. **Theming**:
   Instead of generic light/dark modes, use `app.colors` to match the shop's look:
   - `background`: Main BG
   - `textPrimary`: Main Text
   - `primaryMain`: Brand Accent

3. **Navigation Context**:
   The parent `VibeSandbox` automatically prepends `activeShopId` to internal routes. Use the specific methods like `openArticle` to let the parent handle path construction.

---

## 📊 Bridge Data (v2.6+)
- `user`: { id, displayName, photoURL, balance, type }
- `app`: { shopId, platform, theme, colors: { background, textPrimary, textSecondary, primaryMain } }

---

## 🗺️ Methods
- `notibot.onUpdate(cb)`: Subscribe to all changes (including async balance).
- `notibot.openArticle(id)`: Navigates to `/product/article/{shopid}/{id}`.
- `notibot.openProduct(id)`: Navigates to `/product/{shopid}/{id}`.
- `notibot.openStorefront()`: Navigates to `/shop/{shopid}`.
- `notibot.openUserCard()`: Navigates to `/lp/{shopid}`.
- `notibot.submitForm(formId, answers)`: Отправляет ответы формы в Notibot. Возвращает `Promise`.
  - Формат `answers`: `[{ title: "Название поля", answers: ["Значение"] }]`.
  - Защита от спама: не более одной отправки раз в 3 секунды для одного `formId`.

---

## 📝 Работа с формами через Bridge

Для интеграции кастомных Vibe-форм с системой сбора ответов Notibot используется метод `notibot.submitForm`.

### 1. Подготовка схемы формы (Vibe JSON)
Перед интеграцией формы скачайте её схему в панели управления Notibot (в самом низу вкладки **Настройки** конструктора формы). 

Положите полученный JSON-файл в корневую папку вашего Vibe-проекта. При разработке или генерации кода AI-агент автоматически найдет этот файл, считает структуру полей, типы данных и ID формы, чтобы сгенерировать точный HTML-интерфейс и JS-обработчик отправки.

Вы получите JSON-файл следующего формата:

```json
{
  "formId": "65cd1efbc1b29a0012f45abc",
  "formName": "Обратная связь",
  "questions": [
    {
      "title": "Ваш Email",
      "type": "email",
      "required": true
    },
    {
      "title": "Как вас зовут?",
      "type": "text",
      "required": true
    },
    {
      "title": "Интересы",
      "type": "checkbox",
      "options": ["Спорт", "Музыка", "IT"]
    }
  ]
}
```

### 2. Формат отправки ответов
При вызове метода `submitForm` массив `answers` должен содержать объекты, в которых поле `title` **строго совпадает** с заголовком вопроса из схемы (`title` вопроса).

```javascript
const answers = [
    {
        title: "Ваш Email",
        answers: ["user@example.com"]
    },
    {
        title: "Как вас зовут?",
        answers: ["Алексей"]
    },
    {
        title: "Интересы",
        answers: ["Спорт", "IT"] // Для чекбоксов передается массив выбранных вариантов
    }
];
```

### 3. Интеграция в JS-код (Пример)
Метод возвращает Promise, который можно обработать с помощью `.then()/.catch()` или `async/await`. 

> [!IMPORTANT]
> На бэкенд автоматически подмешиваются метаданные текущего авторизованного пользователя Notibot (`tg_id`, имя, аватар). Vibe-приложению передавать их самостоятельно не нужно.

```javascript
async function handleFormSubmit() {
    const formId = "65cd1efbc1b29a0012f45abc"; // ID из схемы формы
    const answers = [
        { title: "Ваш Email", answers: [document.getElementById('email').value] },
        { title: "Как вас зовут?", answers: [document.getElementById('name').value] }
    ];

    try {
        console.log("Отправка формы...");
        const result = await window.notibot.submitForm(formId, answers);
        
        console.log("Форма успешно сохранена на сервере:", result);
        alert("Спасибо за заполнение формы!");
    } catch (error) {
        // Ошибка может возникнуть при ошибке сети, неверном ID формы или срабатывании анти-спама
        console.error("Ошибка при отправке формы:", error.message);
        alert("Ошибка: " + error.message);
    }
}
```




