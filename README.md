# Платформа онлайн-обучения

MVP: регистрация, авторизация, каталог курсов, запись на курс, уроки и прогресс.

Стек: React (Vite), Tailwind, FastAPI, SQLAlchemy, SQLite/PostgreSQL.

## Структура

- `client/` - фронтенд
- `server/` - API

## Запуск

Backend:

```bash
cd server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

В `.env` задайте `SECRET_KEY` и при необходимости пароли для seed-пользователей:

```
SEED_ADMIN_PASSWORD=ваш_пароль
SEED_USER_PASSWORD=ваш_пароль
```

Пароли не хранятся в коде - только в `.env` (файл не коммитится).

```bash
uvicorn main:app --reload
```

Frontend:

```bash
cd client
npm install
npm run dev
```

Сайт: http://localhost:5173  
API: http://localhost:8000/docs

## Реализовано (недели 1–2, начало 3)

- Регистрация, вход, JWT, роли user/admin
- Каталог с поиском и фильтрами
- Страница курса, запись на курс
- Уроки, отметка «пройдено», прогресс, навигация prev/next
- Seed-курсы (5 курсов с уроками)
