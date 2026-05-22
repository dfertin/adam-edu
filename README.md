# adam-edu

Веб-платформа для просмотра образовательных курсов.

Стек: React (Vite), Tailwind, FastAPI, SQLAlchemy, SQLite.

## Структура

- `client/` — фронтенд
- `server/` — API и бизнес-логика

## Запуск

Backend:

```
cd server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Frontend:

```
cd client
npm install
npm run dev
```

Сайт: http://localhost:5173  
API: http://localhost:8000/docs

## Ветки

- `main` — основная версия
- `develop` — разработка (по необходимости)
