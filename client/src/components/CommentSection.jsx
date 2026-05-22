import { useEffect, useState } from "react";
import { commentsApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/format";

export function CommentSection({ lessonId }) {
  const { isAuthed } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  const load = () => commentsApi.list(lessonId).then((r) => setComments(r.data));

  useEffect(() => { load(); }, [lessonId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await commentsApi.add(lessonId, text);
    setText("");
    load();
  };

  return (
    <div className="card p-4">
      <h3 className="font-medium">Комментарии ({comments.length})</h3>
      {isAuthed ? (
        <form onSubmit={submit} className="mt-3">
          <textarea className="input-field" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
          <button type="submit" className="btn-primary mt-2">Отправить</button>
        </form>
      ) : (
        <p className="muted mt-2 text-sm">Войдите чтобы писать</p>
      )}
      <ul className="mt-4 space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="border-t border-slate-100 pt-3 text-sm">
            <b>{c.user_name}</b> <span className="muted text-xs">{formatDate(c.created_at)}</span>
            <p className="mt-1">{c.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
