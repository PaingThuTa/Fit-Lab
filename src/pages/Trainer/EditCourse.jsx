import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { getCourseDetail, updateCourse } from '../../services/courseService'
import { queryKeys } from '../../lib/queryKeys'

const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced']

const EditCourse = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')

  const courseQuery = useQuery({
    queryKey: ['course', courseId],
    queryFn: ({ signal }) => getCourseDetail(courseId, { signal }),
    enabled: Boolean(courseId),
  })

  const updateCourseMutation = useMutation({
    mutationFn: (payload) => updateCourse(courseId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.courses({}) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.trainerDashboard }),
        queryClient.invalidateQueries({ queryKey: ['course', courseId] }),
      ])
      navigate('/trainer/courses')
    },
  })

  const initialForm = useMemo(() => {
    const course = courseQuery.data
    if (!course) return null
    return {
      title: course.title,
      duration: course.duration,
      level: course.level,
      price: course.price,
      description: course.description || '',
      syllabus: (course.syllabus || []).join('\n'),
    }
  }, [courseQuery.data])
  const currentForm = form || initialForm

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...(prev || initialForm), [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!currentForm) return
    try {
      await updateCourseMutation.mutateAsync({
        title: currentForm.title,
        duration: currentForm.duration,
        level: currentForm.level,
        price: currentForm.price,
        description: currentForm.description,
        syllabus: currentForm.syllabus
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
      })
    } catch (submitError) {
      setError(submitError.message || 'Unable to update course')
    }
  }

  if (!currentForm) {
    return <Card title="Loading course" description={error || courseQuery.error?.message || 'Fetching course details...'} />
  }

  return (
    <Card title="Edit course" description="Update the details below">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <Input label="Course title" name="title" value={currentForm.title} onChange={handleChange} className="md:col-span-2" />
        <Input label="Duration" name="duration" value={currentForm.duration} onChange={handleChange} />
        <label className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="font-medium text-slate-700 dark:text-slate-200">Level</span>
          <select
            name="level"
            value={currentForm.level}
            onChange={handleChange}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">Select level</option>
            {DIFFICULTY_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
        <Input label="Price" name="price" value={currentForm.price} onChange={handleChange} />
        <label className="md:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Description</span>
          <textarea
            name="description"
            value={currentForm.description}
            onChange={handleChange}
            className="mt-2 min-h-[160px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
        <label className="md:col-span-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Syllabus topics</span>
          <textarea
            name="syllabus"
            value={currentForm.syllabus}
            onChange={handleChange}
            className="mt-2 min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
        {error ? <p className="md:col-span-2 text-sm text-red-600">{error}</p> : null}
        <div className="md:col-span-2 flex gap-3">
          <Button type="submit">{updateCourseMutation.isPending ? 'Saving...' : 'Save changes'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/trainer/courses')}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default EditCourse
