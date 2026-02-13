import { apiRequest } from '../lib/apiClient'
import { useApiMode } from '../lib/dataMode'
import { getMockState } from './mockState'

export async function getThreads({ role, currentName }) {
  if (useApiMode) {
    const payload = await apiRequest('/messages/threads')
    return payload.threads.map((thread) => ({
      id: thread.threadId,
      otherUserId: thread.otherUserId,
      trainerName: role === 'member' ? thread.otherUserName : undefined,
      memberName: role === 'trainer' ? thread.otherUserName : undefined,
      courseId: thread.courseId,
      courseTitle: thread.courseName,
      lastMessage: thread.lastMessage,
      lastTimestamp: thread.lastTimestamp,
    }))
  }

  const state = getMockState()
  if (role === 'member') {
    const ownThreads = state.messageThreads.filter((thread) => thread.memberName === currentName)
    return ownThreads.length ? ownThreads : state.messageThreads
  }

  return state.messageThreads.filter((thread) => thread.trainerName === currentName)
}

export async function getThreadMessages({ otherUserId, courseId }) {
  if (useApiMode) {
    const payload = await apiRequest('/messages/thread', {
      query: {
        otherUserId,
        courseId,
      },
    })

    return payload.messages
  }

  return []
}
