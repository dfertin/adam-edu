from sqlalchemy.orm import Session

from .config import settings
from .models import Course, Lesson, User, UserRole
from .security import hash_password


def seed_data(db: Session):
    if db.query(Course).first():
        return

    if settings.SEED_ADMIN_PASSWORD and settings.SEED_USER_PASSWORD:
        admin = User(
            email=settings.SEED_ADMIN_EMAIL,
            name=settings.SEED_ADMIN_NAME,
            hashed_password=hash_password(settings.SEED_ADMIN_PASSWORD),
            role=UserRole.admin,
        )
        user = User(
            email=settings.SEED_USER_EMAIL,
            name=settings.SEED_USER_NAME,
            hashed_password=hash_password(settings.SEED_USER_PASSWORD),
            role=UserRole.user,
        )
        db.add_all([admin, user])
        db.flush()

    courses_data = [
        {
            "title": "React для начинающих",
            "description": "Основы React: компоненты, хуки, роутинг и работа с API.",
            "category": "Программирование",
            "level": "beginner",
            "duration": 20,
            "image_url": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600",
            "lessons": [
                ("Введение в React", "React — библиотека для UI. Установка и первый компонент.", "https://www.youtube.com/embed/Dp60T421bpc"),
                ("Компоненты и props", "Создание переиспользуемых компонентов и передача данных.", "https://www.youtube.com/embed/Ke90Tje7VS0"),
                ("Состояние и хуки", "useState, useEffect и управление состоянием.", "https://www.youtube.com/embed/yznL1ZfWw6U"),
            ],
        },
        {
            "title": "Python и FastAPI",
            "description": "REST API на Python: маршруты, модели, JWT и PostgreSQL.",
            "category": "Программирование",
            "level": "intermediate",
            "duration": 24,
            "image_url": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600",
            "lessons": [
                ("Введение в FastAPI", "Создание приложения и первые эндпоинты.", "https://www.youtube.com/embed/tLKKmCg7M2Y"),
                ("SQLAlchemy и модели", "ORM, связи и миграции.", "https://www.youtube.com/embed/3KIPM982U-M"),
                ("JWT авторизация", "Регистрация, логин и защита маршрутов.", "https://www.youtube.com/embed/Ke1Y4O0C-_c"),
            ],
        },
        {
            "title": "Основы PostgreSQL",
            "description": "SQL, индексы, связи и проектирование схемы БД.",
            "category": "Базы данных",
            "level": "beginner",
            "duration": 16,
            "image_url": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600",
            "lessons": [
                ("SELECT и фильтрация", "Базовые запросы и условия WHERE.", "https://www.youtube.com/embed/e1MhyMef598"),
                ("JOIN и связи", "Объединение таблиц и внешние ключи.", "https://www.youtube.com/embed/85pVn-g__P8"),
            ],
        },
        {
            "title": "DevOps Start",
            "description": "Docker, CI/CD и основы деплоя приложений.",
            "category": "DevOps",
            "level": "beginner",
            "duration": 18,
            "image_url": "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=600",
            "lessons": [
                ("Docker основы", "Контейнеры, образы и docker-compose.", "https://www.youtube.com/embed/3c-iBn73dDE"),
                ("GitHub Actions", "Автоматизация сборки и тестов.", "https://www.youtube.com/embed/R8_veQiYBsI"),
            ],
        },
        {
            "title": "Git и GitHub",
            "description": "Версионирование, ветки, pull request и совместная работа.",
            "category": "Инструменты",
            "level": "beginner",
            "duration": 12,
            "image_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
            "lessons": [
                ("Коммиты и ветки", "git init, add, commit, branch.", "https://www.youtube.com/embed/zPqeeTf2v80"),
                ("Pull request", "Fork, PR и code review.", "https://www.youtube.com/embed/H37H3WwH0Bw"),
            ],
        },
    ]

    for cd in courses_data:
        lessons = cd.pop("lessons")
        course = Course(**cd)
        db.add(course)
        db.flush()
        for i, (title, content, video_url) in enumerate(lessons):
            db.add(
                Lesson(
                    course_id=course.id,
                    title=title,
                    content=content,
                    video_url=video_url,
                    order_index=i,
                )
            )

    db.commit()
