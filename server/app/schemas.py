from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .models import UserRole
from .validators import validate_email


class UserCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: str
    password: str = Field(min_length=6, max_length=128)

    @field_validator("email")
    @classmethod
    def check_email(cls, v: str) -> str:
        return validate_email(v)

    @field_validator("full_name")
    @classmethod
    def check_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Имя слишком короткое")
        return v


class UserLogin(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def check_email(cls, v: str) -> str:
        return validate_email(v)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    role: UserRole
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    is_verified: bool
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MessageOut(BaseModel):
    message: str


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    icon: str

    class Config:
        from_attributes = True


class CourseListOut(BaseModel):
    id: int
    title: str
    slug: str
    short_description: Optional[str] = None
    image_url: Optional[str] = None
    price: int
    level: str
    duration_hours: int
    lessons_count: int = 0
    rating_avg: float = 0.0
    reviews_count: int = 0
    category: CategoryOut

    class Config:
        from_attributes = True


class CourseDetailOut(CourseListOut):
    description: str
    is_enrolled: bool = False
    progress_percent: float = 0.0


class CourseCreate(BaseModel):
    title: str
    description: str
    short_description: Optional[str] = None
    category_id: int
    price: int = 0
    level: str = "beginner"
    duration_hours: int = 10
    image_url: Optional[str] = None


class LessonOut(BaseModel):
    id: int
    title: str
    slug: str
    content: Optional[str] = None
    video_url: Optional[str] = None
    duration_minutes: int
    order: int
    is_free_preview: bool
    completed: bool = False
    watch_percent: float = 0.0
    has_quiz: bool = False

    class Config:
        from_attributes = True


class LessonDetailOut(LessonOut):
    course_id: int
    course_title: str
    course_slug: str


class LessonCreate(BaseModel):
    title: str
    content: Optional[str] = None
    video_url: Optional[str] = None
    duration_minutes: int = 15
    order: int = 0
    is_free_preview: bool = False


class QuestionOptionOut(BaseModel):
    id: int
    text: str

    class Config:
        from_attributes = True


class QuestionOut(BaseModel):
    id: int
    text: str
    options: List[QuestionOptionOut]

    class Config:
        from_attributes = True


class QuizOut(BaseModel):
    id: int
    title: str
    passing_score: int
    questions: List[QuestionOut]

    class Config:
        from_attributes = True


class QuizSubmit(BaseModel):
    answers: dict[int, int]


class QuizResultOut(BaseModel):
    score: int
    passed: bool
    correct_count: int
    total_count: int


class ProgressOut(BaseModel):
    course_id: int
    course_title: str
    course_slug: str
    image_url: Optional[str] = None
    progress_percent: float
    completed_lessons: int
    total_lessons: int
    enrolled_at: datetime
    completed_at: Optional[datetime] = None


class LessonProgressUpdate(BaseModel):
    watch_percent: float = Field(ge=0, le=100)
    completed: bool = False


class CommentCreate(BaseModel):
    text: str = Field(min_length=1, max_length=2000)


class CommentOut(BaseModel):
    id: int
    text: str
    created_at: datetime
    user_id: int
    user_name: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    text: str = Field(min_length=10, max_length=2000)
    stars: int = Field(ge=1, le=5)


class ReviewOut(BaseModel):
    id: int
    text: str
    stars: int
    created_at: datetime
    user_id: int
    user_name: str

    class Config:
        from_attributes = True


class CertificateOut(BaseModel):
    id: int
    code: str
    course_id: int
    course_title: str
    issued_at: datetime

    class Config:
        from_attributes = True


class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PaginatedCourses(BaseModel):
    items: List[CourseListOut]
    total: int
    page: int
    page_size: int
    pages: int


class UploadOut(BaseModel):
    url: str
    filename: str
