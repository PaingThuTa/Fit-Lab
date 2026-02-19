import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { listCoursesPage } from '../../services/courseService'
import { getMyEnrollments } from '../../services/enrollmentService'
import { useAuthStore } from '../../store/useAuthStore'
import { queryKeys } from '../../lib/queryKeys'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'

const ALL_LEVELS = 'All levels'

function getLevelBadgeClasses(level) {
  const normalized = String(level || '').toLowerCase()

  if (normalized === 'beginner') {
    return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30'
  }

  if (normalized === 'intermediate') {
    return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30'
  }

  if (normalized === 'advanced') {
    return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30'
  }

  return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
}

function getLevelHeroClasses(level) {
  const normalized = String(level || '').toLowerCase()

  if (normalized === 'beginner') {
    return 'from-emerald-200 via-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:via-emerald-800/30 dark:to-teal-900/40'
  }

  if (normalized === 'intermediate') {
    return 'from-blue-200 via-sky-100 to-indigo-100 dark:from-blue-900/40 dark:via-blue-800/30 dark:to-indigo-900/40'
  }

  if (normalized === 'advanced') {
    return 'from-violet-200 via-fuchsia-100 to-purple-100 dark:from-violet-900/40 dark:via-violet-800/30 dark:to-purple-900/40'
  }

  return 'from-slate-200 via-slate-100 to-slate-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900'
}

const Courses = () => {
  const [query, setQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState(ALL_LEVELS)
  const user = useAuthStore((state) => state.user)
  const currentName = user?.name || 'Jordan Wells'
  const debouncedQuery = useDebouncedValue(query, 250)

  const coursesQuery = useQuery({
    queryKey: queryKeys.courses({ query: debouncedQuery, limit: 20, offset: 0 }),
    queryFn: ({ signal }) =>
      listCoursesPage({
        query: debouncedQuery,
        limit: 20,
        offset: 0,
        signal,
      }),
    staleTime: 60 * 1000,
  })

  const myEnrollmentsQuery = useQuery({
    queryKey: queryKeys.myEnrollments,
    queryFn: ({ signal }) => getMyEnrollments({ memberName: currentName, signal }),
  })

  const courses = coursesQuery.data?.courses || []
  const enrolledCourseIds = new Set((myEnrollmentsQuery.data || []).map((item) => String(item.courseId)))
  const levelOptions = Array.from(new Set(courses.map((course) => course.level).filter(Boolean)))
  const filteredCourses = courses.filter((course) => levelFilter === ALL_LEVELS || course.level === levelFilter)
  const total = coursesQuery.data?.page?.total ?? filteredCourses.length
  const error = coursesQuery.error?.message || myEnrollmentsQuery.error?.message || ''

  return (
    <div className="page-shell">
      <div className="page-header gap-4">
        <div>
          <h1 className="section-title">Courses</h1>
          <p className="section-subtitle">Discover curated programs designed for every learning stage.</p>
        </div>
        <div className="grid w-full gap-3 sm:w-auto sm:min-w-[420px] sm:grid-cols-[1fr,160px]">
          <Input
            label="Search courses"
            placeholder="Search by title, trainer, or description"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="font-medium text-slate-700 dark:text-slate-200">Level</span>
            <select
              className="field-control"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <option value={ALL_LEVELS}>{ALL_LEVELS}</option>
              {levelOptions.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {error ? <p className="status-error">{error}</p> : null}
      <p className="text-xs text-slate-400">Showing {filteredCourses.length} of {total} courses</p>
      {coursesQuery.isPending ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <Card key={item}>
              <div className="aspect-video w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              <div className="mt-4 h-10 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            </Card>
          ))}
        </div>
      ) : null}
      {coursesQuery.isError ? (
        <Card>
          <p className="text-sm text-slate-500">Unable to load courses.</p>
          <Button className="mt-3" size="sm" variant="outline" onClick={() => coursesQuery.refetch()}>
            Retry
          </Button>
        </Card>
      ) : null}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filteredCourses.map((course) => {
          const isEnrolled = enrolledCourseIds.has(String(course.id))
          return (
            <div
              key={course.id}
              className="fade-in-up group flex h-full flex-col overflow-hidden rounded-3xl bg-white/95 shadow-[0_10px_30px_-16px_rgba(15,23,42,0.26)] ring-1 ring-slate-200/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_44px_-20px_rgba(30,64,175,0.35)] dark:bg-slate-900/95 dark:ring-slate-800"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                {course.thumbnailUrl ? (
                  <>
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-900/10 to-transparent" />
                    <div className="absolute bottom-3 left-3 rounded-lg bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 shadow-sm backdrop-blur dark:bg-slate-900/75 dark:text-slate-200">
                      {course.category || 'Fitness'}
                    </div>
                  </>
                ) : (
                  <div className={`relative flex h-full w-full items-center justify-center bg-gradient-to-br ${getLevelHeroClasses(course.level)}`}>
                    <div className="absolute -left-10 top-8 h-24 w-24 rounded-full bg-white/30 blur-xl dark:bg-white/10" />
                    <div className="absolute -right-8 bottom-6 h-20 w-20 rounded-full bg-white/30 blur-xl dark:bg-white/10" />
                    <div className="relative px-6 text-center">
                      <p className="line-clamp-3 text-2xl font-bold leading-tight text-slate-700/90 dark:text-slate-100/90">
                        {course.title}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${getLevelBadgeClasses(
                        course.level,
                      )}`}
                    >
                      {course.level}
                    </span>
                    {isEnrolled ? (
                      <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-700 ring-1 ring-primary-200 dark:bg-primary-500/10 dark:text-primary-300 dark:ring-primary-500/30">
                        Enrolled
                      </span>
                    ) : null}
                  </div>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{course.price}</span>
                </div>

                <div>
                  <h3 className="line-clamp-2 text-xl font-bold leading-7 text-slate-900 dark:text-white">{course.title}</h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {course.category || 'General Fitness'} • {course.trainerName}
                  </p>
                </div>

                <p className="line-clamp-3 min-h-[60px] text-sm leading-5 text-slate-600 dark:text-slate-300">
                  {course.description || 'Build your skills with structured lessons and guided practice.'}
                </p>

                <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                  <Link
                    to={`/member/courses/${course.id}`}
                    className="text-sm font-medium text-slate-500 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-300"
                  >
                    View details
                  </Link>
                  <Button
                    as={Link}
                    to={isEnrolled ? `/member/courses/${course.id}` : `/member/courses/${course.id}?intent=enroll`}
                    size="sm"
                    className="h-10 min-w-[160px]"
                  >
                    {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
        {filteredCourses.length === 0 && !coursesQuery.isPending && (
          <Card>
            <p className="text-sm text-slate-500">No courses match your search and level filter yet.</p>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Courses
