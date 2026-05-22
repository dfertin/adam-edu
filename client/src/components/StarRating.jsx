export function StarRating({ value }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-500">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i}>{i <= Math.round(value) ? "★" : "☆"}</span>
      ))}
      <span className="ml-1 text-xs text-slate-500">{value.toFixed(1)}</span>
    </div>
  );
}
