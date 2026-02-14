export const queryKeys = {
  authMe: ['auth', 'me'],
  courses: ({ query = '', limit = 20, offset = 0, mine = false, trainerId = '' } = {}) => [
    'courses',
    { query, limit, offset, mine, trainerId },
  ],
  memberDashboard: ['member', 'dashboard'],
  trainerDashboard: ['trainer', 'dashboard'],
  myEnrollments: ['enrollments', 'me'],
  messageThreads: (role) => ['messages', 'threads', role],
  threadMessages: ({ otherUserId, courseId }) => ['messages', 'thread', { otherUserId, courseId: courseId || null }],
}
