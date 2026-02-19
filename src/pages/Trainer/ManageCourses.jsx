import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { useAuthStore } from '../../store/useAuthStore'
import { deleteCourse, listCoursesPage } from '../../services/courseService'
import { queryKeys } from '../../lib/queryKeys'

function getLevelBadgeClasses(level) {
  const normalized = String(level || '').toLowerCase()

  if (normalized === 'beginner') {
    return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30'
  }

  if (normalized === 'intermediate') {
    return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30'
  }

  if (normalized === 'advanced') {
    return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30'
  }

  return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
}

const ManageCourses = () => {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState('')
  const coursesQuery = useQuery({
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

  const deleteCourseMutation = useMutation({
    mutationFn: (courseId) => deleteCourse(courseId),
    onSuccess: async () => {
      setActionError('')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['courses'] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.trainerDashboard }),
      ])
    },
  })

  const handleDeleteCourse = async (course) => {
    const confirmed = window.confirm(`Delete "${course.title}"? This action cannot be undone.`)
    if (!confirmed) return

    setActionError('')
    try {
      await deleteCourseMutation.mutateAsync(course.id)
    } catch (deleteError) {
      setActionError(deleteError.message || 'Unable to delete course')
    }
  }

  const trainerCourses = coursesQuery.data?.courses || []
  const error = coursesQuery.error?.message || actionError || ''
  const deletingCourseId = deleteCourseMutation.isPending ? deleteCourseMutation.variables : null

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="section-title">Courses</h1>
          <p className="section-subtitle">Control pricing and rosters.</p>
        </div>
        <Button as={Link} to="/trainer/courses/create">
          New course
        </Button>
      </div>
      {error ? <p className="status-error">{error}</p> : null}
      {coursesQuery.isError ? (
        <Card>
          <p className="status-muted">Unable to load courses.</p>
          <Button className="mt-3" size="sm" variant="outline" onClick={() => coursesQuery.refetch()}>
            Retry
          </Button>
        </Card>
      ) : null}
      {coursesQuery.isPending ? <p className="status-muted">Loading courses...</p> : null}
      {!coursesQuery.isPending && trainerCourses.length === 0 ? (
        <p className="status-muted">No courses assigned to your trainer profile yet.</p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {trainerCourses.map((course) => (
          <div
            key={course.id}
            className="fade-in-up group overflow-hidden rounded-2xl bg-white/95 shadow-[0_10px_26px_-16px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_30px_-18px_rgba(37,99,235,0.45)] dark:bg-slate-900/90 dark:ring-slate-800"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50 px-6 dark:from-slate-800 dark:to-slate-900">
                  <p className="line-clamp-3 text-center text-xl font-bold leading-tight text-slate-700/90 dark:text-slate-100/90">
                    {course.title}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 dark:text-white">{course.title}</h3>
                  <span
                    className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${getLevelBadgeClasses(
                      course.level,
                    )}`}
                  >
                    {course.level}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  as={Link}
                  to={`/trainer/courses/${course.id}/edit`}
                  size="sm"
                  variant="outline"
                  className={deleteCourseMutation.isPending ? 'pointer-events-none opacity-60' : ''}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
                  onClick={() => handleDeleteCourse(course)}
                  disabled={deleteCourseMutation.isPending}
                >
                  {deletingCourseId === course.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ManageCourses
