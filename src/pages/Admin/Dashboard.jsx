import Card from '../../components/Card'
import { courses, enrollments, users } from '../../data/mockData'
import { useAuthStore } from '../../store/useAuthStore'

const AdminDashboard = () => {
  const currentUser = useAuthStore((state) => state.user)
  const applications = useAuthStore((state) => state.trainerApplications)
  const allUsers = currentUser && !users.some((user) => user.email === currentUser.email) ? [currentUser, ...users] : users
  const memberCount = allUsers.filter((user) => user.role === 'member').length
  const trainerCount = allUsers.filter((user) => user.role === 'trainer').length
  const pendingTrainerProposals = applications.filter((application) => application.status === 'pending').length
  const approvedTrainerProposals = applications.filter((application) => application.status === 'approved').length
  const stats = [
    { label: 'Total users', value: allUsers.length },
    { label: 'Total members', value: memberCount },
    { label: 'Total trainers', value: trainerCount },
    { label: 'Pending trainer proposals', value: pendingTrainerProposals },
    { label: 'Approved trainer proposals', value: approvedTrainerProposals },
    { label: 'Total courses', value: courses.length },
    { label: 'Total enrollments', value: enrollments.length },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Admin overview</h1>
        <p className="text-sm text-slate-500">Audit courses, review trainer proposals, and monitor member activity.</p>
      </div>
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
