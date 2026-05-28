'use client';

import React, { useState } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import { teachers, Teacher, burnoutDistribution } from '@/lib/data/teachers';
import { 
  Heart, 
  Flame, 
  AlertTriangle, 
  CheckCircle,
  Activity,
  Award,
  Clock,
  BookOpen,
  Calendar,
  Grid
} from 'lucide-react';
import CustomSparkline from '@/components/charts/CustomSparkline';

export default function TeacherWellnessDashboard() {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0].id);

  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId) || teachers[0];

  const getHeatmapColor = (value: number) => {
    if (value >= 80) return 'bg-[#DC2626] text-white border-red-700';
    if (value >= 65) return 'bg-[#EA580C] text-white border-orange-600';
    if (value >= 50) return 'bg-[#D4A843] text-[#1A1A2E] border-amber-500';
    return 'bg-[#4A7C59] text-white border-green-700';
  };

  const getBurnoutBadge = (value: number) => {
    if (value >= 75) return { label: 'Severe Stress', color: 'bg-red-50 text-red-700 border-red-200' };
    if (value >= 60) return { label: 'High Burden', color: 'bg-orange-50 text-orange-700 border-orange-200' };
    if (value >= 40) return { label: 'Moderate', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Optimal / Stable', color: 'bg-green-50 text-green-700 border-green-200' };
  };

  return (
    <PageWrapper 
      title="Teacher Wellness Monitor" 
      subtitle="Analyze administrative burden, classroom stress trends, and prevent educational burnout"
    >
      <div className="space-y-6">

        {/* OVERALL HEATMAP GRID */}
        <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E8DDD0] pb-4 mb-5">
            <div>
              <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E] flex items-center gap-2">
                <Grid className="w-5 h-5 text-[#C75B39]" /> 
                School Burnout Heatmap Grid
              </h3>
              <p className="text-xs text-[#6B7280]">AI monitors administrative burden, class workload, and correction weight</p>
            </div>
            {/* Color key */}
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#4A7C59] rounded" /> Stable (&lt;50)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#D4A843] rounded" /> Moderate (50-65)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#EA580C] rounded" /> High (65-80)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#DC2626] rounded" /> Critical (80+)</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs min-w-[700px]">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8DDD0] text-gray-500 font-bold">
                  <th className="px-4 py-3">Teacher ID & Name</th>
                  <th className="px-4 py-3">Subject / Experience</th>
                  <th className="px-4 py-3 text-center">Correction Weight</th>
                  <th className="px-4 py-3 text-center">Class Stress</th>
                  <th className="px-4 py-3 text-center">Attendance Burden</th>
                  <th className="px-4 py-3 text-center">Emotional Fatigue</th>
                  <th className="px-4 py-3 text-center">Burnout Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DDD0]/40">
                {teachers.map(teacher => {
                  const isSelected = teacher.id === selectedTeacherId;
                  return (
                    <tr 
                      key={teacher.id}
                      onClick={() => setSelectedTeacherId(teacher.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#FFF8F0] font-semibold border-l-4 border-l-[#C75B39]' : 'hover:bg-[#FAF7F2]/50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-bold text-[#1A1A2E]">{teacher.name}</p>
                          <p className="text-[10px] text-[#6B7280]">{teacher.id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#6B7280]">
                        <p className="font-semibold text-[#1A1A2E]">{teacher.subject}</p>
                        <p className="text-[10px]">{teacher.yearsExperience} yrs exp</p>
                      </td>
                      {/* Heatmap cells */}
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-3 py-1.5 rounded-lg border font-mono font-bold w-12 ${getHeatmapColor(teacher.correctionWorkload)}`}>
                          {teacher.correctionWorkload}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-3 py-1.5 rounded-lg border font-mono font-bold w-12 ${getHeatmapColor(teacher.classroomStress)}`}>
                          {teacher.classroomStress}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-3 py-1.5 rounded-lg border font-mono font-bold w-12 ${getHeatmapColor(teacher.attendanceBurden)}`}>
                          {teacher.attendanceBurden}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-3 py-1.5 rounded-lg border font-mono font-bold w-12 ${getHeatmapColor(teacher.emotionalFatigue)}`}>
                          {teacher.emotionalFatigue}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-3 py-1.5 rounded-lg border font-mono font-extrabold w-12 ${getHeatmapColor(teacher.overallBurnout)}`}>
                          {teacher.overallBurnout}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* WORKLOAD DISTRIBUTION DETAILS & INDIVIDUAL CARD */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* LEFT 7 COLS: DETAILED REPORT ON SELECTED TEACHER */}
          <div className="xl:col-span-8 bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm space-y-6">
            
            <div className="flex justify-between items-start flex-wrap gap-4 border-b border-[#E8DDD0] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#6B7280]">Detailed Workfile</span>
                <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">Wellness Audit: {selectedTeacher.name}</h3>
                <p className="text-xs text-[#6B7280]">Subject: {selectedTeacher.subject} • Experience: {selectedTeacher.yearsExperience} Years</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getBurnoutBadge(selectedTeacher.overallBurnout).color}`}>
                  {getBurnoutBadge(selectedTeacher.overallBurnout).label} ({selectedTeacher.overallBurnout}%)
                </span>
              </div>
            </div>

            {/* Burnout Wave Sparkline */}
            <div className="space-y-3 p-4 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold text-[#6B7280]">12-Week Stress progression</p>
                  <p className="text-sm font-bold text-[#1A1A2E]">Burnout Trend Curve</p>
                </div>
                <span className="text-[10px] bg-white border border-[#E8DDD0] px-2 py-0.5 rounded font-bold font-mono">
                  Weekly Samples
                </span>
              </div>
              <CustomSparkline data={selectedTeacher.burnoutTrend} color="#C75B39" height={70} width={640} />
            </div>

            {/* Core Stats info */}
            <div className="grid sm:grid-cols-3 gap-4">
              
              <div className="p-3 bg-white border border-[#E8DDD0] rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-[#C75B39]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#6B7280]">Work Hours</p>
                  <p className="text-base font-extrabold text-[#1A1A2E]">{selectedTeacher.workloadHoursPerWeek} hrs/wk</p>
                </div>
              </div>

              <div className="p-3 bg-white border border-[#E8DDD0] rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#6B7280]">Case Load</p>
                  <p className="text-base font-extrabold text-[#1A1A2E]">{selectedTeacher.interventionCases} Student cases</p>
                </div>
              </div>

              <div className="p-3 bg-white border border-[#E8DDD0] rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-[#4A7C59]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#6B7280]">Experience</p>
                  <p className="text-base font-extrabold text-[#1A1A2E]">{selectedTeacher.yearsExperience} Years</p>
                </div>
              </div>

            </div>

            {/* Attention Distribution indicator */}
            {selectedTeacher.attentionDistribution.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#6B7280]">AI Attention Distribution Check</h4>
                <p className="text-xs text-[#6B7280]">Are student risk profiles aligned with the teacher's focused attention?</p>
                
                <div className="space-y-2">
                  {selectedTeacher.attentionDistribution.map((item, index) => (
                    <div key={index} className="p-3 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#1A1A2E]">{item.studentName}</span>
                        <span className="text-[10px] text-[#6B7280] block font-mono">ID: {item.studentId}</span>
                      </div>
                      <div className="text-right w-1/2">
                        <div className="flex justify-between items-center mb-1 text-[10px] font-semibold">
                          <span>Focus level</span>
                          <span className="font-mono text-[#1A1A2E]">{item.attention}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${item.attention > 50 ? 'bg-[#C75B39]' : 'bg-[#D4A843]'}`} 
                            style={{ width: `${item.attention}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT 5 COLS: WELLNESS ALERTS & INTERVENTIONS */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* WELLNESS ALERTS */}
            <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-[#1A1A2E] font-[family-name:var(--font-heading)] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#C75B39]" /> 
                Copilot Wellness Alerts
              </h4>

              {selectedTeacher.wellnessAlerts.length > 0 ? (
                <div className="space-y-3">
                  {selectedTeacher.wellnessAlerts.map((alert, index) => (
                    <div key={index} className="p-3 bg-red-50/50 border border-red-100/60 text-red-900 rounded-xl text-xs flex gap-2">
                      <Flame className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
                      <p className="leading-relaxed font-medium">{alert}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-green-50/40 border border-green-100 text-green-900 rounded-xl text-xs flex gap-2">
                  <CheckCircle className="w-4 h-4 text-[#4A7C59] flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-semibold">Teacher metrics are optimal. No wellness actions suggested currently.</p>
                </div>
              )}
            </div>

            {/* STATS BREAKDOWN GRID */}
            <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-[#1A1A2E] font-[family-name:var(--font-heading)] uppercase tracking-wider">Burnout Distribution</h4>
              
              <div className="space-y-3">
                
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-2 font-medium text-[#1A1A2E]"><span className="w-2.5 h-2.5 rounded bg-[#DC2626]" /> Severe Stress</span>
                  <span className="font-mono font-bold text-[#1A1A2E]">{burnoutDistribution.critical} teachers</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-2 font-medium text-[#1A1A2E]"><span className="w-2.5 h-2.5 rounded bg-[#EA580C]" /> High Burden</span>
                  <span className="font-mono font-bold text-[#1A1A2E]">{burnoutDistribution.high} teachers</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-2 font-medium text-[#1A1A2E]"><span className="w-2.5 h-2.5 rounded bg-[#D4A843]" /> Moderate</span>
                  <span className="font-mono font-bold text-[#1A1A2E]">{burnoutDistribution.moderate} teachers</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-2 font-medium text-[#1A1A2E]"><span className="w-2.5 h-2.5 rounded bg-[#4A7C59]" /> Healthy / Optimal</span>
                  <span className="font-mono font-bold text-[#1A1A2E]">{burnoutDistribution.healthy} teachers</span>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </PageWrapper>
  );
}
