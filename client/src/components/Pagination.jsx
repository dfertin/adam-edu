export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="mt-8 flex justify-center gap-2">
      <button type="button" className="btn-secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>←</button>
      <span className="flex items-center px-3 text-sm text-slate-600">
        {page} / {pages}
      </span>
      <button type="button" className="btn-secondary" disabled={page >= pages} onClick={() => onChange(page + 1)}>→</button>
    </div>
  );
}
