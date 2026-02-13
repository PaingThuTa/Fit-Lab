import {
  courses as seededCourses,
  enrollments as seededEnrollments,
  users as seededUsers,
  trainerApplicants as seededTrainerApplicants,
  messageThreads as seededMessageThreads,
} from '../data/mockData'

const clone = (value) => JSON.parse(JSON.stringify(value))

const mockState = {
  courses: clone(seededCourses),
  enrollments: clone(seededEnrollments),
  users: clone(seededUsers),
  trainerProposals: clone(seededTrainerApplicants).map((proposal) => ({
    ...proposal,
    status: proposal.status || 'pending',
    email: proposal.email || `${proposal.name.toLowerCase().replace(/\s+/g, '.')}@fit-lab.app`,
    experienceYears: proposal.experienceYears || 0,
    sampleCourse: proposal.sampleCourse || '',
    bio: proposal.bio || '',
    message: proposal.bio || `${proposal.name} submitted trainer proposal.`,
  })),
  messageThreads: clone(seededMessageThreads),
}

export function getMockState() {
  return mockState
}
