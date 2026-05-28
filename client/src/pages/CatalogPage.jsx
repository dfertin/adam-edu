import { useEffect, useState } from "react";
import { coursesApi } from "../api/client";
import { CourseCard } from "../components/CourseCard";

const levels = [
  { value: "", label: "Все уровни" },
  { value: "beginner", label: "Начальный" },
  { value: "intermediate", label: "Средний" },
  { value: "advanced", label: "Продвинутый" },
];

export function CatalogPage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesApi.list().then((r) => {
      const cats = [...new Set(r.data.map((c) => c.category))].sort();
      setCategories(cats);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    coursesApi
      .list({
        search: search || undefined,
        category: category || undefined,
        level: level || undefined,
      })
      .then((r) => setCourses(r.data))
      .finally(() => setLoading(false));
  }, [search, category, level]);

  return (
    <main className="page-wrap py-8">
      <h1 className="section-title">Каталог курсов</h1>

      <form
        className="mt-6 flex max-w-lg flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input
          className="input-field flex-1"
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={`rounded-full px-3 py-1.5 text-sm ${!category ? "bg-brand-700 text-white" : "border border-slate-200 bg-white"}`}
          onClick={() => setCategory("")}
        >
          Все категории
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            className={`rounded-full px-3 py-1.5 text-sm ${category === c ? "bg-brand-700 text-white" : "border border-slate-200 bg-white"}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
        <select className="input-field w-auto" value={level} onChange={(e) => setLevel(e.target.value)}>
          {levels.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="muted py-10 text-center">Загрузка...</p>
      ) : courses.length === 0 ? (
        <p className="muted py-10 text-center">Курсы не найдены</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </main>
  );
}
