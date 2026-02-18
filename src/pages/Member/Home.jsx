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
    duration: course.durationLabel || 'TBD',
    level: course.difficulty || 'BEGINNER',
    trainerName: course.trainerName,
    price: `$${Number(course.price || 0).toFixed(0)}`,
    description: course.description || '',
    syllabus: [],
  }))
  const courses = coursesQuery.data?.courses?.length ? coursesQuery.data.courses : fallbackCourses
  const myEnrollments = (dashboard.myEnrollments || []).map((enrollment) => ({
    id: `${enrollment.courseId}-${enrollment.progressPercent}`,
    courseId: enrollment.courseId,
    progress: enrollment.progressPercent || 0,
  }))
  const myTrainerApplication = proposalQuery.data || null
  const loading = dashboardQuery.isPending || coursesQuery.isPending || proposalQuery.isPending
  const error =
    dashboardQuery.error?.message ||
    coursesQuery.error?.message ||
    proposalQuery.error?.message ||
    ''

  return (
    <div className="grid gap-8 lg:grid-cols-[280px,1fr]">
      <div className="space-y-4">
        {myTrainerApplication ? (
          <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4 dark:border-primary-400/40 dark:bg-slate-900">
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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Member tools</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Your shortcuts</h1>
          <p className="mt-1 text-sm text-slate-500">Jump straight to the essentials.</p>
          <div className="mt-4 space-y-3">
            <Button as={Link} to="/member/courses" variant="outline" className="w-full justify-start">
              Browse courses
            </Button>
            <Button as={Link} to="/member/my-courses" variant="outline" className="w-full justify-start">
              View my enrollments
            </Button>
            <Button as={Link} to="/member/messages" variant="outline" className="w-full justify-start">
              Message my trainer
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
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
            {courses.map((course) => (
              <Card key={course.id} title={course.title} description={`${course.level} • ${course.duration}`}>
                <p className="text-sm text-slate-600 dark:text-slate-300">{course.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-semibold text-primary-600">{course.price}</span>
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <Button as={Link} to={`/member/courses/${course.id}`} size="sm">
                    View details
                  </Button>
                  <Button variant="outline" size="sm">
                    Enroll
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">My enrolled courses</h2>
              <p className="text-sm text-slate-500">Track progress and jump back into the next lesson.</p>
            </div>
            <Button as={Link} to="/member/my-courses" variant="outline">
              Open enrollment list
            </Button>
          </div>
          {!loading && myEnrollments.length === 0 ? (
            <Card>
              <p className="text-sm text-slate-500">No enrollments yet. Start with a course to see it here.</p>
            </Card>
          ) : !loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {myEnrollments.map((item) => {
                const course = courses.find((courseItem) => courseItem.id === item.courseId)
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
                      <Button size="sm" variant="outline">
                        Resume
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}

export default Home
