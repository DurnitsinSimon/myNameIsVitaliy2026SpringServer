# Развёртывание ИнПАД в Kubernetes

Инструкция по развёртыванию системы ИнПАД (бэкенд + фронтенд + PostgreSQL + MinIO + WordPress) в локальном кластере Kubernetes с нуля.

---

## Архитектура

Система состоит из компонентов, развёртываемых в namespace `inpad`:

| Компонент | Назначение |
|-----------|------------|
| **inpad-backend** | NestJS API (порт 3000) |
| **inpad-frontend** | React + nginx (порт 80), проксирует `/api` на бэкенд |
| **postgres** | База данных приложения (порт 5432) |
| **minio** | S3-совместимое хранилище файлов (порты 9000/9001) |
| **wordpress** | Публичный сайт (порт 80) |
| **wordpress-mysql** | База данных WordPress (порт 3306) |

Внутри кластера компоненты находят друг друга по именам сервисов через DNS Kubernetes.

---

## Предварительные требования

- **Docker Desktop** с включённым Kubernetes
  (Settings → Kubernetes → Enable Kubernetes)
- **kubectl** (входит в Docker Desktop)

Проверка, что кластер работает:

```bash
kubectl get nodes
```

Должен показать узел `docker-desktop` в статусе `Ready`.

---

## Шаг 1. Сборка Docker-образов

Образы собираются локально. Kubernetes в Docker Desktop видит локальные образы напрямую.

### Бэкенд

В корне репозитория бэкенда:

```bash
docker build -t inpad-backend:1.0 .
```

### Фронтенд

В корне репозитория фронтенда:

```bash
docker build -t inpad-frontend:1.0 .
```

Проверка, что образы собраны:

```bash
docker images | grep inpad
```

---

## Шаг 2. Развёртывание в Kubernetes

Все манифесты находятся в папке `k8s/`. Применяются по порядку (нумерация в именах файлов).

```bash
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-secrets.yaml
kubectl apply -f k8s/02-postgres.yaml
kubectl apply -f k8s/03-minio.yaml
kubectl apply -f k8s/04-backend.yaml
kubectl apply -f k8s/05-wordpress.yaml
kubectl apply -f k8s/06-frontend.yaml
```

Или одной командой (применит все файлы из папки):

```bash
kubectl apply -f k8s/
```

### Проверка статуса

```bash
kubectl get pods -n inpad
```

Дождитесь, пока все поды перейдут в статус `Running` (`READY 1/1`). Первый запуск занимает 1–3 минуты — Kubernetes скачивает образы PostgreSQL, MinIO, WordPress, MySQL.

Бэкенд при старте автоматически применяет миграции базы данных — таблицы создаются сами.

---

## Шаг 3. Создание администратора

После того как `inpad-backend` в статусе `Running`, создайте администратора.

Пробросьте порт бэкенда:

```bash
kubectl port-forward -n inpad deployment/inpad-backend 3000:3000
```

В браузере откройте `http://localhost:3000/docs` (Swagger). Зарегистрируйте пользователя через `POST /api/auth/register`:

```json
{
  "email": "admin@inpad.ru",
  "password": "admin123",
  "name": "Администратор"
}
```

Затем повысьте его до администратора (в новом терминале):

```bash
kubectl exec -n inpad deployment/postgres -- psql -U inpad_user -d inpad_db -c "UPDATE \"User\" SET role='ADMIN' WHERE email='admin@inpad.ru';"
```

Должно вывести `UPDATE 1`.

---

## Шаг 4. Настройка MinIO

Создайте bucket для файлов. Пробросьте консоль MinIO:

```bash
kubectl port-forward -n inpad deployment/minio 9001:9001
```

Откройте `http://localhost:9001` (логин/пароль `minioadmin` / `minioadmin`),
создайте bucket с именем **inpad-media**.

---

## Шаг 5. Настройка WordPress

WordPress требует ручной первичной настройки через браузер.

### 5.1. Установка

Пробросьте порт WordPress:

```bash
kubectl port-forward -n inpad deployment/wordpress 8090:80
```

Откройте `http://localhost:8090`, пройдите мастер установки:
- выберите язык;
- задайте название сайта, логин и пароль администратора, email;
- нажмите «Установить WordPress», затем войдите.

### 5.2. Постоянные ссылки (для REST API)

В админке: **Настройки → Постоянные ссылки** → выберите **Название записи** → сохранить.
Без этого WordPress REST API возвращает 404.

### 5.3. Application Password (для интеграции с бэкендом)

В админке: **Пользователи → Профиль** → раздел **Application Passwords** →
введите имя (например `inpad-backend`) → **Add New Application Password**.
Скопируйте сгенерированный пароль (показывается один раз).

### 5.4. Связка бэкенда с WordPress

Впишите данные WordPress в `k8s/01-secrets.yaml` (значения `WORDPRESS_URL`,
`WORDPRESS_USER`, `WORDPRESS_APP_PASSWORD`), затем примените секрет и
перезапустите бэкенд:

```bash
kubectl apply -f k8s/01-secrets.yaml
kubectl rollout restart deployment/inpad-backend -n inpad
```

> Примечание: внутри кластера адрес WordPress — `http://wordpress:8080`.

---

## Шаг 6. Открытие приложения

Пробросьте порт фронтенда:

```bash
kubectl port-forward -n inpad deployment/inpad-frontend 8082:80
```

Откройте `http://localhost:8082`, войдите под администратором
(`admin@inpad.ru` / `admin123`).

Система работает: фронтенд → (nginx-прокси `/api`) → бэкенд → PostgreSQL + MinIO.

---

## Полезные команды

```bash
# Все ресурсы проекта
kubectl get all -n inpad

# Логи бэкенда
kubectl logs -n inpad deployment/inpad-backend

# Статус подов
kubectl get pods -n inpad

# Удалить всё развёртывание
kubectl delete namespace inpad
```

---

## Структура манифестов

```
k8s/
├── 00-namespace.yaml    # Пространство имён inpad
├── 01-secrets.yaml      # Пароли и секреты
├── 02-postgres.yaml     # PostgreSQL + PVC + Service
├── 03-minio.yaml        # MinIO + PVC + Service
├── 04-backend.yaml      # Бэкенд Deployment + Service
├── 05-wordpress.yaml    # WordPress + MySQL
└── 06-frontend.yaml     # Фронтенд Deployment + Service
```

---

## Примечания

- Пароли в `01-secrets.yaml` хранятся в открытом виде для простоты развёртывания.
  В production используются зашифрованные секреты (Sealed Secrets, внешние хранилища).
- Данные PostgreSQL, MinIO и WordPress сохраняются в PersistentVolumeClaim и
  переживают перезапуск подов.
- Образы собираются локально с тегом `1.0`. При пересборке используйте тот же тег
  или обновите его в манифестах `04-backend.yaml` и `06-frontend.yaml`.
