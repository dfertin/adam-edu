import json
from typing import Dict, List

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active: Dict[int, List[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active.setdefault(user_id, []).append(websocket)

    def disconnect(self, user_id: int, websocket: WebSocket):
        if user_id in self.active:
            self.active[user_id] = [ws for ws in self.active[user_id] if ws != websocket]
            if not self.active[user_id]:
                del self.active[user_id]

    async def send_to_user(self, user_id: int, data: dict):
        if user_id not in self.active:
            return
        message = json.dumps(data, ensure_ascii=False)
        dead = []
        for ws in self.active[user_id]:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(user_id, ws)


manager = ConnectionManager()
