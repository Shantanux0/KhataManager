// Reusable UI Primitives — Modal, StatCard, Badge

// ─── Modal ────────────────────────────────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[size] || 'max-w-md';

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-start justify-center p-0 sm:pt-24 sm:px-4 sm:pb-4 modal-backdrop"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className={`relative w-full ${sizeClass} bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-border animate-slide-up`}
        style={{ animation: 'slideUp 0.2s ease-out' }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-bold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[calc(100dvh-120px)] overflow-y-auto">{children}</div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────
export function StatCard({ label, value, subtext, accent = false, icon: Icon }) {
  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="stat-label">{label}</span>
        {Icon && (
          <div className={`p-1.5 rounded-lg ${accent ? 'bg-accent/10' : 'bg-gray-100'}`}>
            <Icon size={14} className={accent ? 'text-accent' : 'text-text-muted'} />
          </div>
        )}
      </div>
      <div className={`stat-value ${accent ? 'text-accent' : ''}`}>{value}</div>
      {subtext && <div className="text-xs text-text-muted">{subtext}</div>}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────
export function Badge({ variant = 'gray', children }) {
  const cls = {
    overdue: 'badge-overdue',
    paid: 'badge-paid',
    gray: 'badge-gray',
  }[variant] || 'badge-gray';
  return <span className={cls}>{children}</span>;
}

// ─── Rupee formatter ──────────────────────────────────────────────────────
export function fmt(amount) {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
}

// ─── Date formatter ───────────────────────────────────────────────────────
export function fmtDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function fmtTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function fmtShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ─── Addition string builder ───────────────────────────────────────────────
// Given entries for a customer on a day, returns "10 + 80 + 30 = ₹120"
export function buildAdditionString(dayEntries) {
  if (!dayEntries.length) return '';
  const sorted = [...dayEntries].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const amounts = sorted.map((e) => e.amount);
  const total = amounts.reduce((s, a) => s + a, 0);
  if (amounts.length === 1) return `₹${total.toLocaleString('en-IN')}`;
  return amounts.join(' + ') + ` = ₹${total.toLocaleString('en-IN')}`;
}

// ─── Empty state ──────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      {Icon && (
        <div className="p-4 rounded-full bg-gray-100 mb-4">
          <Icon size={24} className="text-text-muted" />
        </div>
      )}
      <div className="text-sm font-semibold text-text-primary mb-1">{title}</div>
      {subtitle && <div className="text-xs text-text-muted max-w-xs">{subtitle}</div>}
    </div>
  );
}
