import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="page-wrap flex flex-col gap-6 py-8 sm:flex-row sm:justify-between">
        <div>
          <p className="logo-text text-lg">adam-edu</p>
          <p className="muted mt-1 text-sm">Сайт для онлайн-обучения</p>
        </div>
        <div className="flex gap-10 text-sm">
          <div>
            <Link to="/" className="muted block py-1 hover:text-brand-800">Курсы</Link>
            <Link to="/my-courses" className="muted block py-1 hover:text-brand-800">Мои курсы</Link>
          </div>
          <div>
            <Link to="/login" className="muted block py-1 hover:text-brand-800">Вход</Link>
            <Link to="/register" className="muted block py-1 hover:text-brand-800">Регистрация</Link>
          </div>
        </div>
      </div>
      <p className="border-t border-slate-100 py-3 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} adam-edu
      </p>
    </footer>
  );
}
