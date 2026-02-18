const repository = require('./repository');

async function getMemberEnrollments(memberId) {
  const rows = await repository.listMemberEnrollments(memberId);
  return rows.map((row) => ({
    memberId: row.member_id,
    courseId: row.course_id,
    enrolledAt: row.enrolled_at,
    progressPercent: 0,
    course: {
      name: row.course_name,
      description: row.course_description,
      difficulty: row.difficulty,
      price: Number(row.price),
      trainerName: row.trainer_name,
    },
  }));
}

async function getTrainerEnrollments(trainerId) {
  const rows = await repository.listTrainerEnrollments(trainerId);
  return rows.map((row) => ({
    memberId: row.member_id,
    memberName: row.member_name,
    memberEmail: row.member_email,
    courseId: row.course_id,
    courseName: row.course_name,
    difficulty: row.difficulty,
    enrolledAt: row.enrolled_at,
    progressPercent: 0,
  }));
}

module.exports = {
  getMemberEnrollments,
  getTrainerEnrollments,
};
