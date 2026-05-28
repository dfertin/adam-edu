from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import get_db
from .deps import get_current_user, require_admin
from .models import Course, Enrollment, Lesson, LessonProgress, User
from .schemas import LessonCreate, LessonOut, LessonUpdate, MessageOut
from .services.progress_service import course_progress

router = APIRouter(tags=["Lessons"])


def _require_enrollment(db: Session, user: User, course_id: int) -> None:
    enr = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == user.id, Enrollment.course_id == course_id)
        .first()
    )
    if not enr:
        raise HTTPException(status_code=403, detail="Сначала запишитесь на курс")


def _lesson_completed(db: Session, user_id: int, lesson_id: int) -> bool:
    prog = (
        db.query(LessonProgress)
        .filter(LessonProgress.user_id == user_id, LessonProgress.lesson_id == lesson_id)
        .first()
    )
    return bool(prog and prog.completed)


@router.get("/courses/{course_id}/lessons", response_model=List[LessonOut])
def list_lessons(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Курс не найден")
    _require_enrollment(db, current_user, course_id)

    lessons = (
        db.query(Lesson)
        .filter(Lesson.course_id == course_id)
        .order_by(Lesson.order_index.asc())
        .all()
    )
    result = []
    for lesson in lessons:
        result.append(
            LessonOut(
                id=lesson.id,
                course_id=lesson.course_id,
                title=lesson.title,
                content=lesson.content,
                video_url=lesson.video_url,
                order_index=lesson.order_index,
                completed=_lesson_completed(db, current_user.id, lesson.id),
            )
        )
    return result


@router.get("/lessons/{lesson_id}", response_model=LessonOut)
def get_lesson(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Урок не найден")
    _require_enrollment(db, current_user, lesson.course_id)

    return LessonOut(
        id=lesson.id,
        course_id=lesson.course_id,
        title=lesson.title,
        content=lesson.content,
        video_url=lesson.video_url,
        order_index=lesson.order_index,
        completed=_lesson_completed(db, current_user.id, lesson.id),
    )


@router.post("/courses/{course_id}/lessons", response_model=LessonOut)
def create_lesson(
    course_id: int,
    payload: LessonCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Курс не найден")

    lesson = Lesson(course_id=course_id, **payload.model_dump())
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return LessonOut(
        id=lesson.id,
        course_id=lesson.course_id,
        title=lesson.title,
        content=lesson.content,
        video_url=lesson.video_url,
        order_index=lesson.order_index,
        completed=False,
    )


@router.put("/lessons/{lesson_id}", response_model=LessonOut)
def update_lesson(
    lesson_id: int,
    payload: LessonUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Урок не найден")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(lesson, field, value)
    db.commit()
    db.refresh(lesson)
    return LessonOut(
        id=lesson.id,
        course_id=lesson.course_id,
        title=lesson.title,
        content=lesson.content,
        video_url=lesson.video_url,
        order_index=lesson.order_index,
        completed=False,
    )


@router.delete("/lessons/{lesson_id}", response_model=MessageOut)
def delete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Урок не найден")
    db.delete(lesson)
    db.commit()
    return MessageOut(message="Урок удалён")


@router.post("/lessons/{lesson_id}/complete", response_model=MessageOut)
def complete_lesson(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Урок не найден")
    _require_enrollment(db, current_user, lesson.course_id)

    prog = (
        db.query(LessonProgress)
        .filter(LessonProgress.user_id == current_user.id, LessonProgress.lesson_id == lesson_id)
        .first()
    )
    if not prog:
        prog = LessonProgress(user_id=current_user.id, lesson_id=lesson_id)
        db.add(prog)

    prog.completed = True
    prog.completed_at = datetime.utcnow()
    db.commit()

    course_progress(db, current_user.id, lesson.course_id)
    return MessageOut(message="Урок отмечен как пройденный")
