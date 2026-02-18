const pool = require('../../config/db');

async function findProposalByUserId(userId) {
  const { rows } = await pool.query(
    `SELECT
       p.proposal_id,
       p.user_id,
       p.message,
       p.status,
       p.reviewer_id,
       p.reviewed_at,
       p.rejection_reason,
       p.created_at,
       p.updated_at,
       reviewer.full_name AS reviewer_name
     FROM trainer_proposals p
     LEFT JOIN users reviewer ON reviewer.user_id = p.reviewer_id
     WHERE p.user_id = $1
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

async function upsertProposal({ userId, message }) {
  const { rows } = await pool.query(
    `INSERT INTO trainer_proposals (
       user_id,
       message,
       status,
       reviewer_id,
       reviewed_at,
       rejection_reason,
       updated_at
     ) VALUES ($1,$2,'PENDING',NULL,NULL,NULL,NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET
       message = EXCLUDED.message,
       status = 'PENDING',
       reviewer_id = NULL,
       reviewed_at = NULL,
       rejection_reason = NULL,
       updated_at = NOW()
     RETURNING proposal_id`,
    [userId, message]
  );

  return rows[0].proposal_id;
}

async function listProposalsForAdmin() {
  const { rows } = await pool.query(
    `SELECT
       p.proposal_id,
       p.user_id,
       p.message,
       p.status,
       p.reviewer_id,
       p.reviewed_at,
       p.rejection_reason,
       p.created_at,
       p.updated_at,
       applicant.full_name AS applicant_name,
       applicant.email AS applicant_email,
       reviewer.full_name AS reviewer_name
     FROM trainer_proposals p
     JOIN users applicant ON applicant.user_id = p.user_id
     LEFT JOIN users reviewer ON reviewer.user_id = p.reviewer_id
     ORDER BY p.updated_at DESC`
  );

  return rows;
}

async function findProposalById(proposalId) {
  const { rows } = await pool.query(
    `SELECT proposal_id, user_id, status
     FROM trainer_proposals
     WHERE proposal_id = $1
     LIMIT 1`,
    [proposalId]
  );

  return rows[0] || null;
}

async function updateProposalDecision(client, { proposalId, status, reviewerId, rejectionReason }) {
  const { rows } = await client.query(
    `UPDATE trainer_proposals
     SET status = $2,
         reviewer_id = $3,
         reviewed_at = NOW(),
         rejection_reason = $4,
         updated_at = NOW()
     WHERE proposal_id = $1
     RETURNING proposal_id, user_id, status`,
    [proposalId, status, reviewerId, rejectionReason]
  );

  return rows[0] || null;
}

module.exports = {
  findProposalByUserId,
  upsertProposal,
  listProposalsForAdmin,
  findProposalById,
  updateProposalDecision,
};
