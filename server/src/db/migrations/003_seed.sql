INSERT INTO users (user_id, email, password_hash, full_name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'morgan@fit-lab.app', crypt('Admin123!', gen_salt('bf', 12)), 'Morgan Lee', 'ADMIN'),
  ('00000000-0000-0000-0000-000000000002', 'avery@fit-lab.app', crypt('Trainer123!', gen_salt('bf', 12)), 'Avery Cole', 'TRAINER'),
  ('00000000-0000-0000-0000-000000000003', 'dev@fit-lab.app', crypt('Trainer123!', gen_salt('bf', 12)), 'Dev Kapoor', 'TRAINER'),
  ('00000000-0000-0000-0000-000000000004', 'jordan@fit-lab.app', crypt('Member123!', gen_salt('bf', 12)), 'Jordan Wells', 'MEMBER'),
  ('00000000-0000-0000-0000-000000000005', 'parker@fit-lab.app', crypt('Member123!', gen_salt('bf', 12)), 'Parker Chen', 'MEMBER'),
  ('00000000-0000-0000-0000-000000000006', 'skylar@fit-lab.app', crypt('Member123!', gen_salt('bf', 12)), 'Skylar Patel', 'MEMBER')
ON CONFLICT (user_id) DO UPDATE
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

INSERT INTO courses (
  course_id,
  trainer_id,
  name,
  description,
  category,
  difficulty,
  price,
  thumbnail_url,
  duration_label,
  session_count,
  spot_limit
) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'Foundations of Strength',
    'Program focused on progressive overload, movement fundamentals, and accessory stability work.',
    'Strength',
    'INTERMEDIATE',
    149.00,
    NULL,
    '6 Weeks',
    18,
    24
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    'HIIT Accelerator',
    'Interval-based approach combining power, speed, and metabolic finishers to boost conditioning.',
    'Conditioning',
    'BEGINNER',
    129.00,
    NULL,
    '4 Weeks',
    12,
    30
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'Mobility Reset',
    'Low-impact plan to restore posture, joint health, and breathing mechanics.',
    'Mobility',
    'BEGINNER',
    89.00,
    NULL,
    '3 Weeks',
    9,
    18
  )
ON CONFLICT (course_id) DO UPDATE
SET trainer_id = EXCLUDED.trainer_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    difficulty = EXCLUDED.difficulty,
    price = EXCLUDED.price,
    duration_label = EXCLUDED.duration_label,
    session_count = EXCLUDED.session_count,
    spot_limit = EXCLUDED.spot_limit;

INSERT INTO lessons (lesson_id, course_id, title, content, position) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Movement assessment', NULL, 1),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Tempo lifting for strength', NULL, 2),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Accessory stability toolkit', NULL, 3),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Power intervals', NULL, 1),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'Cardio ladders', NULL, 2),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'Metabolic finishers', NULL, 3),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'Daily mobility ritual', NULL, 1),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', 'Breathwork primer', NULL, 2),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', 'Restorative flows', NULL, 3)
ON CONFLICT (lesson_id) DO UPDATE
SET course_id = EXCLUDED.course_id,
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    position = EXCLUDED.position;

INSERT INTO enrollments (member_id, course_id, progress_percent) VALUES
  ('00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 45),
  ('00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 72),
  ('00000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 0)
ON CONFLICT (member_id, course_id) DO UPDATE
SET progress_percent = EXCLUDED.progress_percent;

INSERT INTO trainer_proposals (
  proposal_id,
  user_id,
  message,
  specialties,
  certifications,
  experience_years,
  sample_course,
  bio,
  status,
  rejection_reason
) VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000006',
    'I would like to coach members through progressive strength cycles.',
    ARRAY['Strength', 'MetCon'],
    ARRAY['NASM CPT', 'CF-L1'],
    4,
    'Foundations of Strength',
    'Focus on safety-first programming and measurable outcomes.',
    'PENDING',
    NULL
  )
ON CONFLICT (proposal_id) DO UPDATE
SET user_id = EXCLUDED.user_id,
    message = EXCLUDED.message,
    specialties = EXCLUDED.specialties,
    certifications = EXCLUDED.certifications,
    experience_years = EXCLUDED.experience_years,
    sample_course = EXCLUDED.sample_course,
    bio = EXCLUDED.bio,
    status = EXCLUDED.status,
    rejection_reason = EXCLUDED.rejection_reason,
    updated_at = NOW();

INSERT INTO messages (message_id, sender_id, receiver_id, course_id, content, sent_at, read_at) VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'Can you share a quick warm-up for hamstrings?',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '20 hours'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000001',
    'Uploaded the warm-up video to your resources.',
    NOW() - INTERVAL '18 hours',
    NOW() - INTERVAL '17 hours'
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000001',
    'Shared cues for tempo squats and a deload option.',
    NOW() - INTERVAL '1 hour',
    NULL
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000002',
    'Friday felt heavy last week. Should I scale?',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '90 minutes'
  ),
  (
    '40000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000002',
    'Let’s lower Friday intensity to 70% this week.',
    NOW() - INTERVAL '30 minutes',
    NULL
  )
ON CONFLICT (message_id) DO UPDATE
SET sender_id = EXCLUDED.sender_id,
    receiver_id = EXCLUDED.receiver_id,
    course_id = EXCLUDED.course_id,
    content = EXCLUDED.content,
    sent_at = EXCLUDED.sent_at,
    read_at = EXCLUDED.read_at;
