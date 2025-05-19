# 🛠️ Tool Shop

Полноценный pet‑project‑маркетплейс: **Django + DRF** на backend, **React (Vite)** на frontend, платежи через **Stripe Checkout**, хранение медиа в S3‑совместимом MinIO.

---

## 📂 Структура репозитория

```text
tool‑shop/
├── backend/               # Django + DRF (см. дерево ниже)
└── frontend/              # Vite + React (см. дерево ниже)
```

<details>
<summary><strong>backend</strong></summary>

```text
backend/
├── apps/                  # доменные приложения
│   ├── shop/              # каталог, корзина, заказы, отзывы
│   │   ├── models.py
│   │   ├── serializers/
│   │   ├── filters.py
│   │   ├── views.py       # REST‑эндпоинты + Stripe
│   │   └── urls.py
│   └── users/             # кастомная модель пользователя + JWT
│       └── ...
├── config/                # Django‑конфигурация
│   ├── settings/          # base / dev / prod / local
│   ├── urls.py            # точка входа DRF
│   └── storages.py        # S3 (MinIO) backend через django‑storages
├── manage.py
└── pyproject.toml
```

</details>

<details>
<summary><strong>frontend</strong></summary>

```text
frontend/
├── src/
│   ├── api/               # fetch‑обёртки
│   ├── assets/            # статичные картинки
│   ├── components/        # общие React‑компоненты (Header и т.д.)
│   ├── pages/             # роуты (Products, Cart, Orders, …)
│   ├── store/             # (зарезервировано под Zustand/Redux)
│   ├── main.tsx           # React‑entry
│   └── vite-env.d.ts
├── index.html
└── vite.config.ts
```

</details>

---

## ✨ Функционал

* **Каталог товаров** c фильтрами, сортировкой и поиском
* **Карточка товара** с отзывами и «недавно просмотренными»
* **Корзина** (JWT‑защита) – добавление/удаление, оформление заказа
* **Stripe Checkout**
  – success / cancel URLs приходят из env‑переменной `FRONTEND_URL`
  – веб‑хук подтверждает оплату, меняет статус заказа
* **Личный кабинет** – список заказов + статус оплаты
* **Админ‑панель** Django для менеджеров
* **Хранение изображений** в MinIO (S3 strictly compatible)

---

## 🚀 Демонстрация

| Каталог                       | Корзина                    | Stripe Checkout                | Личный кабинет               |
| ----------------------------- | -------------------------- | ------------------------------ | ---------------------------- |
| ![](docs/screens/catalog.png) | ![](docs/screens/cart.png) | ![](docs/screens/checkout.png) | ![](docs/screens/orders.png) |

---

## ⚙️ Быстрый старт (dev)

### 1. Docker‑compose

```bash
docker compose up -d
```

Поднимет:

| Сервис         | Порт  | Описание                       |
| -------------- | ----- | ------------------------------ |
| **backend**    | 8000  | Django + DRF                   |
| **frontend**   | 5173  | Vite dev‑server                |
| **minio**      | 9000  | S3‑хранилище                   |
| **stripe‑cli** | 12111 | Локальный прокси для веб‑хуков |

### 2. Миграции и суперюзер

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

### 3. Env‑переменные

`.env` (корень проекта):

```dotenv
# Django
SECRET_KEY=...
DEBUG=1
ALLOWED_HOSTS=*

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Storage
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_STORAGE_BUCKET_NAME=local-bucket-shop
AWS_S3_ENDPOINT_URL=http://minio:9000

# Front
FRONTEND_URL=http://localhost:5173
```

---

## 🏗️ Сборка production

### Backend


### Frontend



---

## 🧩 Архитектура

![diagram](docs/architecture.svg)

* Django → Stripe Checkout → redirect → Front `/success`
* Front подтверждает оплату `/payment-status/{session_id}`
* Stripe также шлёт **webhook** → `/stripe/webhook`
  (двойная проверка + fail‑safe)

---

## 📝 API кратко

| Метод                                       | URL                            | Описание |
| ------------------------------------------- | ------------------------------ | -------- |
| `GET /api/shop/products`                    | список товаров                 |          |
| `GET /api/shop/product/<id>`                | товар + отзывы                 |          |
| `POST /api/shop/cart/<id>`                  | добавить в корзину             |          |
| `DELETE /api/shop/cart/<id>`                | удалить из корзины             |          |
| `POST /api/shop/order`                      | создать заказ + Stripe session |          |
| `GET /api/shop/payment-status/<session_id>` | статус оплаты                  |          |
| `POST /stripe/webhook`                      | Stripe webhooks                |          |

Полная спецификация → `docs/openapi.yaml`.

---

## 🧪 Тесты

```bash
docker compose exec backend pytest
```

---

## 🙌 Contributing

1. Fork → Feature branch → PR
2. Pre‑commit hooks (`black`, `ruff`, `isort`)
3. Описание изменений в CHANGELOG.

---

## 📜 License

MIT © 2025 Vlad Hramenko 💚
