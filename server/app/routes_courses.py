from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .database import get_db
from .deps import get_current_user, get_current_user_optional, require_admin
from .models import Course, Enrollment, Lesson, LessonProgress, User
from .schemas import CourseCreate, CourseDetailOut, CourseOut, CourseUpdate, LessonOut, MessageOut, ProgressOut
from .services.progress_service import course_progress

router = APIRouter(prefix="/courses", tags=["Courses"])


def _course_out(course: Course, db: Session) -> CourseOut:
    lessons_count = db.query(Lesson).filter(Lesson.course_id == course.id).count()
    return CourseOut(
        id=course.id,
        title=course.title,
        description=course.description,
        category=course.category,
        level=course.level,
        duration=course.duration,
        image_url=course.image_url,
        lessons_count=lessons_count,
        created_at=course.created_at,
    )


def _lesson_out(lesson: Lesson, enrolled: bool, user: User | None, db: Session) -> LessonOut:
    completed = False
    if user:
        prog = (
            db.query(LessonProgress)
            .filter(LessonProgress.user_id == user.id, LessonProgress.lesson_id == lesson.id)
            .first()
        )
        completed = bool(prog and prog.completed)
    return LessonOut(
        id=lesson.id,
        course_id=lesson.course_id,
        title=lesson.title,
        content=lesson.content if enrolled else None,
        video_url=lesson.video_url if enrolled else None,
        order_index=lesson.order_index,
        completed=completed,
    )


@router.get("", response_model=List[CourseOut])
def list_courses(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    level: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Course)
    if search:
        query = query.filter(
            Course.title.ilike(f"%{search}%") | Course.description.ilike(f"%{search}%")
        )
    if category:
        query = query.filter(Course.category == category)
    if level:
        query = query.filter(Course.level == level)
    courses = query.order_by(Course.created_at.desc()).all()
    return [_course_out(c, db) for c in courses]


@router.get("/{course_id}", response_model=CourseDetailOut)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Курс не найден")

    base = _course_out(course, db)
    is_enrolled = False
    progress_percent = 0.0
    if user:
        enr = (
            db.query(Enrollment)
            .filter(Enrollment.user_id == user.id, Enrollment.course_id == course.id)
            .first()
        )
        if enr:
            is_enrolled = True
            _, _, progress_percent = course_progress(db, user.id, course.id)

    lessons = (
        db.query(Lesson)
        .filter(Lesson.course_id == course.id)
        .order_by(Lesson.order_index.asc())
        .all()
    )
    lesson_items = [_lesson_out(l, is_enrolled, user, db) for l in lessons]

    return CourseDetailOut(
        **base.model_dump(),
        is_enrolled=is_enrolled,
        progress_percent=progress_percent,
        lessons=lesson_items,
    )


@router.post("", response_model=CourseOut)
def create_course(
    payload: CourseCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    course = Course(**payload.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return _course_out(course, db)


@router.put("/{course_id}", response_model=CourseOut)
def update_course(
    course_id: int,
    payload: CourseUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Курс не найден")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(course, field, value)
    db.commit()
    db.refresh(course)
    return _course_out(course, db)


@router.delete("/{course_id}", response_model=MessageOut)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Курс не найден")
    db.delete(course)
    db.commit()
    return MessageOut(message="Курс удалён")


@router.post("/{course_id}/enroll", response_model=MessageOut)
def enroll_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Курс не найден")

    exists = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == current_user.id, Enrollment.course_id == course.id)
        .first()
    )
    if exists:
        return MessageOut(message="Вы уже записаны на этот курс")

    db.add(Enrollment(user_id=current_user.id, course_id=course.id))
    db.commit()
    return MessageOut(message="Вы успешно записались на курс")


@router.get("/{course_id}/progress", response_model=ProgressOut)
def get_progress(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Курс не найден")

    enr = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == current_user.id, Enrollment.course_id == course_id)
        .first()
    )
    if not enr:
        raise HTTPException(status_code=403, detail="Сначала запишитесь на курс")

    completed, total, percent = course_progress(db, current_user.id, course_id)
    return ProgressOut(
        course_id=course_id,
        completed_lessons=completed,
        total_lessons=total,
        progress_percent=percent,
    )
