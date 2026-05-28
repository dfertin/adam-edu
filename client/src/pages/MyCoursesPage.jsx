import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usersApi } from "../api/client";

export function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi
      .myCourses()
      .then((r) => setCourses(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page-wrap py-8">
      <h1 className="section-title">Мои курсы</h1>
      {loading ? (
        <p className="muted py-10 text-center">Загрузка...</p>
      ) : courses.length === 0 ? (
        <p className="muted py-10 text-center">
          Вы ещё не записаны на курсы.{" "}
          <Link to="/catalog" className="text-brand-700">
            Перейти в каталог
          </Link>
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {courses.map((c) => (
            <Link key={c.id} to={`/courses/${c.id}`} className="card block p-4 hover:border-brand-600">
              <h3 className="font-semibold">{c.title}</h3>
              <p className="muted text-sm">
                {c.category} · {c.completed_lessons} / {c.total_lessons} уроков · {c.progress_percent}%
              </p>
              <div className="mt-2 h-2 rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-brand-600" style={{ width: `${c.progress_percent}%` }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
