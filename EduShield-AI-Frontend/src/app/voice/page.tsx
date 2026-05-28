'use client';

import React, { useState, useEffect } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import { students } from '@/lib/data/students';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  User, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Volume2,
  BrainCircuit,
  MessageSquarePlus,
  Play
} from 'lucide-react';

export default function VoiceObservationsPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Extracted insights
  const [extractedStudent, setExtractedStudent] = useState<string>('');
  const [detectedConcerns, setDetectedConcerns] = useState<string[]>([]);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
  const [successSaved, setSuccessSaved] = useState(false);

  const sampleVoiceTexts = [
    {
      lang: 'Hindi / Hinglish',
      text: 'Ravi class me silent rehne laga hai aur homework bhi incomplete aa raha hai.',
      student: 'Ravi Kumar',
      concerns: ['Academic decline', 'Social disengagement / withdrawal'],
      actions: ['Teacher direct follow-up', 'Peer buddy allocation']
    },
    {
      lang: 'English',
      text: 'Ananya was crying in class today after the math test, she seems very anxious and needs counseling.',
      student: 'Ananya Sharma',
      concerns: ['Emotional fatigue / Anxiety', 'Academic performance pressure'],
      actions: ['Counseling session', 'Reduce homework load temporarily']
    },
    {
      lang: 'Hindi',
      text: 'प्रिया पिछले तीन दिनों से स्कूल नहीं आ रही है और उसके माता-पिता फोन नहीं उठा रहे हैं।',
      student: 'Priya Sharma',
      concerns: ['Attendance drop (Critical)', 'Lack of guardian communication'],
      actions: ['Attendance Monitoring', 'Home Visit planning']
    }
  ];

  useEffect(() => {
    // Check Speech Recognition support in browser
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'hi-IN'; // Set to Hindi/English mixed primary support

        rec.onstart = () => {
          setIsRecording(true);
          setTranscription('Listening... (speak now)');
          setSuccessSaved(false);
        };

        rec.onerror = (event: any) => {
          console.error(event);
          setIsRecording(false);
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        rec.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript;
          setTranscription(resultText);
          processVoiceText(resultText);
        };

        setRecognition(rec);
      }
    }
  }, []);

  const handleToggleRecord = () => {
    if (isRecording) {
      recognition?.stop();
    } else {
      setTranscription('');
      setExtractedStudent('');
      setDetectedConcerns([]);
      setSuggestedActions([]);
      try {
        recognition?.start();
      } catch (err) {
        // Fallback for double starts or permissions
        setIsRecording(true);
        setTranscription('Simulating voice input...');
        setTimeout(() => {
          // Select random sample
          const sample = sampleVoiceTexts[Math.floor(Math.random() * sampleVoiceTexts.length)];
          handleSelectSample(sample);
          setIsRecording(false);
        }, 2000);
      }
    }
  };

  const handleSelectSample = (sample: typeof sampleVoiceTexts[0]) => {
    setTranscription(sample.text);
    setSuccessSaved(false);
    processVoiceText(sample.text, sample);
  };

  const processVoiceText = (text: string, manualSample?: typeof sampleVoiceTexts[0]) => {
    setIsProcessing(true);
    
    // Simulate NLP processing time
    setTimeout(() => {
      if (manualSample) {
        setExtractedStudent(manualSample.student);
        setDetectedConcerns(manualSample.concerns);
        setSuggestedActions(manualSample.actions);
      } else {
        // Simple regex matches for simulation on speech results
        const lower = text.toLowerCase();
        if (lower.includes('ravi')) {
          setExtractedStudent('Ravi Kumar');
          setDetectedConcerns(['Academic decline', 'Social disengagement / withdrawal']);
          setSuggestedActions(['Teacher direct follow-up', 'Peer buddy allocation']);
        } else if (lower.includes('ananya')) {
          setExtractedStudent('Ananya Sharma');
          setDetectedConcerns(['Emotional fatigue / Anxiety', 'Academic performance pressure']);
          setSuggestedActions(['Counseling session', 'Reduce homework load temporarily']);
        } else if (lower.includes('priya') || lower.includes('प्रिया')) {
          setExtractedStudent('Priya Sharma');
          setDetectedConcerns(['Attendance drop (Critical)', 'Lack of guardian communication']);
          setSuggestedActions(['Attendance Monitoring', 'Home Visit planning']);
        } else {
          // Generic fallback match
          setExtractedStudent('Aarav Sharma');
          setDetectedConcerns(['General disengagement alert']);
          setSuggestedActions(['Class teacher standard check-in']);
        }
      }
      setIsProcessing(false);
    }, 1200);
  };

  const handleSaveObservation = () => {
    if (!extractedStudent) return;
    
    // Simulate updating database profile
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessSaved(true);
      
      // Reset
      setTranscription('');
      setExtractedStudent('');
      setDetectedConcerns([]);
      setSuggestedActions([]);
    }, 800);
  };

  return (
    <PageWrapper 
      title="Voice-AI Observation Intake" 
      subtitle="Speak comments in Hindi, English, or mixed language to update student profiles instantly"
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ACTIVE MIC & RECORDER */}
        <div className="xl:col-span-7 space-y-6">
          
          <div className="bg-white border border-[#E8DDD0] rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[380px]">
            
            {/* Waveform indicator */}
            {isRecording && (
              <div className="flex items-center gap-1 mb-6">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1.5 bg-[#C75B39] rounded-full animate-bounce" 
                    style={{ 
                      height: `${24 + Math.sin(i) * 16}px`,
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: '0.6s'
                    }} 
                  />
                ))}
              </div>
            )}

            <button
              onClick={handleToggleRecord}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse text-white' 
                  : 'bg-[#FFF8F0] hover:bg-[#FFF3E5] border border-[#E8DDD0] text-[#C75B39]'
              }`}
            >
              {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </button>

            <div className="mt-5 space-y-1">
              <h4 className="font-bold text-sm text-[#1A1A2E]">
                {isRecording ? 'Listening to voice...' : 'Press Mic to Record Observation'}
              </h4>
              <p className="text-xs text-[#6B7280]">
                {speechSupported 
                  ? 'Mix Hindi & English naturally (Hinglish supported)' 
                  : 'Speech API fallback active • Tap to simulate voice'
                }
              </p>
            </div>

            {/* Simulated success alert */}
            {successSaved && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-900 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#4A7C59]" /> Student profile updated successfully with new observations.
              </div>
            )}

          </div>

          {/* SIMULATED DEMO VOICE CARDS */}
          <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#6B7280]">Test Sample Pronouncers (Click to Simulate)</h4>
            <div className="grid gap-2.5">
              {sampleVoiceTexts.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(sample)}
                  className="p-3 bg-[#FAF7F2] hover:bg-[#FFF8F0] border border-[#E8DDD0] hover:border-[#C75B39]/40 rounded-xl text-left text-xs transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] bg-white border border-[#E8DDD0] px-1.5 py-0.5 rounded font-bold text-[#6B7280]">
                      {sample.lang}
                    </span>
                    <p className="font-medium text-[#1A1A2E] italic">"{sample.text}"</p>
                  </div>
                  <Play className="w-4 h-4 text-[#C75B39] group-hover:scale-110 transition-all flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: AI TRANSCRIBER & NLP EXTRACTOR */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* TEXT FIELD */}
          <div className="bg-white border border-[#E8DDD0] rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#6B7280] flex items-center gap-1">
              <FileText className="w-4 h-4" /> Live Transcript
            </h4>
            <div className="min-h-[100px] p-3.5 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-xs text-[#1A1A2E] leading-relaxed italic">
              {transcription || 'No active transcript recorded yet. Select a sample below or trigger mic recording.'}
            </div>
          </div>

          {/* AI EXTRACTOR */}
          <div className="bg-[#FFF8F0] border border-[#E8DDD0] rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#1A1A2E] flex items-center gap-1.5 border-b border-[#E8DDD0] pb-2.5">
              <BrainCircuit className="w-4 h-4 text-[#C75B39]" /> 
              AI Extraction & Entity Mapping
            </h4>

            {isProcessing ? (
              <div className="py-6 text-center text-xs text-[#6B7280] space-y-2">
                <div className="w-6 h-6 border-2 border-[#C75B39] border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Analyzing syntax & sentiment...</p>
              </div>
            ) : extractedStudent ? (
              <div className="space-y-4 text-xs">
                
                {/* Mapped Student */}
                <div className="flex justify-between items-center p-3 bg-white border border-[#E8DDD0] rounded-xl">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#C75B39]" />
                    <span className="font-semibold text-[#6B7280]">Identified Student:</span>
                  </div>
                  <span className="font-bold text-sm text-[#1A1A2E]">{extractedStudent}</span>
                </div>

                {/* Detected Concerns */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#6B7280] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#D4A843]" /> Mapped Risk Factors
                  </span>
                  <div className="grid gap-1">
                    {detectedConcerns.map((concern, idx) => (
                      <div key={idx} className="p-2 bg-white border border-[#E8DDD0] rounded-lg font-medium text-[#1A1A2E]">
                        {concern}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggested Actions */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#6B7280] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#4A7C59]" /> Suggested Interventions
                  </span>
                  <div className="grid gap-1">
                    {suggestedActions.map((action, idx) => (
                      <div key={idx} className="p-2 bg-white border border-[#E8DDD0] rounded-lg font-medium text-[#1A1A2E]">
                        {action}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save observation CTA */}
                <button
                  onClick={handleSaveObservation}
                  className="w-full py-2.5 bg-[#1A1A2E] hover:bg-[#C75B39] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <MessageSquarePlus className="w-4 h-4" /> Save to Student Profile
                </button>

              </div>
            ) : (
              <p className="text-xs text-[#6B7280] text-center py-6 italic">No entities extracted yet. Speak into the mic or click a test sample.</p>
            )}

          </div>

        </div>

      </div>
    </PageWrapper>
  );
}
