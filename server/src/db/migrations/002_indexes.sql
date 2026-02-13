CREATE INDEX IF NOT EXISTS idx_courses_trainer_id ON courses(trainer_id);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enrollments_member_id ON enrollments(member_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver_sent_at ON messages(sender_id, receiver_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_sender_sent_at ON messages(receiver_id, sender_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_course_id ON messages(course_id);
CREATE INDEX IF NOT EXISTS idx_trainer_proposals_status ON trainer_proposals(status);
CREATE INDEX IF NOT EXISTS idx_trainer_proposals_user_id ON trainer_proposals(user_id);
