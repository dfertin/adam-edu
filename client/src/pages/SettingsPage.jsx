import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usersApi } from "../api/client";
import { getErrorMessage, validateEmail } from "../utils/format";

export function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [emailError, setEmailError] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdErr, setPwdErr] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileErr("");
    const check = validateEmail(email);
    if (check) {
      setEmailError(check);
      return;
    }
    setEmailError("");
    setProfileLoading(true);
    try {
      await usersApi.updateProfile({ name: name.trim(), email: email.trim().toLowerCase() });
      await refreshUser();
      setProfileMsg("Профиль успешно обновлён");
    } catch (err) {
      setProfileErr(getErrorMessage(err, "Не удалось обновить профиль"));
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdMsg("");
    setPwdErr("");
    if (newPassword.length < 6) {
      setPwdErr("Новый пароль должен содержать минимум 6 символов");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdErr("Пароли не совпадают");
      return;
    }
    setPwdLoading(true);
    try {
      await usersApi.updatePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPwdMsg("Пароль успешно изменён");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwdErr(getErrorMessage(err, "Не удалось изменить пароль"));
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <main className="page-wrap py-8 sm:py-12">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Настройки профиля</h1>
          <p className="muted mt-1 text-sm">Управляйте вашими личными данными и безопасностью аккаунта</p>
        </div>
        <button
          type="button"
          className="btn-secondary w-full self-start py-2 text-xs font-semibold sm:w-auto"
          onClick={logout}
        >
          Выйти из аккаунта
        </button>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="card p-6 shadow-sm transition hover:shadow-md">
          <h2 className="text-lg font-bold text-slate-800">Личные данные</h2>
          <p className="muted mt-1 text-xs">Обновите ваше имя и электронную почту</p>

          <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Имя</label>
              <input
                type="text"
                className="input-field mt-1.5 w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Электронная почта</label>
              <input
                type="email"
                className="input-field mt-1.5 w-full"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(validateEmail(e.target.value));
                }}
                required
              />
              {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Роль в системе</label>
              <div className="mt-1.5 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-100">
                <span className="flex h-2 w-2 rounded-full bg-brand-500" />
                {user?.role === "admin" ? "Администратор" : "Пользователь"}
              </div>
            </div>

            {profileMsg && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-800">
                {profileMsg}
              </div>
            )}

            {profileErr && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-800">
                {profileErr}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full py-2.5 font-semibold"
              disabled={profileLoading}
            >
              {profileLoading ? "Сохранение..." : "Сохранить изменения"}
            </button>
          </form>
        </div>

        <div className="card p-6 shadow-sm transition hover:shadow-md">
          <h2 className="text-lg font-bold text-slate-800">Безопасность</h2>
          <p className="muted mt-1 text-xs">Измените пароль для доступа к вашему аккаунту</p>

          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Текущий пароль</label>
              <input
                type="password"
                className="input-field mt-1.5 w-full"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Новый пароль</label>
              <input
                type="password"
                className="input-field mt-1.5 w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Подтвердите новый пароль</label>
              <input
                type="password"
                className="input-field mt-1.5 w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {pwdMsg && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-800">
                {pwdMsg}
              </div>
            )}

            {pwdErr && (
              <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-800">
                {pwdErr}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full py-2.5 font-semibold"
              disabled={pwdLoading}
            >
              {pwdLoading ? "Обновление..." : "Обновить пароль"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
