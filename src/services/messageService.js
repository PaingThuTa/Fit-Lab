import { apiRequest } from '../lib/apiClient'
import { useApiMode } from '../lib/dataMode'
import { getMockState } from './mockState'

export async function getThreads({ role, currentName, signal }) {
  if (useApiMode) {
    const payload = await apiRequest('/messages/threads', { signal })
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

export async function getThreadMessages({ otherUserId, courseId, signal }) {
  if (useApiMode) {
    const payload = await apiRequest('/messages/thread', {
      query: {
        otherUserId,
        courseId,
      },
      signal,
    })

    return payload.messages
  }

  return []
}

export async function sendMessage({ receiverId, courseId, content, signal }) {
  if (useApiMode) {
    const payload = await apiRequest('/messages', {
      method: 'POST',
      body: { receiverId, courseId, content },
      signal,
    })

    return payload.message
  }

  const state = getMockState()
  const thread = state.messageThreads.find(
    (item) =>
      item.courseId === courseId &&
      ((item.memberId === receiverId && item.trainerId) || (item.trainerId === receiverId && item.memberId))
  )
  if (thread) {
    thread.messages = thread.messages || []
    thread.messages.push({
      sender: 'trainer',
      text: String(content || ''),
      time: new Date().toLocaleString(),
    })
    thread.lastMessage = String(content || '')
    thread.lastTimestamp = 'Now'
  }

  return {
    receiverId,
    courseId: courseId || null,
    content,
    sentAt: new Date().toISOString(),
  }
}
