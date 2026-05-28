from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .models import UserRole
from .validators import validate_email


class UserRegister(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str
    password: str = Field(min_length=6, max_length=128)

    @field_validator("email")
    @classmethod
    def check_email(cls, v: str) -> str:
        return validate_email(v)

    @field_validator("name")
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


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    role: UserRole
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MessageOut(BaseModel):
    message: str


class CourseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    category: str
    level: str
    duration: int
    image_url: Optional[str] = None
    lessons_count: int = 0
    created_at: datetime


class CourseCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    description: str = Field(min_length=10)
    category: str
    level: str = "beginner"
    duration: int = Field(default=10, ge=1)
    image_url: Optional[str] = None


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    level: Optional[str] = None
    duration: Optional[int] = Field(default=None, ge=1)
    image_url: Optional[str] = None


class CourseDetailOut(CourseOut):
    is_enrolled: bool = False
    progress_percent: float = 0.0
    lessons: List["LessonOut"] = []


class LessonOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    course_id: int
    title: str
    content: Optional[str] = None
    video_url: Optional[str] = None
    order_index: int
    completed: bool = False


class LessonCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    content: Optional[str] = None
    video_url: Optional[str] = None
    order_index: int = 0


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    video_url: Optional[str] = None
    order_index: Optional[int] = None


class ProgressOut(BaseModel):
    course_id: int
    completed_lessons: int
    total_lessons: int
    progress_percent: float


class EnrolledCourseOut(BaseModel):
    id: int
    title: str
    category: str
    level: str
    image_url: Optional[str] = None
    progress_percent: float
    completed_lessons: int
    total_lessons: int


class UserUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str

    @field_validator("email")
    @classmethod
    def check_email(cls, v: str) -> str:
        return validate_email(v)

    @field_validator("name")
    @classmethod
    def check_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Имя слишком короткое")
        return v


class UserPasswordUpdate(BaseModel):
    old_password: str
    new_password: str = Field(min_length=6, max_length=128)

