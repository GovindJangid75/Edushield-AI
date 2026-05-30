'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageWrapper from '@/components/layout/PageWrapper';
import RiskBadge from '@/components/ai/RiskBadge';
import ConfidenceScore from '@/components/ai/ConfidenceScore';
import RiskDistributionRing from '@/components/charts/RiskDistributionRing';
import AddStudentModal from '@/components/students/AddStudentModal';
import { api } from '@/lib/api';
import { getLocalStudents, Student } from '@/lib/data/students';
import { getOverloadedTeachers } from '@/lib/data/teachers';
import { schoolMetrics } from '@/lib/data/school-metrics';
import { 
  ShieldAlert, 
  Sparkles, 
  ArrowUpRight, 
  Mic, 
  UserX, 
  Activity, 
  UserCheck, 
  Users,
  Flame,
  FileSpreadsheet,
  Plus,
  Send,
  MessageSquare,
  Building,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function RiskHeatmapGrid({ students }: { students: Student[] }) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0]);
    }
  }, [students]);

  const getColorClass = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500 hover:bg-red-600 shadow-xs border-red-600';
      case 'high': return 'bg-orange-500 hover:bg-orange-600 shadow-xs border-orange-600';
      case 'moderate': return 'bg-amber-400 hover:bg-amber-500 shadow-xs border-amber-500';
      case 'stable':
      default:
        return 'bg-emerald-500 hover:bg-emerald-600 shadow-xs border-emerald-600';
    }
  };

  return (
    <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm">
      <div className="border-b border-[#E8DDD0] pb-3 mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E] flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C75B39] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C75B39]"></span>
            </span>
            Classroom Risk Heatmap Grid
          </h3>
          <p className="text-xs text-[#6B7280]">Tactile grid mapping individual student risk coefficients</p>
        </div>
        <div className="flex gap-2.5 text-[9px] font-bold">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded" /> Stable</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-400 rounded" /> Moderate</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-orange-500 rounded" /> High</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-500 rounded" /> Critical</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* The Grid */}
        <div className="md:col-span-7">
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DDD0]/50 max-h-[220px] overflow-y-auto">
            {students.map((student) => (
              <motion.button
                key={student.id}
                whileHover={{ scale: 1.15, zIndex: 10 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedStudent(student)}
                className={`w-9 h-9 rounded-lg border flex items-center justify-center font-mono text-[10px] font-bold text-white transition-all cursor-pointer ${getColorClass(student.riskLevel)} ${
                  selectedStudent?.id === student.id ? 'ring-3 ring-[#C75B39]/40 border-white' : ''
                }`}
                title={`${student.name} (${student.riskLevel})`}
              >
                {student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </motion.button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 italic">Tip: Click any cell to inspect predictive variables & AI explanations.</p>
        </div>

        {/* Selected Student Details Panel */}
        <div className="md:col-span-5 border-l border-l-gray-100 md:pl-6 flex flex-col justify-between">
          {selectedStudent ? (
            <div className="space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="text-xs font-bold text-[#1A1A2E]">{selectedStudent.name}</h4>
                  <p className="text-[10px] text-gray-400">ID: {selectedStudent.id} • Class {selectedStudent.class}-{selectedStudent.section}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold capitalize border ${
                  selectedStudent.riskLevel === 'critical' ? 'bg-red-50 text-red-700 border-red-200' :
                  selectedStudent.riskLevel === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                  selectedStudent.riskLevel === 'moderate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-green-50 text-green-700 border-green-200'
                }`}>
                  {selectedStudent.riskLevel}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#FAF7F2] p-2.5 rounded-lg border border-[#E8DDD0]/50">
                <div>
                  <span className="text-gray-400">Attendance:</span>
                  <span className="block font-bold text-[#1A1A2E]">{selectedStudent.attendanceRate}%</span>
                </div>
                <div>
                  <span className="text-gray-400">Academic Avg:</span>
                  <span className="block font-bold text-[#1A1A2E]">{selectedStudent.academicScore}%</span>
                </div>
              </div>

              <p className="text-[10px] text-gray-500 leading-normal italic bg-slate-50 p-2.5 rounded border border-gray-100">
                "{selectedStudent.aiExplanation}"
              </p>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-[#C75B39] font-bold">AI Confidence: {selectedStudent.confidenceScore}%</span>
                <Link 
                  href={`/students/${selectedStudent.id}`}
                  className="text-[10px] text-[#C75B39] hover:underline font-bold flex items-center gap-0.5"
                >
                  Full Diagnosis →
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-6 text-center">No student selected</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [role, setRole] = useState<'admin' | 'teacher' | 'parent' | 'ngo'>('admin');
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<'all-alerts' | 'hidden'>('all-alerts');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Simulated parent chat states
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'parent' | 'counselor', text: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatInitialized, setChatInitialized] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load local storage role
    const savedRole = localStorage.getItem('userRole') as any;
    if (savedRole) {
      setRole(savedRole);
    }

    // Load dynamic students
    const loadStudents = async () => {
      const data = await api.getStudents();
      setAllStudents(data);
    };
    
    loadStudents();
    
    // Listen to newly added students
    window.addEventListener('students-updated', loadStudents);
    return () => {
      window.removeEventListener('students-updated', loadStudents);
    };
  }, []);

  useEffect(() => {
    if (allStudents.length > 0 && !chatInitialized) {
      const savedUserCode = localStorage.getItem('userCode') || 'STU-001';
      const myChild = allStudents.find(s => s.id.toLowerCase() === savedUserCode.toLowerCase()) || allStudents[0];
      const parentName = myChild?.guardianName ? myChild.guardianName.split(' ')[0] : 'Parent';
      const childFirstName = myChild?.name ? myChild.name.split(' ')[0] : 'your child';
      
      setChatMessages([
        { sender: 'counselor', text: `Namaste ${parentName} ji, I am the school counselor. I can assist you with ${childFirstName}'s academic performance or attendance trends. How can I help you today?` }
      ]);
      setChatInitialized(true);
    }
  }, [allStudents, chatInitialized]);

  const handleSendMessage = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || chatInput;
    if (!textToSend.trim()) return;

    const newMsgs = [...chatMessages, { sender: 'parent' as const, text: textToSend }];
    setChatMessages(newMsgs);
    setChatInput('');

    // Simulate comforting counselor responses
    setTimeout(() => {
      const savedUserCode = localStorage.getItem('userCode') || 'STU-001';
      const myChild = allStudents.find(s => s.id.toLowerCase() === savedUserCode.toLowerCase()) || allStudents[0];
      const childFirstName = myChild?.name ? myChild.name.split(' ')[0] : 'your child';
      
      let reply = `Thank you for reaching out. We will schedule a personalized meeting with ${childFirstName}'s subject teachers.`;
      if (textToSend.toLowerCase().includes('math')) {
        reply = `Don't worry. We have allocated ${childFirstName} a revision buddy who scored 90% in maths. They will review problems together daily at school. We will also share extra practice worksheets in Hindi.`;
      } else if (textToSend.toLowerCase().includes('attendance')) {
        reply = `${childFirstName}'s attendance is currently ${myChild?.attendanceRate || 85}%, which is stable. However, if he needs to take a sick day, please inform us on this portal so his attendance record isn't marked as unnotified absence.`;
      } else if (textToSend.toLowerCase().includes('meeting') || textToSend.toLowerCase().includes('call')) {
        reply = `Sure! We can schedule a video/home counselor meeting this Saturday at 11 AM. Let me mark this in the teacher intervention log.`;
      }
      setChatMessages(prev => [...prev, { sender: 'counselor' as const, text: reply }]);
    }, 800);
  };

  if (!mounted || allStudents.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#C75B39] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Teacher-specific student filtration (only Class 8)
  const teacherStudents = allStudents.filter(s => s.class === '8');
  
  // Dynamic stats calculated from active student list state
  const criticalStudents = allStudents.filter(s => s.riskLevel === 'critical').sort((a, b) => b.riskScore - a.riskScore).slice(0, 4);
  const hiddenStudents = allStudents.filter(s => s.isHiddenStudent).slice(0, 4);
  const overloadedTeachers = getOverloadedTeachers().slice(0, 3);

  const totalCritical = allStudents.filter(s => s.riskLevel === 'critical').length;
  const totalHigh = allStudents.filter(s => s.riskLevel === 'high').length;
  const totalHidden = allStudents.filter(s => s.isHiddenStudent).length;

  // Teacher metrics for Class 8-A
  const teacherCritical = teacherStudents.filter(s => s.riskLevel === 'critical').length;
  const teacherHigh = teacherStudents.filter(s => s.riskLevel === 'high').length;
  const teacherHidden = teacherStudents.filter(s => s.isHiddenStudent).length;
  const teacherCriticalList = teacherStudents.filter(s => s.riskLevel === 'critical' || s.riskLevel === 'high').slice(0, 4);

  // -------------------------------------------------------------
  // RENDER PORTALS
  // -------------------------------------------------------------

  const renderDashboard = () => {
    switch (role) {
      // -------------------------------------------------------------
      // 1. TEACHER DASHBOARD
      // -------------------------------------------------------------
      case 'teacher':
        return (
          <PageWrapper 
            title="Classroom Copilot" 
            subtitle="Early Warning Signals & Intervention Planner for Class 8-A"
          >
            {/* Quick action buttons row with tactile clicks */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <motion.button
                onClick={() => setIsAddModalOpen(true)}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2.5 bg-[#C75B39] text-white hover:bg-[#A94A2D] font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Student to Class
              </motion.button>
              
              <Link href="/voice" className="block">
                <motion.div
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2.5 bg-white border border-[#E8DDD0] hover:border-[#C75B39]/40 text-[#1A1A2E] font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Mic className="w-4 h-4 text-[#C75B39]" /> Record Voice Note
                </motion.div>
              </Link>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* TOP METRICS */}
              <div className="col-span-1 xl:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">Class 8-A Health Score</p>
                      <h3 className="text-3xl font-extrabold font-[family-name:var(--font-heading)] text-[#1A1A2E] mt-1">
                        78<span className="text-sm font-medium text-[#6B7280]">/100</span>
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#A8D5BA] flex items-center justify-center">
                      <Activity className="w-5 h-5 text-[#4A7C59]" />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-[#4A7C59] font-medium flex items-center gap-1">
                    <span>Average attendance stable at 81.4%</span>
                  </p>
                </div>

                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">Critical & High Alerts</p>
                      <h3 className="text-3xl font-extrabold font-[family-name:var(--font-heading)] text-[#DC2626] mt-1">
                        {teacherCritical + teacherHigh}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] border border-red-200 flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5 text-[#DC2626]" />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-[#DC2626] font-medium flex items-center gap-1">
                    <span className="risk-pulse-critical w-2 h-2 rounded-full bg-[#DC2626]" />
                    <span>Requires active revision plans</span>
                  </p>
                </div>

                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">Silent Disengagement</p>
                      <h3 className="text-3xl font-extrabold font-[family-name:var(--font-heading)] text-[#D4A843] mt-1">
                        {teacherHidden}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] border border-[#F0DCA4] flex items-center justify-center">
                      <UserX className="w-5 h-5 text-[#D4A843]" />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-[#D4A843] font-medium">
                    <span>Stable grades masking low class talking</span>
                  </p>
                </div>
              </div>

              {/* CLASS ROOM RISK QUEUE */}
              <div className="col-span-1 xl:col-span-8 space-y-6">
                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm">
                  <div className="border-b border-[#E8DDD0] pb-4 mb-5 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">Class 8-A Intervention Queue</h3>
                      <p className="text-xs text-[#6B7280]">Prioritized student dropout risk indicators</p>
                    </div>
                    <Link href="/students" className="text-xs font-semibold text-[#C75B39] hover:underline">
                      View All Class List
                    </Link>
                  </div>

                  <div className="space-y-3.5">
                    {teacherCriticalList.length > 0 ? (
                      teacherCriticalList.map(student => (
                        <motion.div 
                          key={student.id}
                          whileHover={{ scale: 1.01, borderColor: '#C75B39' }}
                          whileTap={{ scale: 0.99 }}
                          className="p-4 bg-white border border-[#E8DDD0] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-150 cursor-pointer shadow-xs"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1A1A2E] to-[#2C3E6B] flex items-center justify-center text-white text-xs font-bold font-mono">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-[#1A1A2E] hover:underline">
                                  <Link href={`/students/${student.id}`}>{student.name}</Link>
                                </h4>
                                <span className="text-[10px] bg-[#FAF7F2] border border-[#E8DDD0] px-2 py-0.5 rounded text-[#6B7280] font-mono">
                                  Class {student.class}-{student.section}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[11px] text-[#6B7280]">
                                <span>Attendance: <span className="font-semibold text-[#1A1A2E]">{student.attendanceRate}%</span></span>
                                <span>Academic Avg: <span className="font-semibold text-[#1A1A2E]">{student.academicScore}%</span></span>
                                <span>Risk Score: <span className="font-semibold text-[#1A1A2E]">{student.riskScore}</span></span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 justify-between md:justify-end border-t md:border-0 pt-3 md:pt-0">
                            <div className="flex items-center gap-2">
                              <ConfidenceScore score={student.confidenceScore} size="sm" />
                              <RiskBadge level={student.riskLevel} />
                            </div>
                            <Link href={`/students/${student.id}`} className="p-2 bg-[#FAF7F2] hover:bg-[#FFF8F0] border border-[#E8DDD0] rounded-lg text-[#C75B39]">
                              <ArrowUpRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-center text-xs text-[#6B7280] py-8 bg-[#FAF7F2] rounded-xl border border-dashed border-[#E8DDD0]">
                        No high/critical risk students found in Class 8-A.
                      </p>
                    )}
                  </div>
                </div>

                {/* Interactive Risk Heatmap */}
                <RiskHeatmapGrid students={teacherStudents} />

                {/* AI Rationale */}
                <div className="bg-[#FFF8F0] border border-[#E8DDD0] rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-[#E8DDD0] pb-3 mb-4">
                    <Sparkles className="w-5 h-5 text-[#C75B39]" />
                    <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">Class AI Dropout Risk Insights</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {teacherStudents.filter(s => s.riskLevel === 'critical').slice(0, 2).map(student => (
                      <div key={student.id} className="bg-white border border-[#E8DDD0] rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-[#1A1A2E]">{student.name}</h4>
                          <RiskBadge level={student.riskLevel} />
                        </div>
                        <p className="text-[10px] text-[#6B7280] leading-relaxed bg-[#FAF7F2] p-2.5 rounded-lg">
                          {student.aiExplanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SIDE METRICS & DISTRIBUTION */}
              <div className="col-span-1 xl:col-span-4 space-y-6">
                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E] mb-1">Class Triage Distribution</h3>
                  <p className="text-xs text-[#6B7280] mb-4">Urgency levels across all Class 8-A students</p>
                  
                  {/* Custom smaller Distribution display */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs border-b border-gray-100 pb-1.5">
                      <span className="text-[#DC2626] font-semibold">Critical:</span>
                      <span className="font-bold">{teacherCritical}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-gray-100 pb-1.5">
                      <span className="text-[#EA580C] font-semibold">High Risk:</span>
                      <span className="font-bold">{teacherHigh}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-gray-100 pb-1.5">
                      <span className="text-[#D4A843] font-semibold">Moderate:</span>
                      <span className="font-bold">{teacherStudents.filter(s => s.riskLevel === 'moderate').length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#4A7C59] font-semibold">Stable:</span>
                      <span className="font-bold">{teacherStudents.filter(s => s.riskLevel === 'stable').length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E] mb-2">Classroom Action Targets</h3>
                  <div className="space-y-3 text-xs text-[#6B7280]">
                    <div className="p-3 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl">
                      <p className="font-bold text-[#1A1A2E]">Home Visit Target</p>
                      <p className="mt-1">Visit families with attendance &lt; 60% this Friday.</p>
                    </div>
                    <div className="p-3 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl">
                      <p className="font-bold text-[#1A1A2E]">Revision Buddy Allocation</p>
                      <p className="mt-1">Pair high academic performers with struggling students.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </PageWrapper>
        );

      // -------------------------------------------------------------
      // -------------------------------------------------------------
      // 2. PARENT DASHBOARD
      // -------------------------------------------------------------
      case 'parent': {
        const savedUserCode = localStorage.getItem('userCode') || 'STU-001';
        const myChild = allStudents.find(s => s.id.toLowerCase() === savedUserCode.toLowerCase()) || allStudents[0];
        const initials = myChild.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const childFirstName = myChild.name.split(' ')[0];

        return (
          <PageWrapper 
            title="Student Care Portal" 
            subtitle="Preventive Academic Engagement & Attendance Dashboard"
          >
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* STUDENT SNAPSHOT */}
              <div className="col-span-1 xl:col-span-4 bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C75B39] to-[#2C3E6B] flex items-center justify-center text-white text-3xl font-extrabold mx-auto shadow-md">
                    {initials}
                  </div>
                  <h3 className="text-lg font-bold text-[#1A1A2E] mt-3">{myChild.name}</h3>
                  <p className="text-xs text-[#6B7280]">Class {myChild.class}-Section {myChild.section} • Student ID: {myChild.id}</p>
                  
                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#4A7C59]" /> {myChild.riskLevel === 'stable' ? 'Stable Engagement Status' : `${myChild.riskLevel.toUpperCase()} Risk Profile`}
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Score Indicators */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-[#6B7280]">Attendance Rate</span>
                      <span className={`${myChild.attendanceRate >= 80 ? 'text-[#4A7C59]' : myChild.attendanceRate >= 70 ? 'text-[#D4A843]' : 'text-[#DC2626]'} font-bold`}>
                        {myChild.attendanceRate}% ({myChild.attendanceRate >= 80 ? 'Healthy' : myChild.attendanceRate >= 70 ? 'Needs Attention' : 'Critical Warning'})
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${myChild.attendanceRate >= 80 ? 'bg-[#4A7C59]' : myChild.attendanceRate >= 70 ? 'bg-[#D4A843]' : 'bg-[#DC2626]'}`} style={{ width: `${myChild.attendanceRate}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-[#6B7280]">Academic Assessment Score</span>
                      <span className={`${myChild.academicScore >= 70 ? 'text-[#4A7C59]' : myChild.academicScore >= 50 ? 'text-[#D4A843]' : 'text-[#DC2626]'} font-bold`}>
                        {myChild.academicScore}% ({myChild.academicScore >= 70 ? 'Satisfactory' : myChild.academicScore >= 50 ? 'Requires practice' : 'Academic Alert'})
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${myChild.academicScore >= 70 ? 'bg-[#4A7C59]' : myChild.academicScore >= 50 ? 'bg-[#D4A843]' : 'bg-[#DC2626]'}`} style={{ width: `${myChild.academicScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-[#6B7280]">Classroom Social Interaction</span>
                      <span className="text-[#4A7C59] font-bold">Good</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="bg-[#4A7C59] h-full" style={{ width: '90%' }} />
                    </div>
                  </div>
                </div>

                {/* Parent revision notice */}
                <div className="bg-[#FFF8F0] border border-[#E8DDD0] rounded-xl p-4 text-xs space-y-2">
                  <p className="font-bold text-[#C75B39] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> AI Academic Recommendation
                  </p>
                  <p className="text-[#6B7280] leading-relaxed font-medium">
                    {myChild.aiExplanation}
                  </p>
                </div>
              </div>

              {/* LIVE CHAT WITH SCHOOL COUNSELOR */}
              <div className="col-span-1 xl:col-span-8 bg-white border border-[#E8DDD0] rounded-2xl shadow-sm flex flex-col h-[650px] overflow-hidden">
                <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E8DDD0] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4A7C59] to-[#2C3E6B] flex items-center justify-center text-white shadow-xs">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1A1A2E]">Talk to School Counselor</h3>
                    <p className="text-[10px] text-[#4A7C59] font-medium flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4A7C59] animate-ping" /> Counselor Active
                    </p>
                  </div>
                </div>

                {/* Message logs */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/20">
                  {chatMessages.map((msg, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'parent' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] p-3.5 rounded-2xl text-xs shadow-xs leading-relaxed ${
                        msg.sender === 'parent' 
                          ? 'bg-[#1A1A2E] text-white rounded-tr-none' 
                          : 'bg-white border border-[#E8DDD0] text-[#1A1A2E] rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Chat suggestions query links */}
                <div className="px-6 py-2 border-t border-gray-100 flex flex-wrap gap-2 bg-[#FAF7F2]/40">
                  <span className="text-[10px] text-[#6B7280] flex items-center font-bold">Quick Ask:</span>
                  {[
                    `How to improve ${childFirstName}'s Math score?`,
                    'Check attendance records',
                    'Request counseling callback',
                  ].map((q, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => handleSendMessage(undefined, q)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-[10px] bg-white border border-[#E8DDD0] px-2.5 py-1 rounded-full text-[#C75B39] font-semibold cursor-pointer shadow-xs"
                    >
                      {q}
                    </motion.button>
                  ))}
                </div>

                {/* Input form */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-[#E8DDD0] flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type message in Hindi or English..."
                    className="flex-grow px-4 py-2 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C75B39]/20 text-[#1A1A2E]"
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-[#C75B39] hover:bg-[#A94A2D] text-white rounded-xl flex items-center justify-center cursor-pointer shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </form>

              </div>

            </div>
          </PageWrapper>
        );
      }

      // -------------------------------------------------------------
      // 3. NGO OBSERVER DASHBOARD
      // -------------------------------------------------------------
      case 'ngo':
        return (
          <PageWrapper 
            title="Jaipur District Intelligence Audit" 
            subtitle="Preventive early warning data metrics across 120 District Public Schools"
          >
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* TOP DISTRICT STATS */}
              <div className="col-span-1 xl:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">Schools Monitored</p>
                  <h3 className="text-3xl font-extrabold text-[#1A1A2E] mt-1 flex items-center gap-1.5 font-[family-name:var(--font-heading)]">
                    <Building className="w-6 h-6 text-[#C75B39]" /> 120
                  </h3>
                  <p className="text-[10px] text-[#4A7C59] mt-2 font-medium">92% UDISE sync rate active</p>
                </div>

                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">District Avg Attendance</p>
                  <h3 className="text-3xl font-extrabold text-[#4A7C59] mt-1 flex items-center gap-1.5 font-[family-name:var(--font-heading)]">
                    81.4%
                  </h3>
                  <p className="text-[10px] text-[#4A7C59] mt-2 font-medium">Up 1.2% from last term</p>
                </div>

                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">NGO Support Personnel</p>
                  <h3 className="text-3xl font-extrabold text-[#1A1A2E] mt-1 flex items-center gap-1.5 font-[family-name:var(--font-heading)]">
                    <Users className="w-6 h-6 text-[#2C3E6B]" /> 34
                  </h3>
                  <p className="text-[10px] text-[#6B7280] mt-2">Active district counselors</p>
                </div>

                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">Dropout Prevention Count</p>
                  <h3 className="text-3xl font-extrabold text-[#C75B39] mt-1 flex items-center gap-1.5 font-[family-name:var(--font-heading)]">
                    184
                  </h3>
                  <p className="text-[10px] text-[#C75B39] mt-2 font-medium">High risk students stabilized</p>
                </div>
              </div>

              {/* COMPARATIVE DISTRICT MAP/LIST */}
              <div className="col-span-1 xl:col-span-8 bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">District School Interventions Queue</h3>
                  <p className="text-xs text-[#6B7280]">Aggregated warning queues across monitored educational institutions</p>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Govt. Sr. Sec. School No. 1, Jaipur West', criticalCount: 14, highCount: 22, score: 78, active: 'Peer Buddy, Home Visit' },
                    { name: 'Rajasthan Girls Academy, Shastri Nagar', criticalCount: 4, highCount: 11, score: 89, active: 'Counselor Meeting' },
                    { name: 'Mahatma Gandhi English School, Jhotwara', criticalCount: 19, highCount: 30, score: 64, active: 'Extra Maths coaching, Food audit' },
                    { name: 'Govt. Primary School, Sanganer', criticalCount: 8, highCount: 15, score: 81, active: 'Parent Call Campaign' },
                  ].map((school, i) => (
                    <div key={i} className="p-4 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="font-bold text-[#1A1A2E] text-sm">{school.name}</h4>
                          <p className="text-[10px] text-[#6B7280] mt-0.5">Active intervention strategies: <span className="font-semibold text-[#C75B39]">{school.active}</span></p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          school.score < 70 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
                        }`}>
                          Health: {school.score}/100
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[10px] bg-white p-2.5 rounded-lg border border-[#E8DDD0]/50">
                        <div>
                          <p className="text-[#6B7280]">Critical alerts</p>
                          <p className="font-bold text-[#DC2626] font-mono text-sm">{school.criticalCount}</p>
                        </div>
                        <div>
                          <p className="text-[#6B7280]">High risks</p>
                          <p className="font-bold text-[#EA580C] font-mono text-sm">{school.highCount}</p>
                        </div>
                        <div>
                          <p className="text-[#6B7280]">Action Plan status</p>
                          <p className="font-bold text-[#4A7C59]">Deploying (85%)</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AUDIT SUMMARY & TARGETS */}
              <div className="col-span-1 xl:col-span-4 space-y-6">
                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E] mb-2">NGO District Objectives</h3>
                  <div className="space-y-3 text-xs text-[#6B7280]">
                    <div className="p-3 bg-[#FFF8F0] border border-[#E8DDD0] rounded-xl">
                      <p className="font-bold text-[#C75B39] flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> OptiMeal Nutritional Target</p>
                      <p className="mt-1">Cross-check Mahatma Gandhi Jhotwara School mid-day meal logs to analyze engagement trends.</p>
                    </div>

                    <div className="p-3 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl">
                      <p className="font-bold text-[#1A1A2E] flex items-center gap-1"><FileSpreadsheet className="w-3.5 h-3.5 text-[#2C3E6B]" /> Generate Audit Report</p>
                      <p className="mt-1">Download monthly compliance and dropout prevention summaries for state boards.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </PageWrapper>
        );

      // -------------------------------------------------------------
      // 4. ADMIN DASHBOARD (DEFAULT)
      // -------------------------------------------------------------
      case 'admin':
      default:
        return (
          <PageWrapper 
            title="Command Center" 
            subtitle="Mission Control for Early School Intervention & Predictive Intelligence"
          >
            {/* Quick action buttons row with tactile clicks */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <motion.button
                onClick={() => setIsAddModalOpen(true)}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2.5 bg-[#C75B39] text-white hover:bg-[#A94A2D] font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Student
              </motion.button>
              
              <Link href="/voice" className="block">
                <motion.div
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2.5 bg-white border border-[#E8DDD0] hover:border-[#C75B39]/40 text-[#1A1A2E] font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Mic className="w-4 h-4 text-[#C75B39]" /> Record Voice Note
                </motion.div>
              </Link>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* TOP METRICS SUMMARY */}
              <div className="col-span-1 xl:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">School Health Score</p>
                      <h3 className="text-3xl font-extrabold font-[family-name:var(--font-heading)] text-[#1A1A2E] mt-1">
                        {schoolMetrics.healthScore}<span className="text-sm font-medium text-[#6B7280]">/100</span>
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#A8D5BA] flex items-center justify-center">
                      <Activity className="w-5 h-5 text-[#4A7C59]" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-[#4A7C59] font-medium">
                    <span>Stable engagement trends</span>
                  </div>
                </div>

                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">Critical Flag Queue</p>
                      <h3 className="text-3xl font-extrabold font-[family-name:var(--font-heading)] text-[#DC2626] mt-1">
                        {totalCritical + totalHigh}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] border border-red-200 flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5 text-[#DC2626]" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-[#DC2626] font-medium">
                    <span className="risk-pulse-critical w-2 h-2 rounded-full bg-[#DC2626]" />
                    <span>Immediate intervention required</span>
                  </div>
                </div>

                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">Silent Disengagement</p>
                      <h3 className="text-3xl font-extrabold font-[family-name:var(--font-heading)] text-[#D4A843] mt-1">
                        {totalHidden}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] border border-[#F0DCA4] flex items-center justify-center">
                      <UserX className="w-5 h-5 text-[#D4A843]" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-[#D4A843] font-medium">
                    <span>"Invisible" students flagged</span>
                  </div>
                </div>

                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">Teacher Workload Stress</p>
                      <h3 className="text-3xl font-extrabold font-[family-name:var(--font-heading)] text-[#C75B39] mt-1">
                        {schoolMetrics.teacherWellnessScore}<span className="text-sm font-medium text-[#6B7280]">/100</span>
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#FFF8F0] border border-[#E8A990] flex items-center justify-center">
                      <Flame className="w-5 h-5 text-[#C75B39]" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-[#C75B39] font-medium">
                    <span>3 teachers at high burnout risk</span>
                  </div>
                </div>

              </div>

              {/* LEFT COLUMN: ACTIVE RISK QUEUE & DROPOUTS */}
              <div className="col-span-1 xl:col-span-8 space-y-6">
                
                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DDD0] pb-4 mb-5">
                    <div>
                      <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">Urgent Intervention Queue</h3>
                      <p className="text-xs text-[#6B7280]">Prioritized by urgency score and AI model confidence</p>
                    </div>

                    {/* Tabs with tap effects */}
                    <div className="flex bg-[#FAF7F2] p-1 border border-[#E8DDD0] rounded-xl self-start">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab('all-alerts')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          activeTab === 'all-alerts'
                            ? 'bg-[#1A1A2E] text-white shadow-xs'
                            : 'text-[#6B7280] hover:text-[#1A1A2E]'
                        }`}
                      >
                        Critical Alerts ({totalCritical})
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab('hidden')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          activeTab === 'hidden'
                            ? 'bg-[#1A1A2E] text-white shadow-xs'
                            : 'text-[#6B7280] hover:text-[#1A1A2E]'
                        }`}
                      >
                        Hidden Strugglers ({totalHidden})
                      </motion.button>
                    </div>
                  </div>

                  {/* List of critical/hidden students with click animations */}
                  <div className="space-y-3.5">
                    {(activeTab === 'all-alerts' ? criticalStudents : hiddenStudents).map((student) => (
                      <motion.div 
                        key={student.id}
                        whileHover={{ scale: 1.01, borderColor: '#C75B39' }}
                        whileTap={{ scale: 0.99 }}
                        className="p-4 bg-white border border-[#E8DDD0] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-150 cursor-pointer shadow-xs"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1A1A2E] to-[#2C3E6B] flex items-center justify-center text-white text-xs font-bold font-mono shadow-xs">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-[#1A1A2E] hover:underline">
                                <Link href={`/students/${student.id}`}>{student.name}</Link>
                              </h4>
                              <span className="text-[10px] bg-[#FAF7F2] border border-[#E8DDD0] px-2 py-0.5 rounded text-[#6B7280] font-mono">
                                Class {student.class}-{student.section}
                              </span>
                              {student.isHiddenStudent && (
                                <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium flex items-center gap-0.5">
                                  <Sparkles className="w-3 h-3" /> Hidden Student
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[11px] text-[#6B7280]">
                              <span>Attendance: <span className="font-semibold font-mono text-[#1A1A2E]">{student.attendanceRate}%</span></span>
                              <span>Academic Avg: <span className="font-semibold font-mono text-[#1A1A2E]">{student.academicScore}%</span></span>
                              <span>Risk Score: <span className="font-semibold font-mono text-[#1A1A2E]">{student.riskScore}</span></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 justify-between md:justify-end border-t md:border-0 pt-3 md:pt-0">
                          <div className="flex items-center gap-2">
                            <ConfidenceScore score={student.confidenceScore} size="sm" />
                            <RiskBadge level={student.riskLevel} />
                          </div>

                          <Link 
                            href={`/students/${student.id}`} 
                            className="p-2 bg-[#FAF7F2] hover:bg-[#FFF8F0] border border-[#E8DDD0] hover:border-[#C75B39]/40 rounded-lg text-[#C75B39] transition-all flex items-center justify-center shadow-xs"
                            title="View AI Profile"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-5 text-center">
                    <Link 
                      href="/students" 
                      className="text-xs font-semibold text-[#C75B39] hover:underline inline-flex items-center gap-1"
                    >
                      View all students list & filter details <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Interactive Risk Heatmap */}
                <RiskHeatmapGrid students={allStudents} />

                {/* EXPLAINABLE AI PREDICTIONS SPOTLIGHT */}
                <div className="bg-[#FFF8F0] border border-[#E8DDD0] rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#E8DDD0] pb-3">
                    <Sparkles className="w-5 h-5 text-[#C75B39]" />
                    <div>
                      <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">AI Dropout Risk Rationale</h3>
                      <p className="text-xs text-[#6B7280]">Why is the system flagging these students? (Responsible AI layer)</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {allStudents.filter(s => s.riskLevel === 'critical').slice(0, 2).map(student => (
                      <div key={student.id} className="bg-white border border-[#E8DDD0] rounded-xl p-4 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-[#1A1A2E]">{student.name}</h4>
                            <p className="text-[10px] text-[#6B7280]">Class {student.class}-{student.section} • Score {student.riskScore}</p>
                          </div>
                          <RiskBadge level={student.riskLevel} />
                        </div>
                        <p className="text-[11px] text-[#6B7280] leading-relaxed bg-[#FAF7F2] p-2.5 rounded-lg border border-[#E8DDD0]/50 font-medium">
                          {student.aiExplanation}
                        </p>
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-[#C75B39]">Confidence:</span>
                            <span className="font-mono font-bold">{student.confidenceScore}%</span>
                          </div>
                          <Link 
                            href={`/students/${student.id}`} 
                            className="text-[#C75B39] hover:underline font-semibold flex items-center gap-0.5"
                          >
                            Diagnose <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: SCHOOL RISK RATIO, TEACHERS BURNOUT, QUICK ACTIONS */}
              <div className="col-span-1 xl:col-span-4 space-y-6">
                
                {/* RISK RATIO DISTRIBUTION */}
                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E] mb-1">Risk Triage Categorization</h3>
                  <p className="text-xs text-[#6B7280] mb-4">Urgency levels across all enrolled students</p>
                  <RiskDistributionRing students={allStudents} />
                </div>

                {/* TEACHER BURNOUT MONITOR */}
                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">Burnout Alerts</h3>
                      <p className="text-xs text-[#6B7280]">Teachers monitored for high stress and evaluation cases</p>
                    </div>
                    <Link href="/teachers" className="text-xs font-semibold text-[#C75B39] hover:underline">
                      View Heatmap
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {overloadedTeachers.map(teacher => (
                      <div key={teacher.id} className="p-3 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#1A1A2E]">{teacher.name}</span>
                          <span className="text-[10px] bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded border border-red-100 flex items-center gap-0.5">
                            Burnout: {teacher.overallBurnout}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#6B7280]">
                          <span>Subject: <span className="font-semibold text-[#1A1A2E]">{teacher.subject}</span></span>
                          <span>Interventions: <span className="font-semibold text-[#1A1A2E]">{teacher.interventionCases} active</span></span>
                        </div>
                        {teacher.wellnessAlerts.length > 0 && (
                          <p className="text-[10px] text-[#C75B39] font-medium leading-normal italic border-l-2 border-[#C75B39] pl-2">
                            {teacher.wellnessAlerts[0]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* QUICK INTERVENTION ACTIONS */}
                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">Copilot Actions</h3>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    
                    <Link 
                      href="/voice" 
                      className="p-3.5 bg-[#FFF8F0] hover:bg-[#FFF3E5] border border-[#E8DDD0] hover:border-[#C75B39]/40 rounded-xl flex items-center gap-3 transition-all duration-150 group cursor-pointer shadow-xs"
                    >
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Mic className="w-5 h-5 text-[#C75B39] group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#1A1A2E]">Voice Observation Note</h4>
                        <p className="text-[10px] text-[#6B7280] mt-0.5">Transcribe spoken updates in Hindi/English</p>
                      </div>
                    </Link>

                    <Link 
                      href="/interventions" 
                      className="p-3.5 bg-green-50/40 hover:bg-green-50/80 border border-[#E8DDD0] hover:border-[#4A7C59]/40 rounded-xl flex items-center gap-3 transition-all duration-150 group cursor-pointer shadow-xs"
                    >
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                        <UserCheck className="w-5 h-5 text-[#4A7C59] group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#1A1A2E]">Deploy Intervention</h4>
                        <p className="text-[10px] text-[#6B7280] mt-0.5">Assign peer buddy, revision plans, counseling</p>
                      </div>
                    </Link>

                    <Link 
                      href="/analytics" 
                      className="p-3.5 bg-[#FAF7F2] hover:bg-slate-50 border border-[#E8DDD0] hover:border-[#2C3E6B]/40 rounded-xl flex items-center gap-3 transition-all duration-150 group cursor-pointer shadow-xs"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileSpreadsheet className="w-5 h-5 text-[#2C3E6B] group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#1A1A2E]">School Health Report</h4>
                        <p className="text-[10px] text-[#6B7280] mt-0.5">Generate district/NGO comparison audit</p>
                      </div>
                    </Link>

                  </div>
                </div>

              </div>

            </div>
          </PageWrapper>
        );
    }
  };

  return (
    <>
      {renderDashboard()}
      
      {/* Student add modal */}
      <AddStudentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </>
  );
}
