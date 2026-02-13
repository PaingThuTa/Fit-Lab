import { useEffect, useState } from 'react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { getTrainerDashboard } from '../../services/dashboardService'

const TrainerDashboard = () => {
  const user = useAuthStore((state) => state.user)
  const trainerName = user?.name ?? 'Avery Cole'
  const [dashboard, setDashboard] = useState({
    liveCourses: 0,
    enrollments: 0,
    memberMessages: 0,
    courses: [],
  })
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const loadDashboard = async () => {
      setError('')
      try {
        const payload = await getTrainerDashboard({ trainerName })
        if (mounted) {
          setDashboard(payload)
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || 'Unable to load trainer dashboard')
        }
      }
    }

    loadDashboard()
    return () => {
      mounted = false
    }
  }, [trainerName])

  const metrics = [
    { label: 'Live courses', value: dashboard.liveCourses, trend: 'Create or edit cohorts' },
    { label: 'Enrollments', value: dashboard.enrollments, trend: 'Track member progress' },
    { label: 'Member messages', value: dashboard.memberMessages, trend: 'Respond to DMs' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Trainer dashboard</h1>
          <p className="text-sm text-slate-500">Manage courses, follow up with enrollments, and message members.</p>
        </div>
        <Button as={Link} to="/trainer/courses/create">
          New course
        </Button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
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
          {dashboard.courses.map((course) => (
            <div key={course.courseId} className="flex flex-wrap items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{course.name}</p>
                <p className="text-xs text-slate-500">{course.sessionCount} lessons • {course.difficulty}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  {course.enrolledCount} enrolled
                </span>
                <Button as={Link} to={`/trainer/courses/${course.courseId}/edit`} variant="outline" size="sm">
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
