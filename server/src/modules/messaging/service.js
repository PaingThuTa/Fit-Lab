const AppError = require('../../utils/appError');
const repository = require('./repository');

async function getThreads(userId) {
  const rows = await repository.listThreads(userId);
  return rows.map((row) => ({
    threadId: `${row.other_user_id}:${row.course_id || 'none'}`,
    otherUserId: row.other_user_id,
    otherUserName: row.other_user_name,
    courseId: row.course_id,
    courseName: row.course_name,
    lastMessage: row.last_message,
    lastTimestamp: row.last_sent_at,
    lastMessageSenderId: row.last_message_sender_id,
  }));
}

async function getThreadMessages({ userId, otherUserId, courseId }) {
  if (!otherUserId) {
    throw new AppError(400, 'otherUserId is required');
  }

  const rows = await repository.listThreadMessages({ userId, otherUserId, courseId });
  return rows.map((row) => ({
    messageId: row.message_id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    senderName: row.sender_name,
    receiverName: row.receiver_name,
    courseId: row.course_id,
    content: row.content,
    sentAt: row.sent_at,
    readAt: row.read_at,
  }));
}

module.exports = {
  getThreads,
  getThreadMessages,
};
