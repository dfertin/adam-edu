import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { coursesApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/format";

const levelLabels = {
  beginner: "Начальный",
  intermediate: "Средний",
  advanced: "Продвинутый",
};

const categoryGradients = {
  "Программирование": "from-blue-600 to-indigo-800 dark:from-blue-700 dark:to-indigo-900",
  "Базы данных": "from-emerald-600 to-teal-800 dark:from-emerald-700 dark:to-teal-900",
  "DevOps": "from-purple-600 to-pink-800 dark:from-purple-700 dark:to-pink-900",
  "Инструменты": "from-amber-500 to-orange-700 dark:from-amber-600 dark:to-orange-800",
};

const courseQuizzes = {
  1: [
    {
      q: "Что такое React?",
      options: ["Библиотека для разработки UI", "Фреймворк для бэкенда", "Язык разметки", "База данных"],
      answer: 0,
    },
    {
      q: "Какой хук используется для работы с побочными эффектами?",
      options: ["useState", "useEffect", "useContext", "useReducer"],
      answer: 1,
    },
    {
      q: "Что такое Props?",
      options: ["Внутреннее состояние компонента", "Входные параметры, передаваемые компоненту", "Методы жизненного цикла", "Глобальные стили"],
      answer: 1,
    },
  ],
  2: [
    {
      q: "Какая библиотека используется в FastAPI для валидации данных?",
      options: ["SQLAlchemy", "Pydantic", "Alembic", "Django"],
      answer: 1,
    },
    {
      q: "Что возвращает эндпоинт по умолчанию при успешном GET запросе в FastAPI?",
      options: ["HTML страницу", "XML файл", "JSON объект", "Текстовую строку"],
      answer: 2,
    },
    {
      q: "Каким декоратором создается GET-маршрут?",
      options: ["@app.post", "@app.get", "@app.route", "@router.put"],
      answer: 1,
    },
  ],
  3: [
    {
      q: "Какой SQL оператор используется для объединения таблиц?",
      options: ["UNION", "JOIN", "CONNECT", "MERGE"],
      answer: 1,
    },
    {
      q: "Какая команда используется для выборки данных из таблицы?",
      options: ["SELECT", "UPDATE", "GET", "EXTRACT"],
      answer: 0,
    },
    {
      q: "Что такое первичный ключ (Primary Key)?",
      options: ["Ссылка на другую таблицу", "Уникальный идентификатор записи", "Индекс для поиска строк", "Пароль доступа"],
      answer: 1,
    },
  ],
  4: [
    {
      q: "Что такое Docker?",
      options: ["Система контроля версий", "Платформа контейнеризации", "Облачный провайдер", "Веб-сервер"],
      answer: 1,
    },
    {
      q: "В каком файле описывается конфигурация мультиконтейнерного приложения?",
      options: ["Dockerfile", "docker-compose.yml", "package.json", "Makefile"],
      answer: 1,
    },
    {
      q: "Что такое CI/CD?",
      options: ["Метод шифрования данных", "Непрерывная интеграция и доставка", "Интерфейс командной строки", "Способ резервного копирования"],
      answer: 1,
    },
  ],
  5: [
    {
      q: "Какой командой создается новый пустой локальный репозиторий?",
      options: ["git commit", "git push", "git init", "git clone"],
      answer: 2,
    },
    {
      q: "Какая команда отправляет локальные изменения на удаленный сервер?",
      options: ["git pull", "git push", "git fetch", "git merge"],
      answer: 1,
    },
    {
      q: "Что такое Pull Request?",
      options: ["Запрос на слияние веток с предложением изменений", "Команда для стягивания кода", "Уведомление об ошибке", "Локальный коммит"],
      answer: 0,
    },
  ],
};

const defaultQuiz = [
  {
    q: "Какая система контроля версий является самой популярной в мире?",
    options: ["SVN", "Git", "Mercurial", "Perforce"],
    answer: 1,
  },
  {
    q: "Какая база данных относится к реляционному типу?",
    options: ["MongoDB", "PostgreSQL", "Redis", "Cassandra"],
    answer: 1,
  },
  {
    q: "Для чего используется формат обмена данными JSON?",
    options: ["Для стилизации веб-страниц", "Для сериализации и передачи структурированных данных", "Для компиляции кода", "Для маршрутизации трафика"],
    answer: 1,
  },
];

export function CoursePage() {
  const { id } = useParams();
  const { isAuthed, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [imgErr, setImgErr] = useState(false);

  const [quizStarted, setQuizStarted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState([-1, -1, -1]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizPassed, setQuizPassed] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const load = () => {
    coursesApi
      .get(id)
      .then((r) => setCourse(r.data))
      .catch((e) => setError(getErrorMessage(e, "Курс не найден")));
  };

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    if (course?.image_url) {
      const img = new Image();
      img.src = course.image_url;
      img.onerror = () => setImgErr(true);
    }
  }, [course]);

  const enroll = async () => {
    try {
      const { data } = await coursesApi.enroll(id);
      setMsg(data.message);
      load();
    } catch (e) {
      setMsg(getErrorMessage(e, "Ошибка"));
    }
  };

  const handleSelectAnswer = (qIdx, oIdx) => {
    const next = [...quizAnswers];
    next[qIdx] = oIdx;
    setQuizAnswers(next);
  };

  const submitQuiz = () => {
    const questions = courseQuizzes[id] || defaultQuiz;
    let score = 0;
    questions.forEach((q, i) => {
      if (quizAnswers[i] === q.answer) {
        score += 1;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    if (score >= 2) {
      setQuizPassed(true);
    } else {
      setQuizPassed(false);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizAnswers([-1, -1, -1]);
    setQuizSubmitted(false);
    setQuizScore(0);
    setQuizPassed(false);
  };

  if (error) {
    return (
      <div className="page-wrap py-12 text-center">
        <p className="text-red-600">{error}</p>
        <Link to="/catalog" className="btn-primary mt-4 inline-block">
          В каталог
        </Link>
      </div>
    );
  }

  if (!course) return <p className="page-wrap py-12 text-center muted">Загрузка...</p>;

  const firstLesson = course.lessons?.[0];
  const nextIncomplete = course.lessons?.find((l) => !l.completed);
  const questions = courseQuizzes[id] || defaultQuiz;

  const gradient = categoryGradients[course.category] || "from-brand-700 to-brand-900 dark:from-brand-850 dark:to-brand-950";

  return (
    <main className="page-wrap py-8">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-white shadow-lg">
        {!imgErr && course.image_url ? (
          <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${course.image_url})` }} />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-85`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        <div className="relative p-6 sm:p-8">
          <span className="inline-block rounded-full bg-brand-500/20 border border-brand-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-300 backdrop-blur-sm">
            {course.category}
          </span>
          <h1 className="mt-4 text-2xl font-black sm:text-4xl leading-tight">{course.title}</h1>
          <p className="mt-2 text-xs font-medium text-slate-300 sm:text-sm">
            {levelLabels[course.level] || course.level} · {course.duration} ч · {course.lessons_count} уроков
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-350 sm:text-base">
            {course.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {course.is_enrolled ? (
              <Link
                to={`/courses/${id}/lessons/${(nextIncomplete || firstLesson)?.id}`}
                className="btn-primary py-2.5 px-6 font-semibold shadow-md shadow-brand-700/20 dark:shadow-none"
              >
                Учиться
              </Link>
            ) : isAuthed ? (
              <button type="button" className="btn-primary py-2.5 px-6 font-semibold shadow-md shadow-brand-700/20 dark:shadow-none" onClick={enroll}>
                Записаться
              </button>
            ) : (
              <Link to="/login" className="btn-primary py-2.5 px-6 font-semibold shadow-md shadow-brand-700/20 dark:shadow-none inline-block">
                Войти для записи
              </Link>
            )}
            {msg && <p className="mt-2 text-sm text-brand-400 font-medium">{msg}</p>}
          </div>
        </div>
      </div>

      {course.is_enrolled && (
        <div className="mt-8 card p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="mb-1.5 flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                <span>Ваш прогресс по курсу</span>
                <span>{course.progress_percent}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="h-full rounded-full bg-brand-600 dark:bg-brand-500 transition-all duration-500" style={{ width: `${course.progress_percent}%` }} />
              </div>
            </div>
            {course.progress_percent === 100 && (
              <button
                type="button"
                className="btn-primary py-2.5 px-6 font-semibold shrink-0"
                onClick={() => setQuizStarted(true)}
              >
                Пройти тест
              </button>
            )}
          </div>
        </div>
      )}

      {quizStarted && (
        <section className="mt-8 rounded-2xl border border-brand-200 dark:border-brand-900 bg-brand-50/30 dark:bg-brand-950/10 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-brand-100 dark:border-brand-900 pb-4">
            <div>
              <h2 className="text-lg font-bold text-brand-900 dark:text-brand-400">Итоговое тестирование</h2>
              <p className="muted text-xs mt-0.5">Ответьте правильно как минимум на 2 вопроса</p>
            </div>
            <button type="button" className="text-brand-800 dark:text-brand-400 text-xs font-semibold hover:underline" onClick={resetQuiz}>
              Сбросить
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {qIdx + 1}. {q.q}
                </h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {q.options.map((o, oIdx) => {
                    const isSelected = quizAnswers[qIdx] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-xs font-medium transition-all ${
                          isSelected
                            ? "border-brand-600 dark:border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-900 dark:text-brand-300 font-semibold ring-1 ring-brand-600"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850"
                        }`}
                        onClick={() => !quizSubmitted && handleSelectAnswer(qIdx, oIdx)}
                        disabled={quizSubmitted}
                      >
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                          isSelected ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 dark:border-slate-700 text-transparent"
                        }`}>
                          ✓
                        </span>
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {quizSubmitted ? (
            <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-center shadow-sm">
              {quizPassed ? (
                <div>
                  <span className="text-4xl">🏆</span>
                  <h3 className="mt-2 text-lg font-bold text-emerald-800 dark:text-emerald-400">Тест успешно пройден!</h3>
                  <p className="muted text-xs mt-1">Ваш результат: {quizScore} из 3 правильных ответов.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      className="btn-primary py-2 px-5 font-semibold text-xs"
                      onClick={() => setShowCertificate(true)}
                    >
                      Посмотреть сертификат
                    </button>
                    <Link
                      to="/my-courses"
                      className="btn-secondary py-2 px-5 font-semibold text-xs inline-flex items-center"
                    >
                      В Мои курсы
                    </Link>
                    <button
                      type="button"
                      className="btn-secondary py-2 px-5 font-semibold text-xs"
                      onClick={resetQuiz}
                    >
                      Пройти заново
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-4xl">❌</span>
                  <h3 className="mt-2 text-lg font-bold text-red-800 dark:text-red-400">Тест не пройден</h3>
                  <p className="muted text-xs mt-1">Вы ответили правильно на {quizScore} из 3 вопросов. Нужно набрать минимум 2 балла.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      className="btn-primary py-2 px-5 font-semibold text-xs"
                      onClick={resetQuiz}
                    >
                      Попробовать еще раз
                    </button>
                    <Link
                      to="/my-courses"
                      className="btn-secondary py-2 px-5 font-semibold text-xs inline-flex items-center"
                    >
                      В Мои курсы
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="btn-primary py-2.5 px-6 font-semibold"
                disabled={quizAnswers.includes(-1)}
                onClick={submitQuiz}
              >
                Отправить ответы
              </button>
            </div>
          )}
        </section>
      )}

      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800 sm:p-10">
            <button
              type="button"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
              onClick={() => setShowCertificate(false)}
            >
              ✕
            </button>

            <div className="rounded-xl border-4 border-double border-brand-700 bg-amber-50/10 dark:bg-amber-950/5 p-6 text-center sm:p-8">
              <span className="text-4xl">🎓</span>
              <p className="logo-text text-lg text-brand-800 dark:text-brand-400 mt-2 font-black tracking-widest uppercase">adam-edu</p>
              <h2 className="mt-6 text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-2xl uppercase border-b-2 border-brand-700 dark:border-brand-600 pb-3">
                Сертификат об окончании курса
              </h2>
              <p className="mt-6 text-xs text-slate-500 dark:text-slate-400 italic">Настоящим подтверждается, что пользователь</p>
              <p className="mt-2 text-lg font-black text-slate-850 dark:text-slate-100 sm:text-2xl font-serif tracking-wide border-b border-dashed border-slate-300 dark:border-slate-700 pb-1 max-w-sm mx-auto">
                {user?.name}
              </p>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 italic">успешно завершил обучение и сдал квалификационный тест по курсу:</p>
              <p className="mt-3 text-base font-extrabold text-brand-900 sm:text-xl leading-tight">
                "{course.title}"
              </p>
              <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row">
                <span>Дата выдачи: {new Date().toLocaleDateString("ru-RU")}</span>
                <span className="font-bold text-brand-800 dark:text-brand-400">Идентификатор: AE-{100000 + course.id}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                className="btn-secondary py-2 px-4 text-xs font-bold"
                onClick={() => window.print()}
              >
                Печать / Сохранить PDF
              </button>
              <button
                type="button"
                className="btn-primary py-2 px-4 text-xs font-bold"
                onClick={() => setShowCertificate(false)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="mt-10">
        <h2 className="section-title mb-3">Уроки</h2>
        <div className="card divide-y divide-slate-100 dark:divide-slate-800">
          {course.lessons?.map((l) => {
            const canOpen = course.is_enrolled;
            const inner = (
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-950 text-xs text-brand-800 dark:text-brand-300 font-semibold">
                  {l.completed ? "✓" : l.order_index + 1}
                </span>
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{l.title}</p>
                  {!canOpen && <p className="muted text-xs">Нужна запись на курс</p>}
                </div>
              </div>
            );
            return canOpen ? (
              <Link key={l.id} to={`/courses/${id}/lessons/${l.id}`} className="block hover:bg-slate-50 dark:hover:bg-slate-850">
                {inner}
              </Link>
            ) : (
              <div key={l.id} className="opacity-60">
                {inner}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
