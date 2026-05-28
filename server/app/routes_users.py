from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from .database import get_db
from .deps import get_current_user
from .models import Course, Enrollment, User
from .schemas import EnrolledCourseOut, UserUpdate, UserPasswordUpdate, UserOut, MessageOut
from .security import verify_password, hash_password
from .services.progress_service import course_progress

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me/courses", response_model=List[EnrolledCourseOut])
def my_courses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    enrollments = (
        db.query(Enrollment)
        .options(joinedload(Enrollment.course))
        .filter(Enrollment.user_id == current_user.id)
        .order_by(Enrollment.created_at.desc())
        .all()
    )
    result = []
    for enr in enrollments:
        course = enr.course
        if not course:
            continue
        completed, total, percent = course_progress(db, current_user.id, course.id)
        result.append(
            EnrolledCourseOut(
                id=course.id,
                title=course.title,
                category=course.category,
                level=course.level,
                image_url=course.image_url,
                progress_percent=percent,
                completed_lessons=completed,
                total_lessons=total,
            )
        )
    return result


@router.put("/me", response_model=UserOut)
def update_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    exists = db.query(User).filter(User.email == payload.email, User.id != current_user.id).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email уже занят")
    current_user.name = payload.name
    current_user.email = payload.email
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/me/password", response_model=MessageOut)
def update_password(
    payload: UserPasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Неверный старый пароль")
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return MessageOut(message="Пароль успешно изменён")

