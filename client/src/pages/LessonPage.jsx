import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { lessonsApi } from "../api/client";
import { CommentSection } from "../components/CommentSection";
import { VideoPlayer } from "../components/VideoPlayer";
import { getErrorMessage } from "../utils/format";

export function LessonPage() {
  const { slug, lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    lessonsApi.get(lessonId).then((r) => setLesson(r.data)).catch((e) => setError(getErrorMessage(e, "Нет доступа")));
    lessonsApi.byCourse(slug).then((r) => setLessons(r.data)).catch(() => {});
  }, [lessonId, slug]);

  const saveProgress = async () => {
    try {
      await lessonsApi.progress(lessonId, { watch_percent: 100, completed: true });
      setSaved(true);
    } catch (e) {
      setError(getErrorMessage(e, "Ошибка"));
    }
  };

  if (error && !lesson) {
    return (
      <div className="page-wrap py-12 text-center">
        <p className="text-red-600">{error}</p>
        <Link to={`/courses/${slug}`} className="btn-primary mt-4 inline-block">К курсу</Link>
      </div>
    );
  }

  if (!lesson) return <p className="page-wrap py-12 text-center muted">Загрузка...</p>;

  const next = lessons[lessons.findIndex((l) => l.id === +lessonId) + 1];

  return (
    <div className="page-wrap py-8">
      <Link to={`/courses/${slug}`} className="text-sm text-brand-700">← {lesson.course_title}</Link>
      <h1 className="mt-3 text-xl font-semibold">{lesson.title}</h1>
      <div className="mt-4"><VideoPlayer /></div>
      <div className="card prose-lesson mt-4 p-4" dangerouslySetInnerHTML={{ __html: lesson.content || "<p>Текст урока</p>" }} />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {lesson.has_quiz && <button type="button" className="btn-primary" onClick={() => navigate(`/learn/${slug}/${lessonId}/quiz`)}>Тест</button>}
        <button type="button" className="btn-secondary" onClick={saveProgress}>Урок пройден</button>
        {saved && <span className="text-sm text-brand-700">Сохранено</span>}
        {next && <Link to={`/learn/${slug}/${next.id}`} className="btn-secondary">Дальше</Link>}
      </div>
      <div className="mt-6"><CommentSection lessonId={+lessonId} /></div>
    </div>
  );
}
