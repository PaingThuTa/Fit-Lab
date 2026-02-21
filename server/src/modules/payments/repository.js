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

module.exports = { insertPayment };
