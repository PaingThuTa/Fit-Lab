const pool = require('../../config/db');
const enrollmentsRepository = require('../enrollments/repository');
const proposalsRepository = require('../proposals/repository');
const coursesRepository = require('../courses/repository');

async function getMemberDashboard(userId) {
  const [enrollmentRows, proposal, coursesRows] = await Promise.all([
    enrollmentsRepository.listMemberEnrollments(userId),
    proposalsRepository.findProposalByUserId(userId),
    coursesRepository.listCourses({ query: '', trainerId: null }),
  ]);

  return {
    userEnrollmentsCount: enrollmentRows.length,
    trainerApplicationStatus: proposal ? String(proposal.status).toLowerCase() : 'none',
    courses: coursesRows.map((row) => ({
      courseId: row.course_id,
      name: row.name,
      description: row.description,
      difficulty: row.difficulty,
      price: Number(row.price),
      trainerName: row.trainer_name,
    })),
    myEnrollments: enrollmentRows.map((row) => ({
      courseId: row.course_id,
      progressPercent: 0,
      courseName: row.course_name,
    })),
  };
}

async function getTrainerDashboard(trainerId) {
  const [courseRows, enrollmentCountResult, messageCountResult] = await Promise.all([
    coursesRepository.listCourses({ query: '', trainerId }),
    pool.query(
      `SELECT COUNT(*)::INT AS count
       FROM enrollments e
       JOIN courses c ON c.course_id = e.course_id
       WHERE c.trainer_id = $1`,
      [trainerId]
    ),
    pool.query(
      `SELECT COUNT(DISTINCT CONCAT(LEAST(sender_id::TEXT, receiver_id::TEXT), ':', GREATEST(sender_id::TEXT, receiver_id::TEXT), ':', COALESCE(course_id::TEXT, 'no-course')))::INT AS count
       FROM messages
       WHERE sender_id = $1 OR receiver_id = $1`,
      [trainerId]
    ),
  ]);

  return {
    liveCourses: courseRows.length,
    enrollments: enrollmentCountResult.rows[0].count,
    memberMessages: messageCountResult.rows[0].count,
    courses: courseRows.map((row) => ({
      courseId: row.course_id,
      name: row.name,
      difficulty: row.difficulty,
      enrolledCount: row.enrolled_count,
    })),
  };
}

module.exports = {
  getMemberDashboard,
  getTrainerDashboard,
};
