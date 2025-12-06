import { Link } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { courses, enrollments } from '../../data/mockData'
import { useAuthStore } from '../../store/useAuthStore'

const Home = () => {
  const user = useAuthStore((state) => state.user)
  const currentName = user?.name ?? 'Jordan Wells'
  const myEnrollments = enrollments.filter((item) => item.memberName === currentName)

  return (
    <div className="grid gap-8 lg:grid-cols-[280px,1fr]">
      <div className="space-y-4">
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
                  <span>{course.sessions} Lessons</span>
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
          {myEnrollments.length === 0 ? (
            <Card>
              <p className="text-sm text-slate-500">No enrollments yet. Start with a course to see it here.</p>
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
                      <span>{course?.sessions ?? 0} Lessons</span>
                      <Button size="sm" variant="outline">
                        Resume
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Home
