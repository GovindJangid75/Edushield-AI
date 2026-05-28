export interface Teacher {
  id: string;
  name: string;
  subject: string;
  classes: string[];
  yearsExperience: number;
  totalStudents: number;
  interventionCases: number;
  correctionWorkload: number; // 0-100
  classroomStress: number; // 0-100
  emotionalFatigue: number; // 0-100
  attendanceBurden: number; // 0-100
  overallBurnout: number; // 0-100
  burnoutTrend: number[];
  workloadHoursPerWeek: number;
  attentionDistribution: { studentId: string; studentName: string; attention: number }[];
  wellnessAlerts: string[];
  gender: 'M' | 'F';
}

export const teachers: Teacher[] = [
  {
    id: 'TCH-001', name: 'Sunita Sharma', subject: 'Mathematics', classes: ['8-A', '8-B', '9-A', '9-B'],
    yearsExperience: 15, totalStudents: 48, interventionCases: 7, correctionWorkload: 82,
    classroomStress: 75, emotionalFatigue: 70, attendanceBurden: 65, overallBurnout: 78,
    burnoutTrend: [55, 58, 62, 65, 68, 72, 70, 73, 75, 77, 78, 78],
    workloadHoursPerWeek: 52, gender: 'F',
    attentionDistribution: [
      { studentId: 'STU-001', studentName: 'Aarav Sharma', attention: 85 },
      { studentId: 'STU-005', studentName: 'Arjun Singh', attention: 72 },
      { studentId: 'STU-012', studentName: 'Riya Gupta', attention: 15 },
    ],
    wellnessAlerts: ['Workload exceeds recommended limit by 30%', 'Burnout score trending upward for 6 consecutive weeks']
  },
  {
    id: 'TCH-002', name: 'Rajesh Kumar', subject: 'Science', classes: ['7-A', '7-B', '8-A'],
    yearsExperience: 8, totalStudents: 36, interventionCases: 4, correctionWorkload: 58,
    classroomStress: 45, emotionalFatigue: 40, attendanceBurden: 50, overallBurnout: 48,
    burnoutTrend: [42, 44, 45, 43, 46, 48, 47, 45, 48, 50, 48, 48],
    workloadHoursPerWeek: 42, gender: 'M',
    attentionDistribution: [
      { studentId: 'STU-003', studentName: 'Aditya Verma', attention: 90 },
      { studentId: 'STU-008', studentName: 'Diya Patel', attention: 20 },
    ],
    wellnessAlerts: []
  },
  {
    id: 'TCH-003', name: 'Meenakshi Iyer', subject: 'English', classes: ['6-A', '6-B', '7-A', '7-B', '8-A'],
    yearsExperience: 20, totalStudents: 60, interventionCases: 9, correctionWorkload: 91,
    classroomStress: 85, emotionalFatigue: 88, attendanceBurden: 72, overallBurnout: 89,
    burnoutTrend: [60, 65, 68, 72, 75, 78, 82, 84, 86, 88, 89, 89],
    workloadHoursPerWeek: 58, gender: 'F',
    attentionDistribution: [
      { studentId: 'STU-002', studentName: 'Vivaan Gupta', attention: 95 },
      { studentId: 'STU-015', studentName: 'Kavya Reddy', attention: 10 },
      { studentId: 'STU-020', studentName: 'Neha Singh', attention: 8 },
    ],
    wellnessAlerts: ['CRITICAL: Burnout score at 89% — immediate workload reduction needed', 'Teaching 5 classes exceeds recommended maximum of 4', 'Emotional fatigue critically high — counseling recommended']
  },
  {
    id: 'TCH-004', name: 'Amit Pandey', subject: 'Hindi', classes: ['9-A', '9-B', '10-A', '10-B'],
    yearsExperience: 12, totalStudents: 44, interventionCases: 5, correctionWorkload: 65,
    classroomStress: 55, emotionalFatigue: 50, attendanceBurden: 60, overallBurnout: 58,
    burnoutTrend: [50, 52, 53, 55, 54, 56, 57, 58, 57, 58, 58, 58],
    workloadHoursPerWeek: 45, gender: 'M',
    attentionDistribution: [],
    wellnessAlerts: ['Moderate workload — monitor intervention case count']
  },
  {
    id: 'TCH-005', name: 'Priya Nair', subject: 'Social Science', classes: ['6-A', '7-A', '8-A', '9-A'],
    yearsExperience: 6, totalStudents: 48, interventionCases: 3, correctionWorkload: 52,
    classroomStress: 38, emotionalFatigue: 35, attendanceBurden: 45, overallBurnout: 40,
    burnoutTrend: [35, 36, 37, 38, 37, 38, 39, 40, 39, 40, 40, 40],
    workloadHoursPerWeek: 40, gender: 'F',
    attentionDistribution: [],
    wellnessAlerts: []
  },
  {
    id: 'TCH-006', name: 'Vikram Thakur', subject: 'Physical Education', classes: ['6-A', '6-B', '7-A', '7-B', '8-A', '8-B'],
    yearsExperience: 10, totalStudents: 72, interventionCases: 2, correctionWorkload: 25,
    classroomStress: 30, emotionalFatigue: 28, attendanceBurden: 55, overallBurnout: 32,
    burnoutTrend: [28, 29, 30, 30, 31, 32, 31, 32, 32, 32, 32, 32],
    workloadHoursPerWeek: 38, gender: 'M',
    attentionDistribution: [],
    wellnessAlerts: []
  },
  {
    id: 'TCH-007', name: 'Fatima Khan', subject: 'Urdu', classes: ['6-B', '7-B'],
    yearsExperience: 4, totalStudents: 24, interventionCases: 2, correctionWorkload: 45,
    classroomStress: 42, emotionalFatigue: 38, attendanceBurden: 35, overallBurnout: 42,
    burnoutTrend: [38, 39, 40, 40, 41, 42, 41, 42, 42, 42, 42, 42],
    workloadHoursPerWeek: 36, gender: 'F',
    attentionDistribution: [],
    wellnessAlerts: []
  },
  {
    id: 'TCH-008', name: 'Deepak Mishra', subject: 'Computer Science', classes: ['8-A', '8-B', '9-A', '9-B', '10-A', '10-B'],
    yearsExperience: 7, totalStudents: 72, interventionCases: 6, correctionWorkload: 70,
    classroomStress: 68, emotionalFatigue: 62, attendanceBurden: 58, overallBurnout: 68,
    burnoutTrend: [45, 48, 52, 55, 58, 60, 62, 64, 66, 67, 68, 68],
    workloadHoursPerWeek: 48, gender: 'M',
    attentionDistribution: [
      { studentId: 'STU-010', studentName: 'Sara Mehta', attention: 80 },
    ],
    wellnessAlerts: ['Teaching 6 classes — exceeds maximum', 'Burnout trending upward consistently']
  },
  {
    id: 'TCH-009', name: 'Lakshmi Reddy', subject: 'Telugu', classes: ['6-A', '6-B'],
    yearsExperience: 18, totalStudents: 24, interventionCases: 1, correctionWorkload: 35,
    classroomStress: 25, emotionalFatigue: 22, attendanceBurden: 30, overallBurnout: 28,
    burnoutTrend: [25, 26, 27, 27, 28, 28, 27, 28, 28, 28, 28, 28],
    workloadHoursPerWeek: 34, gender: 'F',
    attentionDistribution: [],
    wellnessAlerts: []
  },
  {
    id: 'TCH-010', name: 'Suresh Yadav', subject: 'Mathematics', classes: ['6-A', '6-B', '7-A', '7-B'],
    yearsExperience: 14, totalStudents: 48, interventionCases: 5, correctionWorkload: 75,
    classroomStress: 62, emotionalFatigue: 58, attendanceBurden: 55, overallBurnout: 65,
    burnoutTrend: [50, 52, 55, 57, 58, 60, 62, 63, 64, 65, 65, 65],
    workloadHoursPerWeek: 46, gender: 'M',
    attentionDistribution: [],
    wellnessAlerts: ['Burnout approaching high threshold']
  },
  {
    id: 'TCH-011', name: 'Geeta Joshi', subject: 'Science', classes: ['9-A', '9-B', '10-A', '10-B'],
    yearsExperience: 22, totalStudents: 44, interventionCases: 8, correctionWorkload: 78,
    classroomStress: 72, emotionalFatigue: 75, attendanceBurden: 68, overallBurnout: 76,
    burnoutTrend: [58, 60, 63, 65, 68, 70, 72, 73, 74, 75, 76, 76],
    workloadHoursPerWeek: 50, gender: 'F',
    attentionDistribution: [],
    wellnessAlerts: ['High intervention caseload — 8 active cases', 'Emotional fatigue elevated']
  },
  {
    id: 'TCH-012', name: 'Mohammed Ansari', subject: 'Social Science', classes: ['8-B', '9-B', '10-B'],
    yearsExperience: 9, totalStudents: 36, interventionCases: 3, correctionWorkload: 55,
    classroomStress: 48, emotionalFatigue: 42, attendanceBurden: 50, overallBurnout: 50,
    burnoutTrend: [42, 44, 45, 46, 47, 48, 49, 49, 50, 50, 50, 50],
    workloadHoursPerWeek: 42, gender: 'M',
    attentionDistribution: [],
    wellnessAlerts: []
  },
  {
    id: 'TCH-013', name: 'Kavita Saxena', subject: 'Art & Craft', classes: ['6-A', '6-B', '7-A', '7-B', '8-A', '8-B'],
    yearsExperience: 11, totalStudents: 72, interventionCases: 1, correctionWorkload: 30,
    classroomStress: 22, emotionalFatigue: 20, attendanceBurden: 40, overallBurnout: 25,
    burnoutTrend: [22, 23, 24, 24, 25, 25, 24, 25, 25, 25, 25, 25],
    workloadHoursPerWeek: 35, gender: 'F',
    attentionDistribution: [],
    wellnessAlerts: []
  },
  {
    id: 'TCH-014', name: 'Harish Chauhan', subject: 'English', classes: ['9-A', '9-B', '10-A', '10-B'],
    yearsExperience: 16, totalStudents: 44, interventionCases: 6, correctionWorkload: 72,
    classroomStress: 65, emotionalFatigue: 60, attendanceBurden: 58, overallBurnout: 67,
    burnoutTrend: [52, 54, 56, 58, 60, 62, 63, 64, 65, 66, 67, 67],
    workloadHoursPerWeek: 47, gender: 'M',
    attentionDistribution: [],
    wellnessAlerts: ['Burnout approaching high threshold', 'High essay correction workload']
  },
  {
    id: 'TCH-015', name: 'Anita Kulkarni', subject: 'Music', classes: ['6-A', '6-B', '7-A', '7-B'],
    yearsExperience: 13, totalStudents: 48, interventionCases: 0, correctionWorkload: 15,
    classroomStress: 18, emotionalFatigue: 15, attendanceBurden: 35, overallBurnout: 20,
    burnoutTrend: [18, 19, 20, 20, 20, 20, 19, 20, 20, 20, 20, 20],
    workloadHoursPerWeek: 32, gender: 'F',
    attentionDistribution: [],
    wellnessAlerts: []
  },
  {
    id: 'TCH-016', name: 'Ramesh Patil', subject: 'Science', classes: ['6-A', '6-B'],
    yearsExperience: 25, totalStudents: 24, interventionCases: 2, correctionWorkload: 40,
    classroomStress: 32, emotionalFatigue: 30, attendanceBurden: 28, overallBurnout: 33,
    burnoutTrend: [30, 31, 32, 32, 33, 33, 32, 33, 33, 33, 33, 33],
    workloadHoursPerWeek: 36, gender: 'M',
    attentionDistribution: [],
    wellnessAlerts: []
  },
  {
    id: 'TCH-017', name: 'Swati Dutta', subject: 'Mathematics', classes: ['10-A', '10-B'],
    yearsExperience: 5, totalStudents: 24, interventionCases: 4, correctionWorkload: 68,
    classroomStress: 70, emotionalFatigue: 65, attendanceBurden: 45, overallBurnout: 66,
    burnoutTrend: [40, 45, 48, 52, 55, 58, 60, 62, 64, 65, 66, 66],
    workloadHoursPerWeek: 44, gender: 'F',
    attentionDistribution: [],
    wellnessAlerts: ['Board exam preparation pressure — stress elevated', 'Newer teacher with high-stakes classes']
  },
  {
    id: 'TCH-018', name: 'Nitin Agarwal', subject: 'Hindi', classes: ['6-A', '6-B', '7-A', '7-B'],
    yearsExperience: 8, totalStudents: 48, interventionCases: 3, correctionWorkload: 55,
    classroomStress: 42, emotionalFatigue: 38, attendanceBurden: 45, overallBurnout: 44,
    burnoutTrend: [38, 39, 40, 41, 42, 43, 43, 44, 44, 44, 44, 44],
    workloadHoursPerWeek: 40, gender: 'M',
    attentionDistribution: [],
    wellnessAlerts: []
  },
  {
    id: 'TCH-019', name: 'Padma Bhat', subject: 'Sanskrit', classes: ['8-A', '8-B', '9-A'],
    yearsExperience: 19, totalStudents: 36, interventionCases: 2, correctionWorkload: 48,
    classroomStress: 35, emotionalFatigue: 32, attendanceBurden: 38, overallBurnout: 38,
    burnoutTrend: [34, 35, 36, 36, 37, 38, 37, 38, 38, 38, 38, 38],
    workloadHoursPerWeek: 38, gender: 'F',
    attentionDistribution: [],
    wellnessAlerts: []
  },
  {
    id: 'TCH-020', name: 'Ajay Sinha', subject: 'Social Science', classes: ['6-B', '7-B', '10-A'],
    yearsExperience: 11, totalStudents: 36, interventionCases: 4, correctionWorkload: 60,
    classroomStress: 55, emotionalFatigue: 52, attendanceBurden: 48, overallBurnout: 55,
    burnoutTrend: [42, 44, 46, 48, 50, 52, 53, 54, 55, 55, 55, 55],
    workloadHoursPerWeek: 43, gender: 'M',
    attentionDistribution: [],
    wellnessAlerts: ['Managing classes across 3 different grade levels']
  },
];

export const getTeacherById = (id: string): Teacher | undefined =>
  teachers.find(t => t.id === id);

export const getOverloadedTeachers = (): Teacher[] =>
  teachers.filter(t => t.overallBurnout >= 65).sort((a, b) => b.overallBurnout - a.overallBurnout);

export const burnoutDistribution = {
  critical: teachers.filter(t => t.overallBurnout >= 75).length,
  high: teachers.filter(t => t.overallBurnout >= 60 && t.overallBurnout < 75).length,
  moderate: teachers.filter(t => t.overallBurnout >= 40 && t.overallBurnout < 60).length,
  healthy: teachers.filter(t => t.overallBurnout < 40).length,
};

export const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
