'use client';

import React from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import { schoolMetrics, districtComparison } from '@/lib/data/school-metrics';
import { 
  BarChart3, 
  TrendingUp, 
  ArrowUpRight, 
  ShieldAlert, 
  Award,
  Users,
  Activity,
  FileText,
  Settings,
  Sparkles,
  PieChart
} from 'lucide-react';
import CustomSparkline from '@/components/charts/CustomSparkline';

export default function AnalyticsPage() {
  const getRating = (val: number) => {
    if (val >= 80) return { label: 'Optimal Health', color: 'text-green-700 bg-green-50' };
    if (val >= 65) return { label: 'Fair / Satisfactory', color: 'text-amber-700 bg-amber-50' };
    return { label: 'Attention Needed', color: 'text-red-700 bg-red-50' };
  };

  const handleExport = () => {
    alert('Generating PDF summary report. The download will start shortly in background (simulated offline export).');
  };

  return (
    <PageWrapper 
      title="School Analytics & Intelligence" 
      subtitle="District benchmarks, NGO effectiveness metrics, and early warning dropout trends"
    >
      <div className="space-y-6">

        {/* HEADER TOOLBAR FOR EXPORTS */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#E8DDD0] p-5 rounded-2xl shadow-sm">
          <div>
            <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">Preventive Education Intelligence Audit</h3>
            <p className="text-xs text-[#6B7280]">District comparisons and school health benchmarks</p>
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-[#1A1A2E] hover:bg-[#C75B39] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" /> Export District PDF Report
          </button>
        </div>

        {/* METRICS TRENDS WITH SPARKLINE */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          
          <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#6B7280]">Overall Health Index</p>
                <h3 className="text-3xl font-extrabold text-[#1A1A2E] mt-1">{schoolMetrics.healthScore}%</h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getRating(schoolMetrics.healthScore).color}`}>
                {getRating(schoolMetrics.healthScore).label}
              </span>
            </div>
            <CustomSparkline data={schoolMetrics.healthTrend} color="#4A7C59" height={70} width={280} />
            <p className="text-[11px] text-[#6B7280]">12-Month progression based on attendance, grading patterns, and social logs.</p>
          </div>

          <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#6B7280]">Silent Dropout Rate</p>
                <h3 className="text-3xl font-extrabold text-[#DC2626] mt-1">{schoolMetrics.dropoutRiskScore}%</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold text-red-700 bg-red-50">
                Action Required
              </span>
            </div>
            <CustomSparkline data={schoolMetrics.dropoutTrend} color="#DC2626" height={70} width={280} />
            <p className="text-[11px] text-[#6B7280]">Percentage of students showing silent disengagement signatures.</p>
          </div>

          <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#6B7280]">Intervention Recovery Rate</p>
                <h3 className="text-3xl font-extrabold text-[#4A7C59] mt-1">{schoolMetrics.recoveryProgress}%</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold text-green-700 bg-green-50">
                Trending Up
              </span>
            </div>
            <CustomSparkline data={schoolMetrics.recoveryTrend} color="#2C3E6B" height={70} width={280} />
            <p className="text-[11px] text-[#6B7280]">Assigned students returned to stable status within 45 days.</p>
          </div>

        </div>

        {/* DISTRICT BENCHMARK TABLE */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          <div className="xl:col-span-8 bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E] mb-1">District Benchmarking Analysis</h3>
            <p className="text-xs text-[#6B7280] mb-5">Compare performance indicators against state and regional averages (NGO metrics)</p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#E8DDD0] text-gray-500 font-bold">
                    <th className="px-4 py-3">Educational Unit</th>
                    <th className="px-4 py-3 text-center">Health Index</th>
                    <th className="px-4 py-3 text-center">Classroom Participation</th>
                    <th className="px-4 py-3 text-center">Average Attendance</th>
                    <th className="px-4 py-3 text-center">Intervention Success</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DDD0]/40">
                  {districtComparison.map((unit, index) => (
                    <tr key={index} className="hover:bg-[#FAF7F2]/50">
                      <td className="px-4 py-3">
                        <span className={`font-bold ${unit.name === 'Our School' ? 'text-[#C75B39]' : 'text-[#1A1A2E]'}`}>
                          {unit.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-semibold">{unit.healthScore}%</td>
                      <td className="px-4 py-3 text-center font-mono font-semibold">{unit.engagement}%</td>
                      <td className="px-4 py-3 text-center font-mono font-semibold">{unit.attendance}%</td>
                      <td className="px-4 py-3 text-center font-mono font-semibold">{unit.interventionSuccess}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="xl:col-span-4 bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">NGO / Admin Insights</h3>
            
            <div className="space-y-4">
              
              <div className="p-3 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl space-y-1">
                <h5 className="font-bold text-xs text-[#1A1A2E] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C75B39]" /> Area of Strength
                </h5>
                <p className="text-[11px] text-[#6B7280]">
                  Our school scores <span className="font-bold text-[#1A1A2E]">7% higher</span> in general health index than the district average, primarily driven by high peer-buddy success.
                </p>
              </div>

              <div className="p-3 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl space-y-1">
                <h5 className="font-bold text-xs text-[#1A1A2E] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#DC2626]" /> Warning Signal
                </h5>
                <p className="text-[11px] text-[#6B7280]">
                  Teacher Burnout is hovering at <span className="font-bold text-red-600">58%</span>, higher than district recommendation. Suggesting workload redistribution for board exam classes.
                </p>
              </div>

              <div className="p-3 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl space-y-1">
                <h5 className="font-bold text-xs text-[#1A1A2E] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#4A7C59]" /> NGO Efficiency Audit
                </h5>
                <p className="text-[11px] text-[#6B7280]">
                  Active case interventions have reduced silent dropout predictions by <span className="font-bold text-[#4A7C59]">12%</span> over the last quarter.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </PageWrapper>
  );
}
