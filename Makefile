.PHONY: up down restart logs migrate seed ps

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose down && docker compose up -d

logs:
	docker compose logs -f

migrate:
	docker compose exec server alembic upgrade head

seed:
	docker compose exec server python app/utils/seed.py

ps:
	docker compose ps