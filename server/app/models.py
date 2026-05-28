from __future__ import annotations

from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class UserRole(str, PyEnum):
    user = "user"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.user, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    enrollments: Mapped[list[Enrollment]] = relationship(back_populates="user")
    progress: Mapped[list[LessonProgress]] = relationship(back_populates="user")


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String, index=True, nullable=False)
    level: Mapped[str] = mapped_column(String, default="beginner")
    duration: Mapped[int] = mapped_column(Integer, default=10)
    image_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    lessons: Mapped[list[Lesson]] = relationship(back_populates="course", order_by="Lesson.order_index")
    enrollments: Mapped[list[Enrollment]] = relationship(back_populates="course")


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    course_id: Mapped[int] = mapped_column(Integer, ForeignKey("courses.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    video_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    course: Mapped[Course] = relationship(back_populates="lessons")
    progress_records: Mapped[list[LessonProgress]] = relationship(back_populates="lesson")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    course_id: Mapped[int] = mapped_column(Integer, ForeignKey("courses.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("user_id", "course_id", name="uq_enrollment"),)

    user: Mapped[User] = relationship(back_populates="enrollments")
    course: Mapped[Course] = relationship(back_populates="enrollments")


class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id: Mapped[int] = mapped_column(Integer, ForeignKey("lessons.id"), nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    __table_args__ = (UniqueConstraint("user_id", "lesson_id", name="uq_lesson_progress"),)

    user: Mapped[User] = relationship(back_populates="progress")
    lesson: Mapped[Lesson] = relationship(back_populates="progress_records")
