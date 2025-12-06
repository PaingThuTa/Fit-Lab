import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { courses } from '../../data/mockData'

const EditCourse = () => {
  const { courseId } = useParams()
  const course = useMemo(() => courses.find((item) => item.id === courseId), [courseId])

  if (!course) {
    return <Card title="Course not found" description="Pick a course from the overview list." />
  }

  return (
    <Card title="Edit course" description="Update the details below">
      <form className="grid gap-4 md:grid-cols-2">
        <Input label="Course title" defaultValue={course.title} className="md:col-span-2" />
        <Input label="Duration" defaultValue={course.duration} />
        <Input label="Level" defaultValue={course.level} />
        <Input label="Sessions" defaultValue={course.sessions} />
        <Input label="Spots" defaultValue={course.spots} />
        <Input label="Price" defaultValue={course.price} />
        <label className="md:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Description</span>
          <textarea
            defaultValue={course.description}
            className="mt-2 min-h-[160px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
        <div className="md:col-span-2 flex gap-3">
          <Button>Save changes</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </form>
    </Card>
  )
}

export default EditCourse
