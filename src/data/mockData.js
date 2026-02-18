export const courses = [
  {
    id: 'c1',
    title: 'Foundations of Strength',
    duration: '6 Weeks',
    level: 'Intermediate',
    trainerName: 'Avery Cole',
    price: '$149',
    description:
      'Program focused on progressive overload, movement fundamentals, and accessory stability work.',
    syllabus: ['Movement assessment', 'Tempo lifting for strength', 'Accessory stability toolkit'],
  },
  {
    id: 'c2',
    title: 'HIIT Accelerator',
    duration: '4 Weeks',
    level: 'All Levels',
    trainerName: 'Maya Hernandez',
    price: '$129',
    description:
      'Interval-based approach combining power, speed, and metabolic finishers to boost conditioning.',
    syllabus: ['Power intervals', 'Cardio ladders', 'Metabolic finishers'],
  },
  {
    id: 'c3',
    title: 'Mobility Reset',
    duration: '3 Weeks',
    level: 'Beginner',
    trainerName: 'Dev Kapoor',
    price: '$89',
    description:
      'Low-impact plan to restore posture, joint health, and breathing mechanics.',
    syllabus: ['Daily mobility ritual', 'Breathwork primer', 'Restorative flows'],
  },
]

export const enrollments = [
  {
    id: 'e1',
    courseId: 'c1',
    memberName: 'Jordan Wells',
    progress: 45,
  },
  {
    id: 'e2',
    courseId: 'c2',
    memberName: 'Jordan Wells',
    progress: 72,
  },
  {
    id: 'e3',
    courseId: 'c3',
    memberName: 'Aida Cooper',
    progress: 0,
  },
]

export const users = [
  { id: 'u1', name: 'Jordan Wells', role: 'member', email: 'jordan@Fit-Lab.app' },
  { id: 'u2', name: 'Parker Chen', role: 'member', email: 'parker@Fit-Lab.app' },
  { id: 'u3', name: 'Avery Cole', role: 'trainer', email: 'avery@Fit-Lab.app' },
  { id: 'u4', name: 'Dev Kapoor', role: 'trainer', email: 'dev@Fit-Lab.app' },
  { id: 'u5', name: 'Morgan Lee', role: 'admin', email: 'morgan@Fit-Lab.app' },
]

export const trainerApplicants = [
  {
    id: 'ta1',
    name: 'Skylar Patel',
    specialties: ['Strength', 'MetCon'],
    submitted: 'Nov 14',
    certifications: ['NASM CPT', 'CF-L1'],
  },
  {
    id: 'ta2',
    name: 'Rowan James',
    specialties: ['Mobility', 'Yoga'],
    submitted: 'Nov 10',
    certifications: ['RYT 200'],
  },
]

export const messageThreads = [
  {
    id: 'm1',
    memberName: 'Jordan Wells',
    trainerName: 'Avery Cole',
    courseTitle: 'Foundations of Strength',
    lastMessage: 'Shared cues for tempo squats and a deload option.',
    lastTimestamp: '1h ago',
    messages: [
      { sender: 'member', text: 'Can you share a quick warm-up for hamstrings?', time: 'Yesterday' },
      { sender: 'trainer', text: 'Uploaded the warm-up video to your resources.', time: '2h ago' },
      { sender: 'trainer', text: 'Shared cues for tempo squats and a deload option.', time: '1h ago' },
    ],
  },
  {
    id: 'm2',
    memberName: 'Jordan Wells',
    trainerName: 'Maya Hernandez',
    courseTitle: 'HIIT Accelerator',
    lastMessage: 'Let’s lower Friday intensity to 70% this week.',
    lastTimestamp: 'Today',
    messages: [
      { sender: 'member', text: 'Friday felt heavy last week. Should I scale?', time: 'Today' },
      { sender: 'trainer', text: 'Let’s lower Friday intensity to 70% this week.', time: 'Today' },
      { sender: 'member', text: 'Sounds good, I will note it.', time: 'Today' },
    ],
  },
  {
    id: 'm3',
    memberName: 'Aida Cooper',
    trainerName: 'Dev Kapoor',
    courseTitle: 'Mobility Reset',
    lastMessage: 'Try the 5-minute breathing drill before bed.',
    lastTimestamp: '3d ago',
    messages: [
      { sender: 'member', text: 'Still tight in my upper back.', time: '4d ago' },
      { sender: 'trainer', text: 'Try the 5-minute breathing drill before bed.', time: '3d ago' },
      { sender: 'member', text: 'Will do, thanks!', time: '3d ago' },
    ],
  },
  {
    id: 'm4',
    memberName: 'Parker Chen',
    trainerName: 'Maya Hernandez',
    courseTitle: 'HIIT Accelerator',
    lastMessage: 'Let me know how your knee feels after mobility prep.',
    lastTimestamp: '1d ago',
    messages: [
      { sender: 'member', text: 'Knee felt off after sprints.', time: '2d ago' },
      { sender: 'trainer', text: 'Add 10 minutes of mobility prep before intervals.', time: '1d ago' },
      { sender: 'trainer', text: 'Let me know how your knee feels after mobility prep.', time: '1d ago' },
    ],
  },
]
