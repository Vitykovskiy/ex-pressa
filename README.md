# ex-pressa

Телеграм-бот на NestJS. База данных — PostgreSQL

## Требования

- Node.js 20+
- Docker

## Установка

```bash
npm install
```

## Настройка окружения

Используются два файла окружения:

- `.env.dev` — для dev (сервис локально, БД в Docker)
- `.env.prod` — для prod (все в Docker)

В нужном файле необходимо указать значения переменных

## Запуск (dev)

База PostgreSQL в Docker, приложение локально:

```bash
docker compose -f docker-compose.dev.yaml --env-file .env.dev up -d
npm run start:dev
```

## Swagger

После запуска приложения Swagger доступен по адресу:

- `http://localhost:<PORT>/docs` (`PORT` в `.env`)

## Запуск (prod)

1. Создать `.env.prod` на сервере
2. Установить зависимости и собрать проект:

```bash
npm install
npm run build
```

3. Запуск:

```bash
docker compose -f docker-compose.prod.yaml --env-file .env.prod up -d
```

## Переменные окружения

- `TELEGRAM_BOT_TOKEN` — токен бота
- `AUTH_JWT_SECRET` - ключ для верификации JWT
- `SKIP_AUTH` - для отключения проверки авторизации значение `true` (только для разработки и тестирования),
- `DB_HOST` — хост PostgreSQL (dev: `localhost`, prod: `postgres`)
- `DB_PORT` — порт PostgreSQL (обычно `5432`)
- `DB_USER` — пользователь БД
- `DB_PASS` — пароль БД
- `DB_NAME` — имя БД
- `PORT` — порт приложения
- `WEB_APP_URL` — URL веб-приложения
