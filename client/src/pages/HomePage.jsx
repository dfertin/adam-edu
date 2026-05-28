import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { coursesApi } from "../api/client";
import { CourseCard } from "../components/CourseCard";

const benefits = [
  { title: "Актуальные курсы", text: "Программирование, DevOps, базы данных и инструменты разработки." },
  { title: "Свой темп", text: "Уроки доступны после записи на курс, прогресс сохраняется." },
  { title: "Понятная структура", text: "Каталог с поиском и фильтрами, страница курса и уроки по порядку." },
];

export function HomePage() {
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesApi
      .list()
      .then((r) => setPopular(r.data.slice(0, 3)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="page-wrap py-16 text-center">
          <h1 className="logo-text text-3xl sm:text-5xl">Платформа онлайн-обучения</h1>
          <p className="muted mx-auto mt-4 max-w-xl text-lg">
            Изучайте технологии с нуля: курсы, уроки и отслеживание прогресса в одном месте.
          </p>
          <Link to="/catalog" className="btn-primary mt-8 inline-block">
            Смотреть каталог
          </Link>
        </div>
      </section>

      <section className="page-wrap py-12">
        <h2 className="section-title mb-6">Популярные курсы</h2>
        {loading ? (
          <p className="muted text-center">Загрузка...</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-slate-200 bg-white py-12">
        <div className="page-wrap">
          <h2 className="section-title mb-8 text-center">Преимущества</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="card p-5 text-center">
                <h3 className="font-semibold text-slate-800">{b.title}</h3>
                <p className="muted mt-2 text-sm">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
