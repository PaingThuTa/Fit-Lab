import { apiRequest } from '../lib/apiClient'
import { useApiMode } from '../lib/dataMode'
import { getMockState } from './mockState'

export async function getMemberDashboard({ currentName, currentEmail, signal } = {}) {
  if (useApiMode) {
    const payload = await apiRequest('/member/dashboard', { signal })
    return payload.dashboard
  }

  const state = getMockState()
  const coursesById = state.courses.reduce((acc, course) => {
    acc[course.id] = course
    return acc
  }, {})
  const myEnrollments = state.enrollments
    .filter((item) => item.memberName === currentName)
    .map((item) => ({
      courseId: item.courseId,
      courseName: item.courseName || coursesById[item.courseId]?.title || '',
      enrolledAt: item.enrolledAt || null,
    }))
  const proposal = state.trainerProposals.find((item) => item.email?.toLowerCase() === currentEmail?.toLowerCase())

  return {
    userEnrollmentsCount: myEnrollments.length,
    trainerApplicationStatus: proposal?.status || 'none',
    courses: state.courses,
    myEnrollments,
  }
}

export async function getTrainerDashboard({ trainerName, signal } = {}) {
  if (useApiMode) {
    const payload = await apiRequest('/trainer/dashboard', { signal })
    return payload.dashboard
  }

  const state = getMockState()
  const courses = state.courses.filter((course) => course.trainerName === trainerName)
  const courseIds = new Set(courses.map((course) => course.id))

  return {
    liveCourses: courses.length,
    enrollments: state.enrollments.filter((enrollment) => courseIds.has(enrollment.courseId)).length,
    memberMessages: state.messageThreads.filter((thread) => thread.trainerName === trainerName).length,
    courses: courses.map((course) => ({
      courseId: course.id,
      name: course.title,
      difficulty: course.level,
      enrolledCount: state.enrollments.filter((enrollment) => enrollment.courseId === course.id).length,
    })),
  }
}
