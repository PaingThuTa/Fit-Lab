import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { getCourseDetail } from '../../services/courseService'
import { enrollInCourse, getMyEnrollments } from '../../services/enrollmentService'
import { useAuthStore } from '../../store/useAuthStore'
import { queryKeys } from '../../lib/queryKeys'

const CourseDetail = () => {
  const { courseId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const currentName = user?.name || 'Jordan Wells'
  const queryClient = useQueryClient()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false)

  const shouldPromptEnroll = searchParams.get('intent') === 'enroll'

  const myEnrollmentsQuery = useQuery({
    queryKey: queryKeys.myEnrollments,
    queryFn: ({ signal }) => getMyEnrollments({ memberName: currentName, signal }),
  })

  const enrollMutation = useMutation({
    mutationFn: () => enrollInCourse(courseId, { memberName: currentName }),
    onSuccess: async () => {
      setNotice('Enrollment successful.')
      setShowEnrollConfirm(false)
      setSearchParams({}, { replace: true })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.myEnrollments }),
        queryClient.invalidateQueries({ queryKey: queryKeys.memberDashboard }),
      ])
    },
    onError: (enrollError) => {
      setError(enrollError.message || 'Unable to enroll')
    },
  })

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
    enrollMutation.mutate()
  }

  const enrolledCourseIds = new Set((myEnrollmentsQuery.data || []).map((item) => String(item.courseId)))
  const isEnrolled = enrolledCourseIds.has(String(courseId))
  const queryError = myEnrollmentsQuery.error?.message || ''
  const displayError = error || queryError

  useEffect(() => {
    if (!isEnrolled && shouldPromptEnroll) {
      setShowEnrollConfirm(true)
      return
    }

    setShowEnrollConfirm(false)
  }, [isEnrolled, shouldPromptEnroll])

  if (loading) {
    return (
      <Card title="Loading course">
        <p className="status-muted">Fetching course details...</p>
      </Card>
    )
  }

  if (!course) {
    return (
      <Card title="Course not found">
        <p className="status-muted">{error || 'This course is no longer available.'}</p>
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
    <div className="page-shell">
      {course.thumbnailUrl ? (
        <div className="fade-in-up overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <img src={course.thumbnailUrl} alt={course.title} className="h-56 w-full object-cover md:h-72" />
        </div>
      ) : null}
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
                {isEnrolled && lesson.content ? <p className="text-slate-500 dark:text-slate-400">{lesson.content}</p> : null}
              </li>
            ))}
          </ul>
          {!isEnrolled ? (
            <p className="mt-3 text-xs text-slate-500">
              Enroll to unlock full lesson content.
            </p>
          ) : null}
        </div>
        {!isEnrolled ? (
          showEnrollConfirm ? (
            <div className="surface-soft mt-6">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Confirm enrollment for this course?
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Button onClick={handleEnroll} disabled={enrollMutation.isPending}>
                  {enrollMutation.isPending ? 'Enrolling...' : 'Confirm enroll'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEnrollConfirm(false)
                    setSearchParams({}, { replace: true })
                  }}
                >
                  Not now
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => setShowEnrollConfirm(true)}>Enroll now</Button>
              <Button as={Link} to="/member/messages" variant="outline">Message trainer</Button>
            </div>
          )
        ) : null}
        {displayError ? <p className="mt-3 status-error">{displayError}</p> : null}
        {notice ? <p className="mt-3 status-success">{notice}</p> : null}
      </Card>
    </div>
  )
}

export default CourseDetail
