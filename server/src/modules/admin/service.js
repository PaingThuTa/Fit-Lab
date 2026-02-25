const pool = require('../../config/db');
const { listUsersWithProposalStatus } = require('../users/repository');
const proposalsService = require('../proposals/service');
const coursesRepository = require('../courses/repository');
const paymentsRepository = require('../payments/repository');

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

async function decideTrainerProposal({ proposalId, action, reviewerId, rejectionReason }) {
  return proposalsService.decideProposal({ proposalId, action, reviewerId, rejectionReason });
}

async function listPayments(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const offset = (page - 1) * limit;

  const [rows, summary] = await Promise.all([
    paymentsRepository.findPaymentsAdmin({
      search: query.search || null,
      status: query.status || null,
      memberId: query.memberId || null,
      trainerId: query.trainerId || null,
      courseId: query.courseId || null,
      dateFrom: query.dateFrom || null,
      dateTo: query.dateTo || null,
      limit,
      offset,
    }),
    paymentsRepository.getPaymentSummary(),
  ]);

  const total = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
  const payments = rows.map((row) => ({
    paymentId: row.id,
    memberId: row.member_id,
    memberName: row.member_name,
    trainerId: row.trainer_id,
    trainerName: row.trainer_name,
    courseId: row.course_id,
    courseName: row.course_name,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    cardLastFour: row.card_last_four,
    createdAt: row.created_at,
  }));

  return {
    payments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    summary: {
      totalCount: parseInt(summary.total_count, 10),
      totalRevenue: parseFloat(summary.total_revenue),
      paidCount: parseInt(summary.paid_count, 10),
      pendingCount: parseInt(summary.pending_count, 10),
      failedCount: parseInt(summary.failed_count, 10),
      refundedCount: parseInt(summary.refunded_count, 10),
    },
  };
}

module.exports = {
  listUsers,
  listCourses,
  getDashboard,
  listTrainerProposals,
  decideTrainerProposal,
  listPayments,
};
