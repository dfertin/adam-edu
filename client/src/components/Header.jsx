import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Header({ onLogout }) {
  const { isAuthed, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme") || "light";
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      return true;
    }
    document.documentElement.classList.remove("dark");
    return false;
  });

  const toggleTheme = () => {
    if (dark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDark(true);
    }
  };

  const nav = [
    { to: "/", label: "Главная" },
    { to: "/catalog", label: "Каталог" },
    ...(isAuthed ? [{ to: "/my-courses", label: "Мои курсы" }] : []),
    ...(isAuthed ? [{ to: "/settings", label: "Настройки" }] : []),
  ];

  const linkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm transition-all duration-200 ${
      isActive
        ? "bg-brand-100 font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-300"
        : "text-slate-600 hover:text-brand-800 dark:text-slate-300 dark:hover:text-brand-400"
    }`;

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="page-wrap flex h-16 items-center justify-between">
        <Link to="/" className="logo-text">
          adam-edu
        </Link>

        <nav className="hidden gap-1 md:flex">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} className={linkClass}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {dark ? (
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 2.243a1 1 0 01.086 1.328l-.086.086L13.3 6.357a1 1 0 01-1.5-.086 1 1 0 01.086-1.328l.086-.086 1.3-1.3a1 1 0 011.414 0zm-8 0a1 1 0 010 1.414l-1.3 1.3a1 1 0 01-1.5-.086 1 1 0 01.086-1.328l.086-.086 1.3-1.3a1 1 0 011.414 0zM10 6a4 4 0 100 8 4 4 0 000-8zm-8 4a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm13 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zM5.657 13.043a1 1 0 01.086 1.328l-.086.086-1.3 1.3a1 1 0 01-1.5-.086 1 1 0 01.086-1.328l.086-.086 1.3-1.3a1 1 0 011.414 0zm8.686 0a1 1 0 010 1.414l-1.3 1.3a1 1 0 01-1.5-.086 1 1 0 01.086-1.328l.086-.086 1.3-1.3a1 1 0 011.414 0zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" />
              </svg>
            ) : (
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {isAuthed ? (
            <>
              <span className="hidden text-sm text-slate-700 dark:text-slate-300 sm:inline">
                {user?.name}
              </span>
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

          <button
            type="button"
            className="btn-secondary px-2 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            Меню
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2 md:hidden">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className="block py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-brand-800 dark:hover:text-brand-400"
              onClick={() => setMenuOpen(false)}
            >
              {n.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
