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

  const lessons = Array.isArray(course.lessons) && course.lessons.length
    ? course.lessons
    : (course.syllabus || []).map((topic, index) => ({
        id: `lesson-${index}`,
        title: topic,
        content: '',
      }))

  return (
    <div className="space-y-6">
      <Card
        title={course.title}
        description={`${course.level} • ${course.category || 'Uncategorized'} • Led by ${course.trainerName}`}
        action={<span className="text-2xl font-semibold text-primary-600">{course.price}</span>}
      >
        <p className="text-slate-600 dark:text-slate-300">{course.description}</p>
        <div className="mt-6">
          <p className="text-xs uppercase text-slate-400">Lessons</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {lessons.map((lesson, index) => (
              <li key={lesson.id || `${lesson.title}-${index}`}>
                <p className="font-medium text-slate-700 dark:text-slate-200">{lesson.title}</p>
                {lesson.content ? <p className="text-slate-500 dark:text-slate-400">{lesson.content}</p> : null}
              </li>
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
