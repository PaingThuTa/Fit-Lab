import { useEffect, useState } from 'react'
import Card from '../../components/Card'
import { getAdminPayments } from '../../services/adminService'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function statusBadge(status) {
  switch (status) {
    case 'success':
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-700/20 dark:text-green-300">
          Paid
        </span>
      )
    case 'pending':
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-300">
          Pending
        </span>
      )
    case 'failed':
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-700/20 dark:text-red-300">
          Failed
        </span>
      )
    case 'refunded':
      return (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          Refunded
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          {status}
        </span>
      )
  }
}

const PaymentsDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const debouncedSearch = useDebouncedValue(search, 300)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const payload = await getAdminPayments({
          page,
          limit: 20,
          search: debouncedSearch,
          status,
          dateFrom,
          dateTo,
        })
        if (mounted) setData(payload)
      } catch (err) {
        if (mounted) setError(err.message || 'Unable to load payments')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [debouncedSearch, status, dateFrom, dateTo, page])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status, dateFrom, dateTo])

  const payments = data?.payments ?? []
  const pagination = data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 }
  const summary = data?.summary ?? {
    totalCount: 0,
    totalRevenue: 0,
    paidCount: 0,
    pendingCount: 0,
    failedCount: 0,
    refundedCount: 0,
  }

  const summaryCards = [
    { label: 'Total payments', value: summary.totalCount },
    { label: 'Total revenue', value: fmt.format(summary.totalRevenue) },
    { label: 'Paid', value: summary.paidCount },
    { label: 'Pending', value: summary.pendingCount },
    { label: 'Failed', value: summary.failedCount },
    { label: 'Refunded', value: summary.refundedCount },
  ]

  return (
    <div className="page-shell">
      <h1 className="section-title">Payments</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <p className="text-xs uppercase text-slate-400">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{card.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search member, trainer, course, ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input flex-1 min-w-[180px]"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input w-40"
          >
            <option value="">All statuses</option>
            <option value="success">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input w-40"
            title="From date"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input w-40"
            title="To date"
          />
        </div>
      </Card>

      {/* Table */}
      <Card
        title="Payment Records"
        description={
          pagination.total > 0
            ? `Showing ${payments.length} of ${pagination.total} records`
            : undefined
        }
      >
        {error ? <p className="mb-3 status-error">{error}</p> : null}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="space-y-3 md:hidden">
              {payments.length === 0 ? (
                <p className="status-muted text-center py-6">No payments found.</p>
              ) : (
                payments.map((p) => (
                  <div key={p.paymentId} className="mobile-list-row">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900 dark:text-white">{p.memberName}</p>
                      {statusBadge(p.status)}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{p.courseName}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{fmt.format(p.amount)}</span>
                      <span>·</span>
                      <span>{new Date(p.createdAt).toLocaleString()}</span>
                      {p.cardLastFour ? <span>· ···{p.cardLastFour}</span> : null}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop table */}
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-3 pr-3">Payment ID</th>
                  <th className="pr-3">Member</th>
                  <th className="pr-3">Trainer</th>
                  <th className="pr-3">Course</th>
                  <th className="pr-3">Amount</th>
                  <th className="pr-3">Date</th>
                  <th className="pr-3">Status</th>
                  <th>Card</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center">
                      <p className="status-muted">No payments found.</p>
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.paymentId} className="text-slate-600 dark:text-slate-300">
                      <td className="py-3 pr-3 font-mono text-xs text-slate-400">{p.paymentId.slice(0, 8)}…</td>
                      <td className="pr-3 font-medium text-slate-900 dark:text-white">{p.memberName}</td>
                      <td className="pr-3">{p.trainerName}</td>
                      <td className="pr-3">{p.courseName}</td>
                      <td className="pr-3 tabular-nums">{fmt.format(p.amount)}</td>
                      <td className="pr-3 text-xs">{new Date(p.createdAt).toLocaleString()}</td>
                      <td className="pr-3">{statusBadge(p.status)}</td>
                      <td>{p.cardLastFour ? `···${p.cardLastFour}` : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn-secondary disabled:opacity-40"
                >
                  Prev
                </button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="btn-secondary disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        )}
      </Card>
    </div>
  )
}

export default PaymentsDashboard
