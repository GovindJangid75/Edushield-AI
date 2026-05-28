'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import PageWrapper from '@/components/layout/PageWrapper';
import RiskBadge from '@/components/ai/RiskBadge';
import ConfidenceScore from '@/components/ai/ConfidenceScore';
import { students, RiskLevel, Student } from '@/lib/data/students';
import { Search, Filter, Sparkles, Phone, Eye, ClipboardPlus, X } from 'lucide-react';

export default function StudentsOverviewPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [showHiddenOnly, setShowHiddenOnly] = useState(false);

  // Extract unique classes
  const classesList = useMemo(() => {
    const list = Array.from(new Set(students.map(s => s.class))).sort((a, b) => parseInt(a) - parseInt(b));
    return list;
  }, []);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.guardianName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClass = selectedClass === 'all' || s.class === selectedClass;
      
      const matchesRisk = selectedRisk === 'all' || s.riskLevel === selectedRisk;
      
      const matchesHidden = !showHiddenOnly || s.isHiddenStudent;

      return matchesSearch && matchesClass && matchesRisk && matchesHidden;
    });
  }, [searchTerm, selectedClass, selectedRisk, showHiddenOnly]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedClass('all');
    setSelectedRisk('all');
    setShowHiddenOnly(false);
  };

  return (
    <PageWrapper 
      title="Student Intelligence Profile Queue" 
      subtitle="View engagement data, prediction confidence, and trigger triage actions"
    >
      <div className="space-y-6">

        {/* SEARCH & FILTERS PANEL */}
        <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search by student name, ID, or guardian..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C75B39]/20 focus:border-[#C75B39]/40 transition-all text-[#1A1A2E]"
              />
            </div>

            {/* Filter Group */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Class selector */}
              <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#E8DDD0] px-3 py-2 rounded-xl">
                <span className="text-xs font-semibold text-[#6B7280]">Class:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-transparent border-0 text-xs font-bold focus:outline-none text-[#1A1A2E]"
                >
                  <option value="all">All Classes</option>
                  {classesList.map(c => (
                    <option key={c} value={c}>Class {c}</option>
                  ))}
                </select>
              </div>

              {/* Risk Level selector */}
              <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#E8DDD0] px-3 py-2 rounded-xl">
                <span className="text-xs font-semibold text-[#6B7280]">Risk:</span>
                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="bg-transparent border-0 text-xs font-bold focus:outline-none text-[#1A1A2E]"
                >
                  <option value="all">All Risks</option>
                  <option value="critical">Critical</option>
                  <option value="high">High Risk</option>
                  <option value="moderate">Moderate</option>
                  <option value="stable">Stable</option>
                </select>
              </div>

              {/* Hidden toggle */}
              <button
                onClick={() => setShowHiddenOnly(!showHiddenOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                  showHiddenOnly
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-[#FAF7F2] border-[#E8DDD0] text-[#6B7280] hover:text-[#1A1A2E]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hidden Strugglers</span>
              </button>

              {/* Reset button */}
              {(searchTerm || selectedClass !== 'all' || selectedRisk !== 'all' || showHiddenOnly) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-xs font-semibold text-[#C75B39] hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear Filters
                </button>
              )}

            </div>

          </div>

          {/* Results Summary */}
          <div className="flex justify-between items-center text-xs text-[#6B7280] border-t border-[#E8DDD0]/60 pt-3">
            <span>Found <span className="font-bold text-[#1A1A2E]">{filteredStudents.length}</span> students matches</span>
            {showHiddenOnly && (
              <span className="text-indigo-600 font-medium">Highlighting invisible students who may mask risks under moderate grades</span>
            )}
          </div>

        </div>

        {/* STUDENTS TABLE GRID */}
        <div className="bg-white border border-[#E8DDD0] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8DDD0] text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                  <th className="px-6 py-4">Student ID & Name</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Urgency Triage</th>
                  <th className="px-6 py-4">Attendance</th>
                  <th className="px-6 py-4">Academics</th>
                  <th className="px-6 py-4">AI Confidence</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DDD0]/50">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr 
                      key={student.id} 
                      className="hover:bg-[#FFF8F0]/30 transition-colors text-xs"
                    >
                      {/* Name & ID */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1A1A2E] to-[#2C3E6B] flex items-center justify-center text-white text-xs font-bold font-mono">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Link 
                                href={`/students/${student.id}`} 
                                className="font-bold text-sm text-[#1A1A2E] hover:text-[#C75B39] hover:underline"
                              >
                                {student.name}
                              </Link>
                              {student.isHiddenStudent && (
                                <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium inline-flex items-center gap-0.5" title="Silently struggling student">
                                  <Sparkles className="w-2.5 h-2.5" /> Hidden
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#6B7280] font-mono">{student.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="px-6 py-4 font-medium text-[#1A1A2E]">
                        Class {student.class}-{student.section}
                      </td>

                      {/* Risk Badge */}
                      <td className="px-6 py-4">
                        <RiskBadge level={student.riskLevel} />
                      </td>

                      {/* Attendance */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold ${
                              student.attendanceRate < 70 ? 'text-[#DC2626]' :
                              student.attendanceRate < 80 ? 'text-[#D4A843]' : 'text-[#4A7C59]'
                            }`}>{student.attendanceRate}%</span>
                          </div>
                          {/* Muted tiny progress line */}
                          <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                student.attendanceRate < 70 ? 'bg-[#DC2626]' :
                                student.attendanceRate < 80 ? 'bg-[#D4A843]' : 'bg-[#4A7C59]'
                              }`}
                              style={{ width: `${student.attendanceRate}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Academics */}
                      <td className="px-6 py-4 font-mono font-semibold text-[#1A1A2E]">
                        {student.academicScore}%
                      </td>

                      {/* Confidence */}
                      <td className="px-6 py-4">
                        <ConfidenceScore score={student.confidenceScore} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/students/${student.id}`}
                            className="p-2 hover:bg-[#FAF7F2] border border-transparent hover:border-[#E8DDD0] rounded-lg text-[#6B7280] hover:text-[#1A1A2E] transition-all flex items-center justify-center"
                            title="Diagnose student"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          
                          <Link
                            href={`/interventions?student=${student.id}`}
                            className="p-2 hover:bg-[#FAF7F2] border border-transparent hover:border-[#E8DDD0] rounded-lg text-[#C75B39] transition-all flex items-center justify-center"
                            title="Assign action plan"
                          >
                            <ClipboardPlus className="w-4 h-4" />
                          </Link>

                          <a
                            href={`tel:${student.guardianPhone}`}
                            className="p-2 hover:bg-[#FAF7F2] border border-transparent hover:border-[#E8DDD0] rounded-lg text-[#4A7C59] transition-all flex items-center justify-center"
                            title={`Call Guardian: ${student.guardianName} (${student.guardianPhone})`}
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#6B7280]">
                      No student records match the selected filters. Try clearing filters or revising terms.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
