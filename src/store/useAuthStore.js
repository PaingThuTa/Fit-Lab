import { create } from 'zustand'
import { trainerApplicants as seededTrainerApplicants } from '../data/mockData'

const fallbackProfiles = {
  member: { name: 'Jordan Wells', role: 'member', email: 'jordan@Fit-Lab.app' },
  trainer: { name: 'Avery Cole', role: 'trainer', email: 'avery@Fit-Lab.app' },
  admin: { name: 'Morgan Lee', role: 'admin', email: 'morgan@Fit-Lab.app' },
}

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  trainerApplications: seededTrainerApplicants.map((applicant) => ({
    ...applicant,
    status: 'pending',
    email: applicant.email || `${applicant.name.toLowerCase().replace(/\s+/g, '.')}@fit-lab.app`,
  })),
  login: ({ name = 'Fit-Lab User', role, email }) =>
    set({
      user: { name, role, email: email || '' },
      role,
    }),
  logout: () => set({ user: null, role: null }),
  setRole: (role, name, email) =>
    set({
      role,
      user: role
        ? {
            name: name || fallbackProfiles[role]?.name || 'Guest',
            role,
            email: email || fallbackProfiles[role]?.email || '',
          }
        : null,
    }),
  createTrainerApplication: (application) =>
    set((state) => {
      const email = (application.email || '').trim().toLowerCase()
      const name = (application.name || state.user?.name || 'Trainer Applicant').trim()
      const existingIndex = state.trainerApplications.findIndex((applicant) => {
        if (email.length > 0 && applicant.email?.toLowerCase() === email) return true
        return applicant.name.toLowerCase() === name.toLowerCase() && applicant.status !== 'approved'
      })

      const nextApplication = {
        id: existingIndex >= 0 ? state.trainerApplications[existingIndex].id : `ta${Date.now()}`,
        name,
        email: application.email || state.user?.email || '',
        specialties: application.specialties || [],
        certifications: application.certifications || [],
        submitted: application.submitted || 'Today',
        bio: application.bio || '',
        experienceYears: application.experienceYears || 0,
        sampleCourse: application.sampleCourse || '',
        status: 'pending',
      }

      if (existingIndex >= 0) {
        const trainerApplications = [...state.trainerApplications]
        trainerApplications[existingIndex] = {
          ...trainerApplications[existingIndex],
          ...nextApplication,
        }
        return { trainerApplications }
      }

      return {
        trainerApplications: [nextApplication, ...state.trainerApplications],
      }
    }),
  approveTrainerApplication: (applicationId) =>
    set((state) => {
      const trainerApplications = state.trainerApplications.map((applicant) =>
        applicant.id === applicationId ? { ...applicant, status: 'approved' } : applicant
      )
      const approved = trainerApplications.find((applicant) => applicant.id === applicationId)
      const shouldPromoteCurrentUser =
        approved &&
        state.user &&
        (approved.email?.toLowerCase() === state.user.email?.toLowerCase() ||
          approved.name.toLowerCase() === state.user.name?.toLowerCase())

      return {
        trainerApplications,
        role: shouldPromoteCurrentUser ? 'trainer' : state.role,
        user: shouldPromoteCurrentUser ? { ...state.user, role: 'trainer' } : state.user,
      }
    }),
  declineTrainerApplication: (applicationId) =>
    set((state) => ({
      trainerApplications: state.trainerApplications.map((applicant) =>
        applicant.id === applicationId ? { ...applicant, status: 'declined' } : applicant
      ),
    })),
  updateUserName: (name) =>
    set((state) => ({
      user: state.user ? { ...state.user, name } : { name, role: state.role, email: '' },
    })),
}))
