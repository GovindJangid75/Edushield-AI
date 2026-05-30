export type RiskLevel = 'critical' | 'high' | 'moderate' | 'stable';

export interface StudentRiskFactor {
  factor: string;
  weight: number;
  description: string;
  trend: 'declining' | 'stable' | 'improving';
}

export interface Intervention {
  id: string;
  type: string;
  description: string;
  assignedTo: string;
  status: 'assigned' | 'in-progress' | 'follow-up' | 'resolved';
  dateAssigned: string;
  dateResolved?: string;
  outcome?: string;
}

export interface StudentObservation {
  id: string;
  teacherName: string;
  date: string;
  note: string;
  type: 'academic' | 'emotional' | 'behavioral' | 'positive';
}

export interface Student {
  id: string;
  dbId?: string;
  name: string;
  class: string;
  section: string;
  age: number;
  gender: 'M' | 'F';
  guardianName: string;
  guardianPhone: string;
  riskLevel: RiskLevel;
  riskScore: number;
  confidenceScore: number;
  isHiddenStudent: boolean;
  attendanceRate: number;
  attendanceTrend: number[];
  academicScore: number;
  academicTrend: number[];
  participationScore: number;
  participationTrend: number[];
  homeworkConsistency: number;
  behaviorScore: number;
  emotionalWellbeing: number;
  interactionFrequency: number;
  riskFactors: StudentRiskFactor[];
  interventions: Intervention[];
  observations: StudentObservation[];
  aiExplanation: string;
  predictedDisengagementDays?: number;
  enrollmentDate: string;
  photoSeed: number;
}

const firstNames = {
  M: ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
    'Shaurya', 'Atharva', 'Advait', 'Dhruv', 'Kabir', 'Ritvik', 'Aarush', 'Kayaan', 'Darsh', 'Virat',
    'Rudra', 'Arnav', 'Samar', 'Yash', 'Dev', 'Rohan', 'Kartik', 'Pranav', 'Mihir', 'Tanish',
    'Parth', 'Kunal', 'Harsh', 'Ravi', 'Sunil', 'Deepak', 'Amit', 'Rahul', 'Vikram', 'Mohan',
    'Ankit', 'Sachin', 'Nikhil', 'Gaurav', 'Akash', 'Manish', 'Piyush', 'Saurabh', 'Himanshu', 'Naveen'],
  F: ['Aanya', 'Saanvi', 'Aadhya', 'Isha', 'Ananya', 'Myra', 'Diya', 'Prisha', 'Anika', 'Sara',
    'Kiara', 'Riya', 'Kavya', 'Shreya', 'Pooja', 'Neha', 'Meera', 'Fatima', 'Zara', 'Nandini',
    'Tanya', 'Simran', 'Palak', 'Divya', 'Kriti', 'Swati', 'Jyoti', 'Suman', 'Rekha', 'Sunita',
    'Priya', 'Ankita', 'Komal', 'Sneha', 'Mansi', 'Bhavna', 'Lalita', 'Geeta', 'Manju', 'Nisha',
    'Radha', 'Sita', 'Uma', 'Lakshmi', 'Durga', 'Padma', 'Rupal', 'Hema', 'Chitra', 'Vidya']
};

const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Reddy', 'Nair', 'Iyer',
  'Joshi', 'Mishra', 'Chauhan', 'Yadav', 'Pandey', 'Tiwari', 'Saxena', 'Agarwal', 'Mehta',
  'Shah', 'Das', 'Bose', 'Roy', 'Dutta', 'Sen', 'Banerjee', 'Mukherjee', 'Khan', 'Ahmed',
  'Hussain', 'Ansari', 'Deshmukh', 'Patil', 'Kulkarni', 'Jain', 'Sinha', 'Thakur', 'Choudhary',
  'Malhotra', 'Kapoor', 'Bhat'];

const classes = ['6-A', '6-B', '7-A', '7-B', '8-A', '8-B', '9-A', '9-B', '10-A', '10-B'];

const interventionTypes = [
  'Parent Communication', 'Mentor Support', 'Peer Buddy Allocation',
  'Bilingual Learning Material', 'Counseling Session', 'Reduced Homework Load',
  'Personalized Revision Plan', 'Teacher Follow-up', 'Extra Coaching',
  'Emotional Support Group', 'Attendance Monitoring', 'Home Visit'
];

const observationTemplates = {
  academic: [
    'Has been struggling with mathematics concepts lately.',
    'Submitted incomplete assignments for the third consecutive week.',
    'Shows improved understanding in science after extra coaching.',
    'Unable to follow classroom instructions in English medium.',
    'Needs additional support in reading comprehension.',
    'Performance dropped significantly in recent unit test.',
  ],
  emotional: [
    'Appeared withdrawn and avoided eye contact during class.',
    'Was seen sitting alone during lunch break consistently.',
    'Seemed anxious before the examination, hands trembling.',
    'Cried during class when asked about homework.',
    'Appears more cheerful after counseling sessions began.',
    'Shows signs of low self-confidence when called upon.',
  ],
  behavioral: [
    'Has been frequently absent on Mondays and Fridays.',
    'Gets into arguments with classmates during group activities.',
    'Refuses to participate in any extracurricular activities.',
    'Often comes to school without proper uniform or supplies.',
    'Falls asleep during afternoon classes regularly.',
    'Shows restless behavior and difficulty concentrating.',
  ],
  positive: [
    'Helped a younger student with their homework voluntarily.',
    'Showed remarkable improvement in class participation this week.',
    'Volunteered to lead the group project presentation.',
    'Attendance has been consistent for the past month.',
    'Scored highest in the surprise quiz - great improvement!',
    'Has been actively asking questions in class.',
  ]
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateTrend(seed: number, base: number, volatility: number, length: number, declining: boolean): number[] {
  const rng = seededRandom(seed);
  const trend: number[] = [];
  let current = base;
  for (let i = 0; i < length; i++) {
    const change = (rng() - 0.5) * volatility + (declining ? -1.5 : 0.3);
    current = Math.max(10, Math.min(100, current + change));
    trend.push(Math.round(current));
  }
  return trend;
}

function generateStudent(index: number): Student {
  const rng = seededRandom(index * 137 + 42);
  const gender: 'M' | 'F' = rng() > 0.48 ? 'M' : 'F';
  const firstName = firstNames[gender][Math.floor(rng() * firstNames[gender].length)];
  const lastName = lastNames[Math.floor(rng() * lastNames.length)];
  const classInfo = classes[Math.floor(rng() * classes.length)];
  const age = parseInt(classInfo.split('-')[0]) + Math.floor(rng() * 2);

  // Risk distribution: 8% critical, 15% high, 30% moderate, 47% stable
  let riskLevel: RiskLevel;
  let riskScore: number;
  const riskRoll = rng();
  if (riskRoll < 0.08) {
    riskLevel = 'critical';
    riskScore = 75 + Math.floor(rng() * 25);
  } else if (riskRoll < 0.23) {
    riskLevel = 'high';
    riskScore = 55 + Math.floor(rng() * 20);
  } else if (riskRoll < 0.53) {
    riskLevel = 'moderate';
    riskScore = 30 + Math.floor(rng() * 25);
  } else {
    riskLevel = 'stable';
    riskScore = 5 + Math.floor(rng() * 25);
  }

  const isDeclining = riskLevel === 'critical' || riskLevel === 'high';
  const isHidden = riskLevel === 'moderate' && rng() > 0.6;

  const attendanceBase = riskLevel === 'critical' ? 45 + rng() * 20 :
    riskLevel === 'high' ? 60 + rng() * 15 :
    riskLevel === 'moderate' ? 72 + rng() * 15 : 85 + rng() * 14;

  const academicBase = riskLevel === 'critical' ? 25 + rng() * 20 :
    riskLevel === 'high' ? 40 + rng() * 20 :
    isHidden ? 55 + rng() * 20 : 60 + rng() * 35;

  const participationBase = isHidden ? 15 + rng() * 15 :
    riskLevel === 'critical' ? 10 + rng() * 20 :
    riskLevel === 'high' ? 25 + rng() * 20 :
    riskLevel === 'moderate' ? 40 + rng() * 25 : 60 + rng() * 35;

  const riskFactors: StudentRiskFactor[] = [];
  if (attendanceBase < 70) {
    riskFactors.push({
      factor: 'Attendance Decline',
      weight: 0.3,
      description: `Attendance dropped to ${Math.round(attendanceBase)}% from 85% over 3 months`,
      trend: 'declining'
    });
  }
  if (academicBase < 50) {
    riskFactors.push({
      factor: 'Academic Performance Drop',
      weight: 0.25,
      description: `Average score declined by ${Math.round(30 + rng() * 20)} points in recent assessments`,
      trend: 'declining'
    });
  }
  if (participationBase < 30) {
    riskFactors.push({
      factor: 'Low Classroom Participation',
      weight: 0.2,
      description: 'Rarely raises hand, avoids group discussions, minimal verbal interaction',
      trend: isDeclining ? 'declining' : 'stable'
    });
  }
  if (rng() > 0.5 && (riskLevel === 'critical' || riskLevel === 'high')) {
    riskFactors.push({
      factor: 'Homework Inconsistency',
      weight: 0.15,
      description: `Only ${Math.round(30 + rng() * 25)}% homework completion rate in last month`,
      trend: 'declining'
    });
  }
  if (rng() > 0.6 && riskLevel === 'critical') {
    riskFactors.push({
      factor: 'Emotional Disengagement',
      weight: 0.1,
      description: 'Teacher reports withdrawn behavior, reduced social interaction with peers',
      trend: 'declining'
    });
  }
  if (isHidden) {
    riskFactors.push({
      factor: 'Social Disconnection',
      weight: 0.2,
      description: 'Never asks questions, sits alone, no recorded teacher interactions in 2 weeks',
      trend: 'stable'
    });
    riskFactors.push({
      factor: 'Invisible Pattern',
      weight: 0.15,
      description: 'Average grades mask declining engagement — student is silently struggling',
      trend: 'declining'
    });
  }

  const interventions: Intervention[] = [];
  if (riskLevel === 'critical' || riskLevel === 'high') {
    const numInterventions = Math.floor(rng() * 3) + 1;
    for (let i = 0; i < numInterventions; i++) {
      const type = interventionTypes[Math.floor(rng() * interventionTypes.length)];
      const statuses: Intervention['status'][] = ['assigned', 'in-progress', 'follow-up', 'resolved'];
      interventions.push({
        id: `INT-${index}-${i}`,
        type,
        description: `${type} recommended based on ${riskFactors[0]?.factor || 'overall risk assessment'}`,
        assignedTo: `Teacher ${Math.floor(rng() * 15) + 1}`,
        status: statuses[Math.floor(rng() * statuses.length)],
        dateAssigned: `2026-0${Math.floor(rng() * 4) + 1}-${String(Math.floor(rng() * 28) + 1).padStart(2, '0')}`,
        ...(rng() > 0.5 ? { dateResolved: '2026-05-15', outcome: 'Positive improvement observed' } : {})
      });
    }
  }

  const observations: StudentObservation[] = [];
  const obsTypes: Array<'academic' | 'emotional' | 'behavioral' | 'positive'> = ['academic', 'emotional', 'behavioral', 'positive'];
  const numObs = riskLevel === 'critical' ? 3 : riskLevel === 'high' ? 2 : Math.floor(rng() * 2) + 1;
  for (let i = 0; i < numObs; i++) {
    const obsType = riskLevel === 'stable' ? 'positive' : obsTypes[Math.floor(rng() * (riskLevel === 'critical' ? 3 : 4))];
    const templates = observationTemplates[obsType];
    observations.push({
      id: `OBS-${index}-${i}`,
      teacherName: `${firstNames.F[Math.floor(rng() * 10)]} ${lastNames[Math.floor(rng() * 10)]}`,
      date: `2026-05-${String(Math.floor(rng() * 20) + 1).padStart(2, '0')}`,
      note: templates[Math.floor(rng() * templates.length)],
      type: obsType
    });
  }

  const explanations: Record<RiskLevel, string[]> = {
    critical: [
      `${firstName} shows a convergence of declining attendance (${Math.round(attendanceBase)}%), dropping academic performance, and reduced classroom participation. The AI model detected a pattern consistent with pre-dropout behavior observed in similar profiles. Immediate intervention is strongly recommended.`,
      `Multiple risk indicators are simultaneously active: attendance has fallen below 60%, homework submissions are irregular, and teacher observations report emotional withdrawal. The confidence score reflects strong signal alignment across 4 independent data streams.`,
      `${firstName}'s engagement pattern matches the "silent disengagement" profile — gradual withdrawal across all measurable dimensions over the past 8 weeks. Without intervention, the model predicts complete disengagement within ${Math.floor(15 + rng() * 20)} days.`
    ],
    high: [
      `${firstName} shows early warning signs across attendance and participation metrics. While academic scores remain borderline, the declining trend is consistent with students who later disengage. Proactive monitoring and teacher check-ins are recommended.`,
      `The AI detected a behavioral change pattern: reduced interaction frequency combined with homework inconsistency. These early indicators, while individually minor, combine to create a meaningful risk signal.`
    ],
    moderate: [
      `${firstName} shows mixed signals — some metrics are stable while others show minor decline. The moderate risk classification reflects uncertainty; continued monitoring will improve prediction accuracy.`,
      `Participation levels have decreased slightly, but attendance and academic performance remain acceptable. This student may benefit from preventive engagement strategies.`
    ],
    stable: [
      `${firstName} shows healthy engagement across all tracked dimensions. No significant risk factors detected. Continue standard monitoring.`,
      `All indicators are within normal ranges. ${firstName} demonstrates consistent attendance, active participation, and stable academic performance.`
    ]
  };

  const explanationList = explanations[riskLevel];

  return {
    id: `STU-${String(index + 1).padStart(3, '0')}`,
    name: `${firstName} ${lastName}`,
    class: classInfo.split('-')[0],
    section: classInfo.split('-')[1],
    age,
    gender,
    guardianName: `${firstNames[rng() > 0.5 ? 'M' : 'F'][Math.floor(rng() * 20)]} ${lastName}`,
    guardianPhone: `+91 ${Math.floor(7000000000 + rng() * 2999999999)}`,
    riskLevel,
    riskScore,
    confidenceScore: Math.round((65 + rng() * 30) * 10) / 10,
    isHiddenStudent: isHidden,
    attendanceRate: Math.round(attendanceBase),
    attendanceTrend: generateTrend(index * 3, attendanceBase + 15, 8, 12, isDeclining),
    academicScore: Math.round(academicBase),
    academicTrend: generateTrend(index * 5, academicBase + 10, 10, 12, isDeclining),
    participationScore: Math.round(participationBase),
    participationTrend: generateTrend(index * 7, participationBase + 10, 12, 12, isDeclining),
    homeworkConsistency: Math.round(riskLevel === 'critical' ? 25 + rng() * 25 :
      riskLevel === 'high' ? 45 + rng() * 20 :
      riskLevel === 'moderate' ? 60 + rng() * 20 : 75 + rng() * 24),
    behaviorScore: Math.round(riskLevel === 'critical' ? 30 + rng() * 25 :
      riskLevel === 'high' ? 50 + rng() * 20 :
      riskLevel === 'moderate' ? 60 + rng() * 20 : 75 + rng() * 24),
    emotionalWellbeing: Math.round(riskLevel === 'critical' ? 20 + rng() * 25 :
      riskLevel === 'high' ? 40 + rng() * 25 :
      riskLevel === 'moderate' ? 55 + rng() * 25 : 70 + rng() * 28),
    interactionFrequency: Math.round(isHidden ? 5 + rng() * 10 :
      riskLevel === 'critical' ? 10 + rng() * 15 :
      riskLevel === 'high' ? 25 + rng() * 20 :
      riskLevel === 'moderate' ? 40 + rng() * 25 : 60 + rng() * 38),
    riskFactors,
    interventions,
    observations,
    aiExplanation: explanationList[Math.floor(rng() * explanationList.length)],
    predictedDisengagementDays: riskLevel === 'critical' ? Math.floor(10 + rng() * 25) :
      riskLevel === 'high' ? Math.floor(30 + rng() * 40) : undefined,
    enrollmentDate: `20${20 + Math.floor(rng() * 5)}-0${Math.floor(rng() * 8) + 1}-${String(Math.floor(rng() * 28) + 1).padStart(2, '0')}`,
    photoSeed: Math.floor(rng() * 1000),
  };
}

export const students: Student[] = Array.from({ length: 120 }, (_, i) => generateStudent(i));

export const getStudentById = (id: string): Student | undefined =>
  students.find(s => s.id === id);

export const getStudentsByRisk = (risk: RiskLevel): Student[] =>
  students.filter(s => s.riskLevel === risk);

export const getStudentsByClass = (cls: string): Student[] =>
  students.filter(s => s.class === cls);

export const getHiddenStudents = (): Student[] =>
  students.filter(s => s.isHiddenStudent);

export const getCriticalStudents = (): Student[] =>
  students.filter(s => s.riskLevel === 'critical').sort((a, b) => b.riskScore - a.riskScore);

export const riskDistribution = {
  critical: students.filter(s => s.riskLevel === 'critical').length,
  high: students.filter(s => s.riskLevel === 'high').length,
  moderate: students.filter(s => s.riskLevel === 'moderate').length,
  stable: students.filter(s => s.riskLevel === 'stable').length,
};

export const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

export const getLocalStudents = (): Student[] => {
  if (typeof window === 'undefined') return students;
  const local = localStorage.getItem('edushield_students');
  if (!local) {
    localStorage.setItem('edushield_students', JSON.stringify(students));
    return students;
  }
  try {
    return JSON.parse(local);
  } catch (e) {
    return students;
  }
};

export const saveLocalStudents = (list: Student[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('edushield_students', JSON.stringify(list));
};
