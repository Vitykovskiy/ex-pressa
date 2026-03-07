# ex-pressa

Telegram-бот на NestJS. База данных — PostgreSQL.

## Требования

- Node.js 20+
- Docker

## Установка

```bash
npm install
```

## Настройка окружения

Используется файл `.env`.

## Запуск (dev)

```bash
docker compose -f docker-compose.dev.yaml up -d
npm run start:dev
```

## Тестовая БД

Для тестирования используется отдельный PostgreSQL на порту `5433`.

```bash
docker compose -f docker-compose.test.yml up -d
```

Чтобы полностью очистить тестовую БД:

```bash
docker compose -f docker-compose.test.yml down
```

## Swagger

После запуска приложения:

- `http://localhost:<PORT>/docs`

## Запуск (prod)

```bash
npm install
npm run build
docker compose -f docker-compose.prod.yaml up -d
```

## Переменные окружения

- `TELEGRAM_BOT_TOKEN` — токен бота
- `AUTH_JWT_SECRET` — ключ для JWT
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` — параметры PostgreSQL
- `PORT` — порт приложения
- `WEB_APP_URL` — URL фронтенда (можно перечислить несколько через запятую)
- `SKIP_AUTH` — `true` отключает JWT-проверку (только для dev/test)
