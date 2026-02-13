import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { getCourseDetail } from '../../services/courseService'
import { enrollInCourse } from '../../services/enrollmentService'
import { useAuthStore } from '../../store/useAuthStore'

const CourseDetail = () => {
  const { courseId } = useParams()
  const user = useAuthStore((state) => state.user)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let mounted = true
    const loadCourse = async () => {
      setLoading(true)
      setError('')

      try {
        const nextCourse = await getCourseDetail(courseId)
        if (mounted) {
          setCourse(nextCourse)
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || 'Unable to load course')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadCourse()
    return () => {
      mounted = false
    }
  }, [courseId])

  const handleEnroll = async () => {
    setError('')
    setNotice('')
    try {
      await enrollInCourse(courseId, { memberName: user?.name || 'Jordan Wells' })
      setNotice('Enrollment successful.')
    } catch (enrollError) {
      setError(enrollError.message || 'Unable to enroll')
    }
  }

  if (loading) {
    return (
      <Card title="Loading course">
        <p className="text-sm text-slate-500">Fetching course details...</p>
      </Card>
    )
  }

  if (!course) {
    return (
      <Card title="Course not found">
        <p className="text-sm text-slate-500">{error || 'This course is no longer available.'}</p>
        <Button as={Link} to="/member/courses" className="mt-4" variant="outline">
          Back to courses
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card
        title={course.title}
        description={`${course.level} • ${course.duration} • Led by ${course.trainerName}`}
        action={<span className="text-2xl font-semibold text-primary-600">{course.price}</span>}
      >
        <p className="text-slate-600 dark:text-slate-300">{course.description}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase text-slate-400">Sessions</p>
            <p className="text-2xl font-semibold">{course.sessions}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">Program spots</p>
            <p className="text-2xl font-semibold">{course.spots}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">Format</p>
            <p className="text-lg font-semibold">Hybrid</p>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-xs uppercase text-slate-400">Syllabus highlights</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {course.syllabus.map((topic) => (
              <li key={topic}>• {topic}</li>
            ))}
          </ul>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={handleEnroll}>Enroll now</Button>
          <Button as={Link} to="/member/messages" variant="outline">Message trainer</Button>
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {notice ? <p className="mt-3 text-sm text-emerald-600">{notice}</p> : null}
      </Card>
    </div>
  )
}

export default CourseDetail
