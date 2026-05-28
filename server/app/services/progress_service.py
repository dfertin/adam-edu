from sqlalchemy.orm import Session

from ..models import Enrollment, Lesson, LessonProgress


def course_progress(db: Session, user_id: int, course_id: int) -> tuple[int, int, float]:
    total = db.query(Lesson).filter(Lesson.course_id == course_id).count()
    if total == 0:
        return 0, 0, 0.0
    completed = (
        db.query(LessonProgress)
        .join(Lesson)
        .filter(
            LessonProgress.user_id == user_id,
            Lesson.course_id == course_id,
            LessonProgress.completed.is_(True),
        )
        .count()
    )
    percent = round((completed / total) * 100, 1)
    return completed, total, percent
