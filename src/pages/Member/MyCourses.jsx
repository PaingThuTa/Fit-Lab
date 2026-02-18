import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { useAuthStore } from '../../store/useAuthStore'
import { getMyEnrollments } from '../../services/enrollmentService'
import { listCourses } from '../../services/courseService'

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
        <p className="text-sm text-slate-500">Track your progress and pickup where you left off.</p>
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
                title={course?.title ?? 'Course removed'}
                description={`Progress ${item.progress}%`}
              >
                <div className="mt-4 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-primary-500"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <Button size="sm">Resume</Button>
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
