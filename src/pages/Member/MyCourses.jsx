import { Link } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { enrollments, courses } from '../../data/mockData'
import { useAuthStore } from '../../store/useAuthStore'

const MyCourses = () => {
  const user = useAuthStore((state) => state.user)
  const currentName = user?.name ?? 'Jordan Wells'
  const myEnrollments = enrollments.filter((item) => item.memberName === currentName)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">My courses</h1>
        <p className="text-sm text-slate-500">Track your progress and pickup where you left off.</p>
      </div>
      {myEnrollments.length === 0 ? (
        <Card title="No enrollments yet">
          <p className="text-sm text-slate-500">Register for a program to unlock milestones.</p>
          <Button as={Link} to="/member/courses" className="mt-4">
            Explore courses
          </Button>
        </Card>
      ) : (
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
                  <span>{course?.sessions ?? 0} Sessions</span>
                  <Button size="sm">Resume</Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MyCourses
