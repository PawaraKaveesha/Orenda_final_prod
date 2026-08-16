export default function StatCard({ label, value, icon: Icon, trend, tone = 'green' }) {
  const iconTones = {
    green: 'bg-moss-100 text-moss-700',
    orange: 'bg-brass-500/15 text-brass-600',
    dark: 'bg-forest-950 text-brass-400',
  }

  return (
    <div className="rounded-2xl bg-sand-50 p-6 ring-1 ring-sand-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-moss-900/10">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-moss-800/60">
            {label}
          </p>
          <p className="mt-3 font-display text-3xl font-bold text-moss-900">{value}</p>
          {trend && <p className="mt-2 text-xs text-moss-700">{trend}</p>}
        </div>
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconTones[tone]}`}
        >
          <Icon size={22} strokeWidth={2} />
        </span>
      </div>
    </div>
  )
}
