import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .database import get_db
from .deps import get_current_user
from .models import EmailVerification, User
from .schemas import MessageOut, Token, UserCreate, UserLogin, UserOut, UserUpdate
from .security import create_access_token, hash_password, verify_password
from .services.email_service import send_verification_email
from .config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])


def _create_verification(db: Session, user: User) -> str:
    token = secrets.token_urlsafe(32)
    record = EmailVerification(
        user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=settings.EMAIL_VERIFICATION_EXPIRE_HOURS),
    )
    db.add(record)
    db.commit()
    send_verification_email(user.email, token)
    return token


@router.post("/register", response_model=Token)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email уже зарегистрирован")

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    if settings.SMTP_HOST:
        _create_verification(db, user)
    return Token(access_token=create_access_token(str(user.id)))


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный email или пароль")
    if not user.is_verified:
        user.is_verified = True
        db.commit()
    return Token(access_token=create_access_token(str(user.id)))


@router.get("/verify-email", response_model=MessageOut)
def verify_email(token: str, db: Session = Depends(get_db)):
    record = (
        db.query(EmailVerification)
        .filter(EmailVerification.token == token, EmailVerification.used.is_(False))
        .first()
    )
    if not record or record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Недействительная или просроченная ссылка")

    user = db.query(User).filter(User.id == record.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="Пользователь не найден")
    user.is_verified = True
    record.used = True
    db.commit()
    return MessageOut(message="Email подтверждён. Теперь можно войти.")


@router.post("/resend-verification", response_model=MessageOut)
def resend_verification(email: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return MessageOut(message="Если email существует, письмо отправлено.")
    if user.is_verified:
        return MessageOut(message="Email уже подтверждён.")
    _create_verification(db, user)
    return MessageOut(message="Письмо отправлено повторно.")


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_me(payload: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user
