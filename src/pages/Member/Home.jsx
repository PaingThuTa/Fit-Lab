import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { useAuthStore } from '../../store/useAuthStore'
import { getMemberDashboard } from '../../services/dashboardService'
import { listCoursesPage } from '../../services/courseService'
import { getMyProposal } from '../../services/proposalService'
import { queryKeys } from '../../lib/queryKeys'

const Home = () => {
  const user = useAuthStore((state) => state.user)
  const currentName = user?.name ?? 'Jordan Wells'
  const queryClient = useQueryClient()

  const dashboardQuery = useQuery({
    queryKey: queryKeys.memberDashboard,
    queryFn: ({ signal }) =>
      getMemberDashboard({
        currentName,
        currentEmail: user?.email,
        signal,
      }),
  })

  const coursesQuery = useQuery({
    queryKey: queryKeys.courses({ query: '', limit: 20, offset: 0 }),
    queryFn: ({ signal }) =>
      listCoursesPage({
        limit: 20,
        offset: 0,
        signal,
      }),
    staleTime: 60 * 1000,
  })

  const proposalQuery = useQuery({
    queryKey: ['proposal', 'me'],
    queryFn: ({ signal }) => getMyProposal({ currentUser: user, signal }),
  })

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.courses({ query: '', limit: 20, offset: 0 }),
      queryFn: ({ signal }) =>
        listCoursesPage({
          limit: 20,
          offset: 0,
          signal,
        }),
      staleTime: 60 * 1000,
    })
  }, [queryClient])

  const dashboard = dashboardQuery.data || {}
  const fallbackCourses = (dashboard.courses || []).map((course) => ({
    id: course.courseId,
    title: course.name,
    category: course.category || '',
    level: course.difficulty || 'BEGINNER',
    trainerName: course.trainerName,
    price: `$${Number(course.price || 0).toFixed(0)}`,
    description: course.description || '',
    syllabus: [],
  }))
  const courses = coursesQuery.data?.courses?.length ? coursesQuery.data.courses : fallbackCourses
  const myEnrollments = (dashboard.myEnrollments || []).map((enrollment) => ({
    id: `${enrollment.courseId}-${enrollment.enrolledAt || 'na'}`,
    courseId: enrollment.courseId,
    courseName: enrollment.courseName || '',
    enrolledAt: enrollment.enrolledAt || null,
  }))
  const enrolledCourseIds = new Set(myEnrollments.map((item) => String(item.courseId)))
  const availableCourses = courses.filter((course) => !enrolledCourseIds.has(String(course.id)))
  const myTrainerApplication = proposalQuery.data || null
  const loading = dashboardQuery.isPending || coursesQuery.isPending || proposalQuery.isPending
  const queryError =
    dashboardQuery.error?.message ||
    coursesQuery.error?.message ||
    proposalQuery.error?.message ||
    ''
  const error = queryError

  return (
    <div className="page-shell grid gap-6 lg:grid-cols-[280px,1fr]">
      <div className="space-y-4">
        {myTrainerApplication ? (
          <div className="surface-soft border-primary-200 bg-primary-50/70 dark:border-primary-400/30">
            <p className="text-xs uppercase tracking-[0.25em] text-primary-600 dark:text-primary-300">
              Trainer application
            </p>
            <p className="mt-2 text-sm font-semibold capitalize text-slate-900 dark:text-white">
              Status: {myTrainerApplication.status}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Update your proposal or check review status.
            </p>
            <Button as={Link} to="/trainer/proposal" variant="outline" className="mt-3 w-full justify-start">
              Open trainer proposal
            </Button>
          </div>
        ) : null}
        <div className="panel">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Member tools</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Your shortcuts</h1>
          <p className="mt-1 text-sm text-slate-500">Jump straight to the essentials.</p>
          <div className="mt-4 space-y-3">
            <Button as={Link} to="/member/courses" variant="outline" className="w-full justify-start">
              Browse courses
            </Button>
            <Button as={Link} to="/member/course" variant="outline" className="w-full justify-start">
              View my enrollments
            </Button>
            <Button as={Link} to="/member/messages" variant="outline" className="w-full justify-start">
              Message my trainer
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {error ? <p className="status-error">{error}</p> : null}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[0, 1].map((item) => (
              <Card key={item}>
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              </Card>
            ))}
          </div>
        ) : null}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Courses curated for you</h2>
              <p className="text-sm text-slate-500">Review details, check difficulty, and enroll without extra steps.</p>
            </div>
            <Button as={Link} to="/member/courses" variant="outline">
              View catalog
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {availableCourses.map((course) => (
              <div
                key={course.id}
                className="fade-in-up overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-[var(--shadow-soft)] transition-transform duration-200 hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/90"
              >
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50 px-6 dark:from-slate-800 dark:to-slate-900">
                    <span className="text-center text-xl font-bold leading-snug text-primary-300 dark:text-slate-600">{course.title}</span>
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{course.title}</h3>
                  <p className="mt-0.5 text-xs text-slate-500">{course.level} • {course.category || 'Uncategorized'}</p>
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{course.description}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-semibold text-primary-600">{course.price}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <Button as={Link} to={`/member/courses/${course.id}`} size="sm">
                      View details
                    </Button>
                    <Button as={Link} to={`/member/courses/${course.id}?intent=enroll`} variant="outline" size="sm">
                      Enroll
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {!loading && availableCourses.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-500">You are already enrolled in all listed courses. Use View my enrollments to continue.</p>
              </Card>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Home
