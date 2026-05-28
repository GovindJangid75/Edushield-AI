'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PageWrapper from '@/components/layout/PageWrapper';
import RiskBadge from '@/components/ai/RiskBadge';
import ConfidenceScore from '@/components/ai/ConfidenceScore';
import RiskDistributionRing from '@/components/charts/RiskDistributionRing';
import { getCriticalStudents, getHiddenStudents, students, RiskLevel } from '@/lib/data/students';
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
  HelpCircle,
  Users,
  Flame,
  FileSpreadsheet
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const criticalStudents = getCriticalStudents().slice(0, 4);
  const hiddenStudents = getHiddenStudents().slice(0, 4);
  const overloadedTeachers = getOverloadedTeachers().slice(0, 3);
  const [activeTab, setActiveTab] = useState<'all-alerts' | 'hidden'>('all-alerts');

  // Calculate stats
  const totalCritical = students.filter(s => s.riskLevel === 'critical').length;
  const totalHigh = students.filter(s => s.riskLevel === 'high').length;
  const totalHidden = getHiddenStudents().length;

  return (
    <PageWrapper 
      title="Command Center" 
      subtitle="Mission Control for Early School Intervention & Predictive Intelligence"
    >
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

              {/* Tabs */}
              <div className="flex bg-[#FAF7F2] p-1 border border-[#E8DDD0] rounded-xl self-start">
                <button
                  onClick={() => setActiveTab('all-alerts')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'all-alerts'
                      ? 'bg-[#1A1A2E] text-white shadow-xs'
                      : 'text-[#6B7280] hover:text-[#1A1A2E]'
                  }`}
                >
                  Critical Alerts ({totalCritical})
                </button>
                <button
                  onClick={() => setActiveTab('hidden')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'hidden'
                      ? 'bg-[#1A1A2E] text-white shadow-xs'
                      : 'text-[#6B7280] hover:text-[#1A1A2E]'
                  }`}
                >
                  Hidden Strugglers ({totalHidden})
                </button>
              </div>
            </div>

            {/* List */}
            <div className="space-y-3.5">
              {(activeTab === 'all-alerts' ? criticalStudents : hiddenStudents).map((student, idx) => (
                <div 
                  key={student.id}
                  className="p-4 bg-white border border-[#E8DDD0] hover:border-[#C75B39]/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 card-tactile"
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
                      className="p-2 bg-[#FAF7F2] hover:bg-[#FFF8F0] border border-[#E8DDD0] hover:border-[#C75B39]/40 rounded-lg text-[#C75B39] transition-all flex items-center justify-center"
                      title="View AI Profile"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
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
              {students.filter(s => s.riskLevel === 'critical').slice(0, 2).map(student => (
                <div key={student.id} className="bg-white border border-[#E8DDD0] rounded-xl p-4 space-y-3">
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
            <RiskDistributionRing />
          </div>

          {/* TEACHER BURNOUT MONITOR */}
          <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">Burnout Alerts</h3>
                <p className="text-xs text-[#6B7280]">Teachers monitored for high correction and class stress</p>
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
                className="p-3.5 bg-[#FFF8F0] hover:bg-[#FFF3E5] border border-[#E8DDD0] hover:border-[#C75B39]/40 rounded-xl flex items-center gap-3 transition-all duration-200 group"
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
                className="p-3.5 bg-green-50/40 hover:bg-green-50/80 border border-[#E8DDD0] hover:border-[#4A7C59]/40 rounded-xl flex items-center gap-3 transition-all duration-200 group"
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
                className="p-3.5 bg-[#FAF7F2] hover:bg-slate-50 border border-[#E8DDD0] hover:border-[#2C3E6B]/40 rounded-xl flex items-center gap-3 transition-all duration-200 group"
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
