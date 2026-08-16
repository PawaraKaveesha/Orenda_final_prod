import { Link } from 'react-router-dom'
import { Inbox, PlusCircle, Home, BadgePercent, ChevronRight, ArrowUpRight } from 'lucide-react'
import StatCard from '../../components/admin/StatCard'
import StatusBadge from '../../components/admin/StatusBadge'
import Loading from '../../components/ui/Loading'
import ErrorMessage from '../../components/ui/ErrorMessage'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { getDashboardStats } from '../../api/dashboard'
import { listInquiries } from '../../api/inquiries'

export default function AdminDashboard() {
  const { admin } = useAuth()
  const stats = useApi(getDashboardStats)
  const inquiries = useApi(listInquiries)

  const loading = stats.loading || inquiries.loading
  const error = stats.error || inquiries.error

  const recentInquiries = (inquiries.data || []).slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-moss-900">
            Welcome back, {admin?.full_name?.split(' ')[0] || 'Admin'}
          </h2>
          <p className="mt-1 text-sm text-moss-800/70">
            Here is what is happening at Orenda Eco lodge and Spa today.
          </p>
        </div>
        <Link
          to="/admin/inquiries"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-moss-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-moss-700"
        >
          View Inquiries <ArrowUpRight size={16} />
        </Link>
      </div>

      {error ? (
        <ErrorMessage error={error} onRetry={stats.refetch} />
      ) : loading && !stats.data ? (
        <Loading />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="New Inquiries"
              value={stats.data?.newInquiries ?? 0}
              icon={PlusCircle}
              trend="awaiting response"
              tone="green"
            />
            <StatCard
              label="Total Inquiries"
              value={stats.data?.totalInquiries ?? inquiries.data?.length ?? 0}
              icon={Inbox}
              trend="all time"
              tone="orange"
            />
            <StatCard
              label="Total Villas"
              value={stats.data?.totalVillas ?? 0}
              icon={Home}
              trend="on the property"
              tone="green"
            />
            <StatCard
              label="Active Offers"
              value={stats.data?.activeOffers ?? 0}
              icon={BadgePercent}
              trend="currently live"
              tone="dark"
            />
          </div>

          <section className="rounded-2xl bg-sand-50 p-5 ring-1 ring-sand-200">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-display text-lg font-semibold text-moss-900">
                Recent Inquiries
              </h3>
              <Link
                to="/admin/inquiries"
                className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brass-600 transition-colors hover:text-brass-500"
              >
                View all <ChevronRight size={16} />
              </Link>
            </div>

            {recentInquiries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left">
                  <thead>
                    <tr className="border-b border-sand-200 text-[11px] font-semibold uppercase tracking-widest text-moss-800/60">
                      <th className="py-2.5 pr-4">Customer</th>
                      <th className="py-2.5 pr-4">Villa</th>
                      <th className="py-2.5 pr-4">Check-in</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInquiries.map((i) => (
                      <tr key={i.id} className="border-b border-sand-200/70 last:border-0">
                        <td className="py-3 pr-4">
                          <p className="text-sm font-semibold text-moss-900">{i.name}</p>
                          <p className="text-xs text-moss-800/60">{i.id}</p>
                        </td>
                        <td className="py-3 pr-4 text-sm text-moss-800">{i.villa}</td>
                        <td className="py-3 pr-4 text-sm text-moss-800">{i.checkIn}</td>
                        <td className="py-3">
                          <StatusBadge status={i.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-moss-800/50">No inquiries yet.</p>
            )}
          </section>
        </>
      )}
    </div>
  )
}
