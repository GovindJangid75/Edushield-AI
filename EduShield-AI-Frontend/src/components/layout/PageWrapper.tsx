'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { motion } from 'framer-motion';

interface PageWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function PageWrapper({ children, title, subtitle }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1A2E] flex">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col md:pl-[260px] pl-[72px] transition-all duration-300">
        <Header title={title} subtitle={subtitle} />
        
        <motion.main 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex-grow p-6 md:p-8 paper-texture"
        >
          {children}
        </motion.main>

        <footer className="py-6 px-8 border-t border-[#E8DDD0] text-center text-xs text-[#6B7280] bg-[#FAF7F2]/50">
          <p>© {new Date().getFullYear()} EduShield AI • AI-Powered Preventive Education Intelligence Infrastructure for Indian Schools.</p>
        </footer>
      </div>
    </div>
  );
}
