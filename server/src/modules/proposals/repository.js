const pool = require('../../config/db');

async function findProposalByUserId(userId) {
  const { rows } = await pool.query(
    `SELECT
       p.proposal_id,
       p.user_id,
       p.message,
       p.specialties,
       p.certifications,
       p.experience_years,
       p.sample_course,
       p.bio,
       p.status,
       COALESCE(p.reviewer_id, p.review_id) AS reviewer_id,
       p.reviewed_at,
       p.rejection_reason,
       p.created_at,
       p.updated_at,
       reviewer.full_name AS reviewer_name
     FROM trainer_proposals p
     LEFT JOIN users reviewer ON reviewer.user_id = COALESCE(p.reviewer_id, p.review_id)
     WHERE p.user_id = $1
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

async function upsertProposal({ userId, message, specialties, certifications, experienceYears, sampleCourse, bio }) {
  const { rows } = await pool.query(
    `INSERT INTO trainer_proposals (
       user_id,
       message,
       specialties,
       certifications,
       experience_years,
       sample_course,
       bio,
       status,
       reviewer_id,
       review_id,
       reviewed_at,
       rejection_reason,
       updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,'PENDING',NULL,NULL,NULL,NULL,NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET
       message = EXCLUDED.message,
       specialties = EXCLUDED.specialties,
       certifications = EXCLUDED.certifications,
       experience_years = EXCLUDED.experience_years,
       sample_course = EXCLUDED.sample_course,
       bio = EXCLUDED.bio,
       status = 'PENDING',
       reviewer_id = NULL,
       review_id = NULL,
       reviewed_at = NULL,
       rejection_reason = NULL,
       updated_at = NOW()
     RETURNING proposal_id`,
    [userId, message, specialties, certifications, experienceYears, sampleCourse, bio]
  );

  return rows[0].proposal_id;
}

async function listProposalsForAdmin() {
  const { rows } = await pool.query(
    `SELECT
       p.proposal_id,
       p.user_id,
       p.message,
       p.specialties,
       p.certifications,
       p.experience_years,
       p.sample_course,
       p.bio,
       p.status,
       COALESCE(p.reviewer_id, p.review_id) AS reviewer_id,
       p.reviewed_at,
       p.rejection_reason,
       p.created_at,
       p.updated_at,
       applicant.full_name AS applicant_name,
       applicant.email AS applicant_email,
       reviewer.full_name AS reviewer_name
     FROM trainer_proposals p
     JOIN users applicant ON applicant.user_id = p.user_id
     LEFT JOIN users reviewer ON reviewer.user_id = COALESCE(p.reviewer_id, p.review_id)
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
         review_id = $3,
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
