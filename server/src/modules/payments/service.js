const pool = require('../../config/db');
const AppError = require('../../utils/appError');
const repository = require('./repository');
const coursesRepository = require('../courses/repository');

/**
 * Records a mock payment and creates the enrollment atomically.
 * @param {string} memberId
 * @param {{ courseId: string, cardLastFour?: string }} input
 * @returns {Promise<{ paymentId: string, amount: number, currency: string, status: string }>}
 */
async function processMockPayment(memberId, { courseId, cardLastFour }) {
  if (!courseId) throw new AppError(400, 'courseId is required');

  const course = await coursesRepository.findCourseById(courseId);
  if (!course) throw new AppError(404, 'Course not found');

  const amount = Number(course.price);
  const currency = 'USD';
  const status = 'success';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const payment = await repository.insertPayment(
      { memberId, courseId, amount, currency, status, cardLastFour },
      client
    );

    // Enroll the member inside the same transaction
    await client.query(
      `INSERT INTO enrollments (member_id, course_id)
       VALUES ($1, $2)
       ON CONFLICT (member_id, course_id) DO NOTHING`,
      [memberId, courseId]
    );

    await client.query('COMMIT');

    return {
      paymentId: payment.id,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { processMockPayment };
