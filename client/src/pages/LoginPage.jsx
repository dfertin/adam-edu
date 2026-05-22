import { useEffect, useState } from "react";
import { removeStorage } from "../utils/storage";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage, validateEmail } from "../utils/format";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    removeStorage("login_email");
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const check = validateEmail(email);
    if (check) {
      setEmailError(check);
      return;
    }
    setEmailError("");
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err, "Неверный email или пароль"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap flex min-h-[60vh] items-center justify-center py-10">
      <div className="card w-full max-w-sm p-6">
        <p className="logo-text text-xl">adam-edu</p>
        <h1 className="mt-4 text-lg font-semibold">Вход</h1>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className="text-sm">Email</label>
            <input className="input-field mt-1" placeholder="email@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(validateEmail(e.target.value)); }} required />
            {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
          </div>
          <div>
            <label className="text-sm">Пароль</label>
            <input className="input-field mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? "..." : "Войти"}</button>
        </form>
        <p className="muted mt-4 text-center text-sm">
          <Link to="/register" className="text-brand-700">Регистрация</Link>
        </p>
      </div>
    </div>
  );
}
