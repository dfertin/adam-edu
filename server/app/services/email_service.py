import logging
import smtplib
from email.mime.text import MIMEText

from ..config import settings

logger = logging.getLogger(__name__)


def send_verification_email(to_email: str, token: str) -> bool:
    link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    subject = f"Подтверждение email — {settings.APP_NAME}"
    body = f"""Здравствуйте!

Подтвердите ваш email, перейдя по ссылке:
{link}

Ссылка действительна {settings.EMAIL_VERIFICATION_EXPIRE_HOURS} часов.

— {settings.APP_NAME}
"""

    if not settings.SMTP_HOST:
        logger.info("Email verify link for %s: %s", to_email, link)
        return True

    try:
        msg = MIMEText(body, "plain", "utf-8")
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM
        msg["To"] = to_email

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            if settings.SMTP_USER:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        logger.error("Failed to send email: %s", e)
        return False
