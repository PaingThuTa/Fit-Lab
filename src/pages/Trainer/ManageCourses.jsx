import { Link } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { courses } from '../../data/mockData'
import { useAuthStore } from '../../store/useAuthStore'

const ManageCourses = () => {
  const user = useAuthStore((state) => state.user)
  const trainerName = user?.name ?? 'Avery Cole'
  const trainerCourses = courses.filter((course) => course.trainerName === trainerName)

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
        {trainerCourses.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No courses assigned to your trainer profile yet.</p>
        ) : null}
      </Card>
    </div>
  )
}

export default ManageCourses
