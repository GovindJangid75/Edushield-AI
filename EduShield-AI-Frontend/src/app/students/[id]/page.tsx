'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import PageWrapper from '@/components/layout/PageWrapper';
import RiskBadge from '@/components/ai/RiskBadge';
import ConfidenceScore from '@/components/ai/ConfidenceScore';
import ExplainableAI from '@/components/ai/ExplainableAI';
import CustomSparkline from '@/components/charts/CustomSparkline';
import { getStudentById, Student, students } from '@/lib/data/students';
import { interventionCatalog, InterventionCatalog } from '@/lib/data/school-metrics';
import { 
  ArrowLeft, 
  Sparkles, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  PlusCircle, 
  ShieldAlert, 
  TrendingUp, 
  BookOpen, 
  Smile, 
  Users,
  Save,
  Plus
} from 'lucide-react';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.id as string;
  const student = getStudentById(studentId);

  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'academic' | 'emotional' | 'behavioral' | 'positive'>('academic');
  const [isSavingNote, setIsSavingNote] = useState(false);

  if (!student) {
    return (
      <PageWrapper title="Student Not Found">
        <div className="bg-white border border-[#E8DDD0] rounded-2xl p-8 text-center max-w-md mx-auto my-12">
          <ShieldAlert className="w-12 h-12 text-[#C75B39] mx-auto mb-4" />
          <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">Student Record Missing</h3>
          <p className="text-sm text-[#6B7280] mt-2 mb-6">The student ID {studentId} does not exist in our Preventive Education database.</p>
          <Link href="/students" className="px-5 py-2.5 bg-[#1A1A2E] text-white text-xs font-semibold rounded-xl hover:bg-[#C75B39] transition-all">
            Back to Student Queue
          </Link>
        </div>
      </PageWrapper>
    );
  }

  // Get matching recommendations from catalog based on student's risk factors
  const recommendedActions = interventionCatalog.filter(catalogItem => 
    catalogItem.targetRiskLevel.includes(student.riskLevel)
  ).slice(0, 3);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsSavingNote(true);

    // Simulate saving note
    setTimeout(() => {
      student.observations.unshift({
        id: `OBS-NEW-${Date.now()}`,
        teacherName: 'Admin User (You)',
        date: new Date().toISOString().split('T')[0],
        note: newNote,
        type: noteType
      });
      setNewNote('');
      setIsSavingNote(false);
    }, 500);
  };

  return (
    <PageWrapper 
      title={`${student.name} — Profile`} 
      subtitle={`Student ID: ${student.id} • AI Risk Diagnosis & Case Workfile`}
    >
      <div className="space-y-6">
        
        {/* BACK BAR & QUICK HEAD INFO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link 
            href="/students" 
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#6B7280] hover:text-[#1A1A2E]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Students Queue
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B7280] font-medium">Guardian: <span className="text-[#1A1A2E] font-bold">{student.guardianName}</span></span>
            <a 
              href={`tel:${student.guardianPhone}`} 
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F0FDF4] hover:bg-green-100/80 border border-[#A8D5BA] rounded-xl text-xs font-semibold text-[#4A7C59]"
            >
              <Phone className="w-3.5 h-3.5" /> Call: {student.guardianPhone}
            </a>
          </div>
        </div>

        {/* HERO STRIP */}
        <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1A1A2E] to-[#C75B39] flex items-center justify-center text-white text-xl font-bold font-mono">
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold font-[family-name:var(--font-heading)] text-[#1A1A2E]">{student.name}</h3>
                <span className="text-xs bg-[#FAF7F2] border border-[#E8DDD0] px-2.5 py-0.5 rounded-lg text-[#6B7280] font-bold">
                  Class {student.class}-{student.section}
                </span>
                {student.isHiddenStudent && (
                  <span className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg font-medium inline-flex items-center gap-0.5">
                    <Sparkles className="w-3.5 h-3.5" /> Hidden Struggler
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7280] mt-1 font-medium">
                Age {student.age} • Enrolled {new Date(student.enrollmentDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t md:border-0 pt-4 md:pt-0 w-full md:w-auto">
            <ConfidenceScore score={student.confidenceScore} />
            <div className="h-8 w-px bg-[#E8DDD0] hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B7280]">AI Urgency Score</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg font-mono font-extrabold text-[#1A1A2E]">{student.riskScore}</span>
                <RiskBadge level={student.riskLevel} />
              </div>
            </div>
          </div>
        </div>

        {/* DETAILED COLUMNS */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* LEFT 7 COLS: ANALYTIC CHARTS & INTERVENTIONS */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* PERFORMANCE & ENGAGEMENT WAVES */}
            <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm space-y-6">
              <h4 className="font-bold text-base text-[#1A1A2E] font-[family-name:var(--font-heading)]">Engagement Waves & Historical Trends</h4>
              
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Attendance Sparkline */}
                <div className="space-y-3 p-4 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-[#6B7280]">Attendance History</p>
                      <h5 className="text-xl font-mono font-bold text-[#1A1A2E]">{student.attendanceRate}%</h5>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-white border border-[#E8DDD0] rounded text-[#6B7280]">12-Week Wave</span>
                  </div>
                  <CustomSparkline data={student.attendanceTrend} color="#C75B39" height={70} width={280} />
                </div>

                {/* Academic Sparkline */}
                <div className="space-y-3 p-4 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-[#6B7280]">Academic Index</p>
                      <h5 className="text-xl font-mono font-bold text-[#1A1A2E]">{student.academicScore}%</h5>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-white border border-[#E8DDD0] rounded text-[#6B7280]">6 Assessments</span>
                  </div>
                  <CustomSparkline data={student.academicTrend} color="#2C3E6B" height={70} width={280} />
                </div>

              </div>

              {/* 5 Indicator Meters */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Primary Behavioral & Academic Signals</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  
                  <div className="p-3 bg-white border border-[#E8DDD0] rounded-xl space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-[#6B7280]">
                      <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Homework</span>
                      <span className="font-mono font-bold text-[#1A1A2E]">{student.homeworkConsistency}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#C75B39]" style={{ width: `${student.homeworkConsistency}%` }} />
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-[#E8DDD0] rounded-xl space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-[#6B7280]">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Participation</span>
                      <span className="font-mono font-bold text-[#1A1A2E]">{student.participationScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${student.participationScore}%` }} />
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-[#E8DDD0] rounded-xl space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-[#6B7280]">
                      <span className="flex items-center gap-1"><Smile className="w-3.5 h-3.5" /> Wellbeing</span>
                      <span className="font-mono font-bold text-[#1A1A2E]">{student.emotionalWellbeing}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#4A7C59]" style={{ width: `${student.emotionalWellbeing}%` }} />
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* INTERVENTION WORK HISTORY */}
            <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#E8DDD0] pb-3">
                <h4 className="font-bold text-base text-[#1A1A2E] font-[family-name:var(--font-heading)]">Intervention Registry & Tasks</h4>
                <Link href={`/interventions?student=${student.id}`} className="px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DDD0] hover:border-[#C75B39]/40 rounded-xl text-xs font-bold text-[#C75B39] transition-all flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> New Workplan
                </Link>
              </div>

              {student.interventions.length > 0 ? (
                <div className="relative border-l border-[#E8DDD0] ml-3 pl-5 space-y-5 py-2">
                  {student.interventions.map((item, idx) => (
                    <div key={item.id} className="relative group">
                      {/* Timeline dot */}
                      <span className={`absolute -left-7 top-1 w-3 h-3 rounded-full border-2 border-white ${
                        item.status === 'resolved' ? 'bg-[#4A7C59]' :
                        item.status === 'in-progress' ? 'bg-[#D4A843]' : 'bg-[#C75B39]'
                      }`} />
                      
                      <div className="bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl p-4 space-y-2">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <span className="text-[10px] font-mono bg-white border border-[#E8DDD0] px-2 py-0.5 rounded text-[#6B7280]">
                              {item.id}
                            </span>
                            <h5 className="font-bold text-sm text-[#1A1A2E] mt-1">{item.type}</h5>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            item.status === 'resolved' ? 'bg-green-50 border-green-200 text-[#4A7C59]' :
                            item.status === 'in-progress' ? 'bg-amber-50 border-amber-200 text-[#D4A843]' : 'bg-red-50 border-red-200 text-[#C75B39]'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B7280]">{item.description}</p>
                        
                        <div className="flex justify-between items-center text-[10px] text-[#9CA3AF] border-t border-[#E8DDD0]/50 pt-2 mt-1">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Assigned: {new Date(item.dateAssigned).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          <span>By: {item.assignedTo}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6B7280] text-center py-6">No previous interventions cataloged for this student profile.</p>
              )}

            </div>

          </div>

          {/* RIGHT 4 COLS: AI EXPLAINABILITY & OBSERVATION POSTING */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* EXPLAINABLE AI DIAGNOSIS PANEL */}
            <ExplainableAI student={student} />

            {/* COPILOT SUGGESTED ACTIONS */}
            <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-[#1A1A2E] font-[family-name:var(--font-heading)] uppercase tracking-wider">AI Suggested Interventions</h4>
              
              <div className="space-y-3">
                {recommendedActions.map((action) => (
                  <div key={action.id} className="p-3 bg-[#FAF7F2] hover:bg-[#FFF8F0] border border-[#E8DDD0] rounded-xl text-xs space-y-2 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#1A1A2E]">{action.type}</span>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded capitalize ${
                        action.priority === 'urgent' ? 'bg-red-50 text-red-700' :
                        action.priority === 'high' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {action.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B7280] leading-relaxed">{action.description}</p>
                    <div className="flex justify-between items-center text-[10px] text-[#9CA3AF] pt-1">
                      <span>Time: {action.estimatedDuration}</span>
                      <span>Assignee: {action.responsibleRole}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TEACHER OBSERVATIONS LOG */}
            <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-[#1A1A2E] font-[family-name:var(--font-heading)] uppercase tracking-wider">Teacher Observations</h4>
              
              {/* Form */}
              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record an observation note (e.g. absent trend on Friday, sitting alone during lunch...)"
                  className="w-full min-h-[70px] p-2.5 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C75B39]/20 focus:border-[#C75B39]/40 transition-all text-[#1A1A2E] placeholder:text-[#9CA3AF]"
                  required
                />
                
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value as any)}
                    className="bg-[#FAF7F2] border border-[#E8DDD0] px-2 py-1.5 rounded-lg text-[10px] font-bold focus:outline-none text-[#1A1A2E]"
                  >
                    <option value="academic">Academic Note</option>
                    <option value="emotional">Emotional Note</option>
                    <option value="behavioral">Behavioral Note</option>
                    <option value="positive">Positive Note</option>
                  </select>

                  <button
                    type="submit"
                    disabled={isSavingNote}
                    className="px-3.5 py-1.5 bg-[#1A1A2E] text-white hover:bg-[#C75B39] disabled:bg-gray-400 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> 
                    {isSavingNote ? 'Saving...' : 'Add Log'}
                  </button>
                </div>
              </form>

              {/* Feed */}
              <div className="border-t border-[#E8DDD0]/60 pt-3 space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {student.observations.map((obs) => (
                  <div key={obs.id} className="p-3 bg-[#FAF7F2] border border-[#E8DDD0]/50 rounded-xl text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-[#1A1A2E]">{obs.teacherName}</span>
                      <span className="text-[#9CA3AF] font-mono">{new Date(obs.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <p className="text-[#6B7280] leading-snug">{obs.note}</p>
                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${
                      obs.type === 'academic' ? 'bg-blue-50 text-blue-700' :
                      obs.type === 'emotional' ? 'bg-purple-50 text-purple-700' :
                      obs.type === 'positive' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {obs.type}
                    </span>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>

      </div>
    </PageWrapper>
  );
}
