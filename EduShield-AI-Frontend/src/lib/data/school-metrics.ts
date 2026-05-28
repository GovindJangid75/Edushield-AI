export interface SchoolMetrics {
  healthScore: number;
  healthTrend: number[];
  engagementScore: number;
  engagementTrend: number[];
  dropoutRiskScore: number;
  dropoutTrend: number[];
  participationIndex: number;
  participationTrend: number[];
  attendanceStability: number;
  attendanceTrend: number[];
  emotionalWellbeing: number;
  wellbeingTrend: number[];
  recoveryProgress: number;
  recoveryTrend: number[];
  interventionSuccessRate: number;
  interventionTrend: number[];
  teacherWellnessScore: number;
  teacherWellnessTrend: number[];
  totalStudents: number;
  totalTeachers: number;
  totalInterventions: number;
  activeInterventions: number;
  resolvedInterventions: number;
  avgAttendance: number;
  avgAcademic: number;
}

export const schoolMetrics: SchoolMetrics = {
  healthScore: 72,
  healthTrend: [65, 66, 68, 67, 69, 70, 71, 70, 72, 71, 72, 72],
  engagementScore: 68,
  engagementTrend: [72, 71, 70, 69, 68, 67, 68, 67, 68, 68, 68, 68],
  dropoutRiskScore: 18,
  dropoutTrend: [12, 13, 14, 15, 14, 16, 17, 16, 17, 18, 18, 18],
  participationIndex: 64,
  participationTrend: [70, 69, 68, 67, 66, 65, 64, 65, 64, 64, 64, 64],
  attendanceStability: 78,
  attendanceTrend: [82, 81, 80, 79, 80, 79, 78, 79, 78, 78, 78, 78],
  emotionalWellbeing: 65,
  wellbeingTrend: [70, 69, 68, 67, 66, 65, 66, 65, 65, 65, 65, 65],
  recoveryProgress: 45,
  recoveryTrend: [30, 32, 34, 36, 38, 40, 41, 42, 43, 44, 45, 45],
  interventionSuccessRate: 62,
  interventionTrend: [48, 50, 52, 54, 55, 57, 58, 59, 60, 61, 62, 62],
  teacherWellnessScore: 58,
  teacherWellnessTrend: [65, 64, 63, 62, 61, 60, 59, 58, 58, 58, 58, 58],
  totalStudents: 120,
  totalTeachers: 20,
  totalInterventions: 87,
  activeInterventions: 34,
  resolvedInterventions: 53,
  avgAttendance: 76,
  avgAcademic: 62,
};

export interface InterventionCatalog {
  id: string;
  type: string;
  description: string;
  targetRiskLevel: string[];
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimatedDuration: string;
  responsibleRole: string;
  culturalNote?: string;
}

export const interventionCatalog: InterventionCatalog[] = [
  {
    id: 'IC-01', type: 'Parent Communication',
    description: 'Schedule a parent-teacher meeting to discuss student progress and home environment factors.',
    targetRiskLevel: ['critical', 'high'], priority: 'urgent', estimatedDuration: '1-2 days',
    responsibleRole: 'Class Teacher',
    culturalNote: 'In rural areas, home visits may be more effective than formal meetings. Consider involving a community elder if needed.'
  },
  {
    id: 'IC-02', type: 'Mentor Support',
    description: 'Assign a senior student or teacher mentor for regular one-on-one guidance sessions.',
    targetRiskLevel: ['critical', 'high', 'moderate'], priority: 'high', estimatedDuration: 'Ongoing (4-8 weeks)',
    responsibleRole: 'School Counselor',
    culturalNote: 'Match mentors by language preference. In government schools, peer mentoring is often more sustainable.'
  },
  {
    id: 'IC-03', type: 'Peer Buddy Allocation',
    description: 'Pair the student with a supportive classmate for academic and social support.',
    targetRiskLevel: ['high', 'moderate'], priority: 'medium', estimatedDuration: '2-4 weeks',
    responsibleRole: 'Class Teacher',
    culturalNote: 'Consider same-gender pairing in conservative settings. Ensure the buddy system doesn\'t create dependency.'
  },
  {
    id: 'IC-04', type: 'Bilingual Learning Material',
    description: 'Provide study materials in the student\'s mother tongue alongside the medium of instruction.',
    targetRiskLevel: ['critical', 'high', 'moderate'], priority: 'high', estimatedDuration: '1 week to prepare',
    responsibleRole: 'Subject Teacher',
    culturalNote: 'Essential for first-generation learners. Hindi-English or regional language support significantly improves comprehension.'
  },
  {
    id: 'IC-05', type: 'Counseling Session',
    description: 'Arrange professional counseling to address emotional or psychological concerns.',
    targetRiskLevel: ['critical', 'high'], priority: 'urgent', estimatedDuration: '1-3 sessions',
    responsibleRole: 'School Counselor',
    culturalNote: 'In schools without counselors, trained teachers or NGO volunteers can provide basic support. Normalize help-seeking.'
  },
  {
    id: 'IC-06', type: 'Reduced Homework Load',
    description: 'Temporarily reduce homework assignments to prevent overwhelm and rebuild confidence.',
    targetRiskLevel: ['high', 'moderate'], priority: 'medium', estimatedDuration: '2-3 weeks',
    responsibleRole: 'Subject Teacher'
  },
  {
    id: 'IC-07', type: 'Personalized Revision Plan',
    description: 'Create a customized revision schedule focusing on weak areas with gradual difficulty increase.',
    targetRiskLevel: ['critical', 'high', 'moderate'], priority: 'high', estimatedDuration: '4-6 weeks',
    responsibleRole: 'Subject Teacher'
  },
  {
    id: 'IC-08', type: 'Teacher Follow-up',
    description: 'Schedule regular check-ins (daily/weekly) to monitor progress and provide encouragement.',
    targetRiskLevel: ['critical', 'high'], priority: 'high', estimatedDuration: 'Ongoing',
    responsibleRole: 'Class Teacher'
  },
  {
    id: 'IC-09', type: 'Extra Coaching',
    description: 'Arrange additional tutoring sessions after school hours for academic support.',
    targetRiskLevel: ['high', 'moderate'], priority: 'medium', estimatedDuration: '4-8 weeks',
    responsibleRole: 'Subject Teacher',
    culturalNote: 'Coordinate with parents regarding transportation. Consider grouping students for efficiency.'
  },
  {
    id: 'IC-10', type: 'Emotional Support Group',
    description: 'Include the student in a peer support group for social-emotional learning.',
    targetRiskLevel: ['critical', 'high'], priority: 'high', estimatedDuration: 'Ongoing (term-long)',
    responsibleRole: 'School Counselor'
  },
  {
    id: 'IC-11', type: 'Attendance Monitoring',
    description: 'Implement daily attendance tracking with immediate parent notification for absences.',
    targetRiskLevel: ['critical', 'high'], priority: 'urgent', estimatedDuration: 'Ongoing',
    responsibleRole: 'Class Teacher',
    culturalNote: 'SMS alerts work well in rural areas. WhatsApp for urban. Consider reasons like harvest season, festivals, sibling care.'
  },
  {
    id: 'IC-12', type: 'Home Visit',
    description: 'Conduct a home visit to understand the student\'s home environment and family situation.',
    targetRiskLevel: ['critical'], priority: 'urgent', estimatedDuration: '1-2 days',
    responsibleRole: 'Class Teacher / Admin',
    culturalNote: 'Essential for understanding socioeconomic factors. Go with a female teacher for girl students. Be sensitive to family dynamics.'
  },
];

export const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

export const districtComparison = [
  { name: 'Our School', healthScore: 72, engagement: 68, attendance: 78, interventionSuccess: 62 },
  { name: 'District Avg', healthScore: 65, engagement: 60, attendance: 72, interventionSuccess: 48 },
  { name: 'State Avg', healthScore: 58, engagement: 55, attendance: 68, interventionSuccess: 42 },
  { name: 'Top Performer', healthScore: 88, engagement: 82, attendance: 92, interventionSuccess: 78 },
];
