'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, ShieldAlert, Sparkles } from 'lucide-react';
import { getLocalStudents, saveLocalStudents, Student, StudentRiskFactor } from '@/lib/data/students';
import { api } from '@/lib/api';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddStudentModal({ isOpen, onClose }: AddStudentModalProps) {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState('8');
  const [selectedSection, setSelectedSection] = useState('A');
  const [age, setAge] = useState('14');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [attendance, setAttendance] = useState('85');
  const [academics, setAcademics] = useState('72');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(async () => {
      const activeStudents = getLocalStudents();
      
      // Auto-generate high-quality student record ID
      const nextIdNum = activeStudents.length + 1;
      const nextId = `STU-${String(nextIdNum).padStart(3, '0')}`;

      const attendanceRate = Number(attendance) || 80;
      const academicScore = Number(academics) || 70;
      const parsedAge = Number(age) || 14;

      // Predict risk classification dynamically
      let riskLevel: Student['riskLevel'] = 'stable';
      let riskScore = 15;
      let aiExplanation = '';

      if (attendanceRate < 65 || academicScore < 45) {
        riskLevel = 'critical';
        riskScore = 80 + Math.floor(Math.random() * 18);
        aiExplanation = `${name} shows a critical dropout threat pattern driven by high absence rates (${attendanceRate}%) and low classroom academic scores (${academicScore}%). Immediate counselor meeting is flagged.`;
      } else if (attendanceRate < 78 || academicScore < 58) {
        riskLevel = 'high';
        riskScore = 60 + Math.floor(Math.random() * 18);
        aiExplanation = `Multiple warning indicators flagged for ${name}. High disengagement probability detected from declining attendance trends and incomplete assignments. Proactive review advised.`;
      } else if (attendanceRate < 88 || academicScore < 74) {
        riskLevel = 'moderate';
        riskScore = 35 + Math.floor(Math.random() * 20);
        aiExplanation = `${name} is currently flagged with moderate risk signals. Mild disengagement observed in homework submissions. Monitor and assign revision support.`;
      } else {
        riskLevel = 'stable';
        riskScore = 5 + Math.floor(Math.random() * 25);
        aiExplanation = `Student ${name} is performing strongly across all indicators. Highly consistent attendance (${attendanceRate}%) and stable academic performance. Standard observation active.`;
      }

      // Populate realistic risk factors
      const riskFactors: StudentRiskFactor[] = [];
      if (attendanceRate < 75) {
        riskFactors.push({
          factor: 'Attendance Decline',
          weight: 0.3,
          description: `Attendance dropped below threshold limits to ${attendanceRate}%`,
          trend: 'declining'
        });
      }
      if (academicScore < 55) {
        riskFactors.push({
          factor: 'Academic Risk Indicator',
          weight: 0.25,
          description: `Unit evaluation score dropped to ${academicScore}%`,
          trend: 'declining'
        });
      }

      const newStudent: Student = {
        id: nextId,
        name,
        class: selectedClass,
        section: selectedSection,
        age: parsedAge,
        gender,
        guardianName,
        guardianPhone: guardianPhone.startsWith('+91') ? guardianPhone : `+91 ${guardianPhone}`,
        riskLevel,
        riskScore,
        confidenceScore: Math.round((70 + Math.random() * 25) * 10) / 10,
        isHiddenStudent: false,
        attendanceRate,
        attendanceTrend: [85, 84, 82, 80, 83, 81, 79, 82, 85, 83, 82, attendanceRate],
        academicScore,
        academicTrend: [70, 71, 68, 72, 70, 69, 72, 74, 71, 73, 72, academicScore],
        participationScore: 65,
        participationTrend: [60, 62, 65, 63, 66, 65, 62, 64, 65, 66, 64, 65],
        homeworkConsistency: 75,
        behaviorScore: 80,
        emotionalWellbeing: 75,
        interactionFrequency: 45,
        riskFactors,
        interventions: [],
        observations: [
          {
            id: `OBS-${nextId}-0`,
            teacherName: 'Meenakshi Sharma',
            date: new Date().toISOString().split('T')[0],
            note: 'Student profile created and enrolled in EduShield early warning system.',
            type: 'positive'
          }
        ],
        aiExplanation,
        enrollmentDate: new Date().toISOString().split('T')[0],
        photoSeed: Math.floor(Math.random() * 1000)
      };

      // Save using hybrid api service
      await api.addStudent(newStudent);

      // Trigger redraw/state reload in all listening pages
      window.dispatchEvent(new Event('students-updated'));

      setIsLoading(false);
      // Reset form fields
      setName('');
      setGuardianName('');
      setGuardianPhone('');
      setAttendance('85');
      setAcademics('72');
      
      onClose();
    }, 700);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Dark Glass Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0c0c16]/50 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="bg-white border border-[#E8DDD0] rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden z-10 flex flex-col relative"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E8DDD0] flex items-center justify-between bg-[#FAF7F2]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C75B39] to-[#D4A843] flex items-center justify-center shadow-xs">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">Add New Student Profile</h3>
                  <p className="text-[10px] text-[#6B7280]">AI will analyze grades and attendance to assign risk triage categories</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-[#6B7280] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[75vh] space-y-4">
              
              {/* Core Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5">Student Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C75B39]/20 focus:border-[#C75B39]/40 transition-all text-[#1A1A2E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5">Class</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C75B39]/20 focus:border-[#C75B39]/40 text-[#1A1A2E]"
                    >
                      {['6', '7', '8', '9', '10'].map(c => (
                        <option key={c} value={c}>Class {c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5">Section</label>
                    <select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C75B39]/20 focus:border-[#C75B39]/40 text-[#1A1A2E]"
                    >
                      {['A', 'B', 'C'].map(s => (
                        <option key={s} value={s}>Sec {s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Age, Gender & Guardians */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5">Age</label>
                  <input
                    type="number"
                    required
                    min="10"
                    max="18"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C75B39]/20 focus:border-[#C75B39]/40 transition-all text-[#1A1A2E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5">Gender</label>
                  <div className="flex gap-2">
                    {(['M', 'F'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize border transition-all duration-150 cursor-pointer ${
                          gender === g
                            ? 'bg-[#1A1A2E] text-white border-[#1A1A2E] shadow-sm'
                            : 'bg-[#FAF7F2] text-[#6B7280] border-[#E8DDD0] hover:bg-[#FFF8F0]'
                        }`}
                      >
                        {g === 'M' ? 'Boy' : 'Girl'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5">Guardian Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C75B39]/20 focus:border-[#C75B39]/40 transition-all text-[#1A1A2E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5">Guardian Name</label>
                <input
                  type="text"
                  required
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="e.g. Sita Ram Sharma"
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C75B39]/20 focus:border-[#C75B39]/40 transition-all text-[#1A1A2E]"
                />
              </div>

              {/* Attendance & Academics (Critical signals!) */}
              <div className="bg-[#FFF8F0] border border-[#E8DDD0] rounded-xl p-4 space-y-4">
                <h4 className="text-xs font-bold text-[#C75B39] flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Predictive Risk Modeling Inputs
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-[#1A1A2E]">Attendance Rate ({attendance}%)</label>
                      {Number(attendance) < 70 && <span className="text-[9px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-bold">Critical Level</span>}
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={attendance}
                      onChange={(e) => setAttendance(e.target.value)}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C75B39]"
                    />
                    <span className="text-[10px] text-[#6B7280]">Critical signal if attendance falls below 70%</span>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-[#1A1A2E]">Academic Unit Average ({academics}%)</label>
                      {Number(academics) < 50 && <span className="text-[9px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-bold">Low Performance</span>}
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={academics}
                      onChange={(e) => setAcademics(e.target.value)}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C75B39]"
                    />
                    <span className="text-[10px] text-[#6B7280]">Academic failure indicators model dropout risks</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2.5 border border-[#E8DDD0] hover:bg-[#FAF7F2] text-xs font-semibold rounded-xl text-[#6B7280] transition-colors cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-2.5 bg-[#C75B39] hover:bg-[#A94A2D] text-xs font-semibold rounded-xl text-white shadow-sm flex items-center gap-1.5 cursor-pointer disabled:bg-[#C75B39]/50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving to AI Models...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Deploy Student Profile
                    </>
                  )}
                </motion.button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
