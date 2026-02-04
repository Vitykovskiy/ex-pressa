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

Используется файл окружения `.env`

## Запуск (dev)

База PostgreSQL в Docker, приложение локально:

```bash
docker compose -f docker-compose.dev.yaml up -d
npm run start:dev
```

## Swagger

После запуска приложения Swagger доступен по адресу:

- `http://localhost:<PORT>/docs` (`PORT` в `.env`)

## Запуск (prod)

1. Создать `.env` на сервере
2. Установить зависимости и собрать проект:

```bash
npm install
npm run build
```

3. Запуск:

```bash
docker compose -f docker-compose.prod.yaml up -d
```

## Переменные окружения

- `TELEGRAM_BOT_TOKEN` — токен бота
- `AUTH_JWT_SECRET` - ключ для верификации JWT
- `DB_HOST` — хост PostgreSQL (dev: `localhost`, prod: `postgres`)
- `DB_PORT` — порт PostgreSQL (обычно `5432`)
- `DB_USER` — пользователь БД
- `DB_PASS` — пароль БД
- `DB_NAME` — имя БД
- `PORT` — порт приложения
- `WEB_APP_URL` — URL веб-приложения
