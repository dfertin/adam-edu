import { useEffect, useState } from "react";
import { progressApi } from "../api/client";

export function CertificatesPage() {
  const [certs, setCerts] = useState([]);
  const [code, setCode] = useState("");
  const [check, setCheck] = useState(null);

  useEffect(() => {
    progressApi.certificates().then((r) => setCerts(r.data));
  }, []);

  const verify = async (e) => {
    e.preventDefault();
    try {
      const { data } = await progressApi.verifyCert(code);
      setCheck({ ok: true, title: data.course_title });
    } catch {
      setCheck({ ok: false });
    }
  };

  return (
    <div className="page-wrap py-8">
      <h1 className="text-xl font-semibold">Сертификаты</h1>
      {certs.length === 0 ? (
        <p className="muted mt-4">Пока нет. Завершите курс на 100%.</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {certs.map((c) => (
            <div key={c.id} className="card border-brand-200 p-4">
              <p className="font-medium">{c.course_title}</p>
              <p className="muted mt-1 font-mono text-xs">{c.code}</p>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={verify} className="card mt-6 flex max-w-md gap-2 p-4">
        <input className="input-field" placeholder="Код" value={code} onChange={(e) => setCode(e.target.value)} />
        <button type="submit" className="btn-primary">Проверить</button>
      </form>
      {check?.ok && <p className="mt-2 text-sm text-brand-700">Найден: {check.title}</p>}
      {check && !check.ok && <p className="mt-2 text-sm text-red-600">Не найден</p>}
    </div>
  );
}
