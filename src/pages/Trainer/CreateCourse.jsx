import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
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
    category: '',
    level: '',
    price: '',
    description: '',
    lessons: [{ title: '', content: '' }],
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

  const handleLessonChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      lessons: prev.lessons.map((lesson, lessonIndex) =>
        lessonIndex === index ? { ...lesson, [field]: value } : lesson
      ),
    }))
  }

  const handleAddLesson = () => {
    setForm((prev) => ({
      ...prev,
      lessons: [...prev.lessons, { title: '', content: '' }],
    }))
  }

  const handleRemoveLesson = (index) => {
    setForm((prev) => {
      if (prev.lessons.length <= 1) {
        return { ...prev, lessons: [{ title: '', content: '' }] }
      }

      return {
        ...prev,
        lessons: prev.lessons.filter((_, lessonIndex) => lessonIndex !== index),
      }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const lessons = form.lessons
        .map((lesson) => ({
          title: lesson.title.trim(),
          content: lesson.content.trim(),
        }))
        .filter((lesson) => lesson.title || lesson.content)

      if (lessons.some((lesson) => !lesson.title)) {
        setError('Each lesson needs a title.')
        return
      }

      await createCourseMutation.mutateAsync({
        title: form.title,
        category: form.category,
        level: form.level,
        price: form.price,
        description: form.description,
        lessons,
      })
    } catch (submitError) {
      setError(submitError.message || 'Unable to create course')
    }
  }

  return (
    <div className="space-y-4">
      <Button as={Link} to="/trainer/courses" size="sm" variant="outline">
        Back to courses
      </Button>
      <Card title="Create course" description="Define the structure and experience">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Input label="Course title" name="title" value={form.title} onChange={handleChange} placeholder="Mobility Reset" className="md:col-span-2" />
          <Input label="Category" name="category" value={form.category} onChange={handleChange} placeholder="Mobility" />
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
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Lessons</span>
              <Button type="button" variant="outline" size="sm" onClick={handleAddLesson}>
                Add lesson
              </Button>
            </div>
            {form.lessons.map((lesson, index) => (
              <div key={`lesson-${index}`} className="space-y-2 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs uppercase text-slate-400">Lesson {index + 1}</p>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveLesson(index)}>
                    Remove
                  </Button>
                </div>
                <Input
                  label="Lesson title"
                  value={lesson.title}
                  onChange={(event) => handleLessonChange(index, 'title', event.target.value)}
                  placeholder="Movement assessment"
                />
                <label>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Lesson content</span>
                  <textarea
                    value={lesson.content}
                    onChange={(event) => handleLessonChange(index, 'content', event.target.value)}
                    className="mt-2 min-h-[100px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="Notes, coaching points, and assignments for this lesson..."
                  />
                </label>
              </div>
            ))}
          </div>
          {error ? <p className="md:col-span-2 text-sm text-red-600">{error}</p> : null}
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit">{createCourseMutation.isPending ? 'Saving...' : 'Create course'}</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/trainer/courses')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default CreateCourse
