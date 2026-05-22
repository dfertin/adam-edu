import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mediaUrl, progressApi } from "../api/client";

export function MyCoursesPage() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    progressApi.myCourses().then((r) => setCourses(r.data));
  }, []);

  return (
    <div className="page-wrap py-8">
      <h1 className="text-xl font-semibold">Мои курсы</h1>
      {courses.length === 0 ? (
        <div className="card mt-4 p-8 text-center">
          <p className="muted">Пока нет курсов</p>
          <Link to="/" className="btn-primary mt-3 inline-block">Каталог</Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {courses.map((c) => (
            <Link key={c.course_id} to={`/courses/${c.course_slug}`} className="card-hover block overflow-hidden">
              {c.image_url && <img src={mediaUrl(c.image_url)} alt="" className="h-28 w-full object-cover" />}
              <div className="p-4">
                <h3 className="font-medium">{c.course_title}</h3>
                <p className="muted mt-2 text-xs">{c.progress_percent}% · {c.completed_lessons}/{c.total_lessons}</p>
                <div className="mt-2 h-1.5 rounded-full bg-slate-200"><div className="h-full rounded-full bg-brand-600" style={{ width: `${c.progress_percent}%` }} /></div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
