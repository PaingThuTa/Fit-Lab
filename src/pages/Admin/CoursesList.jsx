import { useEffect, useState } from 'react'
import Card from '../../components/Card'
import { getAdminCourses } from '../../services/adminService'

const CoursesList = () => {
  const [courses, setCourses] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const loadCourses = async () => {
      setError('')
      try {
        const payload = await getAdminCourses()
        if (mounted) {
          setCourses(payload)
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || 'Unable to load courses')
        }
      }
    }

    loadCourses()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <Card title="Courses" description="All programs on the platform">
      {error ? <p className="mb-3 status-error">{error}</p> : null}
      <div className="space-y-3 md:hidden">
        {courses.map((course) => (
          <div key={course.courseId} className="mobile-list-row">
            <p className="font-semibold text-slate-900 dark:text-white">{course.name}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">Trainer: {course.trainerName}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{course.difficulty}</p>
          </div>
        ))}
      </div>

      <table className="hidden w-full text-left text-sm md:table">
        <thead className="text-xs uppercase text-slate-400">
          <tr>
            <th className="py-3">Course</th>
            <th>Trainer</th>
            <th>Level</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {courses.map((course) => (
            <tr key={course.courseId} className="text-slate-600 dark:text-slate-300">
              <td className="py-3 font-medium text-slate-900 dark:text-white">{course.name}</td>
              <td>{course.trainerName}</td>
              <td>{course.difficulty}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {courses.length === 0 ? <p className="mt-3 status-muted">No courses available.</p> : null}
    </Card>
  )
}

export default CoursesList
