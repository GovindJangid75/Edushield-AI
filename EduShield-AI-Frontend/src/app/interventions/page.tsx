'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PageWrapper from '@/components/layout/PageWrapper';
import RiskBadge from '@/components/ai/RiskBadge';
import { students, Student, Intervention } from '@/lib/data/students';
import { interventionCatalog } from '@/lib/data/school-metrics';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  PlusCircle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  User,
  BookOpen,
  Calendar,
  Sparkles,
  ChevronRight
} from 'lucide-react';

function InterventionsContent() {
  const searchParams = useSearchParams();
  const preselectedStudentId = searchParams ? searchParams.get('student') : null;

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeInterventions, setActiveInterventions] = useState<any[]>([]);
  
  // Form State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [formStudentId, setFormStudentId] = useState(preselectedStudentId || '');
  const [formCatalogId, setFormCatalogId] = useState('IC-01');
  const [formAssignee, setFormAssignee] = useState('Teacher Sunita Sharma');
  const [formNotes, setFormNotes] = useState('');

  // Set up initial interventions from mock students data
  useEffect(() => {
    const list: any[] = [];
    students.forEach(student => {
      student.interventions.forEach(interv => {
        list.push({
          ...interv,
          studentId: student.id,
          studentName: student.name,
          studentClass: student.class,
          studentSection: student.section,
          studentRisk: student.riskLevel
        });
      });
    });
    // Sort by date assigned (newest first)
    list.sort((a, b) => new Date(b.dateAssigned).getTime() - new Date(a.dateAssigned).getTime());
    setActiveInterventions(list);
  }, []);

  // Update form if URL student changes
  useEffect(() => {
    if (preselectedStudentId) {
      setFormStudentId(preselectedStudentId);
      setShowAssignModal(true);
    }
  }, [preselectedStudentId]);

  // Filters
  const filteredInterventions = useMemo(() => {
    return activeInterventions.filter(item => {
      const matchesSearch = item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [activeInterventions, searchTerm, statusFilter]);

  // Columns for Kanban/Workflow
  const columns = [
    { id: 'assigned', label: 'Assigned / Triage', color: 'border-t-4 border-t-red-500 bg-red-50/20' },
    { id: 'in-progress', label: 'In Progress', color: 'border-t-4 border-t-amber-500 bg-amber-50/20' },
    { id: 'follow-up', label: 'Follow-up Period', color: 'border-t-4 border-t-blue-500 bg-blue-50/20' },
    { id: 'resolved', label: 'Resolved / Recovered', color: 'border-t-4 border-t-green-500 bg-green-50/20' },
  ];

  // Move state workflow
  const handleProgressStatus = (interventionId: string, currentStatus: string) => {
    const statusOrder = ['assigned', 'in-progress', 'follow-up', 'resolved'];
    const nextIndex = statusOrder.indexOf(currentStatus) + 1;
    if (nextIndex >= statusOrder.length) return; // Already resolved
    
    const nextStatus = statusOrder[nextIndex];

    setActiveInterventions(prev => prev.map(item => {
      if (item.id === interventionId) {
        return {
          ...item,
          status: nextStatus,
          ...(nextStatus === 'resolved' ? { dateResolved: new Date().toISOString().split('T')[0], outcome: 'Completed. Metrics stabilized.' } : {})
        };
      }
      return item;
    }));
  };

  // Submit assign form
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentId || !formCatalogId) return;

    const studentObj = students.find(s => s.id === formStudentId);
    const catalogItem = interventionCatalog.find(c => c.id === formCatalogId);

    if (!studentObj || !catalogItem) return;

    const newInterv = {
      id: `INT-NEW-${Date.now()}`,
      type: catalogItem.type,
      description: formNotes || catalogItem.description,
      assignedTo: formAssignee,
      status: 'assigned',
      dateAssigned: new Date().toISOString().split('T')[0],
      studentId: studentObj.id,
      studentName: studentObj.name,
      studentClass: studentObj.class,
      studentSection: studentObj.section,
      studentRisk: studentObj.riskLevel
    };

    setActiveInterventions(prev => [newInterv, ...prev]);
    setShowAssignModal(false);
    setFormNotes('');
  };

  return (
    <PageWrapper 
      title="Intervention Center" 
      subtitle="Deploy customized support plans, monitor case pipelines, and log outreach results"
    >
      <div className="space-y-6">

        {/* CONTROLS HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-[#E8DDD0] p-5 rounded-2xl shadow-sm">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 w-full">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search cases by student name or action type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C75B39]/20 focus:border-[#C75B39]/40 text-[#1A1A2E]"
              />
            </div>
            
            {/* Dropdown status */}
            <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#E8DDD0] px-3 py-2 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Pipeline:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-0 text-xs font-semibold focus:outline-none text-[#1A1A2E]"
              >
                <option value="all">All Stages</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="follow-up">Follow-up</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowAssignModal(true)}
            className="w-full md:w-auto px-5 py-2.5 bg-[#C75B39] hover:bg-[#A94A2D] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Deploy Intervention
          </button>

        </div>

        {/* WORKFLOW COLUMNS (KANBAN BOARD) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          
          {columns.map(col => {
            const list = filteredInterventions.filter(item => item.status === col.id);
            return (
              <div key={col.id} className={`rounded-2xl border border-[#E8DDD0] p-4 flex flex-col min-h-[500px] ${col.color}`}>
                <div className="flex items-center justify-between border-b border-[#E8DDD0]/60 pb-2.5 mb-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#1A1A2E]">{col.label}</h4>
                  <span className="text-xs bg-[#1A1A2E] text-white px-2 py-0.5 rounded-full font-bold font-mono">
                    {list.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
                  {list.length > 0 ? (
                    list.map(item => (
                      <div 
                        key={item.id}
                        className="bg-white border border-[#E8DDD0] rounded-xl p-4 shadow-xs space-y-3 card-tactile text-xs relative group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <Link href={`/students/${item.studentId}`} className="font-bold text-sm text-[#1A1A2E] hover:underline hover:text-[#C75B39]">
                              {item.studentName}
                            </Link>
                            <p className="text-[10px] text-[#6B7280]">Class {item.studentClass}-{item.studentSection} • ID: {item.studentId}</p>
                          </div>
                          <RiskBadge level={item.studentRisk} className="scale-90 transform origin-top-right" />
                        </div>

                        <div className="p-2.5 bg-[#FAF7F2] rounded-lg border border-[#E8DDD0]/50 space-y-1">
                          <p className="font-bold text-[#1A1A2E] text-[11px]">{item.type}</p>
                          <p className="text-[#6B7280] leading-relaxed text-[10px]">{item.description}</p>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-[#6B7280] border-t border-[#E8DDD0]/40 pt-2">
                          <User className="w-3.5 h-3.5 text-[#9CA3AF]" />
                          <span>Owner: <span className="font-semibold text-[#1A1A2E]">{item.assignedTo}</span></span>
                        </div>

                        <div className="flex items-center justify-between gap-1 text-[9px] text-[#9CA3AF] mt-1">
                          <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {new Date(item.dateAssigned).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          
                          {/* Workflow advance button */}
                          {col.id !== 'resolved' && (
                            <button
                              onClick={() => handleProgressStatus(item.id, item.status)}
                              className="px-2 py-1 bg-white hover:bg-[#FFF8F0] border border-[#E8DDD0] hover:border-[#C75B39]/50 text-[#C75B39] font-bold rounded-lg transition-all flex items-center gap-0.5 cursor-pointer"
                              title="Advance workflow status"
                            >
                              <span>Advance</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}

                          {col.id === 'resolved' && (
                            <span className="text-[#4A7C59] font-semibold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Success
                            </span>
                          )}
                        </div>

                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex items-center justify-center border border-dashed border-[#E8DDD0] rounded-xl p-6 text-center text-[#6B7280] italic text-[11px]">
                      No active cases in this stage.
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        </div>

        {/* ASSIGN INTERVENTION MODAL */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-[#E8DDD0] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-start border-b border-[#E8DDD0] pb-3">
                <div>
                  <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">Deploy Support Workplan</h3>
                  <p className="text-xs text-[#6B7280]">Select risk profile and map recommended intervention</p>
                </div>
                <button 
                  onClick={() => setShowAssignModal(false)}
                  className="p-1 hover:bg-[#FAF7F2] rounded-lg text-[#6B7280] hover:text-[#1A1A2E]"
                >
                  <span className="text-sm font-bold">Close</span>
                </button>
              </div>

              <form onSubmit={handleAssignSubmit} className="space-y-4">
                
                {/* Student Select */}
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5">Target Student</label>
                  <select
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C75B39]/20 focus:border-[#C75B39]/40 text-[#1A1A2E]"
                    required
                  >
                    <option value="">-- Select Student --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Class {s.class}-{s.section} • Risk: {s.riskLevel.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Catalog Option Select */}
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5">Action Plan Type</label>
                  <select
                    value={formCatalogId}
                    onChange={(e) => setFormCatalogId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C75B39]/20 focus:border-[#C75B39]/40 text-[#1A1A2E]"
                    required
                  >
                    {interventionCatalog.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.type} ({c.priority.toUpperCase()} priority • Role: {c.responsibleRole})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Owner Input */}
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5">Responsible Teacher</label>
                  <input
                    type="text"
                    value={formAssignee}
                    onChange={(e) => setFormAssignee(e.target.value)}
                    placeholder="e.g. Teacher Sunita Sharma"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C75B39]/20 focus:border-[#C75B39]/40 text-[#1A1A2E]"
                    required
                  />
                </div>

                {/* Customize Notes */}
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5">Customized Case Notes (Optional)</label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Describe direct targets (e.g. schedule 3 home visits, provide regional-language Hindi notes...)"
                    className="w-full min-h-[80px] p-2.5 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C75B39]/20 focus:border-[#C75B39]/40 text-[#1A1A2E]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#C75B39] hover:bg-[#A94A2D] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Activate Support Plan
                </button>

              </form>
            </div>
          </div>
        )}

      </div>
    </PageWrapper>
  );
}

export default function InterventionsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-[#6B7280]">Loading interventions...</div>}>
      <InterventionsContent />
    </Suspense>
  );
}
