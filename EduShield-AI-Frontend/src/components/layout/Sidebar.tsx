'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Upload,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../lib/LanguageContext';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState<'admin' | 'teacher' | 'parent' | 'ngo'>('admin');
  const [mounted, setMounted] = useState(false);

  const { t, language } = useTranslation();

  useEffect(() => {
    setMounted(true);
    
    // Read active role and credentials
    const savedRole = localStorage.getItem('userRole') as any;
    if (savedRole) {
      setRole(savedRole);
    }

    // Toggle event listener for mobile hamburger drawer
    const handleToggle = () => setMobileOpen(prev => !prev);
    const handleClose = () => setMobileOpen(false);
    
    window.addEventListener('toggle-sidebar', handleToggle);
    window.addEventListener('close-sidebar', handleClose);
    
    return () => {
      window.removeEventListener('toggle-sidebar', handleToggle);
      window.removeEventListener('close-sidebar', handleClose);
    };
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('userRole');
    localStorage.removeItem('userCode');
    router.push('/');
  };

  if (!mounted) {
    return (
      <aside className="fixed left-0 top-0 h-screen w-[260px] bg-[#1A1A2E] text-white flex flex-col z-50">
        <div className="p-4 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-[#C75B39] flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold">EduShield AI</h1>
          </div>
        </div>
      </aside>
    );
  }

  // Define navigation items dynamically per role
  const getNavItems = () => {
    switch (role) {
      case 'parent':
        return [
          { href: '/dashboard', label: language === 'hi' ? 'रवि की प्रगति' : 'Ravi\'s Progress', icon: LayoutDashboard },
          { href: '/students/STU-001', label: language === 'hi' ? 'एआई जोखिम प्रोफ़ाइल' : 'AI Risk Profile', icon: Users },
          { href: '/interventions', label: language === 'hi' ? 'देखभाल कार्य' : 'Care Actions', icon: ClipboardList },
          { href: '/voice', label: language === 'hi' ? 'परामर्शदाता नोट्स' : 'Counselor Notes', icon: Mic },
        ];
      case 'ngo':
        return [
          { href: '/dashboard', label: language === 'hi' ? 'जिला ऑडिट' : 'District Audit', icon: LayoutDashboard },
          { href: '/analytics', label: language === 'hi' ? 'स्कूल तुलना' : 'School Comparisons', icon: BarChart3 },
          { href: '/teachers', label: language === 'hi' ? 'शिक्षक बर्नआउट हीटमैप' : 'Teacher Burnout Heatmap', icon: Heart },
        ];
      case 'teacher':
        return [
          { href: '/dashboard', label: language === 'hi' ? 'कक्षा सह-पायलट' : 'Classroom Copilot', icon: LayoutDashboard },
          { href: '/students', label: language === 'hi' ? 'कक्षा 8-A के छात्र' : 'Class 8-A Students', icon: Users },
          { href: '/upload', label: t('navUpload'), icon: Upload },
          { href: '/interventions', label: language === 'hi' ? 'हस्तक्षेप लॉग' : 'Interventions Log', icon: ClipboardList },
          { href: '/voice', label: language === 'hi' ? 'वॉयस नोट्स' : 'Voice Notes', icon: Mic },
        ];
      case 'admin':
      default:
        return [
          { href: '/dashboard', label: language === 'hi' ? 'कमांड सेंटर' : 'Command Center', icon: LayoutDashboard },
          { href: '/students', label: t('navStudents'), icon: Users },
          { href: '/upload', label: t('navUpload'), icon: Upload },
          { href: '/interventions', label: t('navInterventions'), icon: ClipboardList },
          { href: '/teachers', label: t('navTeachers'), icon: Heart },
          { href: '/analytics', label: t('navAnalytics'), icon: BarChart3 },
          { href: '/voice', label: t('navVoice'), icon: Mic },
        ];
    }
  };

  const navItems = getNavItems();

  // Get user card metadata dynamically per role
  const getRoleInfo = () => {
    switch (role) {
      case 'teacher':
        return {
          name: language === 'hi' ? 'मीनाक्षी शर्मा' : 'Meenakshi Sharma',
          title: language === 'hi' ? 'कक्षा शिक्षक (8-A)' : 'Class Teacher (8-A)',
          school: language === 'hi' ? 'राजकीय उ. मा. विद्यालय' : 'Govt. Sr. Sec. School',
          region: language === 'hi' ? 'कक्षा 8-A लीड • जयपुर' : 'Class 8-A Lead • Jaipur',
        };
      case 'parent':
        return {
          name: language === 'hi' ? 'सुनीता कुमार' : 'Sunita Kumar',
          title: language === 'hi' ? 'रवि कुमार की माता' : 'Parent of Ravi Kumar',
          school: language === 'hi' ? 'रवि कुमार (कक्षा 8-A)' : 'Ravi Kumar (Class 8-A)',
          region: language === 'hi' ? 'अभिभावक पोर्टल' : 'Guardian Portal',
        };
      case 'ngo':
        return {
          name: language === 'hi' ? 'जयपुर प्रेक्षक' : 'Jaipur Observer',
          title: language === 'hi' ? 'एनजीओ समन्वयक' : 'NGO Coordinator',
          school: language === 'hi' ? 'जयपुर पब्लिक स्कूल' : 'Jaipur Public Schools',
          region: language === 'hi' ? 'निगरानी क्षेत्र' : 'Monitored Region',
        };
      case 'admin':
      default:
        return {
          name: language === 'hi' ? 'एडमिन उपयोगकर्ता' : 'Admin User',
          title: language === 'hi' ? 'स्कूल प्रशासक' : 'School Administrator',
          school: language === 'hi' ? 'राजकीय उ. मा. विद्यालय' : 'Govt. Sr. Sec. School',
          region: language === 'hi' ? 'राजस्थान • जयपुर' : 'Rajasthan • Jaipur',
        };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-[#0c0c16]/60 backdrop-blur-xs z-40 md:hidden transition-all duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <motion.aside
        animate={{ 
          width: collapsed ? 72 : 260,
          x: mobileOpen ? 0 : undefined
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={cn(
          "fixed left-0 top-0 h-screen bg-[#1A1A2E] text-white flex flex-col z-50 transition-transform duration-300 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C75B39] to-[#D4A843] flex items-center justify-center flex-shrink-0 shadow-md">
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
                <p className="text-[10px] text-white/50 leading-tight">{t('brandTag')}</p>
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
                  <p className="text-xs font-semibold text-white/90 truncate max-w-[190px]">{roleInfo.school}</p>
                  <p className="text-[10px] text-white/40">{roleInfo.region}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block"
              >
                <motion.div
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group relative cursor-pointer',
                    isActive
                      ? 'bg-white/12 text-white font-medium shadow-xs'
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
                  <Icon className={cn('w-5 h-5 flex-shrink-0 transition-colors', isActive ? 'text-[#C75B39]' : 'text-white/50 group-hover:text-white/70')} />
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
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Role Badge / User panel at bottom */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-3 border-t border-white/10 bg-[#161626]"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4A7C59] to-[#2C3E6B] flex items-center justify-center flex-shrink-0 shadow-xs">
                  <UserCheck className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white/90 truncate">{roleInfo.name}</p>
                  <p className="text-[10px] text-white/40 truncate">{roleInfo.title}</p>
                </div>
                <motion.button 
                  onClick={handleLogout} 
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-white/30 hover:text-red-400 transition-colors cursor-pointer p-1 rounded hover:bg-white/5"
                  title={t('navLogout')}
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse Button (Desktop Only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-[#1A1A2E] border border-white/20 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all z-50 hidden md:flex cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>
    </>
  );
}
