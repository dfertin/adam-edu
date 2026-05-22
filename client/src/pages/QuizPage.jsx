import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { quizzesApi } from "../api/client";

export function QuizPage() {
  const { slug, lessonId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    quizzesApi.byLesson(lessonId).then((r) => setQuiz(r.data));
  }, [lessonId]);

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await quizzesApi.submit(quiz.id, answers);
    setResult(data);
  };

  if (!quiz) return <p className="page-wrap py-12 muted text-center">Загрузка...</p>;

  return (
    <div className="page-wrap max-w-lg py-8">
      <Link to={`/learn/${slug}/${lessonId}`} className="text-sm text-brand-700">← Урок</Link>
      <h1 className="mt-2 text-xl font-semibold">{quiz.title}</h1>
      {result ? (
        <div className="card mt-4 p-6 text-center">
          <p className="text-lg font-semibold">{result.score}% — {result.passed ? "Сдано" : "Ещё раз"}</p>
          <Link to={`/learn/${slug}/${lessonId}`} className="btn-primary mt-4 inline-block">К уроку</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-4">
          {quiz.questions.map((q, i) => (
            <div key={q.id} className="card p-4">
              <p className="font-medium">{i + 1}. {q.text}</p>
              {q.options.map((o) => (
                <label key={o.id} className="mt-2 flex gap-2 text-sm">
                  <input type="radio" name={`q${q.id}`} checked={answers[q.id] === o.id} onChange={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))} />
                  {o.text}
                </label>
              ))}
            </div>
          ))}
          <button type="submit" className="btn-primary w-full">Отправить</button>
        </form>
      )}
    </div>
  );
}
