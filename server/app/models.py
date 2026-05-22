from __future__ import annotations

from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class UserRole(str, PyEnum):
    student = "student"
    instructor = "instructor"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.student, nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    enrollments: Mapped[list[Enrollment]] = relationship(back_populates="user")
    reviews: Mapped[list[Review]] = relationship(back_populates="user")
    comments: Mapped[list[Comment]] = relationship(back_populates="user")
    progress: Mapped[list[LessonProgress]] = relationship(back_populates="user")
    certificates: Mapped[list[Certificate]] = relationship(back_populates="user")
    notifications: Mapped[list[Notification]] = relationship(back_populates="user")
    quiz_attempts: Mapped[list[QuizAttempt]] = relationship(back_populates="user")


class EmailVerification(Base):
    __tablename__ = "email_verifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    token: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    used: Mapped[bool] = mapped_column(Boolean, default=False)


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    icon: Mapped[str] = mapped_column(String, default="book")

    courses: Mapped[list[Course]] = relationship(back_populates="category")


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    short_description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    price: Mapped[int] = mapped_column(Integer, default=0)
    level: Mapped[str] = mapped_column(String, default="beginner")
    duration_hours: Mapped[int] = mapped_column(Integer, default=10)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    instructor_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey("categories.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category: Mapped[Category] = relationship(back_populates="courses")
    lessons: Mapped[list[Lesson]] = relationship(back_populates="course", order_by="Lesson.order")
    reviews: Mapped[list[Review]] = relationship(back_populates="course")
    enrollments: Mapped[list[Enrollment]] = relationship(back_populates="course")


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    course_id: Mapped[int] = mapped_column(Integer, ForeignKey("courses.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    video_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=15)
    order: Mapped[int] = mapped_column(Integer, default=0)
    is_free_preview: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    course: Mapped[Course] = relationship(back_populates="lessons")
    comments: Mapped[list[Comment]] = relationship(back_populates="lesson")
    quiz: Mapped[Optional[Quiz]] = relationship(back_populates="lesson", uselist=False)
    progress_records: Mapped[list[LessonProgress]] = relationship(back_populates="lesson")


class Quiz(Base):
    __tablename__ = "quizzes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    lesson_id: Mapped[int] = mapped_column(Integer, ForeignKey("lessons.id"), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    passing_score: Mapped[int] = mapped_column(Integer, default=70)

    lesson: Mapped[Lesson] = relationship(back_populates="quiz", lazy="joined")
    questions: Mapped[list[Question]] = relationship(back_populates="quiz", order_by="Question.order")
    attempts: Mapped[list[QuizAttempt]] = relationship(back_populates="quiz")


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    quiz_id: Mapped[int] = mapped_column(Integer, ForeignKey("quizzes.id"), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0)

    quiz: Mapped[Quiz] = relationship(back_populates="questions")
    options: Mapped[list[QuestionOption]] = relationship(back_populates="question", order_by="QuestionOption.order")


class QuestionOption(Base):
    __tablename__ = "question_options"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    question_id: Mapped[int] = mapped_column(Integer, ForeignKey("questions.id"), nullable=False)
    text: Mapped[str] = mapped_column(String, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)
    order: Mapped[int] = mapped_column(Integer, default=0)

    question: Mapped[Question] = relationship(back_populates="options")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_id: Mapped[int] = mapped_column(Integer, ForeignKey("quizzes.id"), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    passed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="quiz_attempts")
    quiz: Mapped[Quiz] = relationship(back_populates="attempts")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    course_id: Mapped[int] = mapped_column(Integer, ForeignKey("courses.id"), nullable=False)
    progress_percent: Mapped[float] = mapped_column(Float, default=0.0)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    __table_args__ = (UniqueConstraint("user_id", "course_id", name="uq_enrollment"),)

    user: Mapped[User] = relationship(back_populates="enrollments")
    course: Mapped[Course] = relationship(back_populates="enrollments")


class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id: Mapped[int] = mapped_column(Integer, ForeignKey("lessons.id"), nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    watch_percent: Mapped[float] = mapped_column(Float, default=0.0)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    __table_args__ = (UniqueConstraint("user_id", "lesson_id", name="uq_lesson_progress"),)

    user: Mapped[User] = relationship(back_populates="progress")
    lesson: Mapped[Lesson] = relationship(back_populates="progress_records")


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id: Mapped[int] = mapped_column(Integer, ForeignKey("lessons.id"), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="comments")
    lesson: Mapped[Lesson] = relationship(back_populates="comments")


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    stars: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    course_id: Mapped[int] = mapped_column(Integer, ForeignKey("courses.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("user_id", "course_id", name="uq_review"),)

    user: Mapped[User] = relationship(back_populates="reviews")
    course: Mapped[Course] = relationship(back_populates="reviews")


class Certificate(Base):
    __tablename__ = "certificates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    course_id: Mapped[int] = mapped_column(Integer, ForeignKey("courses.id"), nullable=False)
    code: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    issued_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("user_id", "course_id", name="uq_certificate"),)

    user: Mapped[User] = relationship(back_populates="certificates")
    course: Mapped[Course] = relationship()


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="notifications")
