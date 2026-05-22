import { Link } from "react-router-dom";
import { mediaUrl } from "../api/client";
import { formatPrice } from "../utils/format";
import { StarRating } from "./StarRating";

export function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.slug}`} className="card-hover flex h-full flex-col overflow-hidden">
      <div className="h-32 bg-slate-100">
        {course.image_url && <img src={mediaUrl(course.image_url)} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-brand-700">{course.category?.name}</p>
        <h3 className="mt-1 font-semibold text-slate-800">{course.title}</h3>
        <p className="muted mt-1 line-clamp-2 flex-1 text-sm">{course.short_description}</p>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
          <StarRating value={course.rating_avg || 0} />
          <span className="font-medium text-brand-800">{formatPrice(course.price)}</span>
        </div>
      </div>
    </Link>
  );
}
