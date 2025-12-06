import Card from '../../components/Card'
import Button from '../../components/Button'
import { enrollments, courses } from '../../data/mockData'
import { Link } from 'react-router-dom'

const Enrollments = () => {
  return (
    <Card title="Enrolled members" description="Snapshot of who is in your programs">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase text-slate-400">
          <tr>
            <th className="py-3">Member</th>
            <th>Course</th>
            <th>Progress</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {enrollments.map((enrollment) => {
            const course = courses.find((item) => item.id === enrollment.courseId)
            return (
              <tr key={enrollment.id} className="text-slate-600 dark:text-slate-300">
                <td className="py-3 font-medium text-slate-900 dark:text-white">{enrollment.memberName}</td>
                <td>{course?.title ?? 'Removed course'}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-primary-500" style={{ width: `${enrollment.progress}%` }} />
                    </div>
                    {enrollment.progress}%
                  </div>
                </td>
                <td className="text-right">
                  <Button as={Link} to="/trainer/messages" size="sm" variant="outline">
                    Message
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}

export default Enrollments
