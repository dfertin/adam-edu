import math
import re
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from .database import get_db
from .deps import get_current_user, get_current_user_optional
from .models import Category, Course, Enrollment, Lesson, Review, User
from .schemas import (
    CategoryOut,
    CourseDetailOut,
    CourseListOut,
    MessageOut,
    PaginatedCourses,
    ReviewCreate,
    ReviewOut,
)
from .services.notification_service import create_notification

router = APIRouter(prefix="/courses", tags=["Courses"])


def _slugify(text: str) -> str:
    s = text.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s, flags=re.UNICODE)
    s = re.sub(r"[\s_-]+", "-", s)
    return s[:80] or "course"


def _course_to_list(course: Course, db: Session) -> CourseListOut:
    lessons_count = db.query(Lesson).filter(Lesson.course_id == course.id).count()
    agg = (
        db.query(func.avg(Review.stars), func.count(Review.id))
        .filter(Review.course_id == course.id)
        .first()
    )
    avg_stars = agg[0] if agg else None
    review_count = agg[1] if agg else 0
    rating_avg = round(float(avg_stars or 0), 1)
    reviews_count = int(review_count or 0)
    return CourseListOut(
        id=course.id,
        title=course.title,
        slug=course.slug,
        short_description=course.short_description,
        image_url=course.image_url,
        price=course.price,
        level=course.level,
        duration_hours=course.duration_hours,
        lessons_count=lessons_count,
        rating_avg=rating_avg,
        reviews_count=reviews_count,
        category=course.category,
    )


@router.get("/categories", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.name.asc()).all()


@router.get("", response_model=PaginatedCourses)
def list_courses(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=30),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    level: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Course).options(joinedload(Course.category)).filter(Course.is_published.is_(True))
    if search:
        query = query.filter(
            Course.title.ilike(f"%{search}%") | Course.description.ilike(f"%{search}%")
        )
    if category:
        query = query.join(Category).filter(Category.slug == category)
    if level:
        query = query.filter(Course.level == level)

    total = query.count()
    courses = (
        query.order_by(Course.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    items = [_course_to_list(c, db) for c in courses]
    pages = max(1, math.ceil(total / page_size))
    return PaginatedCourses(items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.get("/{slug}", response_model=CourseDetailOut)
def get_course(
    slug: str,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
):
    course = (
        db.query(Course)
        .options(joinedload(Course.category))
        .filter(Course.slug == slug, Course.is_published.is_(True))
        .first()
    )
    if not course:
        raise HTTPException(status_code=404, detail="Курс не найден")

    base = _course_to_list(course, db)
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
            progress_percent = enr.progress_percent

    return CourseDetailOut(
        **base.model_dump(),
        description=course.description,
        is_enrolled=is_enrolled,
        progress_percent=progress_percent,
    )


@router.post("/{slug}/enroll", response_model=MessageOut)
def enroll_course(slug: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.slug == slug).first()
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
    create_notification(
        db,
        current_user.id,
        "Запись на курс",
        f"Вы записались на курс «{course.title}»",
    )
    return MessageOut(message="Вы успешно записались на курс")


@router.get("/{slug}/reviews", response_model=List[ReviewOut])
def list_reviews(slug: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.slug == slug).first()
    if not course:
        raise HTTPException(status_code=404, detail="Курс не найден")
    reviews = db.query(Review).filter(Review.course_id == course.id).order_by(Review.created_at.desc()).all()
    result = []
    for r in reviews:
        user = db.query(User).filter(User.id == r.user_id).first()
        result.append(
            ReviewOut(
                id=r.id,
                text=r.text,
                stars=r.stars,
                created_at=r.created_at,
                user_id=r.user_id,
                user_name=user.full_name if user else "Аноним",
            )
        )
    return result


@router.post("/{slug}/reviews", response_model=ReviewOut)
def add_review(
    slug: str,
    payload: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.slug == slug).first()
    if not course:
        raise HTTPException(status_code=404, detail="Курс не найден")

    enr = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == current_user.id, Enrollment.course_id == course.id)
        .first()
    )
    if not enr:
        raise HTTPException(status_code=403, detail="Запишитесь на курс, чтобы оставить отзыв")

    existing = (
        db.query(Review)
        .filter(Review.user_id == current_user.id, Review.course_id == course.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Вы уже оставили отзыв")

    review = Review(text=payload.text, stars=payload.stars, user_id=current_user.id, course_id=course.id)
    db.add(review)
    db.commit()
    db.refresh(review)
    return ReviewOut(
        id=review.id,
        text=review.text,
        stars=review.stars,
        created_at=review.created_at,
        user_id=review.user_id,
        user_name=current_user.full_name,
    )
