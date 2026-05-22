from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.routes_admin import router as admin_router
from app.routes_auth import router as auth_router
from app.routes_comments import router as comments_router
from app.routes_courses import router as courses_router
from app.routes_lessons import router as lessons_router
from app.routes_notifications import router as notifications_router
from app.routes_progress import router as progress_router
from app.routes_quizzes import router as quizzes_router
from app.routes_uploads import router as uploads_router
from app.seed import seed_data

app = FastAPI(title=f"{settings.APP_NAME} API", version="2.0.0")

origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    messages = []
    for err in exc.errors():
        field = err.get("loc", [])[-1] if err.get("loc") else ""
        msg = err.get("msg", "Ошибка")
        if msg.startswith("Value error, "):
            msg = msg[13:]
        if field == "email":
            messages.append(msg)
        elif field:
            messages.append(f"{field}: {msg}")
        else:
            messages.append(msg)
    text = messages[0] if len(messages) == 1 else "; ".join(messages)
    return JSONResponse(status_code=422, content={"detail": text})


@app.exception_handler(StarletteHTTPException)
async def http_handler(request: Request, exc: StarletteHTTPException):
    detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"detail": detail})


@app.exception_handler(Exception)
async def general_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Ошибка сервера. Попробуйте ещё раз."})


Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    seed_data(db)

app.include_router(auth_router, prefix="/api")
app.include_router(courses_router, prefix="/api")
app.include_router(lessons_router, prefix="/api")
app.include_router(quizzes_router, prefix="/api")
app.include_router(comments_router, prefix="/api")
app.include_router(progress_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(uploads_router, prefix="/api")
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/api/health")
def health():
    return {"ok": True, "app": settings.APP_NAME}


@app.get("/")
def root():
    return {"docs": "/docs", "health": "/api/health"}
