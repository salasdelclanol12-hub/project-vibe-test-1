---
name: Amvera Deploy Agent
description: Помогает подготовить и опубликовать Vibe-лендинг на платформе Amvera Cloud через Docker. Запускается при запросе развернуть или деплоить проект на Amvera.
---

# Скилл: Деплой статического сайта на Amvera Cloud

Этот скилл помогает агенту настроить проект Vibe HTML Kit для корректного развертывания на российской PaaS-платформе Amvera. 

Поскольку Amvera запускает проекты в контейнерах от лица непривилегированного пользователя (non-root), стандартные веб-серверы на порту 80 вызывают ошибку 500. Мы используем специальную сборку Nginx на порту 8080.

---

## Шаг 1. Проверка готовности проекта

Перед началом убедись, что:
1. `index.html` существует в корне проекта.
2. Инициализирован Git-репозиторий (проверь наличие каталога `.git`).

---

## Шаг 2. Создание конфигурационных файлов

Создай или обнови следующие файлы в корне проекта:

### 1. [Dockerfile](file:///Users/evgenijkudrasov/WebstormProjects/lead-magnet-loons/Dockerfile)
Используй непривилегированный образ Nginx (порт 8080 по умолчанию) и скопируй файлы с правильным владельцем:
```dockerfile
FROM nginxinc/nginx-unprivileged:alpine
COPY --chown=101:101 . /usr/share/nginx/html
```

### 2. [.dockerignore](file:///Users/evgenijkudrasov/WebstormProjects/lead-magnet-loons/.dockerignore)
Исключи кэш, тяжелые архивы и служебные папки из сборки контейнера:
```text
.git
.gemini
node_modules
README.md
Dockerfile
*.zip
*.tar.gz
```

### 3. [amvera.yml](file:///Users/evgenijkudrasov/WebstormProjects/lead-magnet-loons/amvera.yml)
Настрой порт контейнера на `"8080"`, а внешний порт сервиса на `"80"`:
```yaml
meta:
  environment: docker
  toolchain:
    name: docker
build:
  dockerfile: Dockerfile
  skip: false
run:
  image: null
  command: null
  args: null
  persistenceMount: /data
  containerPort: "8080"
  servicePort: "80"
```

### 4. [.gitignore](file:///Users/evgenijkudrasov/WebstormProjects/lead-magnet-loons/.gitignore)
Убедись, что временные архивы и архивы с бэкапами (например, `*.zip`, `.env`) исключены из репозитория:
```text
.DS_Store
.env
*.log
node_modules/
dodo.zip
*.zip
*.tar.gz
```

---

## Шаг 3. Инструкция для пользователя по привязке репозитория

1. Проверь настроенные remotes: `git remote -v`.
2. Если удаленного репозитория `amvera` нет, спроси у пользователя URL его проекта в Amvera (вида `https://git.msk0.amvera.ru/...`) и добавь его:
   ```bash
   git remote add amvera <URL_РЕПОЗИТОРИЯ_AMVERA>
   ```

---

## Шаг 4. Настройка в панели Amvera

Попроси пользователя:
1. Зайти в личный кабинет Amvera → вкладка **«Конфигурация»**.
2. Указать в поле **containerPort** значение `8080` (вместо 80) и сохранить изменения.

---

## Шаг 5. Отправка изменений и деплой

Объясни пользователю, как закоммитить и отправить код. 
> ⚠️ **Важно:** Поскольку локальная ветка обычно называется `main`, а Amvera по умолчанию слушает ветку `master` и содержит автогенерируемый коммит настроек панели, нужно использовать принудительную отправку:

```bash
git add .
git commit -m "Configure Amvera deployment"
git push amvera main:master -f
```

Предупреди пользователя, что Git запросит логин и пароль от его аккаунта Amvera (если соединение настроено по HTTPS). После отправки сборка займет около 3-5 минут.
