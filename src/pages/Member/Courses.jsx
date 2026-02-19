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

const Courses = () => {
  const [query, setQuery] = useState('')
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
  const total = coursesQuery.data?.page?.total ?? courses.length
  const error = coursesQuery.error?.message || myEnrollmentsQuery.error?.message || ''

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Courses</h1>
          <p className="text-sm text-slate-500">Mix live cohorts with on-demand series.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[280px]">
          <Input
            label="Search courses"
            placeholder="Search by title, trainer, or description"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <p className="text-xs text-slate-400">{total} courses</p>
      {coursesQuery.isPending ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[0, 1].map((item) => (
            <Card key={item}>
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
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
      <div className="grid gap-6 md:grid-cols-2">
        {courses.map((course) => {
          const isEnrolled = enrolledCourseIds.has(String(course.id))
          return (
            <Card
              key={course.id}
              title={course.title}
              description={`${course.level} • ${course.category || 'Uncategorized'}`}
              action={<span className="text-sm font-semibold text-primary-600">{course.price}</span>}
            >
              <p className="text-sm text-slate-600 dark:text-slate-300">{course.description}</p>
              <p className="mt-3 text-xs uppercase tracking-wider text-slate-400">Trainer • {course.trainerName}</p>
              <div className="mt-4 flex items-center justify-end text-sm text-slate-500">
                <div className="flex gap-2">
                  <Button as={Link} to={`/member/courses/${course.id}`} size="sm">
                    Details
                  </Button>
                  {isEnrolled ? (
                    <Button as={Link} to={`/member/courses/${course.id}`} variant="outline" size="sm">
                      Resume
                    </Button>
                  ) : (
                    <Button as={Link} to={`/member/courses/${course.id}?intent=enroll`} variant="outline" size="sm">
                      Enroll
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
        {courses.length === 0 && !coursesQuery.isPending && (
          <Card>
            <p className="text-sm text-slate-500">No courses match your search yet.</p>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Courses
