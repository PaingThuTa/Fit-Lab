import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { createCourse } from '../../services/courseService'

const CreateCourse = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    duration: '',
    level: '',
    sessions: '',
    spots: '',
    price: '',
    description: '',
    syllabus: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      await createCourse({
        title: form.title,
        duration: form.duration,
        level: form.level,
        sessions: Number(form.sessions || 0),
        spots: Number(form.spots || 0),
        price: form.price,
        description: form.description,
        syllabus: form.syllabus
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
      })

      navigate('/trainer/courses')
    } catch (submitError) {
      setError(submitError.message || 'Unable to create course')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card title="Create course" description="Define the structure and experience">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <Input label="Course title" name="title" value={form.title} onChange={handleChange} placeholder="Mobility Reset" className="md:col-span-2" />
        <Input label="Duration" name="duration" value={form.duration} onChange={handleChange} placeholder="6 Weeks" />
        <Input label="Level" name="level" value={form.level} onChange={handleChange} placeholder="Beginner" />
        <Input label="Sessions" name="sessions" value={form.sessions} onChange={handleChange} placeholder="12" />
        <Input label="Spots" name="spots" value={form.spots} onChange={handleChange} placeholder="20" />
        <Input label="Price" name="price" value={form.price} onChange={handleChange} placeholder="$149" />
        <label className="md:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Description</span>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="mt-2 min-h-[160px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Describe the course experience..."
          />
        </label>
        <label className="md:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Syllabus topics (one per line)</span>
          <textarea
            name="syllabus"
            value={form.syllabus}
            onChange={handleChange}
            className="mt-2 min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Movement assessment&#10;Tempo lifting for strength&#10;Accessory stability toolkit"
          />
        </label>
        {error ? <p className="md:col-span-2 text-sm text-red-600">{error}</p> : null}
        <div className="md:col-span-2 flex gap-3">
          <Button type="submit">{saving ? 'Saving...' : 'Create course'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/trainer/courses')}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default CreateCourse
