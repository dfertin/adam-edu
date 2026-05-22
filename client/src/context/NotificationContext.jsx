import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { notificationsApi } from "../api/client";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext({
  notifications: [],
  unread: 0,
  load: () => {},
  markAllRead: async () => {}
});

export const NotificationProvider = ({ children }) => {
  const { token, isAuthed } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    if (!isAuthed) return;
    try {
      const { data } = await notificationsApi.list();
      setNotifications(data);
      setUnread(data.filter((n) => !n.is_read).length);
    } catch (err) {
      setNotifications([]);
      setUnread(0);
    }
  }, [isAuthed]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!token) return undefined;
    const wsBase = import.meta.env.VITE_WS_URL || "ws://localhost:8000";
    let ws;
    try {
      ws = new WebSocket(`${wsBase}/api/notifications/ws?token=${token}`);
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === "notification") {
            setNotifications((prev) => [
              {
                id: data.id,
                title: data.title,
                message: data.message,
                is_read: false,
                created_at: new Date().toISOString()
              },
              ...prev
            ]);
            setUnread((u) => u + 1);
          }
        } catch (err) {
          return;
        }
      };
      ws.onerror = () => {};
    } catch (err) {
      return undefined;
    }
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [token]);

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unread, load, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
