import { apiRequest } from '../lib/apiClient'
import { useApiMode } from '../lib/dataMode'
import { getMockState } from './mockState'

export async function enrollInCourse(courseId, { memberName, signal } = {}) {
  if (useApiMode) {
    await apiRequest(`/courses/${courseId}/enroll`, { method: 'POST', signal })
    return
  }

  const state = getMockState()
  const existing = state.enrollments.find((item) => item.courseId === courseId && item.memberName === memberName)
  if (existing) {
    throw new Error('Already enrolled in this course')
  }

  const course = state.courses.find((item) => item.id === courseId)

  state.enrollments.push({
    id: `e${Date.now()}`,
    courseId,
    memberName,
    courseName: course?.title || '',
    enrolledAt: new Date().toISOString(),
  })
}

export async function getMyEnrollments({ memberName, signal } = {}) {
  if (useApiMode) {
    const payload = await apiRequest('/enrollments/me', { signal })
    return payload.enrollments.map((item) => ({
      id: `${item.memberId}-${item.courseId}`,
      courseId: item.courseId,
      memberName,
      courseName: item.course?.name || '',
      enrolledAt: item.enrolledAt || null,
    }))
  }

  const state = getMockState()
  const coursesById = state.courses.reduce((acc, course) => {
    acc[course.id] = course
    return acc
  }, {})

  return state.enrollments
    .filter((item) => item.memberName === memberName)
    .map((item) => ({
      id: item.id || `${item.memberName}-${item.courseId}`,
      courseId: item.courseId,
      memberName: item.memberName,
      courseName: item.courseName || coursesById[item.courseId]?.title || '',
      enrolledAt: item.enrolledAt || null,
    }))
}

export async function getTrainerEnrollments({ trainerName, signal } = {}) {
  if (useApiMode) {
    const payload = await apiRequest('/enrollments/trainer', { signal })
    return payload.enrollments.map((item) => ({
      id: `${item.memberId}-${item.courseId}`,
      courseId: item.courseId,
      courseName: item.courseName,
      memberName: item.memberName,
      memberEmail: item.memberEmail,
      difficulty: item.difficulty,
      enrolledAt: item.enrolledAt || null,
    }))
  }

  const state = getMockState()
  const coursesById = state.courses.reduce((acc, course) => {
    acc[course.id] = course
    return acc
  }, {})
  const usersByName = state.users.reduce((acc, user) => {
    acc[user.name] = user
    return acc
  }, {})
  const trainerCourseIds = state.courses
    .filter((course) => course.trainerName === trainerName)
    .map((course) => course.id)

  return state.enrollments
    .filter((enrollment) => trainerCourseIds.includes(enrollment.courseId))
    .map((enrollment) => ({
      id: enrollment.id || `${enrollment.memberName}-${enrollment.courseId}`,
      courseId: enrollment.courseId,
      courseName: enrollment.courseName || coursesById[enrollment.courseId]?.title || '',
      memberName: enrollment.memberName,
      memberEmail: usersByName[enrollment.memberName]?.email || '',
      enrolledAt: enrollment.enrolledAt || null,
    }))
}
