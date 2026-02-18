import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { createCourse } from '../../services/courseService'
import { queryKeys } from '../../lib/queryKeys'

const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced']

const CreateCourse = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    title: '',
    duration: '',
    level: '',
    price: '',
    description: '',
    syllabus: '',
  })
  const [error, setError] = useState('')

  const createCourseMutation = useMutation({
    mutationFn: (payload) => createCourse(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.courses({}) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.trainerDashboard }),
      ])
      navigate('/trainer/courses')
    },
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      await createCourseMutation.mutateAsync({
        title: form.title,
        duration: form.duration,
        level: form.level,
        price: form.price,
        description: form.description,
        syllabus: form.syllabus
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
      })
    } catch (submitError) {
      setError(submitError.message || 'Unable to create course')
    }
  }

  return (
    <Card title="Create course" description="Define the structure and experience">
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <Input label="Course title" name="title" value={form.title} onChange={handleChange} placeholder="Mobility Reset" className="md:col-span-2" />
        <Input label="Duration" name="duration" value={form.duration} onChange={handleChange} placeholder="6 Weeks" />
        <label className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="font-medium text-slate-700 dark:text-slate-200">Level</span>
          <select
            name="level"
            value={form.level}
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
          <Button type="submit">{createCourseMutation.isPending ? 'Saving...' : 'Create course'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/trainer/courses')}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default CreateCourse
