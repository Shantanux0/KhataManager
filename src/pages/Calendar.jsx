import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { fmt } from '../components/ui/index';

const HIGH_CREDIT_THRESHOLD = 800;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
function pad(n) {
  return String(n).padStart(2, '0');
}

export default function Calendar() {
  const navigate = useNavigate();
  const { state } = useKhata();
  const { entries, payments } = state;

  const todayDate = new Date('2026-06-29');
  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());

  // Build a map: dateStr → { totalCredit, totalPayments, transactions, customers }
  const dayMap = {};
  entries.forEach((e) => {
    if (!dayMap[e.date]) dayMap[e.date] = { totalCredit: 0, totalPayments: 0, transactions: 0, customerSet: new Set() };
    dayMap[e.date].totalCredit += e.amount;
    dayMap[e.date].transactions += 1;
    dayMap[e.date].customerSet.add(e.customerId);
  });
  payments.forEach((p) => {
    if (!dayMap[p.date]) dayMap[p.date] = { totalCredit: 0, totalPayments: 0, transactions: 0, customerSet: new Set() };
    dayMap[p.date].totalPayments += p.amount;
  });

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(todayDate.getDate())}`;
  const isCurrentMonth =
    viewYear === todayDate.getFullYear() && viewMonth === todayDate.getMonth();

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-text-primary">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Tap a date to view details</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="btn-ghost p-2">
            <ChevronLeft size={18} />
          </button>
          {!isCurrentMonth && (
            <button
              onClick={() => { setViewYear(todayDate.getFullYear()); setViewMonth(todayDate.getMonth()); }}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              Today
            </button>
          )}
          <button onClick={nextMonth} className="btn-ghost p-2">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-text-muted py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;

          const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
          const data = dayMap[dateStr];
          const isToday = dateStr === todayStr && isCurrentMonth;
          const isHighCredit = data && data.totalCredit >= HIGH_CREDIT_THRESHOLD;
          const hasData = !!data && data.totalCredit > 0;

          return (
            <button
              key={day}
              onClick={() => navigate(`/daily/${dateStr}`)}
              className={`
                relative flex flex-col items-center justify-start min-h-[68px] sm:min-h-[80px] md:min-h-[90px] rounded-xl p-1.5 text-left
                transition-all duration-150 active:scale-95 overflow-hidden
                ${isToday
                  ? 'bg-accent text-white ring-2 ring-accent ring-offset-1'
                  : isHighCredit
                    ? 'bg-accent/8 border border-accent/30 hover:bg-accent/12'
                    : hasData
                      ? 'bg-white border border-border hover:border-gray-300'
                      : 'hover:bg-gray-50'}
              `}
            >
              {/* Date number */}
              <span className={`text-xs font-bold mb-1 ${isToday ? 'text-white' : isHighCredit ? 'text-accent' : 'text-text-primary'}`}>
                {day}
              </span>

              {/* Data */}
              {data && data.totalCredit > 0 && (
                <>
                  <span className={`text-[10px] font-bold tabular-nums leading-tight ${isToday ? 'text-white/90' : isHighCredit ? 'text-accent' : 'text-text-primary'}`}>
                    {data.totalCredit >= 1000
                      ? `₹${(data.totalCredit / 1000).toFixed(1)}k`
                      : fmt(data.totalCredit)}
                  </span>
                  <div className={`flex items-center gap-1 mt-0.5 ${isToday ? 'text-white/70' : 'text-text-muted'}`}>
                    <span className="text-[9px]">{data.customerSet.size}c</span>
                    <span className="text-[9px]">·</span>
                    <span className="text-[9px]">{data.transactions}t</span>
                  </div>
                </>
              )}

              {/* Accent dot for high credit days */}
              {isHighCredit && !isToday && (
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend — wraps on small screens */}
      <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-accent" />
          <span className="text-[11px] text-text-muted">Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-accent/20 border border-accent/40" />
          <span className="text-[11px] text-text-muted">High credit day (&gt;{fmt(HIGH_CREDIT_THRESHOLD)})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-white border border-border" />
          <span className="text-[11px] text-text-muted">Has entries</span>
        </div>
        <div className="text-[11px] text-text-muted">c=customers, t=transactions</div>
      </div>
    </div>
  );
}
