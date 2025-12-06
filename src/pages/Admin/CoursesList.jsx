import Card from '../../components/Card'
import Button from '../../components/Button'
import { courses } from '../../data/mockData'

const CoursesList = () => {
  return (
    <Card title="Courses" description="All programs on the platform">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase text-slate-400">
          <tr>
            <th className="py-3">Course</th>
            <th>Trainer</th>
            <th>Level</th>
            <th>Spots</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {courses.map((course) => (
            <tr key={course.id} className="text-slate-600 dark:text-slate-300">
              <td className="py-3 font-medium text-slate-900 dark:text-white">{course.title}</td>
              <td>{course.trainerName}</td>
              <td>{course.level}</td>
              <td>{course.spots}</td>
              <td className="text-right">
                <Button size="sm" variant="outline">
                  Audit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export default CoursesList
