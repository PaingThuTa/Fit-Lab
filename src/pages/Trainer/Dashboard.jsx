import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { getTrainerDashboard } from '../../services/dashboardService'
import { listCoursesPage } from '../../services/courseService'
import { queryKeys } from '../../lib/queryKeys'

const TrainerDashboard = () => {
  const user = useAuthStore((state) => state.user)
  const trainerName = user?.name ?? 'Avery Cole'
  const queryClient = useQueryClient()

  const dashboardQuery = useQuery({
    queryKey: queryKeys.trainerDashboard,
    queryFn: ({ signal }) => getTrainerDashboard({ trainerName, signal }),
  })

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.courses({
        mine: true,
        trainerId: user?.userId || user?.name || '',
        limit: 20,
        offset: 0,
      }),
      queryFn: ({ signal }) =>
        listCoursesPage({
          mine: true,
          trainerId: user?.userId || user?.name,
          limit: 20,
          offset: 0,
          signal,
        }),
      staleTime: 60 * 1000,
    })
  }, [queryClient, user])

  const dashboard = dashboardQuery.data || {
    liveCourses: 0,
    enrollments: 0,
    memberMessages: 0,
    courses: [],
  }
  const error = dashboardQuery.error?.message || ''

  const metrics = [
    { label: 'Live courses', value: dashboard.liveCourses, trend: 'Create or edit courses' },
    { label: 'Enrollments', value: dashboard.enrollments, trend: 'Track member enrollment status' },
    { label: 'Member messages', value: dashboard.memberMessages, trend: 'Respond to DMs' },
  ]

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="section-title">Trainer dashboard</h1>
          <p className="section-subtitle">Manage courses, follow up with enrollments, and message members.</p>
        </div>
        <Button as={Link} to="/trainer/courses/create">
          New course
        </Button>
      </div>
      {error ? <p className="status-error">{error}</p> : null}
      {dashboardQuery.isPending ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((metric) => (
            <Card key={metric}>
              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-3 h-7 w-1/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            </Card>
          ))}
        </div>
      ) : null}
      {!dashboardQuery.isPending ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <p className="text-xs uppercase text-slate-400">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{metric.value}</p>
              <p className="text-xs text-green-500">{metric.trend}</p>
            </Card>
          ))}
        </div>
      ) : null}
      <Card title="Courses" description="See enrollments per course">
        <div className="space-y-4">
          {dashboard.courses.map((course) => (
            <div key={course.courseId} className="flex flex-wrap items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{course.name}</p>
                <p className="text-xs text-slate-500">{course.difficulty}</p>
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
