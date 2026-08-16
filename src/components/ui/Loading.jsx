export default function Loading({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-3 py-14 ${className}`} role="status">
      <span className="flex h-10 w-10 animate-spin rounded-full border-2 border-moss-200 border-t-moss-600" />
      <p className="text-sm text-moss-800/60">{label}</p>
    </div>
  )
}
