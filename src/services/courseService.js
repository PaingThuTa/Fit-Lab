import { apiRequest } from '../lib/apiClient'
import { useApiMode } from '../lib/dataMode'
import { getMockState } from './mockState'
import { formatPrice, toApiDifficulty, toDisplayDifficulty } from './formatters'

function normalizeLessonsFromApi(course) {
  if (Array.isArray(course.lessons)) {
    return course.lessons
      .map((lesson, index) => ({
        id: lesson.lessonId || `lesson-${index}`,
        title: String(lesson.title || '').trim(),
        content: lesson.content ? String(lesson.content) : '',
      }))
      .filter((lesson) => lesson.title)
  }

  if (Array.isArray(course.syllabus)) {
    return course.syllabus
      .map((topic, index) => ({
        id: `lesson-${index}`,
        title: String(topic || '').trim(),
        content: '',
      }))
      .filter((lesson) => lesson.title)
  }

  return []
}

function normalizeLessonsForPayload(course) {
  if (Array.isArray(course.lessons)) {
    return course.lessons
      .map((lesson) => ({
        title: String(lesson?.title || '').trim(),
        content: String(lesson?.content || '').trim(),
      }))
      .filter((lesson) => lesson.title || lesson.content)
  }

  if (Array.isArray(course.syllabus)) {
    return course.syllabus
      .map((topic) => ({ title: String(topic || '').trim(), content: '' }))
      .filter((lesson) => lesson.title)
  }

  return []
}

function mapApiCourseToUi(course) {
  const lessons = normalizeLessonsFromApi(course)
  return {
    id: course.courseId,
    title: course.name,
    category: course.category || '',
    level: toDisplayDifficulty(course.difficulty),
    trainerName: course.trainerName,
    price: formatPrice(course.price),
    description: course.description || '',
    lessons,
    syllabus: lessons.map((lesson) => lesson.title),
    trainerId: course.trainerId,
  }
}

function mapUiCourseToApi(course) {
  const lessons = normalizeLessonsForPayload(course)
  const category = String(course.category || '').trim()
  return {
    name: course.title,
    description: course.description,
    category: category || null,
    difficulty: toApiDifficulty(course.level),
    price: Number(String(course.price || '0').replace(/[^0-9.]/g, '')),
    lessons,
    syllabus: lessons.map((lesson) => lesson.title),
  }
}

export async function listCoursesPage({
  query = '',
  trainerId,
  mine = false,
  limit = 20,
  offset = 0,
  signal,
} = {}) {
  if (useApiMode) {
    const payload = await apiRequest('/courses', {
      query: {
        query,
        trainerId,
        mine: mine ? 'true' : undefined,
        limit,
        offset,
      },
      signal,
    })

    return {
      courses: payload.courses.map(mapApiCourseToUi),
      page: payload.page || { limit, offset, total: payload.courses.length },
    }
  }

  const { courses } = getMockState()
  let filteredCourses = courses

  if (trainerId) {
    filteredCourses = courses.filter((course) => course.trainerId === trainerId || course.trainerName === trainerId)
  }

  if (query) {
    const normalizedQuery = String(query).toLowerCase()
    filteredCourses = filteredCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(normalizedQuery) ||
        course.description.toLowerCase().includes(normalizedQuery) ||
        course.trainerName.toLowerCase().includes(normalizedQuery)
    )
  }

  return {
    courses: filteredCourses.slice(offset, offset + limit),
    page: {
      limit,
      offset,
      total: filteredCourses.length,
    },
  }
}

export async function listCourses(options = {}) {
  const payload = await listCoursesPage(options)
  return payload.courses
}

export async function getCourseDetail(courseId, { signal } = {}) {
  if (useApiMode) {
    const payload = await apiRequest(`/courses/${courseId}`, { signal })
    return mapApiCourseToUi(payload.course)
  }

  const { courses } = getMockState()
  return courses.find((course) => course.id === courseId) || null
}

export async function createCourse(coursePayload, { signal } = {}) {
  if (useApiMode) {
    const payload = await apiRequest('/courses', {
      method: 'POST',
      body: mapUiCourseToApi(coursePayload),
      signal,
    })

    return mapApiCourseToUi(payload.course)
  }

  const { courses } = getMockState()
  const nextCourse = {
    ...coursePayload,
    id: `c${Date.now()}`,
  }
  courses.unshift(nextCourse)
  return nextCourse
}

export async function updateCourse(courseId, coursePayload, { signal } = {}) {
  if (useApiMode) {
    const payload = await apiRequest(`/courses/${courseId}`, {
      method: 'PATCH',
      body: mapUiCourseToApi(coursePayload),
      signal,
    })

    return mapApiCourseToUi(payload.course)
  }

  const { courses } = getMockState()
  const index = courses.findIndex((course) => course.id === courseId)
  if (index >= 0) {
    courses[index] = { ...courses[index], ...coursePayload }
    return courses[index]
  }

  return null
}

export async function deleteCourse(courseId, { signal } = {}) {
  if (useApiMode) {
    await apiRequest(`/courses/${courseId}`, {
      method: 'DELETE',
      signal,
    })
    return true
  }

  const { courses } = getMockState()
  const index = courses.findIndex((course) => course.id === courseId)
  if (index >= 0) {
    courses.splice(index, 1)
    return true
  }

  throw new Error('Course not found')
}
