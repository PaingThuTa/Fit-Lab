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

function getLevelConfig(level) {
  const normalized = String(level || '').toLowerCase()
  if (normalized === 'beginner') {
    return {
      badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25',
      dot: 'bg-emerald-500',
      hero: 'from-emerald-100 via-teal-50 to-emerald-50 dark:from-emerald-900/40 dark:via-emerald-800/25 dark:to-teal-900/30',
    }
  }
  if (normalized === 'intermediate') {
    return {
      badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/25',
      dot: 'bg-blue-500',
      hero: 'from-blue-100 via-sky-50 to-indigo-50 dark:from-blue-900/40 dark:via-blue-800/25 dark:to-indigo-900/30',
    }
  }
  if (normalized === 'advanced') {
    return {
      badge: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/25',
      dot: 'bg-violet-500',
      hero: 'from-violet-100 via-fuchsia-50 to-purple-50 dark:from-violet-900/40 dark:via-violet-800/25 dark:to-purple-900/30',
    }
  }
  return {
    badge: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
    dot: 'bg-slate-400',
    hero: 'from-slate-100 via-slate-50 to-white dark:from-slate-800 dark:via-slate-700 dark:to-slate-900',
  }
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
      {/* ── header ── */}
      <div className="page-header gap-4">
        <div>
          <h1 className="section-title">Courses</h1>
          <p className="section-subtitle">Discover curated programs designed for every learning stage.</p>
        </div>
        <div className="grid w-full gap-3 md:w-auto md:min-w-[420px] md:grid-cols-[1fr,160px]">
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

      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
        Showing {filteredCourses.length} of {total} courses
      </p>

      {/* ── skeleton ── */}
      {coursesQuery.isPending ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="aspect-video w-full animate-pulse bg-slate-100 dark:bg-slate-800" />
              <div className="p-5 space-y-3">
                <div className="h-3.5 w-1/3 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                <div className="pt-1 h-9 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
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

      {/* ── course grid ── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => {
          const isEnrolled = enrolledCourseIds.has(String(course.id))
          const lvl = getLevelConfig(course.level)

          return (
            <article
              key={course.id}
              className="fade-in-up group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[0_8px_30px_-8px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-slate-900"
            >
              {/* ── thumbnail ── */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                {course.thumbnailUrl ? (
                  <>
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 rounded-lg bg-white/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-700 backdrop-blur dark:bg-slate-900/80 dark:text-slate-200">
                      {course.category || 'Fitness'}
                    </div>
                  </>
                ) : (
                  <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${lvl.hero}`}>
                    <p className="line-clamp-2 px-6 text-center text-xl font-bold text-slate-500/70 dark:text-slate-300/60">
                      {course.title}
                    </p>
                  </div>
                )}
              </div>

              {/* ── content ── */}
              <div className="flex flex-1 flex-col gap-3 p-5">
                {/* badges + price row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${lvl.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${lvl.dot}`} />
                      {course.level}
                    </span>
                    {isEnrolled && (
                      <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-700 ring-1 ring-primary-200 dark:bg-primary-500/10 dark:text-primary-300 dark:ring-primary-500/25">
                        Enrolled
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 rounded-lg bg-slate-50 px-2.5 py-1 text-[13px] font-semibold text-slate-800 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700">
                    {course.price}
                  </span>
                </div>

                {/* title + attribution */}
                <div>
                  <h3 className="line-clamp-2 text-[17px] font-bold leading-snug text-slate-900 dark:text-white">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {course.category || 'General Fitness'}&nbsp;·&nbsp;{course.trainerName}
                  </p>
                </div>

                {/* description */}
                <p className="line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {course.description || 'Build your skills with structured lessons and guided practice.'}
                </p>

                {/* divider */}
                <div className="h-px bg-slate-100 dark:bg-slate-800" />

                {/* actions */}
                <div className="flex items-center justify-between gap-3">
                  <Link
                    to={`/member/courses/${course.id}`}
                    className="text-[13px] font-medium text-slate-400 transition-colors hover:text-primary-600 dark:text-slate-500 dark:hover:text-primary-300"
                  >
                    View details
                  </Link>
                  <Button
                    as={Link}
                    to={isEnrolled ? `/member/courses/${course.id}` : `/member/courses/${course.id}?intent=enroll`}
                    size="sm"
                    className="h-9 sm:min-w-[148px] text-[13px]"
                  >
                    {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
                  </Button>
                </div>
              </div>
            </article>
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
