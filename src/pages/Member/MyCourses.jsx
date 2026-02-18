import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { useAuthStore } from '../../store/useAuthStore'
import { getMyEnrollments } from '../../services/enrollmentService'
import { listCourses } from '../../services/courseService'
import { formatShortDate } from '../../services/formatters'

const MyCourses = () => {
  const user = useAuthStore((state) => state.user)
  const currentName = user?.name ?? 'Jordan Wells'
  const [myEnrollments, setMyEnrollments] = useState([])
  const [coursesById, setCoursesById] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const [enrollments, courses] = await Promise.all([
          getMyEnrollments({ memberName: currentName }),
          listCourses(),
        ])

        if (!mounted) return

        setMyEnrollments(enrollments)
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
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadData()
    return () => {
      mounted = false
    }
  }, [currentName])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">My courses</h1>
        <p className="text-sm text-slate-500">Review enrolled dates and pick up where you left off.</p>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <Card>
          <p className="text-sm text-slate-500">Loading enrollments...</p>
        </Card>
      ) : null}
      {!loading && myEnrollments.length === 0 ? (
        <Card title="No enrollments yet">
          <p className="text-sm text-slate-500">Register for a program to unlock milestones.</p>
          <Button as={Link} to="/member/courses" className="mt-4">
            Explore courses
          </Button>
        </Card>
      ) : !loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {myEnrollments.map((item) => {
            const course = coursesById[item.courseId]
            return (
              <Card
                key={item.id}
                title={course?.title || item.courseName || 'Course removed'}
                description={`Enrolled ${formatShortDate(item.enrolledAt)}`}
              >
                <div className="mt-4 flex items-center justify-between text-sm">
                  {item.courseId ? (
                    <Button as={Link} to={`/member/courses/${item.courseId}`} size="sm">
                      Resume
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      Course unavailable
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default MyCourses
