import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { getCourseDetail, updateCourse } from '../../services/courseService'

const EditCourse = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    const loadCourse = async () => {
      setError('')
      try {
        const course = await getCourseDetail(courseId)
        if (!mounted) return
        setForm({
          title: course.title,
          duration: course.duration,
          level: course.level,
          sessions: String(course.sessions || ''),
          spots: String(course.spots || ''),
          price: course.price,
          description: course.description || '',
          syllabus: (course.syllabus || []).join('\n'),
        })
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || 'Unable to load course')
        }
      }
    }

    loadCourse()
    return () => {
      mounted = false
    }
  }, [courseId])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSaving(true)

    try {
      await updateCourse(courseId, {
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
      setError(submitError.message || 'Unable to update course')
    } finally {
      setSaving(false)
    }
  }

  if (!form) {
    return <Card title="Loading course" description={error || 'Fetching course details...'} />
  }

  return (
    <Card title="Edit course" description="Update the details below">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <Input label="Course title" name="title" value={form.title} onChange={handleChange} className="md:col-span-2" />
        <Input label="Duration" name="duration" value={form.duration} onChange={handleChange} />
        <Input label="Level" name="level" value={form.level} onChange={handleChange} />
        <Input label="Sessions" name="sessions" value={form.sessions} onChange={handleChange} />
        <Input label="Spots" name="spots" value={form.spots} onChange={handleChange} />
        <Input label="Price" name="price" value={form.price} onChange={handleChange} />
        <label className="md:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Description</span>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="mt-2 min-h-[160px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
        <label className="md:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Syllabus topics</span>
          <textarea
            name="syllabus"
            value={form.syllabus}
            onChange={handleChange}
            className="mt-2 min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
        {error ? <p className="md:col-span-2 text-sm text-red-600">{error}</p> : null}
        <div className="md:col-span-2 flex gap-3">
          <Button type="submit">{saving ? 'Saving...' : 'Save changes'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/trainer/courses')}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default EditCourse
