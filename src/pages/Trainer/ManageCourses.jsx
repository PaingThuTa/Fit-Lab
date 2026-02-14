import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { useAuthStore } from '../../store/useAuthStore'
import { listCoursesPage } from '../../services/courseService'
import { queryKeys } from '../../lib/queryKeys'

const ManageCourses = () => {
  const user = useAuthStore((state) => state.user)
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
  const trainerCourses = coursesQuery.data?.courses || []
  const error = coursesQuery.error?.message || ''

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Courses</h1>
          <p className="text-sm text-slate-500">Control pricing, sessions, and rosters.</p>
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
              <th>Sessions</th>
              <th>Spots</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {trainerCourses.map((course) => (
              <tr key={course.id} className="text-slate-600 dark:text-slate-300">
                <td className="py-3 font-medium text-slate-900 dark:text-white">{course.title}</td>
                <td>{course.level}</td>
                <td>{course.sessions}</td>
                <td>{course.spots}</td>
                <td className="text-right">
                  <Button as={Link} to={`/trainer/courses/${course.id}/edit`} size="sm" variant="outline">
                    Edit
                  </Button>
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
