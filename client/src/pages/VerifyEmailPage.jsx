import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authApi } from "../api/client";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [text, setText] = useState("Проверка...");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setText("Ошибка ссылки");
      return;
    }
    authApi.verifyEmail(token).then((r) => setText(r.data.message)).catch(() => setText("Ошибка"));
  }, [params]);

  return (
    <div className="page-wrap py-16 text-center">
      <div className="card mx-auto max-w-sm p-6">
        <p className="logo-text">adam-edu</p>
        <p className="mt-4">{text}</p>
        <Link to="/login" className="btn-primary mt-4 inline-block">Войти</Link>
      </div>
    </div>
  );
}
