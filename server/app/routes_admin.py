import re
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import get_db
from .deps import require_admin, require_instructor
from .models import Course, Lesson, Question, QuestionOption, Quiz, User
from .schemas import CourseCreate, LessonCreate, MessageOut, UserOut

router = APIRouter(prefix="/admin", tags=["Admin"])


def _slugify(text: str) -> str:
    s = text.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s, flags=re.UNICODE)
    s = re.sub(r"[\s_-]+", "-", s)
    return s[:80] or "item"


@router.get("/users", response_model=List[UserOut])
def list_users(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.get("/courses")
def admin_list_courses(_: User = Depends(require_instructor), db: Session = Depends(get_db)):
    return db.query(Course).order_by(Course.created_at.desc()).all()


@router.post("/courses", response_model=MessageOut)
def create_course(
    payload: CourseCreate,
    current_user: User = Depends(require_instructor),
    db: Session = Depends(get_db),
):
    slug = _slugify(payload.title)
    if db.query(Course).filter(Course.slug == slug).first():
        slug = f"{slug}-{db.query(Course).count() + 1}"

    course = Course(
        title=payload.title,
        slug=slug,
        description=payload.description,
        short_description=payload.short_description or payload.description[:200],
        category_id=payload.category_id,
        price=payload.price,
        level=payload.level,
        duration_hours=payload.duration_hours,
        image_url=payload.image_url,
        instructor_id=current_user.id,
    )
    db.add(course)
    db.commit()
    return MessageOut(message=f"Курс создан: {slug}")


@router.post("/courses/{course_id}/lessons", response_model=MessageOut)
def create_lesson(
    course_id: int,
    payload: LessonCreate,
    _: User = Depends(require_instructor),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Курс не найден")

    slug = _slugify(payload.title)
    lesson = Lesson(
        course_id=course_id,
        title=payload.title,
        slug=slug,
        content=payload.content,
        video_url=payload.video_url,
        duration_minutes=payload.duration_minutes,
        order=payload.order,
        is_free_preview=payload.is_free_preview,
    )
    db.add(lesson)
    db.commit()
    return MessageOut(message="Урок создан")


@router.post("/lessons/{lesson_id}/quiz", response_model=MessageOut)
def create_sample_quiz(lesson_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Урок не найден")
    if db.query(Quiz).filter(Quiz.lesson_id == lesson_id).first():
        raise HTTPException(status_code=400, detail="Тест уже существует")

    quiz = Quiz(lesson_id=lesson_id, title=f"Тест: {lesson.title}", passing_score=70)
    db.add(quiz)
    db.flush()

    q1 = Question(quiz_id=quiz.id, text="Вы поняли материал урока?", order=0)
    db.add(q1)
    db.flush()
    db.add_all(
        [
            QuestionOption(question_id=q1.id, text="Да", is_correct=True, order=0),
            QuestionOption(question_id=q1.id, text="Нет", is_correct=False, order=1),
            QuestionOption(question_id=q1.id, text="Частично", is_correct=False, order=2),
        ]
    )
    db.commit()
    return MessageOut(message="Тест создан")
