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
import { useTranslation } from '@/lib/LanguageContext';
import { tDynamic } from '@/lib/dynamicTranslations';

function RiskHeatmapGrid({ students }: { students: Student[] }) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { t, language } = useTranslation();

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
            {language === 'hi' ? 'कक्षा जोखिम हीटमैप ग्रिड' : 'Classroom Risk Heatmap Grid'}
          </h3>
          <p className="text-xs text-[#6B7280]">
            {language === 'hi' ? 'व्यक्तिगत छात्र जोखिम संकेतकों को दर्शाने वाला ग्रिड' : 'Tactile grid mapping individual student risk coefficients'}
          </p>
        </div>
        <div className="flex gap-2.5 text-[9px] font-bold">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded" /> {t('riskStable')}</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-400 rounded" /> {t('riskModerate')}</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-orange-500 rounded" /> {t('riskHigh')}</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-500 rounded" /> {t('riskCritical')}</span>
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
          <p className="text-[10px] text-gray-400 mt-2 italic">
            {language === 'hi' ? 'संकेत: छात्र के जोखिम कारणों और एआई स्पष्टीकरण को देखने के लिए किसी भी सेल पर क्लिक करें।' : 'Tip: Click any cell to inspect predictive variables & AI explanations.'}
          </p>
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
                  {selectedStudent.riskLevel === 'critical' ? t('riskCritical') :
                   selectedStudent.riskLevel === 'high' ? t('riskHigh') :
                   selectedStudent.riskLevel === 'moderate' ? t('riskModerate') :
                   t('riskStable')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#FAF7F2] p-2.5 rounded-lg border border-[#E8DDD0]/50">
                <div>
                  <span className="text-gray-400">{language === 'hi' ? 'उपस्थिति:' : 'Attendance:'}</span>
                  <span className="block font-bold text-[#1A1A2E]">{selectedStudent.attendanceRate}%</span>
                </div>
                <div>
                  <span className="text-gray-400">{language === 'hi' ? 'शैक्षणिक औसत:' : 'Academic Avg:'}</span>
                  <span className="block font-bold text-[#1A1A2E]">{selectedStudent.academicScore}%</span>
                </div>
              </div>

              <p className="text-[10px] text-gray-500 leading-normal italic bg-slate-50 p-2.5 rounded border border-gray-100">
                "{tDynamic(selectedStudent.aiExplanation, language)}"
              </p>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-[#C75B39] font-bold">
                  {language === 'hi' ? 'एआई का विश्वास:' : 'AI Confidence:'} {selectedStudent.confidenceScore}%
                </span>
                <Link 
                  href={`/students/${selectedStudent.id}`}
                  className="text-[10px] text-[#C75B39] hover:underline font-bold flex items-center gap-0.5"
                >
                  {language === 'hi' ? 'पूर्ण निदान →' : 'Full Diagnosis →'}
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-6 text-center">
              {language === 'hi' ? 'कोई छात्र नहीं चुना गया' : 'No student selected'}
            </p>
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
  const { t, language } = useTranslation();

  // Multi-Class state for Teacher Dashboard
  const [selectedClass, setSelectedClass] = useState<string>('8');
  // Sibling state for Parent Dashboard
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  // Simulated parent chat states
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'parent' | 'counselor', text: string }>>([]);
  const [chatInput, setChatInput] = useState('');

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
      const savedUserCode = localStorage.getItem('userCode') || 'STU-001';
      setSelectedChildId(savedUserCode);
    };
    
    loadStudents();
    
    // Listen to newly added students
    window.addEventListener('students-updated', loadStudents);
    return () => {
      window.removeEventListener('students-updated', loadStudents);
    };
  }, []);

  useEffect(() => {
    if (allStudents.length > 0 && selectedChildId) {
      const myChild = allStudents.find(s => s.id.toLowerCase() === selectedChildId.toLowerCase()) || allStudents[0];
      const parentName = myChild?.guardianName ? myChild.guardianName.split(' ')[0] : 'Parent';
      const childFirstName = myChild?.name ? myChild.name.split(' ')[0] : 'your child';
      
      const greetingText = language === 'hi'
        ? `नमस्ते ${parentName} जी, मैं स्कूल काउंसलर हूँ। मैं ${childFirstName} के शैक्षणिक प्रदर्शन या उपस्थिति के रुझान में आपकी सहायता कर सकता हूँ। मैं आज आपकी क्या मदद कर सकता हूँ?`
        : `Namaste ${parentName} ji, I am the school counselor. I can assist you with ${childFirstName}'s academic performance or attendance trends. How can I help you today?`;

      setChatMessages([
        { sender: 'counselor', text: greetingText }
      ]);
    }
  }, [allStudents, selectedChildId, language]);

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
      
      let reply = language === 'hi'
        ? `संपर्क करने के लिए धन्यवाद। हम ${childFirstName} के विषय शिक्षकों के साथ एक व्यक्तिगत बैठक निर्धारित करेंगे।`
        : `Thank you for reaching out. We will schedule a personalized meeting with ${childFirstName}'s subject teachers.`;
      
      const textLower = textToSend.toLowerCase();
      if (textLower.includes('math') || textLower.includes('गणित')) {
        reply = language === 'hi'
          ? `चिंता न करें। हमने ${childFirstName} को एक रिवीजन बडी (सहपाठी) आवंटित किया है जिसने गणित में 90% अंक प्राप्त किए हैं। वे स्कूल में प्रतिदिन एक साथ समस्याओं की समीक्षा करेंगे। हम हिंदी में अतिरिक्त अभ्यास वर्कशीट भी साझा करेंगे।`
          : `Don't worry. We have allocated ${childFirstName} a revision buddy who scored 90% in maths. They will review problems together daily at school. We will also share extra practice worksheets in Hindi.`;
      } else if (textLower.includes('attendance') || textLower.includes('उपस्थिति') || textLower.includes('प्रेजेंट')) {
        reply = language === 'hi'
          ? `${childFirstName} की उपस्थिति वर्तमान में ${myChild?.attendanceRate || 85}% है, जो स्थिर है। हालांकि, यदि उसे बीमारी के कारण छुट्टी की आवश्यकता है, तो कृपया हमें इस पोर्टल पर सूचित करें ताकि उसकी उपस्थिति को बिना सूचना के अनुपस्थिति के रूप में चिह्नित न किया जाए।`
          : `${childFirstName}'s attendance is currently ${myChild?.attendanceRate || 85}%, which is stable. However, if he needs to take a sick day, please inform us on this portal so his attendance record isn't marked as unnotified absence.`;
      } else if (textLower.includes('meeting') || textLower.includes('call') || textLower.includes('बैठक') || textLower.includes('कॉल') || textLower.includes('बात')) {
        reply = language === 'hi'
          ? `ज़रूर! हम इस शनिवार को सुबह 11 बजे वीडियो/गृह परामर्श बैठक निर्धारित कर सकते हैं। मुझे इसे शिक्षक हस्तक्षेप लॉग में चिह्नित करने दें।`
          : `Sure! We can schedule a video/home counselor meeting this Saturday at 11 AM. Let me mark this in the teacher intervention log.`;
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

  // Teacher-specific student filtration (only Class 8, 9, 10 dynamic switcher)
  const teacherStudents = allStudents.filter(s => s.class === selectedClass);
  
  // Dynamic stats calculated from active student list state
  const classAvgAttendance = teacherStudents.length > 0
    ? Math.round(teacherStudents.reduce((sum, s) => sum + s.attendanceRate, 0) / teacherStudents.length * 10) / 10
    : 81.4;

  const criticalStudents = allStudents.filter(s => s.riskLevel === 'critical').sort((a, b) => b.riskScore - a.riskScore).slice(0, 4);
  const hiddenStudents = allStudents.filter(s => s.isHiddenStudent).slice(0, 4);
  const overloadedTeachers = getOverloadedTeachers().slice(0, 3);

  const totalCritical = allStudents.filter(s => s.riskLevel === 'critical').length;
  const totalHigh = allStudents.filter(s => s.riskLevel === 'high').length;
  const totalHidden = allStudents.filter(s => s.isHiddenStudent).length;

  // Teacher metrics for Class
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
            title={t('teacherDashboardTitle')} 
            subtitle={language === 'hi' ? `कक्षा ${selectedClass}-A के लिए प्रारंभिक चेतावनी संकेत और हस्तक्षेप योजनाकार` : `Early Warning Signals & Intervention Planner for Class ${selectedClass}-A`}
          >
            {/* Quick action buttons row & Class Selector */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E8DDD0] shadow-xs">
              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  onClick={() => setIsAddModalOpen(true)}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2.5 bg-[#C75B39] text-white hover:bg-[#A94A2D] font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> {t('addStudentToClass')}
                </motion.button>
                
                <Link href="/voice" className="block">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-4 py-2.5 bg-white border border-[#E8DDD0] hover:border-[#C75B39]/40 text-[#1A1A2E] font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Mic className="w-4 h-4 text-[#C75B39]" /> {t('recordVoiceNote')}
                  </motion.div>
                </Link>
              </div>

              {/* Dynamic Class Selector Dropdown */}
              <div className="flex items-center gap-2.5 bg-[#FAF7F2] px-3.5 py-1.5 rounded-xl border border-[#E8DDD0]">
                <span className="text-xs font-bold text-[#6B7280]">
                  {language === 'hi' ? 'कक्षा चुनें:' : 'Select Class:'}
                </span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-white border border-[#E8DDD0] rounded-lg px-2.5 py-1 text-xs font-bold text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#C75B39]/20"
                >
                  <option value="8">{language === 'hi' ? 'कक्षा 8' : 'Class 8'}</option>
                  <option value="9">{language === 'hi' ? 'कक्षा 9' : 'Class 9'}</option>
                  <option value="10">{language === 'hi' ? 'कक्षा 10' : 'Class 10'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* TOP METRICS */}
              <div className="col-span-1 xl:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">
                        {language === 'hi' ? `कक्षा ${selectedClass}-A स्वास्थ्य स्कोर` : `Class ${selectedClass}-A Health Score`}
                      </p>
                      <h3 className="text-3xl font-extrabold font-[family-name:var(--font-heading)] text-[#1A1A2E] mt-1">
                        {selectedClass === '8' ? '78' : selectedClass === '9' ? '82' : '85'}<span className="text-sm font-medium text-[#6B7280]">/100</span>
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#A8D5BA] flex items-center justify-center">
                      <Activity className="w-5 h-5 text-[#4A7C59]" />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-[#4A7C59] font-medium flex items-center gap-1">
                    <span>
                      {language === 'hi' ? `औसत उपस्थिति ${classAvgAttendance}% पर स्थिर` : `Average attendance stable at ${classAvgAttendance}%`}
                    </span>
                  </p>
                </div>

                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">{t('criticalHighAlerts')}</p>
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
                    <span>{t('requiresActiveRevision')}</span>
                  </p>
                </div>

                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">{t('silentDisengagementText')}</p>
                      <h3 className="text-3xl font-extrabold font-[family-name:var(--font-heading)] text-[#D4A843] mt-1">
                        {teacherHidden}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] border border-[#F0DCA4] flex items-center justify-center">
                      <UserX className="w-5 h-5 text-[#D4A843]" />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-[#D4A843] font-medium">
                    <span>{t('stableGradesMasking')}</span>
                  </p>
                </div>
              </div>

              {/* CLASS ROOM RISK QUEUE */}
              <div className="col-span-1 xl:col-span-8 space-y-6">
                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm">
                  <div className="border-b border-[#E8DDD0] pb-4 mb-5 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">
                        {language === 'hi' ? `कक्षा ${selectedClass}-A हस्तक्षेप कतार` : `Class ${selectedClass}-A Intervention Queue`}
                      </h3>
                      <p className="text-xs text-[#6B7280]">{t('prioritizedDropoutRisk')}</p>
                    </div>
                    <Link href="/students" className="text-xs font-semibold text-[#C75B39] hover:underline">
                      {t('viewAllClassList')}
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
                                <span>{language === 'hi' ? 'उपस्थिति:' : 'Attendance:'} <span className="font-semibold text-[#1A1A2E]">{student.attendanceRate}%</span></span>
                                <span>{language === 'hi' ? 'शैक्षणिक औसत:' : 'Academic Avg:'} <span className="font-semibold text-[#1A1A2E]">{student.academicScore}%</span></span>
                                <span>{language === 'hi' ? 'जोखिम स्कोर:' : 'Risk Score:'} <span className="font-semibold text-[#1A1A2E]">{student.riskScore}</span></span>
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
                        {t('noHighRiskStudents')}
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
                    <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">{t('classAiRiskInsights')}</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {teacherStudents.filter(s => s.riskLevel === 'critical').slice(0, 2).map(student => (
                      <div key={student.id} className="bg-white border border-[#E8DDD0] rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-[#1A1A2E]">{student.name}</h4>
                          <RiskBadge level={student.riskLevel} />
                        </div>
                        <p className="text-[10px] text-[#6B7280] leading-relaxed bg-[#FAF7F2] p-2.5 rounded-lg">
                          {tDynamic(student.aiExplanation, language)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SIDE METRICS & DISTRIBUTION */}
              <div className="col-span-1 xl:col-span-4 space-y-6">
                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E] mb-1">{t('classTriageDistribution')}</h3>
                  <p className="text-xs text-[#6B7280] mb-4">
                    {language === 'hi' ? `कक्षा ${selectedClass}-A के सभी छात्रों में तत्परता का स्तर` : `Urgency levels across all Class ${selectedClass}-A students`}
                  </p>
                  
                  {/* Custom smaller Distribution display */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs border-b border-gray-100 pb-1.5">
                      <span className="text-[#DC2626] font-semibold">{language === 'hi' ? 'महत्वपूर्ण:' : 'Critical:'}</span>
                      <span className="font-bold">{teacherCritical}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-gray-100 pb-1.5">
                      <span className="text-[#EA580C] font-semibold">{language === 'hi' ? 'उच्च जोखिम:' : 'High Risk:'}</span>
                      <span className="font-bold">{teacherHigh}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-gray-100 pb-1.5">
                      <span className="text-[#D4A843] font-semibold">{language === 'hi' ? 'मध्यम:' : 'Moderate:'}</span>
                      <span className="font-bold">{teacherStudents.filter(s => s.riskLevel === 'moderate').length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#4A7C59] font-semibold">{language === 'hi' ? 'स्थिर:' : 'Stable:'}</span>
                      <span className="font-bold">{teacherStudents.filter(s => s.riskLevel === 'stable').length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E] mb-2">{t('classroomActionTargets')}</h3>
                  <div className="space-y-3 text-xs text-[#6B7280]">
                    <div className="p-3 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl">
                      <p className="font-bold text-[#1A1A2E]">{t('homeVisitTarget')}</p>
                      <p className="mt-1">{t('visitFamiliesAttendance')}</p>
                    </div>
                    <div className="p-3 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl">
                      <p className="font-bold text-[#1A1A2E]">{t('revisionBuddyAllocation')}</p>
                      <p className="mt-1">{t('pairHighAcademic')}</p>
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
        const primaryChild = allStudents.find(s => s.id.toLowerCase() === (selectedChildId || localStorage.getItem('userCode') || 'STU-001').toLowerCase()) || allStudents[0];
        
        // Find all children under the same guardianName
        let myChildren = allStudents.filter(s => s.guardianName === primaryChild.guardianName);
        if (myChildren.length < 2 && allStudents.length > 1) {
          const siblingCandidate = allStudents.find(s => s.id !== primaryChild.id && s.name.split(' ')[1] === primaryChild.name.split(' ')[1]) || allStudents.find(s => s.id !== primaryChild.id);
          if (siblingCandidate) {
            siblingCandidate.guardianName = primaryChild.guardianName;
            myChildren = [primaryChild, siblingCandidate];
          }
        }
        
        const activeChild = myChildren.find(s => s.id === selectedChildId) || primaryChild;
        const initials = activeChild.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const childFirstName = activeChild.name.split(' ')[0];

        return (
          <PageWrapper 
            title={t('studentCarePortal')} 
            subtitle={t('preventiveAcademicEngagement')}
          >
            {/* Premium Sibling Switcher Card */}
            {myChildren.length > 1 && (
              <div className="mb-6 bg-white border border-[#E8DDD0] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-extrabold text-[#1A1A2E] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#C75B39]" />
                    {language === 'hi' ? 'अपने बच्चे का चयन करें:' : 'Select Sibling / Child:'}
                  </h4>
                  <p className="text-[10px] text-[#6B7280]">
                    {language === 'hi' ? 'एक ही अभिभावक के तहत नामांकित छात्रों को बदलें' : 'Switch dashboard view between children registered under your profile'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {myChildren.map((child) => (
                    <motion.button
                      key={child.id}
                      onClick={() => setSelectedChildId(child.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 cursor-pointer transition-all ${
                        activeChild.id === child.id
                          ? 'bg-[#1A1A2E] text-white border-[#1A1A2E] shadow-sm'
                          : 'bg-white text-[#6B7280] border-[#E8DDD0] hover:text-[#1A1A2E]'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        child.riskLevel === 'critical' ? 'bg-red-500' :
                        child.riskLevel === 'high' ? 'bg-orange-500' :
                        child.riskLevel === 'moderate' ? 'bg-amber-400' : 'bg-emerald-500'
                      }`} />
                      {child.name} ({language === 'hi' ? `कक्षा ${child.class}` : `Class ${child.class}`})
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* STUDENT SNAPSHOT */}
              <div className="col-span-1 xl:col-span-4 bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C75B39] to-[#2C3E6B] flex items-center justify-center text-white text-3xl font-extrabold mx-auto shadow-md">
                    {initials}
                  </div>
                  <h3 className="text-lg font-bold text-[#1A1A2E] mt-3">{activeChild.name}</h3>
                  <p className="text-xs text-[#6B7280]">Class {activeChild.class}-Section {activeChild.section} • Student ID: {activeChild.id}</p>
                  
                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#4A7C59]" /> 
                    {activeChild.riskLevel === 'stable' 
                      ? (language === 'hi' ? 'स्थिर सहभागिता स्थिति' : 'Stable Engagement Status')
                      : `${activeChild.riskLevel.toUpperCase()} ${language === 'hi' ? 'जोखिम प्रोफाइल' : 'Risk Profile'}`}
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Score Indicators */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-[#6B7280]">{t('attendanceRateText')}</span>
                      <span className={`${activeChild.attendanceRate >= 80 ? 'text-[#4A7C59]' : activeChild.attendanceRate >= 70 ? 'text-[#D4A843]' : 'text-[#DC2626]'} font-bold`}>
                        {activeChild.attendanceRate}% ({activeChild.attendanceRate >= 80 ? t('healthyText') : activeChild.attendanceRate >= 70 ? t('needsAttentionText') : t('criticalWarningText')})
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${activeChild.attendanceRate >= 80 ? 'bg-[#4A7C59]' : activeChild.attendanceRate >= 70 ? 'bg-[#D4A843]' : 'bg-[#DC2626]'}`} style={{ width: `${activeChild.attendanceRate}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-[#6B7280]">{t('academicAssessmentScore')}</span>
                      <span className={`${activeChild.academicScore >= 70 ? 'text-[#4A7C59]' : activeChild.academicScore >= 50 ? 'text-[#D4A843]' : 'text-[#DC2626]'} font-bold`}>
                        {activeChild.academicScore}% ({activeChild.academicScore >= 70 ? t('satisfactoryText') : activeChild.academicScore >= 50 ? t('requiresPractice') : t('academicAlertText')})
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${activeChild.academicScore >= 70 ? 'bg-[#4A7C59]' : activeChild.academicScore >= 50 ? 'bg-[#D4A843]' : 'bg-[#DC2626]'}`} style={{ width: `${activeChild.academicScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-[#6B7280]">{t('classroomSocialInteraction')}</span>
                      <span className="text-[#4A7C59] font-bold">{t('goodText')}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="bg-[#4A7C59] h-full" style={{ width: '90%' }} />
                    </div>
                  </div>
                </div>

                {/* Parent revision notice */}
                <div className="bg-[#FFF8F0] border border-[#E8DDD0] rounded-xl p-4 text-xs space-y-2">
                  <p className="font-bold text-[#C75B39] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> {t('aiAcademicRecommendation')}
                  </p>
                  <p className="text-[#6B7280] leading-relaxed font-medium">
                    {tDynamic(activeChild.aiExplanation, language)}
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
                    <h3 className="text-sm font-bold text-[#1A1A2E]">{t('talkToCounselor')}</h3>
                    <p className="text-[10px] text-[#4A7C59] font-medium flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4A7C59] animate-ping" /> {t('counselorActive')}
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
                  <span className="text-[10px] text-[#6B7280] flex items-center font-bold">{t('quickAskText')}</span>
                  {[
                    language === 'hi' ? `${childFirstName} के गणित स्कोर में सुधार कैसे करें?` : `How to improve ${childFirstName}'s Math score?`,
                    language === 'hi' ? 'उपस्थिति रिकॉर्ड जांचें' : 'Check attendance records',
                    language === 'hi' ? 'परामर्शदाता बैठक बुक करें' : 'Request counseling callback',
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
                    placeholder={t('typeMessagePlaceholder')}
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
            title={t('jaipurDistrictIntelligence')} 
            subtitle={t('preventiveEarlyWarningNGO')}
          >
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* TOP DISTRICT STATS */}
              <div className="col-span-1 xl:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">{t('schoolsMonitoredText')}</p>
                  <h3 className="text-3xl font-extrabold text-[#1A1A2E] mt-1 flex items-center gap-1.5 font-[family-name:var(--font-heading)]">
                    <Building className="w-6 h-6 text-[#C75B39]" /> 120
                  </h3>
                  <p className="text-[10px] text-[#4A7C59] mt-2 font-medium">{t('udiseSyncRateActive')}</p>
                </div>

                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">{t('districtAvgAttendance')}</p>
                  <h3 className="text-3xl font-extrabold text-[#4A7C59] mt-1 flex items-center gap-1.5 font-[family-name:var(--font-heading)]">
                    81.4%
                  </h3>
                  <p className="text-[10px] text-[#4A7C59] mt-2 font-medium">{t('upFromLastTerm')}</p>
                </div>

                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">{t('ngoSupportPersonnel')}</p>
                  <h3 className="text-3xl font-extrabold text-[#1A1A2E] mt-1 flex items-center gap-1.5 font-[family-name:var(--font-heading)]">
                    <Users className="w-6 h-6 text-[#2C3E6B]" /> 34
                  </h3>
                  <p className="text-[10px] text-[#6B7280] mt-2">{t('activeDistrictCounselors')}</p>
                </div>

                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">{t('dropoutPreventionCount')}</p>
                  <h3 className="text-3xl font-extrabold text-[#C75B39] mt-1 flex items-center gap-1.5 font-[family-name:var(--font-heading)]">
                    184
                  </h3>
                  <p className="text-[10px] text-[#C75B39] mt-2 font-medium">{t('highRiskStabilized')}</p>
                </div>
              </div>

              {/* COMPARATIVE DISTRICT MAP/LIST */}
              <div className="col-span-1 xl:col-span-8 bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">{t('districtSchoolQueue')}</h3>
                  <p className="text-xs text-[#6B7280]">{t('aggregatedWarningQueues')}</p>
                </div>

                <div className="space-y-4">
                  {[
                    { 
                      name: language === 'hi' ? 'राजकीय वरिष्ठ माध्यमिक विद्यालय नंबर 1, जयपुर पश्चिम' : 'Govt. Sr. Sec. School No. 1, Jaipur West', 
                      criticalCount: 14, highCount: 22, score: 78, 
                      active: language === 'hi' ? 'सहकर्मी मित्र, गृह भ्रमण' : 'Peer Buddy, Home Visit' 
                    },
                    { 
                      name: language === 'hi' ? 'राजस्थान गर्ल्स एकेडमी, शास्त्री नगर' : 'Rajasthan Girls Academy, Shastri Nagar', 
                      criticalCount: 4, highCount: 11, score: 89, 
                      active: language === 'hi' ? 'काउंसलर बैठक' : 'Counselor Meeting' 
                    },
                    { 
                      name: language === 'hi' ? 'महात्मा गांधी अंग्रेजी स्कूल, झोटवाड़ा' : 'Mahatma Gandhi English School, Jhotwara', 
                      criticalCount: 19, highCount: 30, score: 64, 
                      active: language === 'hi' ? 'अतिरिक्त गणित कोचिंग, भोजन ऑडिट' : 'Extra Maths coaching, Food audit' 
                    },
                    { 
                      name: language === 'hi' ? 'राजकीय प्राथमिक विद्यालय, सांगानेर' : 'Govt. Primary School, Sanganer', 
                      criticalCount: 8, highCount: 15, score: 81, 
                      active: language === 'hi' ? 'अभिभावक कॉल अभियान' : 'Parent Call Campaign' 
                    },
                  ].map((school, i) => (
                    <div key={i} className="p-4 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="font-bold text-[#1A1A2E] text-sm">{school.name}</h4>
                          <p className="text-[10px] text-[#6B7280] mt-0.5">
                            {language === 'hi' ? 'सक्रिय हस्तक्षेप रणनीतियां:' : 'Active intervention strategies:'} <span className="font-semibold text-[#C75B39]">{school.active}</span>
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          school.score < 70 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
                        }`}>
                          {language === 'hi' ? 'स्वास्थ्य:' : 'Health:'} {school.score}/100
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[10px] bg-white p-2.5 rounded-lg border border-[#E8DDD0]/50">
                        <div>
                          <p className="text-[#6B7280]">{language === 'hi' ? 'गंभीर चेतावनियाँ' : 'Critical alerts'}</p>
                          <p className="font-bold text-[#DC2626] font-mono text-sm">{school.criticalCount}</p>
                        </div>
                        <div>
                          <p className="text-[#6B7280]">{language === 'hi' ? 'उच्च जोखिम' : 'High risks'}</p>
                          <p className="font-bold text-[#EA580C] font-mono text-sm">{school.highCount}</p>
                        </div>
                        <div>
                          <p className="text-[#6B7280]">{language === 'hi' ? 'योजना की स्थिति' : 'Action Plan status'}</p>
                          <p className="font-bold text-[#4A7C59]">{language === 'hi' ? 'लागू (85%)' : 'Deploying (85%)'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AUDIT SUMMARY & TARGETS */}
              <div className="col-span-1 xl:col-span-4 space-y-6">
                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E] mb-2">{t('ngoDistrictObjectives')}</h3>
                  <div className="space-y-3 text-xs text-[#6B7280]">
                    <div className="p-3 bg-[#FFF8F0] border border-[#E8DDD0] rounded-xl">
                      <p className="font-bold text-[#C75B39] flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> {t('optiMealNutritionalTarget')}</p>
                      <p className="mt-1">{t('crossCheckMealLogs')}</p>
                    </div>

                    <div className="p-3 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl">
                      <p className="font-bold text-[#1A1A2E] flex items-center gap-1"><FileSpreadsheet className="w-3.5 h-3.5 text-[#2C3E6B]" /> {t('generateAuditReportText')}</p>
                      <p className="mt-1">{t('downloadMonthlyCompliance')}</p>
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
            title={t('adminDashboardTitle')} 
            subtitle={t('adminDashboardSubtitle')}
          >
            {/* Quick action buttons row with tactile clicks */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <motion.button
                onClick={() => setIsAddModalOpen(true)}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2.5 bg-[#C75B39] text-white hover:bg-[#A94A2D] font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> {t('addStudent')}
              </motion.button>
              
              <Link href="/voice" className="block">
                <motion.div
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2.5 bg-white border border-[#E8DDD0] hover:border-[#C75B39]/40 text-[#1A1A2E] font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Mic className="w-4 h-4 text-[#C75B39]" /> {t('recordVoiceNote')}
                </motion.div>
              </Link>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* TOP METRICS SUMMARY */}
              <div className="col-span-1 xl:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">{t('schoolHealthScoreText')}</p>
                      <h3 className="text-3xl font-extrabold font-[family-name:var(--font-heading)] text-[#1A1A2E] mt-1">
                        {schoolMetrics.healthScore}<span className="text-sm font-medium text-[#6B7280]">/100</span>
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#A8D5BA] flex items-center justify-center">
                      <Activity className="w-5 h-5 text-[#4A7C59]" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-[#4A7C59] font-medium">
                    <span>{t('stableEngagementTrends')}</span>
                  </div>
                </div>

                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">{t('criticalFlagQueue')}</p>
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
                    <span>{t('immediateInterventionRequired')}</span>
                  </div>
                </div>

                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">{t('silentDisengagementText')}</p>
                      <h3 className="text-3xl font-extrabold font-[family-name:var(--font-heading)] text-[#D4A843] mt-1">
                        {totalHidden}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] border border-[#F0DCA4] flex items-center justify-center">
                      <UserX className="w-5 h-5 text-[#D4A843]" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-[#D4A843] font-medium">
                    <span>{t('invisibleStudentsFlagged')}</span>
                  </div>
                </div>

                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">{t('teacherWorkloadStress')}</p>
                      <h3 className="text-3xl font-extrabold font-[family-name:var(--font-heading)] text-[#C75B39] mt-1">
                        {schoolMetrics.teacherWellnessScore}<span className="text-sm font-medium text-[#6B7280]">/100</span>
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#FFF8F0] border border-[#E8A990] flex items-center justify-center">
                      <Flame className="w-5 h-5 text-[#C75B39]" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-[#C75B39] font-medium">
                    <span>{t('teachersHighBurnout')}</span>
                  </div>
                </div>

              </div>

              {/* LEFT COLUMN: ACTIVE RISK QUEUE & DROPOUTS */}
              <div className="col-span-1 xl:col-span-8 space-y-6">
                
                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DDD0] pb-4 mb-5">
                    <div>
                      <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">{t('urgentInterventionQueue')}</h3>
                      <p className="text-xs text-[#6B7280]">{t('prioritizedUrgencyScore')}</p>
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
                        {t('criticalAlertsTab').replace('{count}', totalCritical.toString())}
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
                        {t('hiddenStrugglersTab').replace('{count}', totalHidden.toString())}
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
                                  <Sparkles className="w-3 h-3" /> {language === 'hi' ? 'छिपा हुआ छात्र' : 'Hidden Student'}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[11px] text-[#6B7280]">
                              <span>{language === 'hi' ? 'उपस्थिति:' : 'Attendance:'} <span className="font-semibold font-mono text-[#1A1A2E]">{student.attendanceRate}%</span></span>
                              <span>{language === 'hi' ? 'शैक्षणिक औसत:' : 'Academic Avg:'} <span className="font-semibold font-mono text-[#1A1A2E]">{student.academicScore}%</span></span>
                              <span>{language === 'hi' ? 'जोखिम स्कोर:' : 'Risk Score:'} <span className="font-semibold font-mono text-[#1A1A2E]">{student.riskScore}</span></span>
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
                      {t('viewAllStudentsList')} <ArrowUpRight className="w-3.5 h-3.5" />
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
                      <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">{t('aiDropoutRiskRationale')}</h3>
                      <p className="text-xs text-[#6B7280]">{t('whySystemFlagging')}</p>
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
                          {tDynamic(student.aiExplanation, language)}
                        </p>
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-[#C75B39]">{language === 'hi' ? 'विश्वास:' : 'Confidence:'}</span>
                            <span className="font-mono font-bold">{student.confidenceScore}%</span>
                          </div>
                          <Link 
                            href={`/students/${student.id}`} 
                            className="text-[#C75B39] hover:underline font-semibold flex items-center gap-0.5"
                          >
                            {language === 'hi' ? 'निदान' : 'Diagnose'} <ArrowUpRight className="w-3.5 h-3.5" />
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
                  <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E] mb-1">{t('riskTriageCategorization')}</h3>
                  <p className="text-xs text-[#6B7280] mb-4">{t('urgencyEnrolledStudents')}</p>
                  <RiskDistributionRing students={allStudents} />
                </div>

                {/* TEACHER BURNOUT MONITOR */}
                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">{t('burnoutAlertsTitle')}</h3>
                      <p className="text-xs text-[#6B7280]">{t('teachersMonitoredHighStress')}</p>
                    </div>
                    <Link href="/teachers" className="text-xs font-semibold text-[#C75B39] hover:underline">
                      {t('viewHeatmapLink')}
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {overloadedTeachers.map(teacher => (
                      <div key={teacher.id} className="p-3 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#1A1A2E]">{teacher.name}</span>
                          <span className="text-[10px] bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded border border-red-100 flex items-center gap-0.5">
                            {language === 'hi' ? 'तनाव:' : 'Burnout:'} {teacher.overallBurnout}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#6B7280]">
                          <span>{language === 'hi' ? 'विषय:' : 'Subject:'} <span className="font-semibold text-[#1A1A2E]">{tDynamic(teacher.subject, language)}</span></span>
                          <span>{language === 'hi' ? 'हस्तक्षेप:' : 'Interventions:'} <span className="font-semibold text-[#1A1A2E]">{language === 'hi' ? `${teacher.interventionCases} सक्रिय` : `${teacher.interventionCases} active`}</span></span>
                        </div>
                        {teacher.wellnessAlerts.length > 0 && (
                          <p className="text-[10px] text-[#C75B39] font-medium leading-normal italic border-l-2 border-[#C75B39] pl-2">
                            {tDynamic(teacher.wellnessAlerts[0], language)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* QUICK INTERVENTION ACTIONS */}
                <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">{t('copilotActionsTitle')}</h3>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    
                    <Link 
                      href="/voice" 
                      className="p-3.5 bg-[#FFF8F0] hover:bg-[#FFF3E5] border border-[#E8DDD0] hover:border-[#C75B39]/40 rounded-xl flex items-center gap-3 transition-all duration-150 group cursor-pointer shadow-xs"
                    >
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Mic className="w-5 h-5 text-[#C75B39] group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#1A1A2E]">{t('voiceObservationNoteText')}</h4>
                        <p className="text-[10px] text-[#6B7280] mt-0.5">{t('transcribeSpokenUpdates')}</p>
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
                        <h4 className="text-xs font-bold text-[#1A1A2E]">{t('deployInterventionText')}</h4>
                        <p className="text-[10px] text-[#6B7280] mt-0.5">{t('assignPeerBuddy')}</p>
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
                        <h4 className="text-xs font-bold text-[#1A1A2E]">{t('schoolHealthReportText')}</h4>
                        <p className="text-[10px] text-[#6B7280] mt-0.5">{t('generateDistrictNGOAudit')}</p>
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
