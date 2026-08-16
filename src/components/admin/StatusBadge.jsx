const styles = {
  New: 'bg-brass-500/10 text-brass-600 ring-brass-500/30',
  Read: 'bg-sand-200 text-moss-800 ring-sand-300',
  Replied: 'bg-moss-500/10 text-moss-700 ring-moss-500/30',
  Pending: 'bg-brass-500/10 text-brass-600 ring-brass-500/30',
  Confirmed: 'bg-moss-500/10 text-moss-700 ring-moss-500/30',
  Cancelled: 'bg-red-500/10 text-red-600 ring-red-500/30',
  Available: 'bg-moss-500/10 text-moss-700 ring-moss-500/30',
  Low: 'bg-brass-500/10 text-brass-600 ring-brass-500/30',
  Booked: 'bg-red-500/10 text-red-600 ring-red-500/30',
  Enabled: 'bg-moss-500/10 text-moss-700 ring-moss-500/30',
  Disabled: 'bg-sand-200 text-moss-800 ring-sand-300',
}

export default function StatusBadge({ status, className = '' }) {
  const tone = styles[status] || styles.Read
  return (
    <span
      className={`inline-flex min-h-6 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${tone} ${className}`}
    >
      {status}
    </span>
  )
}
