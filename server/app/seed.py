from datetime import datetime

from sqlalchemy.orm import Session

from .models import (
    Category,
    Course,
    Lesson,
    Question,
    QuestionOption,
    Quiz,
    User,
    UserRole,
)
from .security import hash_password


def seed_data(db: Session):
    if db.query(User).first():
        return

    admin = User(
        email="admin@gmail.com",
        full_name="Администратор",
        hashed_password=hash_password("admin123"),
        role=UserRole.admin,
        is_verified=True,
    )
    student = User(
        email="student@gmail.com",
        full_name="Студент Демо",
        hashed_password=hash_password("student123"),
        role=UserRole.student,
        is_verified=True,
    )
    db.add_all([admin, student])
    db.flush()

    categories = [
        Category(name="Программирование", slug="programming", icon="code"),
        Category(name="Дизайн", slug="design", icon="palette"),
        Category(name="Аналитика", slug="analytics", icon="chart"),
        Category(name="Маркетинг", slug="marketing", icon="megaphone"),
    ]
    db.add_all(categories)
    db.flush()

    courses_data = [
        {
            "title": "Python для начинающих",
            "slug": "python-basics",
            "description": "Полный курс Python с нуля: синтаксис, ООП, работа с файлами, API и проекты.",
            "short_description": "Освойте Python с нуля за 4 недели",
            "image_url": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800",
            "price": 0,
            "level": "beginner",
            "duration_hours": 24,
            "category_id": categories[0].id,
        },
        {
            "title": "React и современный Frontend",
            "slug": "react-frontend",
            "description": "Создавайте SPA на React: хуки, роутинг, state management, Tailwind и API.",
            "short_description": "Современная разработка интерфейсов",
            "image_url": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
            "price": 14990,
            "level": "intermediate",
            "duration_hours": 32,
            "category_id": categories[0].id,
        },
        {
            "title": "UI/UX Дизайн",
            "slug": "ui-ux-design",
            "description": "Принципы дизайна, Figma, прототипирование и usability-тестирование.",
            "short_description": "Дизайн интерфейсов от идеи до макета",
            "image_url": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
            "price": 9990,
            "level": "beginner",
            "duration_hours": 18,
            "category_id": categories[1].id,
        },
        {
            "title": "Data Science с нуля",
            "slug": "data-science",
            "description": "Pandas, NumPy, визуализация данных и введение в машинное обучение.",
            "short_description": "Анализ данных и ML основы",
            "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
            "price": 19990,
            "level": "advanced",
            "duration_hours": 40,
            "category_id": categories[2].id,
        },
        {
            "title": "Digital Marketing",
            "slug": "digital-marketing",
            "description": "SMM, SEO, контент-маркетинг и аналитика рекламных кампаний.",
            "short_description": "Продвижение в digital-среде",
            "image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
            "price": 4990,
            "level": "beginner",
            "duration_hours": 16,
            "category_id": categories[3].id,
        },
        {
            "title": "FastAPI Backend",
            "slug": "fastapi-backend",
            "description": "REST API, JWT, SQLAlchemy, тесты и деплой Python-приложений.",
            "short_description": "Backend на Python и FastAPI",
            "image_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
            "price": 12990,
            "level": "intermediate",
            "duration_hours": 28,
            "category_id": categories[0].id,
        },
    ]

    for cd in courses_data:
        course = Course(instructor_id=admin.id, **cd)
        db.add(course)
        db.flush()
        _seed_lessons(db, course)

    db.commit()


def _seed_lessons(db: Session, course: Course):
    lessons_config = [
        ("Введение в курс", True),
        ("Основные концепции", False),
        ("Практическое задание", False),
        ("Итоговый тест", False),
    ]
    for i, (title, is_free) in enumerate(lessons_config):
        slug = title.lower().replace(" ", "-")[:40]
        lesson = Lesson(
            course_id=course.id,
            title=title,
            slug=f"{slug}-{i}",
            content=f"<h2>{title}</h2><p>Материал урока курса «{course.title}». Изучите теорию и выполните практику.</p>",
            video_url=None,
            duration_minutes=20 + i * 5,
            order=i,
            is_free_preview=is_free,
        )
        db.add(lesson)
        db.flush()

        if i == len(lessons_config) - 1:
            quiz = Quiz(lesson_id=lesson.id, title=f"Тест: {title}", passing_score=70)
            db.add(quiz)
            db.flush()
            q = Question(quiz_id=quiz.id, text="Какой вывод из урока наиболее верен?", order=0)
            db.add(q)
            db.flush()
            db.add_all(
                [
                    QuestionOption(question_id=q.id, text="Материал усвоен полностью", is_correct=True, order=0),
                    QuestionOption(question_id=q.id, text="Материал не изучен", is_correct=False, order=1),
                    QuestionOption(question_id=q.id, text="Нужно пересмотреть", is_correct=False, order=2),
                ]
            )
