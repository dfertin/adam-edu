import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { coursesApi, lessonsApi } from "../api/client";
import { getErrorMessage } from "../utils/format";

export function LessonPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    lessonsApi
      .get(lessonId)
      .then((r) => {
        setLesson(r.data);
        setSaved(r.data.completed);
      })
      .catch((e) => setError(getErrorMessage(e, "Нет доступа")));
    lessonsApi
      .byCourse(courseId)
      .then((r) => setLessons(r.data))
      .catch(() => {});
    coursesApi
      .progress(courseId)
      .then((r) => setProgress(r.data))
      .catch(() => {});
  }, [courseId, lessonId]);

  const complete = async () => {
    try {
      await lessonsApi.complete(lessonId);
      setSaved(true);
      const prog = await coursesApi.progress(courseId);
      setProgress(prog.data);
      setLesson((prev) => (prev ? { ...prev, completed: true } : prev));
    } catch (e) {
      setError(getErrorMessage(e, "Ошибка"));
    }
  };

  if (error && !lesson) {
    return (
      <div className="page-wrap py-12 text-center">
        <p className="text-red-600">{error}</p>
        <Link to={`/courses/${courseId}`} className="btn-primary mt-4 inline-block">
          К курсу
        </Link>
      </div>
    );
  }

  if (!lesson) return <p className="page-wrap py-12 text-center muted">Загрузка...</p>;

  const idx = lessons.findIndex((l) => l.id === +lessonId);
  const prev = lessons[idx - 1];
  const next = lessons[idx + 1];

  return (
    <div className="page-wrap py-8">
      <Link to={`/courses/${courseId}`} className="text-sm text-brand-700">
        ← К курсу
      </Link>

      {progress && (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-sm">
            <span>Прогресс курса</span>
            <span>
              {progress.completed_lessons} / {progress.total_lessons} ({progress.progress_percent}%)
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-brand-600" style={{ width: `${progress.progress_percent}%` }} />
          </div>
        </div>
      )}

      <h1 className="mt-4 text-xl font-semibold">{lesson.title}</h1>

      {lesson.video_url && (
        <div className="mt-4 aspect-video overflow-hidden rounded-lg border border-slate-200 bg-black">
          <iframe
            title={lesson.title}
            src={lesson.video_url}
            className="h-full w-full"
            allowFullScreen
          />
        </div>
      )}

      <div className="card mt-4 whitespace-pre-wrap p-4 text-slate-700">{lesson.content || "Материал урока"}</div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-2">
        {prev && (
          <button type="button" className="btn-secondary" onClick={() => navigate(`/courses/${courseId}/lessons/${prev.id}`)}>
            Предыдущий урок
          </button>
        )}
        <button type="button" className="btn-primary" onClick={complete} disabled={saved}>
          {saved ? "Пройдено" : "Отметить как пройдено"}
        </button>
        {next && (
          <button type="button" className="btn-secondary" onClick={() => navigate(`/courses/${courseId}/lessons/${next.id}`)}>
            Следующий урок
          </button>
        )}
      </div>
    </div>
  );
}
