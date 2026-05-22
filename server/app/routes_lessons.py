from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from .database import get_db
from .deps import get_current_user, get_current_user_optional
from .models import Course, Enrollment, Lesson, LessonProgress, Quiz, User
from .schemas import LessonDetailOut, LessonOut, LessonProgressUpdate, MessageOut
from .services.progress_service import recalculate_course_progress

router = APIRouter(prefix="/lessons", tags=["Lessons"])


def _can_access_lesson(lesson: Lesson, user: User | None, db: Session) -> bool:
    if lesson.is_free_preview:
        return True
    if not user:
        return False
    enr = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == user.id, Enrollment.course_id == lesson.course_id)
        .first()
    )
    return enr is not None


@router.get("/course/{course_slug}", response_model=List[LessonOut])
def list_lessons(
    course_slug: str,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    course = db.query(Course).filter(Course.slug == course_slug).first()
    if not course:
        raise HTTPException(status_code=404, detail="Курс не найден")

    lessons = db.query(Lesson).filter(Lesson.course_id == course.id).order_by(Lesson.order.asc()).all()
    progress_map = {}
    if user and lessons:
        lesson_ids = [l.id for l in lessons]
        records = (
            db.query(LessonProgress)
            .filter(LessonProgress.user_id == user.id, LessonProgress.lesson_id.in_(lesson_ids))
            .all()
        )
        progress_map = {r.lesson_id: r for r in records}

    result = []
    for lesson in lessons:
        prog = progress_map.get(lesson.id)
        has_quiz = db.query(Quiz).filter(Quiz.lesson_id == lesson.id).first() is not None
        can_access = _can_access_lesson(lesson, user, db)
        result.append(
            LessonOut(
                id=lesson.id,
                title=lesson.title,
                slug=lesson.slug,
                content=lesson.content if can_access else None,
                video_url=None,
                duration_minutes=lesson.duration_minutes,
                order=lesson.order,
                is_free_preview=lesson.is_free_preview,
                completed=bool(prog.completed) if prog else False,
                watch_percent=float(prog.watch_percent or 0) if prog else 0.0,
                has_quiz=has_quiz,
            )
        )
    return result


@router.get("/{lesson_id}", response_model=LessonDetailOut)
def get_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    lesson = db.query(Lesson).options(joinedload(Lesson.course)).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Урок не найден")

    if not _can_access_lesson(lesson, user, db):
        raise HTTPException(status_code=403, detail="Сначала запишитесь на курс")

    prog = (
        db.query(LessonProgress)
        .filter(LessonProgress.user_id == user.id, LessonProgress.lesson_id == lesson.id)
        .first()
    )
    has_quiz = db.query(Quiz).filter(Quiz.lesson_id == lesson.id).first() is not None

    return LessonDetailOut(
        id=lesson.id,
        title=lesson.title,
        slug=lesson.slug,
        content=lesson.content,
        video_url=None,
        duration_minutes=lesson.duration_minutes,
        order=lesson.order,
        is_free_preview=lesson.is_free_preview,
        completed=bool(prog.completed) if prog else False,
        watch_percent=float(prog.watch_percent or 0) if prog else 0.0,
        has_quiz=has_quiz,
        course_id=lesson.course_id,
        course_title=lesson.course.title,
        course_slug=lesson.course.slug,
    )


@router.post("/{lesson_id}/progress", response_model=MessageOut)
def update_progress(
    lesson_id: int,
    payload: LessonProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Урок не найден")

    if not _can_access_lesson(lesson, current_user, db):
        raise HTTPException(status_code=403, detail="Нет доступа к уроку")

    prog = (
        db.query(LessonProgress)
        .filter(LessonProgress.user_id == current_user.id, LessonProgress.lesson_id == lesson_id)
        .first()
    )
    if not prog:
        prog = LessonProgress(user_id=current_user.id, lesson_id=lesson_id, watch_percent=0.0)
        db.add(prog)

    current_percent = float(prog.watch_percent or 0)
    prog.watch_percent = max(current_percent, float(payload.watch_percent))
    if payload.completed or prog.watch_percent >= 90:
        prog.completed = True
        prog.completed_at = datetime.utcnow()

    db.commit()

    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == current_user.id, Enrollment.course_id == lesson.course_id)
        .first()
    )
    if enrollment:
        recalculate_course_progress(db, current_user.id, lesson.course_id)

    return MessageOut(message="Прогресс сохранён")
