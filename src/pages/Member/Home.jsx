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

/* ── shortcut icons ── */
const IconCourses = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
  </svg>
)
const IconEnrollments = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
    <path d="M6.3 2.84A1.5 1.5 0 0 1 7.5 2.25h5a1.5 1.5 0 0 1 1.5 1.5v11.25a.75.75 0 0 1-1.136.643L10 14.305l-2.864 1.338A.75.75 0 0 1 6 15V3.75a1.5 1.5 0 0 1 .3-.91Z" />
  </svg>
)
const IconMessages = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
    <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 0 0 1.28.53l3.58-3.579a.78.78 0 0 1 .527-.224 41.202 41.202 0 0 0 5.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM8 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm5 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
  </svg>
)
const IconArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 opacity-40">
    <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L9.22 5.03a.75.75 0 0 1 1.06-1.06l3.5 3.5a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 1 1-1.06-1.06l2.22-2.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
  </svg>
)

const shortcuts = [
  { icon: <IconCourses />, label: 'Browse Courses', desc: 'Find your next program', to: '/member/courses' },
  { icon: <IconEnrollments />, label: 'My Enrollments', desc: 'Continue where you left off', to: '/member/course' },
  { icon: <IconMessages />, label: 'Messages', desc: 'Chat with your trainer', to: '/member/messages' },
]

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
  const error =
    dashboardQuery.error?.message ||
    coursesQuery.error?.message ||
    proposalQuery.error?.message ||
    ''

  /* ── first name only for greeting ── */
  const firstName = currentName.split(' ')[0]

  return (
    <div className="page-shell grid gap-6 lg:grid-cols-[272px,1fr]">
      {/* ── left panel ── */}
      <div className="space-y-4">
        {/* trainer application status */}
        {myTrainerApplication ? (
          <div className="rounded-2xl border border-primary-200/70 bg-primary-50/60 p-4 dark:border-primary-400/20 dark:bg-primary-500/10">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-primary-500 dark:text-primary-400">
              Trainer Application
            </p>
            <p className="mt-2 text-sm font-semibold capitalize text-slate-900 dark:text-white">
              Status: {myTrainerApplication.status}
            </p>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Update your proposal or check review status.
            </p>
            <Button as={Link} to="/trainer/proposal" variant="outline" size="sm" className="mt-3 w-full justify-start">
              Open trainer proposal
            </Button>
          </div>
        ) : null}

        {/* shortcuts panel */}
        <div className="panel">
          {/* greeting */}
          <div className="mb-4 border-b border-slate-100 pb-4 dark:border-slate-800">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Welcome back
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {firstName}
            </h1>
          </div>

          {/* tiles */}
          <div className="space-y-1.5">
            {shortcuts.map(({ icon, label, desc, to }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all duration-150 hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-800 dark:hover:bg-slate-800/50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                  {icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{desc}</p>
                </div>
                <IconArrow />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── main content ── */}
      <div className="space-y-8">
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
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Courses curated for you
              </h2>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                Review details, check difficulty, and enroll without extra steps.
              </p>
            </div>
            <Button as={Link} to="/member/courses" variant="outline" size="sm">
              View catalog
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {availableCourses.map((course) => (
              <div
                key={course.id}
                className="fade-in-up group overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[0_6px_20px_-6px_rgba(15,23,42,0.15)] dark:border-slate-800 dark:bg-slate-900"
              >
                {/* thumbnail */}
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="h-36 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-36 items-center justify-center bg-gradient-to-br from-primary-100 via-primary-50 to-white px-6 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900">
                    <span className="line-clamp-2 text-center text-lg font-bold text-primary-300 dark:text-slate-600">
                      {course.title}
                    </span>
                  </div>
                )}

                {/* content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[15px] font-bold leading-snug text-slate-900 dark:text-white">
                      {course.title}
                    </h3>
                    <span className="shrink-0 text-sm font-semibold text-primary-600 dark:text-primary-400">
                      {course.price}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium uppercase tracking-widest text-slate-400">
                    {course.level}&nbsp;·&nbsp;{course.category || 'Fitness'}
                  </p>
                  <p className="mt-2.5 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                    {course.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2.5">
                    <Button as={Link} to={`/member/courses/${course.id}`} size="sm" className="h-8 text-[12px]">
                      View details
                    </Button>
                    <Button as={Link} to={`/member/courses/${course.id}?intent=enroll`} variant="outline" size="sm" className="h-8 text-[12px]">
                      Enroll
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {!loading && availableCourses.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-500">
                  You are already enrolled in all listed courses. Use <strong>My Enrollments</strong> to continue learning.
                </p>
              </Card>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Home
