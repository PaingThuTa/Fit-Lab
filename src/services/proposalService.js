import { apiRequest } from '../lib/apiClient'
import { useApiMode } from '../lib/dataMode'
import { getMockState } from './mockState'

function mapApiProposal(proposal) {
  if (!proposal) return null
  return {
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
    reviewerId: proposal.reviewerId,
    message: proposal.message,
    rejectionReason: proposal.rejectionReason,
  }
}

function parseCommaList(value) {
  if (Array.isArray(value)) return value
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function getMyProposal({ currentUser, signal } = {}) {
  if (useApiMode) {
    const payload = await apiRequest('/trainer-proposals/me', { signal })
    return mapApiProposal(payload.proposal)
  }

  const state = getMockState()
  return (
    state.trainerProposals.find((proposal) => proposal.email?.toLowerCase() === currentUser?.email?.toLowerCase()) ||
    null
  )
}

export async function upsertMyProposal(formPayload, { currentUser } = {}) {
  if (useApiMode) {
    const payload = await apiRequest('/trainer-proposals/me', {
      method: 'PUT',
      body: {
        message: formPayload.message,
        specialties: parseCommaList(formPayload.specialties),
        certifications: parseCommaList(formPayload.certifications),
        experienceYears: Number(formPayload.experienceYears || 0),
        sampleCourse: formPayload.sampleCourse,
        bio: formPayload.bio,
      },
    })

    return mapApiProposal(payload.proposal)
  }

  const state = getMockState()
  const existingIndex = state.trainerProposals.findIndex(
    (proposal) => proposal.email?.toLowerCase() === currentUser?.email?.toLowerCase()
  )

  const nextProposal = {
    id: existingIndex >= 0 ? state.trainerProposals[existingIndex].id : `ta${Date.now()}`,
    name: currentUser?.name || 'Trainer Applicant',
    email: currentUser?.email || '',
    specialties: parseCommaList(formPayload.specialties),
    certifications: parseCommaList(formPayload.certifications),
    experienceYears: Number(formPayload.experienceYears || 0),
    sampleCourse: formPayload.sampleCourse || '',
    bio: formPayload.bio || '',
    message: formPayload.message || '',
    submitted: 'Today',
    status: 'pending',
  }

  if (existingIndex >= 0) {
    state.trainerProposals[existingIndex] = nextProposal
  } else {
    state.trainerProposals.unshift(nextProposal)
  }

  return nextProposal
}
