from datetime import datetime

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..models import Certificate, Enrollment, Lesson, LessonProgress


def recalculate_course_progress(db: Session, user_id: int, course_id: int):
    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == user_id, Enrollment.course_id == course_id)
        .first()
    )
    if not enrollment:
        return None

    lessons = db.query(Lesson).filter(Lesson.course_id == course_id).all()
    total = len(lessons)
    if total == 0:
        enrollment.progress_percent = 0.0
        db.commit()
        return enrollment

    lesson_ids = [l.id for l in lessons]
    completed = 0
    if lesson_ids:
        completed = (
            db.query(LessonProgress)
            .filter(
                LessonProgress.user_id == user_id,
                LessonProgress.lesson_id.in_(lesson_ids),
                LessonProgress.completed.is_(True),
            )
            .count()
        )

    enrollment.progress_percent = round((completed / total) * 100, 1)

    if enrollment.progress_percent >= 100 and not enrollment.completed_at:
        enrollment.completed_at = datetime.utcnow()
        _issue_certificate(db, user_id, course_id)

    db.commit()
    db.refresh(enrollment)
    return enrollment


def _issue_certificate(db: Session, user_id: int, course_id: int):
    existing = (
        db.query(Certificate)
        .filter(Certificate.user_id == user_id, Certificate.course_id == course_id)
        .first()
    )
    if existing:
        return existing

    code = f"AE-{course_id:04d}-{user_id:05d}-{datetime.utcnow().strftime('%Y%m')}"
    cert = Certificate(user_id=user_id, course_id=course_id, code=code)
    try:
        db.add(cert)
        db.commit()
    except IntegrityError:
        db.rollback()
    return cert
