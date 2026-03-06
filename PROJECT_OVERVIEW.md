# Ex-Pressa — Обзор проекта для AI-агента

> Документ описывает текущее состояние backend-проекта по состоянию на март 2026 года.
> Предназначен для быстрого погружения AI-агента в архитектуру и логику системы.

---

## 1. Что это за проект

**Ex-Pressa** — backend-сервис для кофейни на базе **Telegram Mini App**.

- Пользователь открывает Telegram-бота, нажимает кнопку «Открыть меню» и попадает в веб-приложение (Mini App).
- В Mini App он видит каталог товаров, формирует корзину, выбирает тайм-слот и оформляет заказ.
- Бариста видит заказы и управляет ими.

**Стек:**
- Runtime: Node.js 20+
- Framework: NestJS 11 (TypeScript)
- ORM: TypeORM 0.3 + PostgreSQL
- Telegram: Telegraf + nestjs-telegraf, @tma.js/sdk
- Auth: JWT (jsonwebtoken), cookie-based сессии
- Docs: Swagger (@nestjs/swagger) — доступен по `/docs`
- Инфраструктура: Docker, docker-compose (dev и prod варианты)

---

## 2. Запуск и окружение

### Переменные окружения (`.env`)

| Переменная | Назначение |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Токен Telegram-бота |
| `AUTH_JWT_SECRET` | Секрет для подписи JWT |
| `DB_HOST` | Хост PostgreSQL (default: `localhost`) |
| `DB_PORT` | Порт PostgreSQL (default: `5432`) |
| `DB_USER` | Пользователь БД (default: `postgres`) |
| `DB_PASS` | Пароль БД (default: `postgres`) |
| `DB_NAME` | Имя БД (default: `ex-pressa`) |
| `PORT` | Порт сервера (default: `3000`) |
| `WEB_APP_URL` | URL фронтенда Mini App (используется для CORS и кнопки в боте) |
| `SKIP_AUTH` | `true` — отключает проверку JWT (для разработки) |
| `NODE_ENV` | `production` — включает secure-cookies |

### TypeORM
Используется `synchronize: true` — схема БД синхронизируется автоматически при старте. Миграций нет.

---

## 3. Структура файлов

```
src/
├── main.ts                          # Bootstrap: CORS, cookie-parser, Swagger, listen
├── app.module.ts                    # Корневой модуль: TypeORM, Telegraf, все модули, глобальные guards
└── modules/
    ├── auth/                        # Авторизация
    │   ├── auth.module.ts
    │   ├── auth.controller.ts       # POST /auth/telegram, GET /auth/me
    │   ├── auth.service.ts          # verifyTelegramInitData, issueToken, verifyToken
    │   ├── auth.guard.ts            # Глобальный guard (JWT из cookie "session")
    │   ├── roles.guard.ts           # Глобальный RolesGuard (проверяет @Roles())
    │   ├── roles.decorator.ts       # @Roles(...codes) — декоратор для ограничения доступа
    │   ├── helpers.ts               # verifyTelegramInitData, parseBoolean
    │   ├── public.decorator.ts      # @Public() — пропустить guard
    │   ├── types.ts                 # SessionPayload { sub, tgId }
    │   └── index.ts
    ├── users/                       # Пользователи
    │   ├── users.module.ts
    │   ├── user.entity.ts           # Таблица users
    │   ├── users.service.ts         # CRUD + подтверждение аккаунта
    │   ├── dto/create-user.dto.ts
    │   ├── roles/
    │   │   ├── role.entity.ts       # Таблица roles
    │   │   └── role-code.enum.ts    # USER | BARISTA | ADMIN
    │   ├── controllers/
    │   │   ├── users.bot.controller.ts  # Telegram @Start — регистрирует пользователя
    │   │   └── users.http.controller.ts # REST: список, подтверждение аккаунтов
    │   └── index.ts
    ├── catalog/                     # Каталог товаров
    │   ├── catalog.module.ts
    │   ├── catalog.controller.ts    # REST эндпоинты каталога (полный CRUD)
    │   ├── catalog.service.ts       # Бизнес-логика каталога
    │   ├── entities/
    │   │   ├── product-group.entity.ts
    │   │   ├── product.entity.ts
    │   │   ├── product-price.entity.ts
    │   │   ├── addon-group.entity.ts
    │   │   ├── addon.entity.ts
    │   │   └── product-group-addon-group.entity.ts
    │   ├── enums/
    │   │   ├── product-type.enum.ts    # DRINK | FOOD | MERCH
    │   │   └── drink-size-code.enum.ts # S | M | L
    │   ├── dto/
    │   │   ├── create-product-group.dto.ts
    │   │   ├── update-product-group.dto.ts
    │   │   ├── create-product.dto.ts
    │   │   ├── update-product.dto.ts
    │   │   ├── create-product-price.dto.ts
    │   │   ├── replace-product-prices.dto.ts
    │   │   ├── set-product-availability.dto.ts
    │   │   ├── create-addon-group.dto.ts
    │   │   ├── update-addon-group.dto.ts
    │   │   ├── create-addon.dto.ts
    │   │   ├── update-addon.dto.ts
    │   │   └── link-addon-group.dto.ts
    │   └── index.ts
    ├── cart/                        # Корзина
    │   ├── cart.module.ts
    │   ├── cart.controller.ts       # REST эндпоинты корзины (userId из JWT)
    │   ├── cart.service.ts          # Бизнес-логика корзины
    │   ├── cart.entity.ts
    │   ├── cart-item.entity.ts
    │   ├── cart-item-addon.entity.ts
    │   ├── dto/
    │   │   ├── add-cart-item.dto.ts
    │   │   └── update-cart-item.dto.ts
    │   └── index.ts
    └── orders/                      # Заказы
        ├── orders.module.ts
        ├── orders.controller.ts     # REST эндпоинты заказов
        ├── orders.service.ts        # Бизнес-логика заказов + смена статусов
        ├── notifications.service.ts # Telegram-уведомления клиенту и баристе
        ├── order.entity.ts
        ├── order-item.entity.ts
        ├── order-item-addon.entity.ts
        ├── order-status.enum.ts     # CREATED | CONFIRMED | REJECTED | READY | CLOSED
        ├── time-slot.entity.ts
        ├── time-slot.service.ts     # Автогенерация слотов при запуске и в полночь
        ├── time-slot.controller.ts  # GET /time-slots/active
        ├── dto/
        │   ├── create-order.dto.ts
        │   ├── orders-filter.dto.ts
        │   ├── update-order-status.dto.ts
        │   └── reject-order.dto.ts
        └── index.ts
```

---

## 4. Модули — детальное описание

### 4.1 AppModule (`src/app.module.ts`)

Корневой модуль. Настраивает:
- `ConfigModule.forRoot({ isGlobal: true })` — `.env` доступен везде
- `ScheduleModule.forRoot()` — поддержка cron-задач
- `TypeOrmModule.forRootAsync` — подключение к PostgreSQL, `autoLoadEntities: true`, `synchronize: true`
- `TelegrafModule.forRootAsync` — инициализация бота по `TELEGRAM_BOT_TOKEN`
- Глобальный `APP_GUARD` → `AuthGuard` (JWT-аутентификация)
- Глобальный `APP_GUARD` → `RolesGuard` (проверка ролей через `@Roles()`)
- Импортирует: `UsersModule`, `AuthModule`, `CatalogModule`, `CartModule`, `OrdersModule`

---

### 4.2 AuthModule

**Назначение:** аутентификация через Telegram Mini App, выдача JWT-сессии.

#### `AuthGuard` (глобальный)
- Читает cookie `session`, декодирует JWT, загружает пользователя (с ролями) → `request.user`
- Пропускает `@Public()` маршруты и режим `SKIP_AUTH=true`

#### `RolesGuard` (глобальный)
- Читает требуемые роли из `@Roles('BARISTA', 'ADMIN')`
- Если роли не указаны — пропускает. Иначе проверяет `user.roles`.

#### Эндпоинты
| Метод | URL | Auth | Описание |
|---|---|---|---|
| POST | `/auth/telegram` | Public | Авторизация через Telegram initData |
| GET | `/auth/me` | JWT | Текущий пользователь |

---

### 4.3 UsersModule

#### Сущность `User` (таблица `users`)
| Поле | Тип | Описание |
|---|---|---|
| `id` | number PK | |
| `name` | string(120) | Имя пользователя |
| `tgId` | string nullable | Telegram user ID (уникальный) |
| `tgUsername` | string nullable | @username |
| `isActive` | boolean | |
| `isConfirmed` | boolean | Подтверждён ли аккаунт (default: false) |
| `confirmationRequestedAt` | timestamptz nullable | Время подачи заявки |
| `createdAt` / `updatedAt` | timestamp | |
| `roles` | Role[] | ManyToMany через `user_roles` |

#### Эндпоинты `/users`
| Метод | URL | Роли | Описание |
|---|---|---|---|
| GET | `/users` | BARISTA, ADMIN | Все пользователи |
| POST | `/users/me/confirm-request` | JWT | Подать заявку на подтверждение |
| GET | `/users/pending-confirmation` | BARISTA, ADMIN | Ожидают подтверждения |
| PATCH | `/users/:id/confirm` | BARISTA, ADMIN | Подтвердить аккаунт |

---

### 4.4 CatalogModule

#### Эндпоинты `/catalog`
| Метод | URL | Роли | Описание |
|---|---|---|---|
| GET | `/catalog` | JWT | Полный каталог |
| GET | `/catalog/products/:id` | JWT | Товар по ID |
| GET | `/catalog/addon-groups` | JWT | Группы аддонов |
| POST | `/catalog/product-groups` | ADMIN | Создать группу |
| PATCH | `/catalog/product-groups/:id` | ADMIN | Обновить группу |
| DELETE | `/catalog/product-groups/:id` | ADMIN | Удалить группу |
| POST | `/catalog/products` | ADMIN | Создать товар |
| PATCH | `/catalog/products/:id` | ADMIN | Обновить товар |
| DELETE | `/catalog/products/:id` | ADMIN | Удалить товар |
| PUT | `/catalog/products/:id/prices` | ADMIN | Заменить все цены товара |
| PATCH | `/catalog/products/:id/availability` | BARISTA, ADMIN | Переключить isAvailable |
| POST | `/catalog/product-prices` | ADMIN | Создать цену |
| POST | `/catalog/addon-groups` | ADMIN | Создать группу аддонов |
| PATCH | `/catalog/addon-groups/:id` | ADMIN | Обновить группу аддонов |
| DELETE | `/catalog/addon-groups/:id` | ADMIN | Удалить группу аддонов |
| POST | `/catalog/addons` | ADMIN | Создать аддон |
| PATCH | `/catalog/addons/:id` | ADMIN | Обновить аддон |
| DELETE | `/catalog/addons/:id` | ADMIN | Удалить аддон |
| POST | `/catalog/addon-groups/link` | ADMIN | Связать аддон-группу с группой товаров |

---

### 4.5 CartModule

userId берётся из JWT (`request.user`), **не из URL**.

#### Эндпоинты `/cart`
| Метод | URL | Описание |
|---|---|---|
| GET | `/cart` | Корзина текущего пользователя |
| POST | `/cart/items` | Добавить позицию |
| PATCH | `/cart/items/:itemId` | Изменить количество |
| DELETE | `/cart/items/:itemId` | Удалить позицию |
| DELETE | `/cart` | Очистить корзину |

---

### 4.6 OrdersModule

#### Машина состояний заказа
```
CREATED → CONFIRMED → READY → CLOSED
                   ↘ REJECTED
```
При `CLOSED` и `REJECTED` — `bookedCount` слота декрементируется.

#### `NotificationsService`
- При переходе в `READY` — Telegram-сообщение клиенту
- Cron `*/2 * * * *` — напоминает баристам о заказах в статусе `CREATED`

#### `TimeSlotService`
- Генерирует слоты на сегодня при старте (idempotent) и в полночь
- 09:00–20:00, интервал 10 мин, вместимость 5 (захардкожено)

#### Эндпоинты `/orders`
| Метод | URL | Роли | Описание |
|---|---|---|---|
| POST | `/orders/from-cart` | JWT | Создать заказ из корзины |
| GET | `/orders/history` | JWT | История заказов текущего пользователя |
| POST | `/orders/search` | BARISTA, ADMIN | Заказы с фильтрами (status, dateFrom, dateTo) |
| PATCH | `/orders/:id/status` | BARISTA, ADMIN | Сменить статус (CONFIRMED/READY/CLOSED) |
| POST | `/orders/:id/reject` | BARISTA, ADMIN | Отклонить заказ с причиной |

#### Эндпоинты `/time-slots`
| Метод | URL | Описание |
|---|---|---|
| GET | `/time-slots/active` | Активные слоты на сегодня |

---

## 5. Схема базы данных

```
users
├── id PK, name, tg_id (unique), tg_username
├── is_active, is_confirmed, confirmation_requested_at
└── created_at, updated_at

roles: id PK, code (USER|BARISTA|ADMIN), name
user_roles: user_id FK, role_id FK

product_groups: id PK, name, sort_order, is_active
products: id PK, group_id FK, name, description, type, is_active, is_available, sort_order
product_prices: id PK, product_id FK, size_code (S|M|L), price_rub, is_active

addon_groups: id PK, name, sort_order, is_active
addons: id PK, addon_group_id FK, name, price_rub, is_active
product_group_addon_groups: product_group_id PK FK, addon_group_id PK FK

carts: id PK, user_id FK, created_at, updated_at
cart_items: id PK, cart_id FK, product_id FK, product_name, size_code, quantity
cart_item_addons: id PK, cart_item_id FK, addon_id FK, addon_name, quantity

orders: id PK, user_id FK, time_slot_id FK, status, slot_time_from, slot_time_to,
        total_rub, reject_reason, created_at, confirmed_at, ready_at, closed_at, updated_at
order_items: id PK, order_id FK, product_name, quantity, size_code, unit_price_rub, line_total_rub
order_item_addons: id PK, order_item_id FK, addon_name, quantity, unit_price_rub, line_total_rub

time_slots: id PK, date, time_from, time_to, capacity, booked_count, is_active
```

---

## 6. Известные ограничения

1. **`synchronize: true`** — схема БД синхронизируется автоматически. Миграций нет. Риск на проде при изменении схемы.
2. **Рабочие часы захардкожены** — 09:00–20:00 и вместимость 5 — константы в `TimeSlotService`. API управления рабочими часами отсутствует.
3. **Автоотклонение заказов не реализовано** — заказы в `CREATED` без подтверждения остаются навсегда.
