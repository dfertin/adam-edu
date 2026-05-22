import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

export function Header({ onLogout }) {
  const { isAuthed, user, isAdmin } = useAuth();
  const { notifications, unread, markAllRead } = useNotifications();
  const [showNotif, setShowNotif] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = [
    { to: "/", label: "Курсы" },
    { to: "/my-courses", label: "Мои курсы", auth: true },
    ...(isAdmin ? [{ to: "/admin", label: "Админ" }] : [])
  ];

  const linkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm ${isActive ? "bg-brand-100 font-medium text-brand-800" : "text-slate-600 hover:text-brand-800"}`;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="page-wrap flex h-16 items-center justify-between">
        <Link to="/" className="logo-text">
          adam-edu
        </Link>

        <nav className="hidden gap-1 md:flex">
          {nav.filter((n) => !n.auth || isAuthed).map((n) => (
            <NavLink key={n.to} to={n.to} className={linkClass}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthed && (
            <div className="relative">
              <button type="button" className="btn-secondary text-xs" onClick={() => setShowNotif(!showNotif)}>
                Уведомления{unread > 0 ? ` (${unread})` : ""}
              </button>
              {showNotif && (
                <div className="absolute right-0 z-10 mt-1 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                  <button type="button" className="text-xs text-brand-700" onClick={markAllRead}>
                    Прочитать все
                  </button>
                  {notifications.length === 0 ? (
                    <p className="muted mt-2 text-xs">Пусто</p>
                  ) : (
                    <ul className="mt-2 max-h-40 space-y-2 overflow-auto text-xs">
                      {notifications.slice(0, 6).map((n) => (
                        <li key={n.id} className="border-t border-slate-100 pt-2">
                          <b>{n.title}</b> — {n.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {isAuthed ? (
            <>
              <Link to="/profile" className="hidden text-sm text-slate-700 sm:inline">
                {user?.full_name}
              </Link>
              <button type="button" onClick={onLogout} className="btn-secondary text-xs">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-xs">
                Вход
              </Link>
              <Link to="/register" className="btn-primary text-xs">
                Регистрация
              </Link>
            </>
          )}

          <button type="button" className="btn-secondary px-2 md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            Меню
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 px-4 py-2 md:hidden">
          {nav.filter((n) => !n.auth || isAuthed).map((n) => (
            <NavLink key={n.to} to={n.to} className="block py-2 text-sm" onClick={() => setMenuOpen(false)}>
              {n.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
