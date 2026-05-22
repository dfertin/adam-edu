from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from .database import get_db
from .deps import get_current_user
from .models import Certificate, Course, Enrollment, Lesson, LessonProgress, User
from .schemas import CertificateOut, ProgressOut

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.get("/my-courses", response_model=List[ProgressOut])
def my_courses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    enrollments = (
        db.query(Enrollment)
        .options(joinedload(Enrollment.course))
        .filter(Enrollment.user_id == current_user.id)
        .order_by(Enrollment.enrolled_at.desc())
        .all()
    )
    result = []
    for enr in enrollments:
        course = enr.course
        if not course:
            continue
        total = db.query(Lesson).filter(Lesson.course_id == course.id).count()
        completed = (
            db.query(LessonProgress)
            .join(Lesson)
            .filter(
                LessonProgress.user_id == current_user.id,
                Lesson.course_id == course.id,
                LessonProgress.completed.is_(True),
            )
            .count()
        )
        result.append(
            ProgressOut(
                course_id=course.id,
                course_title=course.title,
                course_slug=course.slug,
                image_url=course.image_url,
                progress_percent=enr.progress_percent,
                completed_lessons=completed,
                total_lessons=total,
                enrolled_at=enr.enrolled_at,
                completed_at=enr.completed_at,
            )
        )
    return result


@router.get("/certificates", response_model=List[CertificateOut])
def my_certificates(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    certs = db.query(Certificate).filter(Certificate.user_id == current_user.id).all()
    result = []
    for cert in certs:
        course = db.query(Course).filter(Course.id == cert.course_id).first()
        result.append(
            CertificateOut(
                id=cert.id,
                code=cert.code,
                course_id=cert.course_id,
                course_title=course.title if course else "",
                issued_at=cert.issued_at,
            )
        )
    return result


@router.get("/certificates/verify/{code}", response_model=CertificateOut)
def verify_certificate(code: str, db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.code == code).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Сертификат не найден")
    course = db.query(Course).filter(Course.id == cert.course_id).first()
    return CertificateOut(
        id=cert.id,
        code=cert.code,
        course_id=cert.course_id,
        course_title=course.title if course else "",
        issued_at=cert.issued_at,
    )
