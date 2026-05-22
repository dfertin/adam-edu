import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { coursesApi, lessonsApi, mediaUrl } from "../api/client";
import { formatPrice } from "../utils/format";
import { addRecentCourse } from "../utils/storage";
import { StarRating } from "../components/StarRating";
import { useAuth } from "../context/AuthContext";

export function CourseDetailPage() {
  const { slug } = useParams();
  const { isAuthed } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewStars, setReviewStars] = useState(5);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const [c, l, r] = await Promise.all([coursesApi.get(slug), lessonsApi.byCourse(slug), coursesApi.reviews(slug)]);
    setCourse(c.data);
    setLessons(l.data);
    setReviews(r.data);
  };

  useEffect(() => { load(); }, [slug]);

  useEffect(() => {
    if (course?.slug) addRecentCourse(course);
  }, [course?.slug, course?.title]);

  const enroll = async () => {
    try {
      const { data } = await coursesApi.enroll(slug);
      setMsg(data.message);
      load();
    } catch (e) {
      setMsg(e.response?.data?.detail || "Ошибка");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    await coursesApi.addReview(slug, { text: reviewText, stars: reviewStars });
    setReviewText("");
    load();
  };

  if (!course) return <p className="page-wrap py-12 muted text-center">Загрузка...</p>;

  return (
    <main className="page-wrap py-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {course.image_url && <img src={mediaUrl(course.image_url)} alt="" className="mb-4 w-full rounded-lg border border-slate-200" />}
          <span className="rounded bg-brand-100 px-2 py-1 text-xs text-brand-800">{course.category?.name}</span>
          <h1 className="mt-2 text-2xl font-semibold">{course.title}</h1>
          <div className="mt-2 flex gap-4 text-sm muted">
            <StarRating value={course.rating_avg} />
            <span>{course.lessons_count} уроков</span>
          </div>
          <p className="mt-4 text-slate-600">{course.description}</p>
          {course.is_enrolled && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-sm"><span>Прогресс</span><span>{course.progress_percent}%</span></div>
              <div className="h-2 rounded-full bg-slate-200"><div className="h-full rounded-full bg-brand-600" style={{ width: `${course.progress_percent}%` }} /></div>
            </div>
          )}
        </div>
        <div className="card h-fit p-5">
          <p className="text-2xl font-semibold text-brand-800">{formatPrice(course.price)}</p>
          {course.is_enrolled ? (
            <Link to={`/learn/${slug}/${(lessons.find((l) => !l.completed) || lessons[0])?.id}`} className="btn-primary mt-4 block text-center">Учиться</Link>
          ) : isAuthed ? (
            <button type="button" className="btn-primary mt-4 w-full" onClick={enroll}>Записаться</button>
          ) : (
            <Link to="/login" className="btn-primary mt-4 block text-center">Войти</Link>
          )}
          {msg && <p className="mt-2 text-sm text-brand-700">{msg}</p>}
        </div>
      </div>

      <section className="mt-8">
        <h2 className="section-title mb-3">Уроки</h2>
        <div className="card divide-y divide-slate-100">
          {lessons.map((l) => {
            const ok = course.is_enrolled || l.is_free_preview;
            const inner = (
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs text-brand-800">{l.completed ? "✓" : l.order + 1}</span>
                <div>
                  <p className="font-medium">{l.title}</p>
                  <p className="muted text-xs">{l.duration_minutes} мин{!ok ? " · нужна запись" : ""}</p>
                </div>
              </div>
            );
            return ok ? <Link key={l.id} to={`/learn/${slug}/${l.id}`} className="block hover:bg-slate-50">{inner}</Link> : <div key={l.id} className="opacity-50">{inner}</div>;
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="section-title mb-3">Отзывы</h2>
        {course.is_enrolled && (
          <form onSubmit={submitReview} className="card mb-4 p-4">
            <textarea className="input-field" value={reviewText} onChange={(e) => setReviewText(e.target.value)} required minLength={10} />
            <div className="mt-2 flex gap-2">
              <select className="input-field w-20" value={reviewStars} onChange={(e) => setReviewStars(+e.target.value)}>{[5,4,3,2,1].map((s) => <option key={s} value={s}>{s}</option>)}</select>
              <button type="submit" className="btn-primary">Отправить</button>
            </div>
          </form>
        )}
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex justify-between"><b>{r.user_name}</b><StarRating value={r.stars} /></div>
              <p className="muted mt-1 text-sm">{r.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
