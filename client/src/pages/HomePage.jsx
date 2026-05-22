import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { coursesApi } from "../api/client";
import { CourseCard } from "../components/CourseCard";
import { Pagination } from "../components/Pagination";
import { getStorage, setStorage } from "../utils/storage";

const defaultFilters = { search: "", category: "", level: "", page: 1 };

export function HomePage() {
  const saved = getStorage("catalog_filters", defaultFilters);
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState(saved.search || "");
  const [category, setCategory] = useState(saved.category || "");
  const [level, setLevel] = useState(saved.level || "");
  const [page, setPage] = useState(saved.page || 1);
  const [loading, setLoading] = useState(true);
  const [recent] = useState(() => getStorage("recent_courses", []));

  useEffect(() => {
    coursesApi.categories().then((r) => setCategories(r.data));
  }, []);

  useEffect(() => {
    setStorage("catalog_filters", { search, category, level, page });
  }, [search, category, level, page]);

  useEffect(() => {
    setLoading(true);
    coursesApi
      .list({ page, page_size: 12, search: search || undefined, category: category || undefined, level: level || undefined })
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [page, search, category, level]);

  const chip = (active) =>
    `rounded-full px-3 py-1.5 text-sm ${active ? "bg-brand-700 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-brand-600"}`;

  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="page-wrap py-10">
          <h1 className="logo-text text-3xl sm:text-4xl">adam-edu</h1>
          <p className="muted mt-2">Курсы по программированию, дизайну и другим темам</p>
          <form
            className="mt-6 flex max-w-lg flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
            }}
          >
            <input className="input-field flex-1" placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <button type="submit" className="btn-primary">Найти</button>
          </form>
        </div>
      </section>

      <section className="page-wrap py-8">
        {recent.length > 0 && (
          <div className="mb-6">
            <h2 className="section-title mb-2">Недавно смотрели</h2>
            <div className="flex flex-wrap gap-2">
              {recent.map((c) => (
                <Link key={c.slug} to={`/courses/${c.slug}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:border-brand-600">
                  {c.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          <button type="button" className={chip(!category)} onClick={() => { setCategory(""); setPage(1); }}>Все</button>
          {categories.map((c) => (
            <button key={c.slug} type="button" className={chip(category === c.slug)} onClick={() => { setCategory(c.slug); setPage(1); }}>
              {c.name}
            </button>
          ))}
          <select className="input-field w-auto" value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }}>
            <option value="">Уровень</option>
            <option value="beginner">Начальный</option>
            <option value="intermediate">Средний</option>
            <option value="advanced">Продвинутый</option>
          </select>
        </div>

        {loading ? (
          <p className="muted py-10 text-center">Загрузка...</p>
        ) : data.items.length === 0 ? (
          <p className="muted py-10 text-center">Курсы не найдены</p>
        ) : (
          <>
            <p className="muted mb-4 text-sm">Найдено: {data.total}</p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
            <Pagination page={data.page} pages={data.pages} onChange={setPage} />
          </>
        )}
      </section>
    </main>
  );
}
