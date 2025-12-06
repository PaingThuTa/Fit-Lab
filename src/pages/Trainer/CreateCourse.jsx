import Card from '../../components/Card'
import Input from '../../components/Input'
import Button from '../../components/Button'

const CreateCourse = () => {
  return (
    <Card title="Create course" description="Define the structure and experience">
      <form className="grid gap-4 md:grid-cols-2">
        <Input label="Course title" placeholder="Mobility Reset" className="md:col-span-2" />
        <Input label="Duration" placeholder="6 Weeks" />
        <Input label="Level" placeholder="Beginner" />
        <Input label="Sessions" placeholder="12" />
        <Input label="Spots" placeholder="20" />
        <Input label="Price" placeholder="$149" />
        <label className="md:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Contents (members only)</span>
          <textarea
            className="mt-2 min-h-[160px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Add weekly plans, links, and resources shown only to enrolled members..."
          />
        </label>
        <div className="md:col-span-2 flex gap-3">
          <Button>Create course</Button>
          <Button variant="outline">Save as draft</Button>
        </div>
      </form>
    </Card>
  )
}

export default CreateCourse
