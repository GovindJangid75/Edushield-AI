'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Sparkles, Building, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'admin' | 'teacher' | 'parent' | 'ngo'>('admin');
  const [schoolCode, setSchoolCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate authentication
    setTimeout(() => {
      if (schoolCode && password) {
        // Redirect to dashboard (in this mock-up, any valid input redirects)
        router.push('/dashboard');
      } else {
        setError('Please fill in all fields. (Use any mock details for demo)');
        setIsLoading(false);
      }
    }, 800);
  };

  const fillMockDetails = () => {
    setSchoolCode('RJ-JPR-2026');
    setPassword('••••••••');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1A2E] flex flex-col justify-between relative overflow-hidden paper-texture">
      {/* Muted background shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#FFF8F0] -z-10 blur-3xl opacity-60" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#A8D5BA]/10 -z-10 blur-3xl opacity-60" />

      {/* Header */}
      <div className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C75B39] to-[#D4A843] flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-[family-name:var(--font-heading)] leading-none tracking-tight">EduShield AI</h1>
            <span className="text-[10px] text-[#6B7280]">AI Copilot for Early School Intervention</span>
          </div>
        </div>
        <div className="text-xs text-[#6B7280] font-medium hidden sm:block">
          Support: <span className="text-[#C75B39]">support@edushield.ai</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl grid md:grid-cols-12 gap-8 items-center">
          
          {/* Brand/Info Column */}
          <div className="md:col-span-7 space-y-6 text-left pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFF8F0] border border-[#E8DDD0] rounded-full text-xs font-semibold text-[#C75B39]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Track 2.6: AI-Powered Preventive Education Intelligence</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-extrabold font-[family-name:var(--font-heading)] text-[#1A1A2E] leading-tight">
              Identify student risk <span className="text-[#C75B39]">before</span> failure.
            </h2>
            
            <p className="text-[#6B7280] text-base leading-relaxed max-w-lg">
              EduShield AI acts as an early warning copilot, detecting silent dropout signals, identifying overlooked students, and protecting teacher workload in low-resource and government schools across India.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-white border border-[#E8DDD0] rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FEF2F2] flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-[#DC2626]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#1A1A2E]">Explainable AI</h4>
                  <p className="text-xs text-[#6B7280] mt-0.5">Transparent dropout & engagement predictions.</p>
                </div>
              </div>
              <div className="p-4 bg-white border border-[#E8DDD0] rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-4 h-4 text-[#4A7C59]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#1A1A2E]">Triage Intervention</h4>
                  <p className="text-xs text-[#6B7280] mt-0.5">Actionable steps built for Indian public schools.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="md:col-span-5">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-[#E8DDD0] rounded-2xl shadow-sm p-8 relative"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">School Portal Login</h3>
                <p className="text-xs text-[#6B7280] mt-1">Select your access role to enter the dashboard</p>
              </div>

              {/* Role Selectors */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {(['admin', 'teacher', 'parent', 'ngo'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-1 rounded-lg text-xs font-semibold capitalize border transition-all duration-200 ${
                      role === r
                        ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]'
                        : 'bg-[#FAF7F2] text-[#6B7280] border-[#E8DDD0] hover:bg-[#FFF8F0] hover:text-[#1A1A2E]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-[#6B7280]" />
                    {role === 'parent' ? 'Student Admission ID' : role === 'ngo' ? 'District / NGO ID' : 'School Code / UDISE Code'}
                  </label>
                  <input
                    type="text"
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value)}
                    placeholder={role === 'parent' ? 'e.g. STU-001' : role === 'ngo' ? 'e.g. NGO-WEST-01' : 'e.g. RJ-JPR-2026'}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C75B39]/20 focus:border-[#C75B39]/40 transition-all text-[#1A1A2E]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A2E] mb-1.5 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-[#6B7280]" />
                    Portal Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DDD0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C75B39]/20 focus:border-[#C75B39]/40 transition-all text-[#1A1A2E]"
                    required
                  />
                </div>

                {error && (
                  <p className="text-xs text-[#DC2626] font-medium bg-[#FEF2F2] p-2.5 rounded-lg border border-[#DC2626]/10">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#C75B39] hover:bg-[#A94A2D] disabled:bg-[#C75B39]/60 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 group mt-2 cursor-pointer"
                >
                  {isLoading ? 'Verifying access...' : 'Access Dashboard'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              {/* Demo Assist */}
              <div className="mt-5 pt-4 border-t border-[#E8DDD0] text-center">
                <button
                  type="button"
                  onClick={fillMockDetails}
                  className="text-xs text-[#C75B39] hover:underline font-semibold"
                >
                  Quick Fill Demo Details
                </button>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="w-full border-t border-[#E8DDD0] py-6 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B7280]">
          <div>
            <span>Designed for state boards & low-resource environments.</span>
            <span className="font-semibold text-[#4A7C59] ml-2">Offline-first support enabled.</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">UDISE Integration</span>
            <span className="hover:underline cursor-pointer">Responsible AI Guidelines</span>
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
