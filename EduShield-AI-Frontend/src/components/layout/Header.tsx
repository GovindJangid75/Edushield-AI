'use client';

import { Bell, Search, Calendar, AlertTriangle, Check, CheckCircle2, Eye, ShieldAlert, Loader2, Clock, Globe, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';
import { useLanguage } from '../../lib/LanguageContext';

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [role, setRole] = useState<'admin' | 'teacher' | 'parent' | 'ngo'>('admin');
  const [mounted, setMounted] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const { language, setLanguage, t, isOnline, isConnecting, showSyncToast } = useLanguage();

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getAlerts(undefined, false); // Get unread alerts
      
      // Load user details for filtering
      const savedRole = localStorage.getItem('userRole') || 'admin';
      const savedUserCode = localStorage.getItem('userCode') || '';
      
      let filtered = data;
      
      if (savedRole === 'parent') {
        // Load students to find their database ID / name
        const allStudents = await api.getStudents();
        const myChild = allStudents.find(s => s.id.toLowerCase() === savedUserCode.toLowerCase());
        if (myChild) {
          filtered = data.filter(a => 
            a.entity_id === myChild.dbId || 
            a.entity_id === myChild.id ||
            (a.message && a.message.toLowerCase().includes(myChild.name.toLowerCase())) ||
            (a.title && a.title.toLowerCase().includes(myChild.name.toLowerCase()))
          );
        } else {
          filtered = [];
        }
      } else if (savedRole === 'teacher') {
        // Only show alerts for Class 8
        const allStudents = await api.getStudents();
        const class8StudentIds = new Set(
          allStudents.filter(s => s.class === '8').map(s => s.id)
        );
        const class8StudentDbIds = new Set(
          allStudents.filter(s => s.class === '8' && s.dbId).map(s => s.dbId)
        );
        
        filtered = data.filter(a => 
          class8StudentIds.has(a.entity_id) || 
          class8StudentDbIds.has(a.entity_id) ||
          (a.entity_type === 'student' && allStudents.find(s => s.id === a.entity_id || s.dbId === a.entity_id)?.class === '8')
        );
      }
      
      setAlerts(filtered);
      setUnreadCount(filtered.length);
      setCriticalCount(filtered.filter(a => a.severity === 'critical').length);
    } catch (e) {
      console.error('Error fetching alerts in header:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const savedRole = localStorage.getItem('userRole') as any;
    if (savedRole) {
      setRole(savedRole);
    }

    fetchAlerts();

    // Set up polling interval (every 12 seconds)
    const interval = setInterval(fetchAlerts, 12000);

    // Listen for custom refetch-alerts events (triggered by file upload/simulations)
    const handleRefetch = () => {
      fetchAlerts();
    };

    // Listen for online sync events to refresh lists immediately
    window.addEventListener('online-sync', handleRefetch);
    window.addEventListener('refetch-alerts', handleRefetch);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online-sync', handleRefetch);
      window.removeEventListener('refetch-alerts', handleRefetch);
    };
  }, []);

  const handleMarkRead = async (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await api.markAlertRead(alertId);
    if (success) {
      fetchAlerts();
    }
  };

  const handleResolve = async (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await api.resolveAlert(alertId);
    if (success) {
      fetchAlerts();
    }
  };

  // Human readable time formatter
  const formatTime = (isoString: string) => {
    if (!isoString) return 'Just now';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} hours ago`;
    return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Urgent Flag calculation
  const getFlagText = () => {
    if (criticalCount > 0) return `${criticalCount} ${t('criticalAlerts')}`;
    if (unreadCount > 0) return `${unreadCount} ${t('activeAlerts')}`;
    return t('stableAlerts');
  };

  return (
    <>
      {/* Synchronization Success Toast */}
      <AnimatePresence>
        {showSyncToast && (
          <motion.div
            key="sync-success-toast"
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 16, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-1/2 z-50 bg-[#4A7C59] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2.5 border border-[#3E674A] text-sm font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{t('reconnected')}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Offline Resilience Banner */}
      {!isOnline && (
        <div className="bg-[#DC2626] text-white text-center py-1.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 shadow-inner z-50 sticky top-0">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>{t('offlineNotice')}</span>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-[#FAF7F2]/80 backdrop-blur-md border-b border-[#E8DDD0]">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Toggle (Mobile Only) */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => window.dispatchEvent(new Event('toggle-sidebar'))}
              className="md:hidden p-2 rounded-lg hover:bg-white border border-[#E8DDD0]/50 hover:border-[#E8DDD0] transition-all cursor-pointer"
              title="Toggle Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>

            <div>
              <h1 className="text-lg md:text-2xl font-bold font-[family-name:var(--font-heading)] text-[#1A1A2E] truncate max-w-[200px] sm:max-w-xs md:max-w-none">{title}</h1>
              {subtitle && <p className="text-[10px] md:text-sm text-[#6B7280] mt-0.5 hidden sm:block">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                className="w-48 lg:w-64 pl-10 pr-4 py-2 bg-white border border-[#E8DDD0] rounded-lg text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#C75B39]/20 focus:border-[#C75B39]/40 transition-all"
              />
            </div>

            {/* Date */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-[#6B7280] bg-white px-3 py-2 rounded-lg border border-[#E8DDD0]">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>

            {/* Multi-Language Switcher Pills */}
            <div className="flex items-center bg-white rounded-lg border border-[#E8DDD0] p-0.5 relative shadow-sm h-[38px]">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-md text-xs font-bold transition-all duration-150 cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#1A1A2E] text-white shadow-sm'
                    : 'text-[#6B7280] hover:text-[#1A1A2E]'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 rounded-md text-xs font-bold transition-all duration-150 cursor-pointer ${
                  language === 'hi'
                    ? 'bg-[#1A1A2E] text-white shadow-sm'
                    : 'text-[#6B7280] hover:text-[#1A1A2E]'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Connectivity Status Indicators */}
            <AnimatePresence>
              {!isOnline ? (
                <motion.div 
                  key="offline-status-badge"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-[#DC2626] border border-red-100 shadow-sm"
                  title={t('offlineNotice')}
                >
                  <WifiOff className="w-3.5 h-3.5 animate-pulse" />
                  <span className="hidden md:inline">{t('offlineMode')}</span>
                </motion.div>
              ) : null}
              {isConnecting ? (
                <motion.div 
                  key="connecting-status-badge"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden md:inline">Connecting...</span>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Notifications Bell */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-white border border-transparent hover:border-[#E8DDD0] transition-all cursor-pointer"
              >
                <Bell className="w-5 h-5 text-[#6B7280]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#DC2626] rounded-full animate-pulse" />
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    key="notifications-dropdown-panel"
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 w-80 md:w-96 bg-white rounded-xl shadow-lg border border-[#E8DDD0] overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-[#E8DDD0] flex items-center justify-between bg-[#FAF7F2]">
                      <h3 className="text-sm font-semibold text-[#1A1A2E] flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-[#C75B39]" /> {t('alertFeed')}
                      </h3>
                      <div className="flex items-center gap-2">
                        {loading && <Loader2 className="w-3.5 h-3.5 text-[#C75B39] animate-spin" />}
                        <span className="text-xs text-[#C75B39] font-bold px-2 py-0.5 rounded-full bg-[#FFF8F0] border border-[#E8DDD0]">
                          {unreadCount} {t('unreadAlerts')}
                        </span>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-[#E8DDD0]/40">
                      {alerts.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-400 space-y-1">
                          <CheckCircle2 className="w-8 h-8 text-[#4A7C59] mx-auto opacity-60" />
                          <p className="text-xs font-bold text-[#1A1A2E]">{t('allStable')}</p>
                        </div>
                      ) : (
                        alerts.map((notif) => (
                          <div
                            key={notif.id}
                            className={`px-4 py-3.5 hover:bg-[#FAF7F2]/50 transition-colors border-b border-[#E8DDD0]/30 last:border-0 relative ${
                              notif.severity === 'critical' ? 'border-l-4 border-l-[#DC2626]' :
                              notif.severity === 'high' ? 'border-l-4 border-l-[#EA580C]' : 'border-l-4 border-l-[#D4A843]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <p className="text-xs md:text-sm font-bold text-[#1A1A2E] leading-snug">{notif.title}</p>
                                <p className="text-xs text-gray-500 leading-snug">{notif.message}</p>
                                <p className="text-[10px] text-[#9CA3AF] flex items-center gap-1.5">
                                  <Clock className="w-3 h-3" /> {formatTime(notif.created_at)}
                                </p>
                              </div>
                              
                              {/* Action Buttons inside notification */}
                              <div className="flex flex-col gap-1.5">
                                <button
                                  onClick={(e) => handleMarkRead(notif.id, e)}
                                  title="Dismiss notification"
                                  className="p-1 rounded bg-gray-50 border border-[#E8DDD0] hover:bg-gray-100 hover:text-gray-900 text-gray-400 cursor-pointer text-[10px] flex items-center gap-1 font-bold"
                                >
                                  <Eye className="w-3 h-3" /> {t('markRead')}
                                </button>
                                <button
                                  onClick={(e) => handleResolve(notif.id, e)}
                                  title="Resolve action item"
                                  className="p-1 rounded bg-green-50 border border-green-200 hover:bg-green-100 text-green-700 cursor-pointer text-[10px] flex items-center gap-1 font-bold"
                                >
                                  <Check className="w-3 h-3" /> {t('resolve')}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Alert Count Badge */}
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold border transition-colors ${
                criticalCount > 0 
                  ? 'bg-[#FEF2F2] text-[#DC2626] border-red-200 animate-pulse' 
                  : unreadCount > 0
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-green-50 text-[#4A7C59] border-green-200'
              }`}
            >
              {criticalCount > 0 ? (
                <ShieldAlert className="w-3.5 h-3.5 text-[#DC2626]" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              <span>{getFlagText()}</span>
            </motion.div>
          </div>
        </div>
      </header>
    </>
  );
}
