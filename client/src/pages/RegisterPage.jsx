import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage, validateEmail } from "../utils/format";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const check = validateEmail(email);
    if (check) {
      setEmailError(check);
      return;
    }
    setEmailError("");
    if (password.length < 6) {
      setError("Пароль минимум 6 символов");
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err, "Ошибка регистрации"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap flex min-h-[60vh] items-center justify-center py-10">
      <div className="card w-full max-w-sm p-6">
        <p className="logo-text text-xl">adam-edu</p>
        <h1 className="mt-4 text-lg font-semibold">Регистрация</h1>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className="text-sm">Имя</label>
            <input className="input-field mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm">Email</label>
            <input className="input-field mt-1" placeholder="email@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(validateEmail(e.target.value)); }} required />
            {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
          </div>
          <div>
            <label className="text-sm">Пароль</label>
            <input className="input-field mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? "..." : "Создать аккаунт"}</button>
        </form>
        <p className="muted mt-4 text-center text-sm">
          <Link to="/login" className="text-brand-700">Войти</Link>
        </p>
      </div>
    </div>
  );
}
