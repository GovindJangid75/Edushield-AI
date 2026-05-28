'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ClipboardList,
  Heart,
  BarChart3,
  Mic,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { href: '/students', label: 'Student Intelligence', icon: Users },
  { href: '/interventions', label: 'Interventions', icon: ClipboardList },
  { href: '/teachers', label: 'Teacher Wellness', icon: Heart },
  { href: '/analytics', label: 'School Analytics', icon: BarChart3 },
  { href: '/voice', label: 'Voice Observations', icon: Mic },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-[#1A1A2E] text-white flex flex-col z-50"
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C75B39] to-[#D4A843] flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-base font-bold font-[family-name:var(--font-heading)] tracking-tight">EduShield AI</h1>
              <p className="text-[10px] text-white/50 leading-tight">Preventive Education Intelligence</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* School Info */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 border-b border-white/10"
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#D4A843]" />
              <div>
                <p className="text-xs font-medium text-white/90">Govt. Sr. Sec. School</p>
                <p className="text-[10px] text-white/40">Rajasthan • District Jaipur</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative',
                isActive
                  ? 'bg-white/12 text-white font-medium'
                  : 'text-white/60 hover:bg-white/8 hover:text-white/90'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#C75B39] rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-[#C75B39]' : 'text-white/50 group-hover:text-white/70')} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Role Badge */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-3 border-t border-white/10"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4A7C59] to-[#2C3E6B] flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/90 truncate">Admin User</p>
                <p className="text-[10px] text-white/40">School Administrator</p>
              </div>
              <Link href="/login" className="text-white/30 hover:text-white/60 transition-colors">
                <LogOut className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#1A1A2E] border border-white/20 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all z-50"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
}
