import { apiRequest } from '../lib/apiClient'
import { useApiMode } from '../lib/dataMode'
import { getMockState } from './mockState'

export async function enrollInCourse(courseId, { memberName } = {}) {
  if (useApiMode) {
    await apiRequest(`/courses/${courseId}/enroll`, { method: 'POST' })
    return
  }

  const state = getMockState()
  const existing = state.enrollments.find((item) => item.courseId === courseId && item.memberName === memberName)
  if (existing) {
    throw new Error('Already enrolled in this course')
  }

  state.enrollments.push({
    id: `e${Date.now()}`,
    courseId,
    memberName,
    progress: 0,
  })
}

export async function getMyEnrollments({ memberName } = {}) {
  if (useApiMode) {
    const payload = await apiRequest('/enrollments/me')
    return payload.enrollments.map((item) => ({
      id: `${item.memberId}-${item.courseId}`,
      courseId: item.courseId,
      memberName,
      progress: item.progressPercent,
    }))
  }

  const state = getMockState()
  return state.enrollments.filter((item) => item.memberName === memberName)
}

export async function getTrainerEnrollments({ trainerName } = {}) {
  if (useApiMode) {
    const payload = await apiRequest('/enrollments/trainer')
    return payload.enrollments.map((item) => ({
      id: `${item.memberId}-${item.courseId}`,
      courseId: item.courseId,
      memberName: item.memberName,
      progress: item.progressPercent,
    }))
  }

  const state = getMockState()
  const trainerCourseIds = state.courses
    .filter((course) => course.trainerName === trainerName)
    .map((course) => course.id)

  return state.enrollments.filter((enrollment) => trainerCourseIds.includes(enrollment.courseId))
}
