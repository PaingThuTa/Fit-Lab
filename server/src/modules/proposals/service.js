const pool = require('../../config/db');
const AppError = require('../../utils/appError');
const { updateUserRole } = require('../users/repository');
const repository = require('./repository');

function mapProposal(row) {
  return {
    proposalId: row.proposal_id,
    userId: row.user_id,
    applicantName: row.applicant_name,
    applicantEmail: row.applicant_email,
    message: row.message,
    status: String(row.status || '').toLowerCase(),
    reviewerId: row.reviewer_id,
    reviewerName: row.reviewer_name,
    reviewedAt: row.reviewed_at,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getMyProposal(userId) {
  const proposal = await repository.findProposalByUserId(userId);
  return proposal ? mapProposal(proposal) : null;
}

async function upsertMyProposal(userId, payload) {
  const message = String(payload.message || '').trim();

  if (!message) {
    throw new AppError(400, 'message is required');
  }

  const existing = await repository.findProposalByUserId(userId);
  if (existing && String(existing.status || '').toUpperCase() === 'APPROVED') {
    throw new AppError(400, 'Your trainer application has already been approved.');
  }

  await repository.upsertProposal({
    userId,
    message,
  });

  return getMyProposal(userId);
}

async function listAdminProposals() {
  const proposals = await repository.listProposalsForAdmin();
  return proposals.map(mapProposal);
}

async function decideProposal({ proposalId, action, reviewerId, rejectionReason }) {
  const proposal = await repository.findProposalById(proposalId);

  if (!proposal) {
    throw new AppError(404, 'Proposal not found');
  }

  if (!['approve', 'reject'].includes(action)) {
    throw new AppError(400, 'action must be approve or reject');
  }

  const status = action === 'approve' ? 'APPROVED' : 'REJECTED';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updatedProposal = await repository.updateProposalDecision(client, {
      proposalId,
      status,
      reviewerId,
      rejectionReason: action === 'reject' ? rejectionReason || null : null,
    });

    if (status === 'APPROVED') {
      await updateUserRole({ userId: updatedProposal.user_id, role: 'TRAINER', client });
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  const proposals = await listAdminProposals();
  return proposals.find((item) => item.proposalId === proposalId) || null;
}

module.exports = {
  getMyProposal,
  upsertMyProposal,
  listAdminProposals,
  decideProposal,
};
