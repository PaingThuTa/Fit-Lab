import { useEffect, useState } from 'react'
import Card from '../../components/Card'
import { getAdminDashboard } from '../../services/adminService'

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const loadDashboard = async () => {
      setError('')
      try {
        const payload = await getAdminDashboard()
        if (mounted) {
          setDashboard(payload)
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || 'Unable to load admin dashboard')
        }
      }
    }

    loadDashboard()
    return () => {
      mounted = false
    }
  }, [])

  const statsSource = dashboard || {
    totalUsers: 0,
    totalMembers: 0,
    totalTrainers: 0,
    pendingTrainerProposals: 0,
    approvedTrainerProposals: 0,
    totalCourses: 0,
    totalEnrollments: 0,
  }

  const stats = [
    { label: 'Total users', value: statsSource.totalUsers },
    { label: 'Total members', value: statsSource.totalMembers },
    { label: 'Total trainers', value: statsSource.totalTrainers },
    { label: 'Pending trainer proposals', value: statsSource.pendingTrainerProposals },
    { label: 'Approved trainer proposals', value: statsSource.approvedTrainerProposals },
    { label: 'Total courses', value: statsSource.totalCourses },
    { label: 'Total enrollments', value: statsSource.totalEnrollments },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Admin overview</h1>
        <p className="text-sm text-slate-500">Audit courses, review trainer proposals, and monitor member activity.</p>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-xs uppercase text-slate-400">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboard
