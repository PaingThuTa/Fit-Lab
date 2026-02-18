import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { useAuthStore } from '../../store/useAuthStore'
import { deleteCourse, listCoursesPage } from '../../services/courseService'
import { queryKeys } from '../../lib/queryKeys'

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Courses</h1>
          <p className="text-sm text-slate-500">Control pricing and rosters.</p>
        </div>
        <Button as={Link} to="/trainer/courses/create">
          New course
        </Button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {coursesQuery.isError ? (
        <Card>
          <p className="text-sm text-slate-500">Unable to load courses.</p>
          <Button className="mt-3" size="sm" variant="outline" onClick={() => coursesQuery.refetch()}>
            Retry
          </Button>
        </Card>
      ) : null}
      <Card>
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-400">
            <tr>
              <th className="py-3">Course</th>
              <th>Level</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {trainerCourses.map((course) => (
              <tr key={course.id} className="text-slate-600 dark:text-slate-300">
                <td className="py-3 font-medium text-slate-900 dark:text-white">{course.title}</td>
                <td>{course.level}</td>
                <td className="text-right">
                  <div className="flex justify-end gap-2">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coursesQuery.isPending ? (
          <p className="mt-3 text-sm text-slate-500">Loading courses...</p>
        ) : null}
        {!coursesQuery.isPending && trainerCourses.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No courses assigned to your trainer profile yet.</p>
        ) : null}
      </Card>
    </div>
  )
}

export default ManageCourses
