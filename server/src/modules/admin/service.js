const pool = require('../../config/db');
const { listUsersWithProposalStatus } = require('../users/repository');
const proposalsService = require('../proposals/service');
const coursesRepository = require('../courses/repository');

async function listUsers() {
  const rows = await listUsersWithProposalStatus();
  return rows.map((row) => ({
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    role: String(row.role || '').toLowerCase(),
    trainerApplicationStatus: row.proposal_status ? String(row.proposal_status).toLowerCase() : 'none',
  }));
}

async function listCourses() {
  const rows = await coursesRepository.listCourses({ query: '', trainerId: null });
  return rows.map((row) => ({
    courseId: row.course_id,
    name: row.name,
    trainerName: row.trainer_name,
    difficulty: row.difficulty,
    spotLimit: row.spot_limit,
    sessionCount: row.session_count,
    enrolledCount: row.enrolled_count,
  }));
}

async function getDashboard() {
  const [usersCount, membersCount, trainersCount, proposalsCount, coursesCount, enrollmentsCount] = await Promise.all([
    pool.query(`SELECT COUNT(*)::INT AS count FROM users`),
    pool.query(`SELECT COUNT(*)::INT AS count FROM users WHERE role = 'MEMBER'`),
    pool.query(`SELECT COUNT(*)::INT AS count FROM users WHERE role = 'TRAINER'`),
    pool.query(`SELECT
      COUNT(*) FILTER (WHERE status = 'PENDING')::INT AS pending,
      COUNT(*) FILTER (WHERE status = 'APPROVED')::INT AS approved
      FROM trainer_proposals`),
    pool.query(`SELECT COUNT(*)::INT AS count FROM courses`),
    pool.query(`SELECT COUNT(*)::INT AS count FROM enrollments`),
  ]);

  return {
    totalUsers: usersCount.rows[0].count,
    totalMembers: membersCount.rows[0].count,
    totalTrainers: trainersCount.rows[0].count,
    pendingTrainerProposals: proposalsCount.rows[0].pending,
    approvedTrainerProposals: proposalsCount.rows[0].approved,
    totalCourses: coursesCount.rows[0].count,
    totalEnrollments: enrollmentsCount.rows[0].count,
  };
}

async function listTrainerProposals() {
  return proposalsService.listAdminProposals();
}

async function decideTrainerProposal({ proposalId, action, reviewId, rejectionReason }) {
  return proposalsService.decideProposal({ proposalId, action, reviewId, rejectionReason });
}

module.exports = {
  listUsers,
  listCourses,
  getDashboard,
  listTrainerProposals,
  decideTrainerProposal,
};
