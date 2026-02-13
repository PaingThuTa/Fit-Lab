import { useEffect, useState } from 'react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { getTrainerEnrollments } from '../../services/enrollmentService'
import { listCourses } from '../../services/courseService'

const Enrollments = () => {
  const user = useAuthStore((state) => state.user)
  const trainerName = user?.name ?? 'Avery Cole'
  const [trainerEnrollments, setTrainerEnrollments] = useState([])
  const [coursesById, setCoursesById] = useState({})
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      setError('')
      try {
        const [enrollments, courses] = await Promise.all([
          getTrainerEnrollments({ trainerName }),
          listCourses({ mine: true, trainerId: user?.userId || trainerName }),
        ])

        if (!mounted) return
        setTrainerEnrollments(enrollments)
        setCoursesById(
          courses.reduce((acc, course) => {
            acc[course.id] = course
            return acc
          }, {})
        )
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || 'Unable to load enrollments')
        }
      }
    }

    loadData()
    return () => {
      mounted = false
    }
  }, [trainerName, user])

  return (
    <Card title="Enrolled members" description="Snapshot of who is in your programs">
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase text-slate-400">
          <tr>
            <th className="py-3">Member</th>
            <th>Course</th>
            <th>Progress</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {trainerEnrollments.map((enrollment) => {
            const course = coursesById[enrollment.courseId]
            return (
              <tr key={enrollment.id} className="text-slate-600 dark:text-slate-300">
                <td className="py-3 font-medium text-slate-900 dark:text-white">{enrollment.memberName}</td>
                <td>{course?.title ?? 'Removed course'}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-primary-500" style={{ width: `${enrollment.progress}%` }} />
                    </div>
                    {enrollment.progress}%
                  </div>
                </td>
                <td className="text-right">
                  <Button as={Link} to="/trainer/messages" size="sm" variant="outline">
                    Message
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {trainerEnrollments.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No member enrollments for your courses yet.</p>
      ) : null}
    </Card>
  )
}

export default Enrollments
