import { useEffect, useState } from 'react'
import Card from '../../components/Card'
import Button from '../../components/Button'
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
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase text-slate-400">
            <tr>
              <th className="py-3">Course</th>
              <th>Trainer</th>
              <th>Level</th>
              <th className="text-right">Actions</th>
            </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {courses.map((course) => (
            <tr key={course.courseId} className="text-slate-600 dark:text-slate-300">
              <td className="py-3 font-medium text-slate-900 dark:text-white">{course.name}</td>
              <td>{course.trainerName}</td>
              <td>{course.difficulty}</td>
              <td className="text-right">
                <Button size="sm" variant="outline">
                  Audit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export default CoursesList
