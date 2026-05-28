import { useState } from "react";
import { Link } from "react-router-dom";

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

export function CourseCard({ course }) {
  const [imgErr, setImgErr] = useState(false);

  const gradient = categoryGradients[course.category] || "from-brand-600 to-brand-800 dark:from-brand-700 dark:to-brand-900";

  return (
    <Link
      to={`/courses/${course.id}`}
      className="group card-hover flex h-full flex-col overflow-hidden bg-white dark:bg-slate-900 dark:border-slate-800 transition-colors"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-850">
        {!imgErr && course.image_url ? (
          <img
            src={course.image_url}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-355 group-hover:scale-105"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center p-6 text-center text-white`}>
            <span className="text-sm font-black tracking-wide leading-snug drop-shadow-md">
              {course.title}
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-800 dark:bg-slate-900/95 dark:text-brand-400 shadow-sm backdrop-blur-sm">
          {course.category}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 transition-colors group-hover:text-brand-700 dark:group-hover:text-brand-400 line-clamp-1">
          {course.title}
        </h3>
        <p className="muted mt-2 line-clamp-2 flex-1 text-xs leading-relaxed">
          {course.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 border-t border-slate-100 dark:border-slate-800 pt-3.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>{levelLabels[course.level] || course.level}</span>
          <span>·</span>
          <span>{course.duration} ч</span>
          <span>·</span>
          <span>{course.lessons_count} уроков</span>
        </div>
        <span className="btn-secondary mt-4 w-full py-2 text-center text-xs font-semibold group-hover:bg-brand-50 dark:group-hover:bg-brand-950/40 group-hover:border-brand-300 dark:group-hover:border-brand-800 group-hover:text-brand-800 dark:group-hover:text-brand-300 transition-all">
          Подробнее
        </span>
      </div>
    </Link>
  );
}
