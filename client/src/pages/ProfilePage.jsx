import { useState } from "react";
import { authApi } from "../api/client";
import { useAuth } from "../context/AuthContext";

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [msg, setMsg] = useState("");

  const save = async (e) => {
    e.preventDefault();
    await authApi.updateMe({ full_name: fullName, bio });
    setMsg("Сохранено");
    refreshUser();
  };

  return (
    <div className="page-wrap py-8">
      <h1 className="text-xl font-semibold">Профиль</h1>
      <div className="card mt-4 max-w-md p-5">
        <p className="font-medium">{user?.full_name}</p>
        <p className="muted text-sm">{user?.email}</p>
        <form onSubmit={save} className="mt-4 space-y-3">
          <div>
            <label className="text-sm">Имя</label>
            <input className="input-field mt-1" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">О себе</label>
            <textarea className="input-field mt-1" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          {msg && <p className="text-sm text-brand-700">{msg}</p>}
          <button type="submit" className="btn-primary">Сохранить</button>
        </form>
      </div>
    </div>
  );
}
