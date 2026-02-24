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
    <div className="page-shell">
      <div>
        <h1 className="section-title">My courses</h1>
        <p className="section-subtitle">Review enrolled dates and pick up where you left off.</p>
      </div>
      {error ? <p className="status-error">{error}</p> : null}
      {loading ? (
        <Card>
          <p className="status-muted">Loading enrollments...</p>
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
                className="group !p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-18px_rgba(15,23,42,0.45)]"
              >
                <div className="flex items-start gap-4">
                  <div className="aspect-video h-20 w-28 shrink-0 sm:h-[90px] sm:w-40 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/80 dark:bg-slate-800 dark:ring-slate-700/80">
                    {course?.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course?.title || item.courseName || 'Course thumbnail'}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50 px-3 dark:from-slate-800 dark:to-slate-900">
                        <p className="line-clamp-3 text-center text-sm font-bold leading-tight text-slate-700/90 dark:text-slate-100/90">
                          {course?.title || item.courseName || 'Course'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <h3 className="line-clamp-1 text-base font-bold text-slate-900 dark:text-white">
                        {course?.title || item.courseName || 'Course removed'}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Enrolled {formatShortDate(item.enrolledAt)}
                      </p>
                    </div>

                    <div className="flex items-center justify-end">
                      {item.courseId ? (
                        <Button as={Link} to={`/member/courses/${item.courseId}`} size="sm" className="h-9 sm:min-w-[132px]">
                          Resume Learning
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled className="h-9 sm:min-w-[132px]">
                          Course unavailable
                        </Button>
                      )}
                    </div>
                  </div>
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
