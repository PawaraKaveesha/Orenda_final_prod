export default function ErrorMessage({ error, onRetry, className = '' }) {
  if (!error) return null
  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-2xl bg-red-500/5 px-6 py-10 text-center ring-1 ring-red-500/20 ${className}`}
      role="alert"
    >
      <p className="text-sm font-medium text-red-600">{error.message || 'Something went wrong.'}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-10 items-center justify-center rounded-xl bg-moss-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-moss-700"
        >
          Try again
        </button>
      )}
    </div>
  )
}
