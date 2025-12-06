import Card from '../../components/Card'
import Button from '../../components/Button'
import { courses, enrollments, messageThreads } from '../../data/mockData'
import { useAuthStore } from '../../store/useAuthStore'

const TrainerDashboard = () => {
  const user = useAuthStore((state) => state.user)
  const trainerName = user?.name ?? 'Avery Cole'
  const trainerThreads = messageThreads.filter((thread) => thread.trainerName === trainerName)
  const totalEnrollments = enrollments.length
  const memberMessages = trainerThreads.length
  const metrics = [
    { label: 'Live courses', value: courses.length, trend: 'Create or edit cohorts' },
    { label: 'Enrollments', value: totalEnrollments, trend: 'Track member progress' },
    { label: 'Member messages', value: memberMessages, trend: 'Respond to DMs' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Trainer dashboard</h1>
          <p className="text-sm text-slate-500">Manage courses, follow up with enrollments, and message members.</p>
        </div>
        <Button>New course</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <p className="text-xs uppercase text-slate-400">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{metric.value}</p>
            <p className="text-xs text-green-500">{metric.trend}</p>
          </Card>
        ))}
      </div>
      <Card title="Courses" description="See enrollments per cohort">
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="flex flex-wrap items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{course.title}</p>
                <p className="text-xs text-slate-500">{course.sessions} lessons • {course.level}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  {enrollments.filter((enrollment) => enrollment.courseId === course.id).length} enrolled
                </span>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default TrainerDashboard
