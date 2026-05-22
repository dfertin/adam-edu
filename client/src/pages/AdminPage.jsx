import { useEffect, useState } from "react";
import { adminApi, coursesApi } from "../api/client";
import { getErrorMessage } from "../utils/format";

export function AdminPage() {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [msg, setMsg] = useState("");
  const [courseForm, setCourseForm] = useState({ title: "", description: "", category_id: 1, price: 0 });
  const [lessonForm, setLessonForm] = useState({ course_id: 1, title: "", content: "" });

  useEffect(() => {
    adminApi.users().then((r) => setUsers(r.data));
    coursesApi.categories().then((r) => {
      setCategories(r.data);
      if (r.data[0]) setCourseForm((f) => ({ ...f, category_id: r.data[0].id }));
    });
  }, []);

  return (
    <div className="page-wrap py-8">
      <h1 className="text-xl font-semibold">Админ</h1>
      {msg && <p className="mt-2 text-sm text-brand-700">{msg}</p>}

      <div className="card mt-4 overflow-x-auto p-4">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b"><th className="py-2">ID</th><th>Имя</th><th>Email</th><th>Роль</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100"><td>{u.id}</td><td>{u.full_name}</td><td>{u.email}</td><td>{u.role}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="card mt-4 grid gap-2 p-4 sm:grid-cols-2" onSubmit={async (e) => { e.preventDefault(); try { const { data } = await adminApi.createCourse(courseForm); setMsg(data.message); } catch (err) { setMsg(getErrorMessage(err)); } }}>
        <input className="input-field" placeholder="Название курса" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required />
        <select className="input-field" value={courseForm.category_id} onChange={(e) => setCourseForm({ ...courseForm, category_id: +e.target.value })}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <textarea className="input-field sm:col-span-2" placeholder="Описание" value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} required />
        <button type="submit" className="btn-primary sm:col-span-2">Добавить курс</button>
      </form>

      <form className="card mt-4 grid gap-2 p-4 sm:grid-cols-2" onSubmit={async (e) => { e.preventDefault(); try { const { data } = await adminApi.createLesson(lessonForm.course_id, lessonForm); setMsg(data.message); } catch (err) { setMsg(getErrorMessage(err)); } }}>
        <input className="input-field" type="number" placeholder="ID курса" value={lessonForm.course_id} onChange={(e) => setLessonForm({ ...lessonForm, course_id: +e.target.value })} />
        <input className="input-field" placeholder="Название урока" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} required />
        <textarea className="input-field sm:col-span-2" placeholder="Текст" value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} />
        <button type="submit" className="btn-primary">Добавить урок</button>
      </form>
    </div>
  );
}
