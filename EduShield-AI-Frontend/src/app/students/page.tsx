'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageWrapper from '@/components/layout/PageWrapper';
import RiskBadge from '@/components/ai/RiskBadge';
import ConfidenceScore from '@/components/ai/ConfidenceScore';
import AddStudentModal from '@/components/students/AddStudentModal';
import { api } from '@/lib/api';
import { getLocalStudents, Student } from '@/lib/data/students';
import { Search, Filter, Sparkles, Phone, Eye, ClipboardPlus, X, Plus, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/LanguageContext';

export default function StudentsOverviewPage() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [showHiddenOnly, setShowHiddenOnly] = useState(false);
  const [role, setRole] = useState('admin');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load local storage role
    const savedRole = localStorage.getItem('userRole') || 'admin';
    const savedUserCode = localStorage.getItem('userCode') || '';
    setRole(savedRole);

    if (savedRole === 'parent' && savedUserCode) {
      router.push(`/students/${savedUserCode}`);
      return;
    }

    // Load dynamic students
    const loadStudents = async () => {
      const data = await api.getStudents();
      setAllStudents(data);
    };
    loadStudents();
    
    // Add reload listener
    window.addEventListener('students-updated', loadStudents);
    return () => {
      window.removeEventListener('students-updated', loadStudents);
    };
  }, []);

  // Extract unique classes
  const classesList = useMemo(() => {
    const list = role === 'teacher' ? ['8'] : Array.from(new Set(allStudents.map(s => s.class))).sort((a, b) => parseInt(a) - parseInt(b));
    return list;
  }, [allStudents, role]);

  // Filter students
  const filteredStudents = useMemo(() => {
    const studentsList = role === 'teacher' ? allStudents.filter(s => s.class === '8') : allStudents;
    return studentsList.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.guardianName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClass = role === 'teacher' ? s.class === '8' : (selectedClass === 'all' || s.class === selectedClass);
      
      const matchesRisk = selectedRisk === 'all' || s.riskLevel === selectedRisk;
      
      const matchesHidden = !showHiddenOnly || s.isHiddenStudent;

      return matchesSearch && matchesClass && matchesRisk && matchesHidden;
    });
  }, [searchTerm, selectedClass, selectedRisk, showHiddenOnly, allStudents, role]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedClass('all');
    setSelectedRisk('all');
    setShowHiddenOnly(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#C75B39] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PageWrapper 
      title={t('studentIntelligenceQueue')} 
      subtitle={t('studentIntelligenceSubtitle')}
    >
      <div className="space-y-6">

        {/* Action Header Button for Admins/Teachers */}
        {(role === 'admin' || role === 'teacher') && (
          <div className="flex justify-end">
            <motion.button
              onClick={() => setIsAddModalOpen(true)}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2.5 bg-[#C75B39] hover:bg-[#A94A2D] text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> {t('addNewStudent')}
            </motion.button>
          </div>
        )}

        {/* SEARCH & FILTERS PANEL */}
        <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder={t('searchByNameIdGuardian')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C75B39]/20 focus:border-[#C75B39]/40 transition-all text-[#1A1A2E]"
              />
            </div>

            {/* Filter Group */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Class selector */}
              <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#E8DDD0] px-3 py-2 rounded-xl">
                <span className="text-xs font-semibold text-[#6B7280]">{t('classLabel')}</span>
                <select
                  value={role === 'teacher' ? '8' : selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  disabled={role === 'teacher'}
                  className="bg-transparent border-0 text-xs font-bold focus:outline-none text-[#1A1A2E] disabled:opacity-80"
                >
                  {role !== 'teacher' && <option value="all">{t('allClasses')}</option>}
                  {classesList.map(c => (
                    <option key={c} value={c}>{t('classPrefix')} {c}</option>
                  ))}
                </select>
              </div>

              {/* Risk Level selector */}
              <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#E8DDD0] px-3 py-2 rounded-xl">
                <span className="text-xs font-semibold text-[#6B7280]">{t('riskLabel')}</span>
                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="bg-transparent border-0 text-xs font-bold focus:outline-none text-[#1A1A2E]"
                >
                  <option value="all">{t('allRisks')}</option>
                  <option value="critical">{t('riskCritical')}</option>
                  <option value="high">{t('highRisk')}</option>
                  <option value="moderate">{t('riskModerate')}</option>
                  <option value="stable">{t('riskStable')}</option>
                </select>
              </div>

              {/* Hidden toggle */}
              <motion.button
                onClick={() => setShowHiddenOnly(!showHiddenOnly)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  showHiddenOnly
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-[#FAF7F2] border-[#E8DDD0] text-[#6B7280] hover:text-[#1A1A2E]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('hiddenStrugglers')}</span>
              </motion.button>

              {/* Reset button */}
              {(searchTerm || selectedClass !== 'all' || selectedRisk !== 'all' || showHiddenOnly) && (
                <motion.button
                  onClick={clearFilters}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-2 text-xs font-semibold text-[#C75B39] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" /> {t('clearFilters')}
                </motion.button>
              )}

            </div>

          </div>

          {/* Results Summary */}
          <div className="flex justify-between items-center text-xs text-[#6B7280] border-t border-[#E8DDD0]/60 pt-3">
            <span>{t('foundStudents')} <span className="font-bold text-[#1A1A2E]">{filteredStudents.length}</span> {t('studentsMatches')}</span>
            {showHiddenOnly && (
              <span className="text-indigo-600 font-medium">{t('highlightingInvisible')}</span>
            )}
          </div>

        </div>

        {/* MOBILE GRID CARDS VIEW (Visible only on mobile screen widths < 768px) */}
        <div className="md:hidden space-y-4">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <motion.div
                key={student.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="p-4 bg-white border border-[#E8DDD0] rounded-2xl shadow-xs space-y-3 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1A1A2E] to-[#2C3E6B] flex items-center justify-center text-white text-xs font-bold font-mono shadow-xs">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1A1A2E] hover:underline">
                        <Link href={`/students/${student.id}`}>{student.name}</Link>
                      </h4>
                      <p className="text-[10px] text-[#6B7280] font-mono">{t('classPrefix')} {student.class}-{student.section} • {student.id}</p>
                    </div>
                  </div>
                  <RiskBadge level={student.riskLevel} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8DDD0]/50">
                  <div>
                    <span className="text-[9px] text-[#6B7280] uppercase tracking-wider block font-semibold">{t('attendanceLabel')}</span>
                    <p className={`font-bold font-mono text-sm ${
                      student.attendanceRate < 70 ? 'text-[#DC2626]' :
                      student.attendanceRate < 80 ? 'text-[#D4A843]' : 'text-[#4A7C59]'
                    }`}>{student.attendanceRate}%</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#6B7280] uppercase tracking-wider block font-semibold">{t('academicsLabel')}</span>
                    <p className="font-bold font-mono text-sm text-[#1A1A2E]">{student.academicScore}%</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-100 pt-2.5">
                  <Link 
                    href={`/students/${student.id}`} 
                    className="p-2 hover:bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-[#6B7280] flex items-center justify-center shadow-xs"
                    title={t('viewAiProfile')}
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link 
                    href={`/interventions?student=${student.id}`} 
                    className="p-2 hover:bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-[#C75B39] flex items-center justify-center shadow-xs"
                    title={t('assignInterventions')}
                  >
                    <ClipboardPlus className="w-4 h-4" />
                  </Link>
                  <a 
                    href={`tel:${student.guardianPhone}`} 
                    className="p-2 hover:bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-[#4A7C59] flex items-center justify-center shadow-xs"
                    title={t('callGuardian')}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="p-12 text-center text-xs text-[#6B7280] bg-white border border-[#E8DDD0] rounded-2xl">
              {t('noMatchingRecords')}
            </div>
          )}
        </div>

        {/* DESKTOP TABLE VIEW (Hidden on mobile) */}
        <div className="hidden md:block bg-white border border-[#E8DDD0] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8DDD0] text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                  <th className="px-6 py-4">{t('studentIdAndName')}</th>
                  <th className="px-6 py-4">{t('class')}</th>
                  <th className="px-6 py-4">{t('urgencyTriage')}</th>
                  <th className="px-6 py-4">{t('attendance')}</th>
                  <th className="px-6 py-4">{t('academicsLabel')}</th>
                  <th className="px-6 py-4">{t('aiConfidenceLabel')}</th>
                  <th className="px-6 py-4 text-right">{t('actionsLabel')}</th>
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
                                  <Sparkles className="w-2.5 h-2.5" /> {t('hiddenLabel')}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#6B7280] font-mono">{student.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="px-6 py-4 font-medium text-[#1A1A2E]">
                        {t('classPrefix')} {student.class}-{student.section}
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
                            className="p-2 hover:bg-[#FAF7F2] border border-transparent hover:border-[#E8DDD0] rounded-lg text-[#6B7280] hover:text-[#1A1A2E] transition-all flex items-center justify-center shadow-xs"
                            title={t('diagnoseStudent')}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          
                          <Link
                            href={`/interventions?student=${student.id}`}
                            className="p-2 hover:bg-[#FAF7F2] border border-transparent hover:border-[#E8DDD0] rounded-lg text-[#C75B39] transition-all flex items-center justify-center shadow-xs"
                            title={t('assignActionPlan')}
                          >
                            <ClipboardPlus className="w-4 h-4" />
                          </Link>

                          <a
                            href={`tel:${student.guardianPhone}`}
                            className="p-2 hover:bg-[#FAF7F2] border border-transparent hover:border-[#E8DDD0] rounded-lg text-[#4A7C59] transition-all flex items-center justify-center shadow-xs"
                            title={`${t('callGuardian')}: ${student.guardianName} (${student.guardianPhone})`}
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
                      {t('noMatchingFilters')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </PageWrapper>
  );
}
