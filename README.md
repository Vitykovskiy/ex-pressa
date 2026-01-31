# ex-pressa

Телеграм‑бот на NestJS. База данных — PostgreSQL (в dev поднимается через Docker).

## Требования

- Node.js 20+
- Docker (для dev базы)

## Установка

```bash
npm install
```

## Настройка окружения

Создай `.env` из шаблона и заполни значения:

```bash
copy .env.example .env
```

## Запуск (dev)

База PostgreSQL в Docker, приложение локально:

```bash
docker compose up -d
npm run start:dev
```

## Запуск (prod)

1) Создай `.env` на сервере (не коммить в git).
2) Установи зависимости и собери проект:

```bash
npm install
npm run build
```

3) Запуск:

```bash
npm run start:prod
```

## Переменные окружения

- `TELEGRAM_BOT_TOKEN` — токен бота
- `DB_HOST` — хост PostgreSQL (в dev: `postgres`)
- `DB_PORT` — порт PostgreSQL (обычно `5432`)
- `DB_USER` — пользователь БД
- `DB_PASS` — пароль БД
- `DB_NAME` — имя БД
- `PORT` — порт приложения
- `WEB_APP_URL` — URL веб‑приложения
