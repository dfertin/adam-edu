import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from .config import settings
from .deps import require_instructor
from .models import User
from .schemas import UploadOut

router = APIRouter(prefix="/uploads", tags=["Uploads"])

ALLOWED_IMAGE = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_VIDEO = {".mp4", ".webm", ".mov"}
ALLOWED = ALLOWED_IMAGE | ALLOWED_VIDEO


@router.post("", response_model=UploadOut)
async def upload_file(
    file: UploadFile = File(...),
    _: User = Depends(require_instructor),
):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED:
        raise HTTPException(status_code=400, detail="Недопустимый формат файла")

    content = await file.read()
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(status_code=400, detail=f"Файл больше {settings.MAX_UPLOAD_MB} МБ")

    subdir = "images" if ext in ALLOWED_IMAGE else "videos"
    folder = os.path.join(settings.UPLOAD_DIR, subdir)
    os.makedirs(folder, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(folder, filename)
    with open(path, "wb") as f:
        f.write(content)

    url = f"/uploads/{subdir}/{filename}"
    return UploadOut(url=url, filename=filename)
