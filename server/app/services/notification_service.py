from sqlalchemy.orm import Session

from ..models import Notification
from ..websocket import manager


def create_notification(db: Session, user_id: int, title: str, message: str):
    notif = Notification(user_id=user_id, title=title, message=message)
    db.add(notif)
    db.commit()
    db.refresh(notif)

    import asyncio

    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.create_task(
                manager.send_to_user(
                    user_id,
                    {
                        "type": "notification",
                        "id": notif.id,
                        "title": notif.title,
                        "message": notif.message,
                    },
                )
            )
    except RuntimeError:
        pass

    return notif
