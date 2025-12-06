import Card from '../../components/Card'
import { courses, enrollments, users, trainerApplicants } from '../../data/mockData'

const AdminDashboard = () => {
  const memberCount = users.filter((user) => user.role === 'member').length
  const trainerCount = users.filter((user) => user.role === 'trainer').length
  const pendingTrainerProposals = trainerApplicants.length
  const stats = [
    { label: 'Total users', value: users.length },
    { label: 'Total members', value: memberCount },
    { label: 'Total trainers', value: trainerCount },
    { label: 'Pending trainer proposals', value: pendingTrainerProposals },
    { label: 'Approved trainers', value: Math.max(trainerCount - pendingTrainerProposals, 0) },
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
