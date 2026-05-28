'use client';

import { Bell, Search, Calendar, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, type: 'critical', message: 'Ravi Kumar (8-A) marked critical — 3 consecutive absences', time: '5 min ago' },
    { id: 2, type: 'warning', message: 'Teacher Meenakshi Iyer burnout score exceeded 85%', time: '1 hour ago' },
    { id: 3, type: 'info', message: 'Intervention for Priya Sharma resolved successfully', time: '2 hours ago' },
    { id: 4, type: 'warning', message: '5 new hidden students detected this week', time: '3 hours ago' },
    { id: 5, type: 'info', message: 'Weekly school health report generated', time: '5 hours ago' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/80 backdrop-blur-md border-b border-[#E8DDD0]">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E]">{title}</h1>
          {subtitle && <p className="text-sm text-[#6B7280] mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search students, teachers..."
              className="w-64 pl-10 pr-4 py-2 bg-white border border-[#E8DDD0] rounded-lg text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#C75B39]/20 focus:border-[#C75B39]/40 transition-all"
            />
          </div>

          {/* Date */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-[#6B7280] bg-white px-3 py-2 rounded-lg border border-[#E8DDD0]">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-white border border-transparent hover:border-[#E8DDD0] transition-all"
            >
              <Bell className="w-5 h-5 text-[#6B7280]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#DC2626] rounded-full" />
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-lg border border-[#E8DDD0] overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-[#E8DDD0] flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#1A1A2E]">Notifications</h3>
                    <span className="text-xs text-[#C75B39] font-medium">3 new</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="px-4 py-3 hover:bg-[#FAF7F2] transition-colors border-b border-[#E8DDD0]/50 last:border-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                            notif.type === 'critical' ? 'bg-[#DC2626]' :
                            notif.type === 'warning' ? 'bg-[#D4A843]' : 'bg-[#4A7C59]'
                          }`} />
                          <div>
                            <p className="text-sm text-[#1A1A2E] leading-snug">{notif.message}</p>
                            <p className="text-xs text-[#9CA3AF] mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Alert Count */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF2F2] text-[#DC2626] rounded-lg text-sm font-medium">
            <AlertTriangle className="w-4 h-4" />
            <span>8 Urgent</span>
          </div>
        </div>
      </div>
    </header>
  );
}
