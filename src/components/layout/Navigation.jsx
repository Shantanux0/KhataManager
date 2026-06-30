import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, BookOpen, Users, BarChart3, ChevronLeft, ChevronRight, Maximize2, Minimize2, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Daily Book', icon: BookOpen },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

// ── Desktop / Tablet Sidebar ────────────────────────────────────────────────
export function Sidebar({ onAddEntry, collapsed, onToggle }) {
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
    <aside
      className={`
        hidden md:flex flex-col shrink-0 bg-white border-r border-border h-[100dvh] sticky top-0
        transition-all duration-200
        ${collapsed ? 'w-[60px]' : 'w-56'}
      `}
    >
      {/* Logo + collapse toggle */}
      <div className={`flex items-center border-b border-border h-14 shrink-0 ${
        collapsed ? 'justify-center px-0' : 'px-4 gap-3'
      }`}>

        {/* Logo mark */}
        <img
          src="/logo.png"
          alt="khataManager Logo"
          className="w-8 h-8 rounded-lg object-cover shrink-0"
        />

        {/* Brand name */}
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div
              className="text-base font-black text-text-primary leading-none tracking-tight whitespace-nowrap"
              style={{ fontFamily: 'Roboto, sans-serif', letterSpacing: '-0.02em' }}
            >
              khata<span className="text-accent">Manager</span>
            </div>
            <div className="text-[10px] text-text-muted mt-0.5 truncate font-medium">Smart Digital Khata</div>
          </div>
        )}

        {/* Fullscreen Toggle (only shown when expanded on desktop) */}
        {!collapsed && (
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md hover:bg-gray-100 text-text-secondary hover:text-text-primary transition-colors shrink-0 ml-1"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        )}

        {/* Collapse toggle — lg+ only */}
        <button
          onClick={onToggle}
          className={`hidden lg:flex p-1 rounded-md hover:bg-gray-100 text-text-muted shrink-0 ${
            collapsed ? 'ml-0' : 'ml-auto'
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-lg transition-all duration-150 cursor-pointer select-none
               ${collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'}
               ${isActive
                 ? 'text-accent bg-accent/5 font-semibold' + (collapsed ? '' : ' border-l-2 border-accent')
                 : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary font-medium text-sm'
               }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={`shrink-0 ${isActive ? 'text-accent' : ''}`} />
                {!collapsed && <span className="text-sm truncate">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Fullscreen button when collapsed */}
      {collapsed && (
        <button
          onClick={toggleFullscreen}
          className="mx-auto mb-2 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-text-secondary hover:text-text-primary transition-colors shrink-0"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      )}

      {/* Logout button */}
      <button
        onClick={logout}
        className={`flex items-center text-red-600 hover:bg-red-50 transition-colors shrink-0 ${
          collapsed ? 'justify-center mx-auto mb-2 p-2 rounded-lg' : 'gap-3 px-5 py-3 border-t border-border'
        }`}
        title={collapsed ? 'Log out' : undefined}
      >
        <LogOut size={collapsed ? 15 : 17} className="shrink-0" />
        {!collapsed && <span className="text-sm font-medium">Log out</span>}
      </button>

      {/* Subtle footer branding */}
      {!collapsed && (
        <div className="px-4 pb-4 pt-2 border-t border-border shrink-0 bg-gray-50/50">
          <div
            className="text-[10px] text-text-muted text-center font-medium"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            by <span className="font-black text-text-secondary">DevShantanu</span>
          </div>
        </div>
      )}
    </aside>
  );
}

// ── Mobile Bottom Navigation ─────────────────────────────────────────────────
export function BottomNav({ onAddEntry }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-40 bottom-nav-safe">
      <div className="flex items-center justify-around px-1 py-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-0 flex-1 ${
                isActive ? 'text-accent' : 'text-text-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={19} className={isActive ? 'text-accent' : 'text-text-muted'} />
                <span className={`text-[9px] font-semibold truncate w-full text-center ${isActive ? 'text-accent' : 'text-text-muted'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
