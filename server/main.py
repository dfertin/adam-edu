from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.routes_auth import router as auth_router
from app.routes_courses import router as courses_router
from app.routes_lessons import router as lessons_router
from app.routes_users import router as users_router
from app.seed import seed_data

app = FastAPI(title=f"{settings.APP_NAME} API", version="1.0.0")

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
        if field:
            messages.append(f"{field}: {msg}")
        else:
            messages.append(msg)
    text = messages[0] if len(messages) == 1 else "; ".join(messages)
    return JSONResponse(status_code=422, content={"detail": text})


@app.exception_handler(StarletteHTTPException)
async def http_handler(request: Request, exc: StarletteHTTPException):
    detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"detail": detail})


Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    seed_data(db)

app.include_router(auth_router, prefix="/api")
app.include_router(courses_router, prefix="/api")
app.include_router(lessons_router, prefix="/api")
app.include_router(users_router, prefix="/api")


@app.get("/api/health")
def health():
    return {"ok": True, "app": settings.APP_NAME}


@app.get("/")
def root():
    return {"docs": "/docs", "health": "/api/health"}
