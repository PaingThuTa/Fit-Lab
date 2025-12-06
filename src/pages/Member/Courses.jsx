import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { courses } from '../../data/mockData'

const Courses = () => {
  const [query, setQuery] = useState('')
  const filteredCourses = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return courses
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term) ||
        course.trainerName.toLowerCase().includes(term),
    )
  }, [query])

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
      <div className="grid gap-6 md:grid-cols-2">
        {filteredCourses.map((course) => (
          <Card
            key={course.id}
            title={course.title}
            description={`${course.level} • ${course.duration} • ${course.sessions} sessions`}
            action={<span className="text-sm font-semibold text-primary-600">{course.price}</span>}
          >
            <p className="text-sm text-slate-600 dark:text-slate-300">{course.description}</p>
            <p className="mt-3 text-xs uppercase tracking-wider text-slate-400">Trainer • {course.trainerName}</p>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>{course.spots} spots</span>
              <div className="flex gap-2">
                <Button as={Link} to={`/member/courses/${course.id}`} size="sm">
                  Details
                </Button>
                <Button variant="outline" size="sm">
                  Enroll
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {filteredCourses.length === 0 && (
          <Card>
            <p className="text-sm text-slate-500">No courses match your search yet.</p>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Courses
