import { apiRequest } from '../lib/apiClient'
import { useApiMode } from '../lib/dataMode'
import { getMockState } from './mockState'

export async function getAdminDashboard() {
  if (useApiMode) {
    const payload = await apiRequest('/admin/dashboard')
    return payload.dashboard
  }

  const state = getMockState()
  const users = state.users
  const proposals = state.trainerProposals

  return {
    totalUsers: users.length,
    totalMembers: users.filter((user) => user.role === 'member').length,
    totalTrainers: users.filter((user) => user.role === 'trainer').length,
    pendingTrainerProposals: proposals.filter((proposal) => proposal.status === 'pending').length,
    approvedTrainerProposals: proposals.filter((proposal) => proposal.status === 'approved').length,
    totalCourses: state.courses.length,
    totalEnrollments: state.enrollments.length,
  }
}

export async function getAdminUsers() {
  if (useApiMode) {
    const payload = await apiRequest('/admin/users')
    return payload.users
  }

  const state = getMockState()
  return state.users.map((user) => ({
    userId: user.id,
    fullName: user.name,
    email: user.email,
    role: user.role,
    trainerApplicationStatus:
      state.trainerProposals.find((proposal) => proposal.email?.toLowerCase() === user.email?.toLowerCase())?.status ||
      'none',
  }))
}

export async function getAdminCourses() {
  if (useApiMode) {
    const payload = await apiRequest('/admin/courses')
    return payload.courses
  }

  const state = getMockState()
  return state.courses.map((course) => ({
    courseId: course.id,
    name: course.title,
    trainerName: course.trainerName,
    difficulty: course.level,
    spotLimit: course.spots,
    sessionCount: course.sessions,
    enrolledCount: state.enrollments.filter((enrollment) => enrollment.courseId === course.id).length,
  }))
}

export async function getTrainerProposals() {
  if (useApiMode) {
    const payload = await apiRequest('/admin/trainer-proposals')
    return payload.proposals.map((proposal) => ({
      id: proposal.proposalId,
      name: proposal.applicantName,
      email: proposal.applicantEmail,
      specialties: proposal.specialties || [],
      certifications: proposal.certifications || [],
      experienceYears: proposal.experienceYears || 0,
      sampleCourse: proposal.sampleCourse || '',
      bio: proposal.bio || '',
      submitted: proposal.updatedAt || proposal.createdAt,
      status: proposal.status,
      rejectionReason: proposal.rejectionReason,
    }))
  }

  return getMockState().trainerProposals
}

export async function reviewTrainerProposal({ proposalId, action, rejectionReason }) {
  if (useApiMode) {
    const payload = await apiRequest(`/admin/trainer-proposals/${proposalId}`, {
      method: 'PATCH',
      body: { action, rejectionReason },
    })

    return payload.proposal
  }

  const state = getMockState()
  const proposal = state.trainerProposals.find((item) => item.id === proposalId)
  if (!proposal) return null

  proposal.status = action === 'approve' ? 'approved' : 'rejected'
  proposal.rejectionReason = rejectionReason || null

  if (action === 'approve') {
    const user = state.users.find((item) => item.email?.toLowerCase() === proposal.email?.toLowerCase())
    if (user) {
      user.role = 'trainer'
    }
  }

  return proposal
}
