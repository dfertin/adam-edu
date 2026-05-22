from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import get_db
from .deps import get_current_user
from .models import Comment, Enrollment, Lesson, User
from .schemas import CommentCreate, CommentOut

router = APIRouter(prefix="/comments", tags=["Comments"])


@router.get("/lesson/{lesson_id}", response_model=List[CommentOut])
def list_comments(lesson_id: int, db: Session = Depends(get_db)):
    comments = (
        db.query(Comment)
        .filter(Comment.lesson_id == lesson_id)
        .order_by(Comment.created_at.desc())
        .all()
    )
    result = []
    for c in comments:
        user = db.query(User).filter(User.id == c.user_id).first()
        result.append(
            CommentOut(
                id=c.id,
                text=c.text,
                created_at=c.created_at,
                user_id=c.user_id,
                user_name=user.full_name if user else "Аноним",
                avatar_url=user.avatar_url if user else None,
            )
        )
    return result


@router.post("/lesson/{lesson_id}", response_model=CommentOut)
def add_comment(
    lesson_id: int,
    payload: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Урок не найден")

    enr = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == current_user.id, Enrollment.course_id == lesson.course_id)
        .first()
    )
    if not enr and not lesson.is_free_preview:
        raise HTTPException(status_code=403, detail="Нет доступа")

    comment = Comment(user_id=current_user.id, lesson_id=lesson_id, text=payload.text)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return CommentOut(
        id=comment.id,
        text=comment.text,
        created_at=comment.created_at,
        user_id=comment.user_id,
        user_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
    )
