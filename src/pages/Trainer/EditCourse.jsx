import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
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
    const lessons = Array.isArray(course.lessons) && course.lessons.length
      ? course.lessons.map((lesson) => ({
          title: lesson.title || '',
          content: lesson.content || '',
        }))
      : (course.syllabus || []).map((topic) => ({ title: topic, content: '' }))

    return {
      title: course.title,
      category: course.category || '',
      level: course.level,
      price: course.price,
      description: course.description || '',
      lessons: lessons.length ? lessons : [{ title: '', content: '' }],
    }
  }, [courseQuery.data])
  const currentForm = form || initialForm

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...(prev || initialForm), [name]: value }))
  }

  const handleLessonChange = (index, field, value) => {
    setForm((prev) => {
      const next = prev || initialForm
      if (!next) return prev

      return {
        ...next,
        lessons: next.lessons.map((lesson, lessonIndex) =>
          lessonIndex === index ? { ...lesson, [field]: value } : lesson
        ),
      }
    })
  }

  const handleAddLesson = () => {
    setForm((prev) => {
      const next = prev || initialForm
      if (!next) return prev
      return {
        ...next,
        lessons: [...next.lessons, { title: '', content: '' }],
      }
    })
  }

  const handleRemoveLesson = (index) => {
    setForm((prev) => {
      const next = prev || initialForm
      if (!next) return prev

      if (next.lessons.length <= 1) {
        return {
          ...next,
          lessons: [{ title: '', content: '' }],
        }
      }

      return {
        ...next,
        lessons: next.lessons.filter((_, lessonIndex) => lessonIndex !== index),
      }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!currentForm) return
    try {
      const lessons = currentForm.lessons
        .map((lesson) => ({
          title: lesson.title.trim(),
          content: lesson.content.trim(),
        }))
        .filter((lesson) => lesson.title || lesson.content)

      if (lessons.some((lesson) => !lesson.title)) {
        setError('Each lesson needs a title.')
        return
      }

      await updateCourseMutation.mutateAsync({
        title: currentForm.title,
        category: currentForm.category,
        level: currentForm.level,
        price: currentForm.price,
        description: currentForm.description,
        lessons,
      })
    } catch (submitError) {
      setError(submitError.message || 'Unable to update course')
    }
  }

  if (!currentForm) {
    return (
      <div className="space-y-4">
        <Button as={Link} to="/trainer/courses" size="sm" variant="outline">
          Back to courses
        </Button>
        <Card title="Loading course" description={error || courseQuery.error?.message || 'Fetching course details...'} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button as={Link} to="/trainer/courses" size="sm" variant="outline">
        Back to courses
      </Button>
      <Card title="Edit course" description="Update the details below">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Input label="Course title" name="title" value={currentForm.title} onChange={handleChange} className="md:col-span-2" />
          <Input label="Category" name="category" value={currentForm.category} onChange={handleChange} />
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
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Lessons</span>
              <Button type="button" variant="outline" size="sm" onClick={handleAddLesson}>
                Add lesson
              </Button>
            </div>
            {currentForm.lessons.map((lesson, index) => (
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
                />
                <label>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Lesson content</span>
                  <textarea
                    value={lesson.content}
                    onChange={(event) => handleLessonChange(index, 'content', event.target.value)}
                    className="mt-2 min-h-[100px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </label>
              </div>
            ))}
          </div>
          {error ? <p className="md:col-span-2 text-sm text-red-600">{error}</p> : null}
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit">{updateCourseMutation.isPending ? 'Saving...' : 'Save changes'}</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/trainer/courses')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default EditCourse
