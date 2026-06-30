import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Plus, Maximize2, Minimize2, LogOut } from 'lucide-react';
import { Sidebar, BottomNav } from './Navigation';
import { useAuth } from '../../context/AuthContext';
import QuickAddEntry from '../shared/QuickAddEntry';

export default function AppShell() {
  const [addEntryOpen, setAddEntryOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Error exiting fullscreen:', err);
      });
    }
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-bg">
      {/* Sidebar — hidden on mobile, icon-only on tablet (md), full on lg */}
      <Sidebar
        onAddEntry={() => setAddEntryOpen(true)}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar — only below md */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="khataManager Logo"
              className="w-8 h-8 rounded-lg object-cover shrink-0"
            />
            <div className="leading-none">
              <div
                className="text-sm font-black text-text-primary tracking-tight"
                style={{ fontFamily: 'Roboto, sans-serif', letterSpacing: '-0.02em' }}
              >
                khata<span className="text-accent">Manager</span>
              </div>
              <div className="text-[9px] text-text-muted font-medium mt-0.5">Smart Digital Khata</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors shrink-0"
              title="Log out"
            >
              <LogOut size={16} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-gray-100 text-text-secondary hover:text-text-primary transition-colors shrink-0"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button onClick={() => setAddEntryOpen(true)} className="btn-primary py-1.5 px-3 text-xs shrink-0">
              <Plus size={13} />
              Add Entry
            </button>
          </div>
        </header>

        {/* Page content — bottom padding accounts for mobile bottom nav */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet context={{ openAddEntry: () => setAddEntryOpen(true) }} />
        </main>
      </div>

      {/* Bottom nav — only on mobile */}
      <BottomNav onAddEntry={() => setAddEntryOpen(true)} />

      {/* Quick Add Entry Modal */}
      <QuickAddEntry isOpen={addEntryOpen} onClose={() => setAddEntryOpen(false)} />
    </div>
  );
}
