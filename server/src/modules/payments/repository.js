/**
 * Inserts a single payment row inside an existing transaction client.
 * @param {{ memberId, courseId, amount, currency, status, cardLastFour }} data
 * @param {import('pg').PoolClient} client
 * @returns {Promise<object>} The inserted payment row.
 */
async function insertPayment({ memberId, courseId, amount, currency, status, cardLastFour }, client) {
  const { rows } = await client.query(
    `INSERT INTO payments (member_id, course_id, amount, currency, status, card_last_four)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [memberId, courseId, amount, currency, status, cardLastFour || null]
  );
  return rows[0];
}

async function findPaymentsAdmin({
  search,
  status,
  memberId,
  trainerId,
  courseId,
  dateFrom,
  dateTo,
  limit,
  offset,
}) {
  const pool = require('../../config/db');
  const { rows } = await pool.query(
    `SELECT
      p.id,
      p.member_id,
      m.full_name   AS member_name,
      c.course_id,
      c.name        AS course_name,
      c.trainer_id,
      t.full_name   AS trainer_name,
      p.amount,
      p.currency,
      p.status,
      p.card_last_four,
      p.created_at,
      COUNT(*) OVER() AS total_count
    FROM payments p
    JOIN users m  ON p.member_id  = m.user_id
    JOIN courses c ON p.course_id = c.course_id
    JOIN users t  ON c.trainer_id = t.user_id
    WHERE
      ($1::text IS NULL OR
        m.full_name ILIKE '%'||$1||'%' OR
        t.full_name ILIKE '%'||$1||'%' OR
        c.name      ILIKE '%'||$1||'%' OR
        p.id::text  ILIKE '%'||$1||'%')
      AND ($2::text IS NULL OR p.status = $2)
      AND ($3::uuid IS NULL OR p.member_id   = $3::uuid)
      AND ($4::uuid IS NULL OR c.trainer_id  = $4::uuid)
      AND ($5::uuid IS NULL OR p.course_id   = $5::uuid)
      AND ($6::timestamptz IS NULL OR p.created_at >= $6::timestamptz)
      AND ($7::timestamptz IS NULL OR p.created_at <= $7::timestamptz)
    ORDER BY p.created_at DESC
    LIMIT $8 OFFSET $9`,
    [
      search || null,
      status || null,
      memberId || null,
      trainerId || null,
      courseId || null,
      dateFrom || null,
      dateTo || null,
      limit,
      offset,
    ]
  );
  return rows;
}

async function getPaymentSummary() {
  const pool = require('../../config/db');
  const { rows } = await pool.query(
    `SELECT
      COUNT(*)::INT                                           AS total_count,
      COALESCE(SUM(amount), 0)::NUMERIC                       AS total_revenue,
      COUNT(*) FILTER (WHERE status = 'success')::INT         AS paid_count,
      COUNT(*) FILTER (WHERE status = 'pending')::INT         AS pending_count,
      COUNT(*) FILTER (WHERE status = 'failed')::INT          AS failed_count,
      COUNT(*) FILTER (WHERE status = 'refunded')::INT        AS refunded_count
    FROM payments`
  );
  return rows[0];
}

module.exports = { insertPayment, findPaymentsAdmin, getPaymentSummary };
