import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  const end = Math.min(totalPages, start + 4)
  for (let i = start; i <= end; i += 1) pages.push(i)

  return (
    <nav className="mt-6 flex flex-wrap items-center justify-between gap-4" aria-label="Pagination">
      <p className="text-sm text-moss-800/70">
        Page <span className="font-semibold text-moss-900">{page}</span> of {totalPages}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-moss-700 ring-1 ring-sand-200 transition-colors hover:bg-moss-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-sm font-medium transition-colors ${
              p === page
                ? 'bg-moss-600 text-white shadow-sm shadow-moss-600/30'
                : 'text-moss-700 ring-1 ring-sand-200 hover:bg-moss-50'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-moss-700 ring-1 ring-sand-200 transition-colors hover:bg-moss-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </nav>
  )
}
