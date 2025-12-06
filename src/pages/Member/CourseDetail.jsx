import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { courses } from '../../data/mockData'

const CourseDetail = () => {
  const { courseId } = useParams()
  const course = useMemo(() => courses.find((item) => item.id === courseId), [courseId])

  if (!course) {
    return (
      <Card title="Course not found">
        <p className="text-sm text-slate-500">This course is no longer available.</p>
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
          <Button>Enroll now</Button>
          <Button as={Link} to="/member/messages" variant="outline">Message trainer</Button>
        </div>
      </Card>
    </div>
  )
}

export default CourseDetail
