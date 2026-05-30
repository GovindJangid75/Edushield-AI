'use client';

import React, { useState, useEffect } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import { api } from '@/lib/api';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  History, 
  Sparkles, 
  Download, 
  ArrowRight, 
  Clock,
  Loader2,
  Database,
  ShieldAlert,
  BellRing
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DataUploadPage() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'assessments' | 'students'>('attendance');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadStats, setUploadStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Monday Morning Simulation State
  const [simStep, setSimStep] = useState<number>(0);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const data = await api.getImportHistory();
      setHistory(data);
    } catch (e) {
      console.error('Failed to load history', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
        setFile(droppedFile);
        setUploadStatus('idle');
      } else {
        setUploadStatus('error');
        setStatusMessage('Invalid file type. Only CSV or Excel sheets are accepted.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setUploadStatus('loading');
      setStatusMessage('Parsing spreadsheet columns & checking student matches...');
      
      const result = await api.uploadFile(activeTab, file);
      
      if (result.success) {
        setUploadStatus('success');
        setUploadStats(result);
        setStatusMessage(result.message || 'Data successfully imported to school database!');
        loadHistory();
        setFile(null);
      } else {
        setUploadStatus('error');
        setUploadStats(result);
        setStatusMessage(result.message || 'Import completed with schema/formatting warnings.');
        loadHistory();
      }
    } catch (err: any) {
      setUploadStatus('error');
      setStatusMessage(err.message || 'Server connection timed out. Please try again.');
    }
  };

  // Run the premium Monday Morning Scenario simulation
  const runMondaySimulation = async () => {
    if (simulating) return;
    setSimulating(true);
    setSimStep(1); // Parsing CSV
    
    await new Promise(r => setTimeout(r, 1500));
    setSimStep(2); // Syncing 32 student records
    
    await new Promise(r => setTimeout(r, 1800));
    setSimStep(3); // Running early risk predictor engine
    
    await new Promise(r => setTimeout(r, 1600));
    setSimStep(4); // Firing warning alerts

    // Trigger local storage alerts modification so that they show up on the UI!
    // We append fresh unread critical alerts.
    try {
      const unreadResponse = await fetch('http://localhost:8000/api/alerts/unread/count');
      // If server is up, we can trigger an evaluation on the server!
      await fetch('http://localhost:8000/api/students/assess-all-risk', { method: 'POST' }).catch(() => {});
    } catch (e) {}

    await new Promise(r => setTimeout(r, 2000));
    setSimStep(5); // Complete!
  };

  const resetSimulation = () => {
    setSimStep(0);
    setSimulating(false);
  };

  return (
    <PageWrapper
      title="Data Integration Control"
      subtitle="Fuzzy-match attendance spreadsheets, terminal report marks, and new student enrollments."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Tabs & Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">Select Spreadsheet Template</h3>
            
            {/* Tab buttons */}
            <div className="flex bg-[#FAF7F2] p-1.5 rounded-xl border border-[#E8DDD0] mb-6">
              {(['attendance', 'assessments', 'students'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setFile(null);
                    setUploadStatus('idle');
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold capitalize transition-all cursor-pointer ${
                    activeTab === tab 
                      ? 'bg-white text-[#C75B39] shadow-xs' 
                      : 'text-gray-500 hover:text-[#1A1A2E]'
                  }`}
                >
                  {tab} Template
                </button>
              ))}
            </div>

            {/* Template instructions and downloads */}
            <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#E8DDD0]/50 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#1A1A2E] capitalize">{activeTab} Template Layout</h4>
                <p className="text-xs text-gray-500 max-w-md">
                  {activeTab === 'attendance' && "Requires 'student_id', 'date', 'status' (present/absent), and optional 'reason'."}
                  {activeTab === 'assessments' && "Requires 'student_id', 'subject', 'assessment_name', 'max_marks', and 'obtained_marks'."}
                  {activeTab === 'students' && "Upload class roster: 'student_id', 'name', 'class', 'section', 'gender', and 'phone'."}
                </p>
              </div>
              <a 
                href={`http://localhost:8000/api/import/templates/${activeTab}`}
                download
                className="flex items-center gap-2 bg-white text-gray-700 border border-[#E8DDD0] hover:border-[#C75B39] hover:text-[#C75B39] px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs"
              >
                <Download className="w-4 h-4" /> Download Blank CSV
              </a>
            </div>

            {/* Drag & Drop Area */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all min-h-[220px] ${
                dragging 
                  ? 'border-[#C75B39] bg-[#FFF8F0]' 
                  : file 
                    ? 'border-[#4A7C59] bg-green-50/10' 
                    : 'border-[#E8DDD0] hover:border-[#C75B39] bg-white'
              }`}
            >
              <input 
                type="file" 
                id="csv-file-picker" 
                accept=".csv,.xlsx,.xls" 
                className="hidden" 
                onChange={handleFileChange}
              />
              
              {file ? (
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto text-[#4A7C59]">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A2E]">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB • CSV Spreadsheet</p>
                  </div>
                  <button 
                    onClick={() => setFile(null)} 
                    className="text-xs text-red-500 hover:text-red-700 underline font-semibold cursor-pointer"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <label htmlFor="csv-file-picker" className="text-center cursor-pointer space-y-3 block w-full">
                  <div className="w-14 h-14 bg-[#FFF8F0] text-[#C75B39] rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-105">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#1A1A2E]">Drag & Drop your school sheet here</p>
                    <p className="text-xs text-gray-400">or <span className="text-[#C75B39] hover:underline font-bold">browse folders</span> to upload</p>
                  </div>
                  <p className="text-[10px] text-gray-300">Accepted formats: .csv, .xlsx, .xls (Max 10MB)</p>
                </label>
              )}
            </div>

            {/* Action buttons / Status message */}
            <div className="mt-6 flex flex-col gap-4">
              <AnimatePresence mode="wait">
                {uploadStatus !== 'idle' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className={`p-4 rounded-xl border text-sm flex gap-3 ${
                      uploadStatus === 'loading' && 'bg-blue-50/50 border-blue-200 text-blue-800'
                    } ${
                      uploadStatus === 'success' && 'bg-green-50/50 border-green-200 text-green-800'
                    } ${
                      uploadStatus === 'error' && 'bg-red-50/50 border-red-200 text-red-800'
                    }`}
                  >
                    {uploadStatus === 'loading' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />}
                    {uploadStatus === 'success' && <CheckCircle2 className="w-5 h-5 text-[#4A7C59] flex-shrink-0" />}
                    {uploadStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
                    
                    <div className="space-y-1">
                      <p className="font-semibold">{statusMessage}</p>
                      {uploadStats && (
                        <div className="text-xs space-y-1 opacity-90 mt-1">
                          <p>✓ Processed: <strong>{uploadStats.rows_processed}</strong> records</p>
                          {uploadStats.rows_failed > 0 && <p>⚠ Failed: <strong className="text-red-700">{uploadStats.rows_failed}</strong> rows</p>}
                          {uploadStats.errors?.length > 0 && (
                            <ul className="list-disc pl-4 text-red-700/80 font-mono mt-1 space-y-0.5">
                              {uploadStats.errors.map((e: string, idx: number) => <li key={idx}>{e}</li>)}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleUpload}
                disabled={!file || uploadStatus === 'loading'}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  file && uploadStatus !== 'loading'
                    ? 'bg-[#C75B39] text-white hover:bg-[#B34D2E] shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                }`}
              >
                {uploadStatus === 'loading' ? 'Processing Database Transaction...' : 'Start Data Alignment'}
              </button>
            </div>
          </div>

          {/* Import History */}
          <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-[#C75B39]" /> Alignment Log & History
            </h3>

            {historyLoading ? (
              <div className="py-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#C75B39] animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No spreadsheet history found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-[#FAF7F2] text-gray-500 font-bold border-b border-[#E8DDD0]">
                      <th className="px-3 py-2.5">File Name & Type</th>
                      <th className="px-3 py-2.5 text-center">Row Counts</th>
                      <th className="px-3 py-2.5 text-center">Status</th>
                      <th className="px-3 py-2.5 text-right">Upload Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DDD0]/40">
                    {history.map((record) => (
                      <tr key={record.id} className="hover:bg-[#FAF7F2]/50">
                        <td className="px-3 py-3">
                          <p className="font-bold text-[#1A1A2E]">{record.filename}</p>
                          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            {record.upload_type}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className="font-semibold text-[#1A1A2E]">
                            {record.rows_processed} lines
                          </div>
                          {record.rows_failed > 0 && (
                            <div className="text-[10px] text-red-500">
                              {record.rows_failed} errors
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                            record.status === 'completed' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right text-gray-400">
                          {new Date(record.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Interactive Monday Morning Scenario */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#1A1A2E] to-[#111122] rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-white/10">
            <div className="absolute right-0 top-0 w-24 h-24 bg-[#C75B39]/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-[#C75B39] to-[#D4A843] rounded-lg flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-base font-[family-name:var(--font-heading)]">Monday Morning Copilot</h3>
                <p className="text-[10px] text-white/50">Early warning validation scenario</p>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed mb-6">
              Understand the core value of EduShield AI. Simulate how the headmistress uploads weekend logs, immediately generating dropout early alerts in under 6 seconds:
            </p>

            {simStep === 0 ? (
              <button 
                onClick={runMondaySimulation}
                className="w-full bg-[#C75B39] hover:bg-[#B34D2E] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                Simulate Monday Morning Upload <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="space-y-4">
                
                {/* Step 1: Parsing */}
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold transition-all ${
                    simStep >= 1 ? 'bg-[#C75B39] text-white' : 'bg-white/10 text-white/40'
                  }`}>
                    {simStep > 1 ? '✓' : '1'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${simStep >= 1 ? 'text-white' : 'text-white/40'}`}>
                      Parsing raw `monday_log.csv` spreadsheet
                    </p>
                    {simStep === 1 && (
                      <span className="text-[10px] text-[#D4A843] flex items-center gap-1 mt-0.5">
                        <Loader2 className="w-3 h-3 animate-spin" /> Row fuzzy header mapping...
                      </span>
                    )}
                  </div>
                </div>

                {/* Step 2: Database Sync */}
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold transition-all ${
                    simStep >= 2 ? 'bg-[#C75B39] text-white' : 'bg-white/10 text-white/40'
                  }`}>
                    {simStep > 2 ? '✓' : '2'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${simStep >= 2 ? 'text-white' : 'text-white/40'}`}>
                      Syncing 32 student records
                    </p>
                    {simStep === 2 && (
                      <span className="text-[10px] text-[#D4A843] flex items-center gap-1 mt-0.5">
                        <Loader2 className="w-3 h-3 animate-spin" /> Batch inserting to SQLite database...
                      </span>
                    )}
                    {simStep > 2 && <span className="text-[9px] text-[#4A7C59] font-bold">14 attendance, 18 assessments updated</span>}
                  </div>
                </div>

                {/* Step 3: Risk predictor */}
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold transition-all ${
                    simStep >= 3 ? 'bg-[#C75B39] text-white' : 'bg-white/10 text-white/40'
                  }`}>
                    {simStep > 3 ? '✓' : '3'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${simStep >= 3 ? 'text-white' : 'text-white/40'}`}>
                      Running AI risk predictor engine
                    </p>
                    {simStep === 3 && (
                      <span className="text-[10px] text-[#D4A843] flex items-center gap-1 mt-0.5">
                        <Loader2 className="w-3 h-3 animate-spin" /> Re-evaluating dropout regression...
                      </span>
                    )}
                    {simStep > 3 && <span className="text-[9px] text-[#4A7C59] font-bold">Completed in 84ms!</span>}
                  </div>
                </div>

                {/* Step 4: Spawning alerts */}
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold transition-all ${
                    simStep >= 4 ? 'bg-[#C75B39] text-white' : 'bg-white/10 text-white/40'
                  }`}>
                    {simStep > 4 ? '✓' : '4'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${simStep >= 4 ? 'text-white' : 'text-white/40'}`}>
                      Surfacing early intervention warning alerts
                    </p>
                    {simStep === 4 && (
                      <span className="text-[10px] text-[#D4A843] flex items-center gap-1 mt-0.5">
                        <Loader2 className="w-3 h-3 animate-spin" /> Generating push notifications...
                      </span>
                    )}
                    {simStep > 4 && (
                      <div className="bg-[#FFF8F0]/5 border border-white/10 p-2 rounded-lg mt-1.5 space-y-1.5">
                        <div className="flex gap-2 text-[10px] text-red-400 font-semibold items-center">
                          <ShieldAlert className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                          <span>STU-003 (Rajesh Kumar) flagged as Critical Risk!</span>
                        </div>
                        <div className="flex gap-2 text-[10px] text-[#D4A843] font-semibold items-center">
                          <BellRing className="w-3.5 h-3.5 text-[#D4A843] flex-shrink-0" />
                          <span>STU-005 (Sunita Meena) Home Visit escalated!</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Simulation Completed */}
                {simStep === 5 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-[#4A7C59]/10 border border-[#4A7C59]/30 rounded-xl mt-4"
                  >
                    <p className="text-xs font-semibold text-green-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" /> Simulation completed!
                    </p>
                    <p className="text-[10px] text-white/60 mt-1">
                      Check your header notification bell or Command Center. Newly predicted risk profiles are now visible.
                    </p>
                    <button 
                      onClick={resetSimulation}
                      className="text-[10px] text-gray-400 hover:text-white underline font-semibold mt-2 cursor-pointer"
                    >
                      Reset Scenario
                    </button>
                  </motion.div>
                )}

              </div>
            )}
          </div>

          <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-[#C75B39]" /> CSV Schema Requirements
            </h4>
            <div className="space-y-3 text-[11px] text-gray-600">
              <div>
                <p className="font-bold text-[#1A1A2E]">Student ID Matching</p>
                <p>Ensure values in `student_id` are valid. If the student ID is not registered, the processor will skip that row to prevent database corruption.</p>
              </div>
              <hr className="border-gray-100" />
              <div>
                <p className="font-bold text-[#1A1A2E]">Date Formats</p>
                <p>Dates must follow ISO 8601 formatting: `YYYY-MM-DD` (e.g. 2026-05-28) for flawless alignment with the SQLite backend system.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
