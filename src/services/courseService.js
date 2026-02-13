import { apiRequest } from '../lib/apiClient'
import { useApiMode } from '../lib/dataMode'
import { getMockState } from './mockState'
import { formatPrice, toApiDifficulty, toDisplayDifficulty } from './formatters'

function mapApiCourseToUi(course) {
  return {
    id: course.courseId,
    title: course.name,
    duration: course.durationLabel || 'TBD',
    level: toDisplayDifficulty(course.difficulty),
    sessions: course.sessionCount || 0,
    trainerName: course.trainerName,
    spots: course.spotLimit || 0,
    price: formatPrice(course.price),
    description: course.description || '',
    syllabus: course.syllabus || [],
    trainerId: course.trainerId,
  }
}

function mapUiCourseToApi(course) {
  return {
    name: course.title,
    description: course.description,
    difficulty: toApiDifficulty(course.level),
    price: Number(String(course.price || '0').replace(/[^0-9.]/g, '')),
    durationLabel: course.duration,
    sessionCount: Number(course.sessions || 0),
    spotLimit: Number(course.spots || 0),
    syllabus: Array.isArray(course.syllabus) ? course.syllabus : [],
  }
}

export async function listCourses({ query = '', trainerId, mine = false } = {}) {
  if (useApiMode) {
    const payload = await apiRequest('/courses', {
      query: {
        query,
        trainerId,
        mine: mine ? 'true' : undefined,
      },
    })

    return payload.courses.map(mapApiCourseToUi)
  }

  const { courses } = getMockState()

  if (trainerId) {
    return courses.filter((course) => course.trainerId === trainerId || course.trainerName === trainerId)
  }

  return courses
}

export async function getCourseDetail(courseId) {
  if (useApiMode) {
    const payload = await apiRequest(`/courses/${courseId}`)
    return mapApiCourseToUi(payload.course)
  }

  const { courses } = getMockState()
  return courses.find((course) => course.id === courseId) || null
}

export async function createCourse(coursePayload) {
  if (useApiMode) {
    const payload = await apiRequest('/courses', {
      method: 'POST',
      body: mapUiCourseToApi(coursePayload),
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

export async function updateCourse(courseId, coursePayload) {
  if (useApiMode) {
    const payload = await apiRequest(`/courses/${courseId}`, {
      method: 'PATCH',
      body: mapUiCourseToApi(coursePayload),
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
