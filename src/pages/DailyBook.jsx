import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen, CalendarDays, Plus, Check, Search, X, UserPlus, PanelRightOpen, PanelRightClose, IndianRupee } from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { useCustomers } from '../hooks/useCustomers';
import { fmt, fmtDate, fmtTime } from '../components/ui/index';

const TODAY = '2026-06-29';

function dateStr(date) {
  return date.toISOString().split('T')[0];
}
function shiftDate(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}
function pad(n) {
  return String(n).padStart(2, '0');
}
function formatDayHeader(dateString) {
  const d = new Date(dateString);
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return { dayName: weekdays[d.getDay()], day: d.getDate(), month: months[d.getMonth()], year: d.getFullYear() };
}

// ── Quick Entry Sidebar ──────────────────────────────────────────────────────
function QuickEntrySidebar({ currentDateStr, onClose, isMobile, preSelectedCustomer }) {
  const { dispatch, state } = useKhata();
  const customers = useCustomers();

  const [nameInput, setNameInput] = useState('');
  const [amount, setAmount] = useState('');
  const [matched, setMatched] = useState(null);       // existing customer matched
  const [isNew, setIsNew] = useState(false);           // new customer flag
  const [saved, setSaved] = useState(null);            // { name, amount }
  const [showDropdown, setShowDropdown] = useState(false);

  const nameRef = useRef(null);
  const amountRef = useRef(null);

  useEffect(() => {
    setTimeout(() => nameRef.current?.focus(), 150);
  }, []);

  // Sync pre-selected customer when clicked in the daily book ledger
  useEffect(() => {
    if (preSelectedCustomer) {
      setNameInput(preSelectedCustomer.name);
      setMatched(preSelectedCustomer);
      setIsNew(false);
      setShowDropdown(false);
      setAmount(''); // Reset amount field for new transaction
      setTimeout(() => amountRef.current?.focus(), 150);
    }
  }, [preSelectedCustomer]);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!nameInput.trim()) return [];
    const q = nameInput.toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.mobile && c.mobile.includes(q))
    ).slice(0, 6);
  }, [nameInput, customers]);

  // Auto-match exact (case-insensitive)
  useEffect(() => {
    if (!nameInput.trim()) { setMatched(null); setIsNew(false); return; }
    const exact = customers.find((c) => c.name.toLowerCase() === nameInput.trim().toLowerCase());
    if (exact) { setMatched(exact); setIsNew(false); }
    else { setMatched(null); setIsNew(true); }
  }, [nameInput, customers]);

  // Today's existing entries for the matched customer
  const todayEntries = useMemo(() => {
    if (!matched) return [];
    return state.entries.filter((e) => e.customerId === matched.id && e.date === currentDateStr);
  }, [matched, state.entries, currentDateStr]);

  const todayTotal = todayEntries.reduce((s, e) => s + e.amount, 0);
  const parsedAmount = parseInt(amount, 10) || 0;

  function handleSelectSuggestion(c) {
    setNameInput(c.name);
    setMatched(c);
    setIsNew(false);
    setShowDropdown(false);
    setTimeout(() => amountRef.current?.focus(), 80);
  }

  function handleSave() {
    if (!nameInput.trim() || !parsedAmount) return;

    let customerId;

    if (matched) {
      customerId = matched.id;
    } else {
      // Create new customer on the fly
      const newCustomer = {
        id: `c${Date.now()}`,
        name: nameInput.trim(),
        mobile: '',
        address: '',
        notes: '',
        paymentCycle: 'monthly',
        createdAt: currentDateStr,
      };
      dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
      customerId = newCustomer.id;
    }

    const entry = {
      id: `e${Date.now()}`,
      customerId,
      date: currentDateStr,
      amount: parsedAmount,
      timestamp: new Date().toISOString(),
      type: 'credit',
      note: '',
    };
    dispatch({ type: 'ADD_ENTRY', payload: entry });

    setSaved({ name: nameInput.trim(), amount: parsedAmount });
    setTimeout(() => {
      setSaved(null);
      setNameInput('');
      setAmount('');
      setMatched(null);
      setIsNew(false);
      nameRef.current?.focus();
    }, 1000);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      if (document.activeElement === nameRef.current && suggestions.length === 1) {
        handleSelectSuggestion(suggestions[0]);
      } else if (parsedAmount > 0) {
        handleSave();
      }
    }
    if (e.key === 'Escape') setShowDropdown(false);
  }

  const containerCls = isMobile
    ? 'w-full border-t border-[#d0c9be] bg-[#FDFAF5]'
    : 'w-72 shrink-0 border-l border-[#d0c9be] bg-[#FDFAF5] h-full flex flex-col sticky top-0';

  return (
    <div className={containerCls}>
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#d0c9be] bg-[#f0ebe2]">
        <div className="flex items-center gap-2">
          <Plus size={14} className="text-accent" />
          <span className="text-xs font-black text-[#4a4035] uppercase tracking-wider">Quick Entry</span>
        </div>
        {isMobile && (
          <button onClick={onClose} className="p-1 rounded hover:bg-[#e8e0d5] text-[#7a6e5e]">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col gap-4 flex-1 overflow-y-auto">

        {/* Saved confirmation flash */}
        {saved && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5 animate-pulse">
            <Check size={14} className="text-green-600 shrink-0" />
            <div className="text-xs">
              <div className="font-bold text-green-700">{fmt(saved.amount)} saved!</div>
              <div className="text-green-600">{saved.name}</div>
            </div>
          </div>
        )}

        {/* Customer name field */}
        <div className="relative">
          <label className="text-[10px] font-bold text-[#7a6e5e] uppercase tracking-wider mb-1.5 block">
            Customer Name
          </label>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a09888]" />
            <input
              ref={nameRef}
              type="text"
              className="w-full pl-8 pr-3 py-2.5 text-sm bg-white border border-[#d0c9be] rounded-lg outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-[#b0a898] text-[#1a1a1a]"
              placeholder="Type name or mobile…"
              value={nameInput}
              onChange={(e) => { setNameInput(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            {nameInput && (
              <button
                onClick={() => { setNameInput(''); setMatched(null); setIsNew(false); nameRef.current?.focus(); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#b0a898] hover:text-[#7a6e5e]"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Dropdown suggestions */}
          {showDropdown && suggestions.length > 0 && !matched && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#d0c9be] rounded-xl shadow-xl z-30 overflow-hidden">
              {suggestions.map((c) => {
                const todayAmt = state.entries
                  .filter((e) => e.customerId === c.id && e.date === currentDateStr)
                  .reduce((s, e) => s + e.amount, 0);
                return (
                  <button
                    key={c.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectSuggestion(c)}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#f0ebe2] text-left border-b border-[#ece7de] last:border-b-0 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-[#1a1a1a]">{c.name}</div>
                      {c.mobile && <div className="text-[10px] text-[#a09888]">{c.mobile}</div>}
                    </div>
                    <div className="text-right">
                      {todayAmt > 0 && (
                        <div className="text-[10px] font-bold text-accent">{fmt(todayAmt)} today</div>
                      )}
                      {c.outstanding > 0 && (
                        <div className="text-[10px] text-[#a09888]">{fmt(c.outstanding)} due</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Status pill: matched / new */}
        {nameInput.trim() && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
            matched
              ? 'bg-green-50 border border-green-100 text-green-700'
              : 'bg-[#fff8f0] border border-amber-100 text-amber-700'
          }`}>
            {matched ? (
              <>
                <Check size={12} />
                Existing customer
                {matched.outstanding > 0 && (
                  <span className="ml-auto font-normal text-[10px] text-[#a09888]">
                    {fmt(matched.outstanding)} due
                  </span>
                )}
              </>
            ) : (
              <>
                <UserPlus size={12} />
                Will create new customer
              </>
            )}
          </div>
        )}

        {/* Today's running total for matched customer */}
        {matched && todayEntries.length > 0 && (
          <div className="bg-[#f0ebe2] border border-[#d0c9be] rounded-xl px-3 py-2.5">
            <div className="text-[10px] text-[#7a6e5e] font-bold uppercase tracking-wider mb-1">Today so far</div>
            <div className="text-xs font-mono text-[#4a4035] tabular-nums">
              {todayEntries.map((e) => e.amount).join(' + ')}
              {parsedAmount > 0 && <span className="text-accent"> + {parsedAmount}</span>}
              {' = '}
              <span className={`font-black ${parsedAmount > 0 ? 'text-accent' : 'text-[#1a1a1a]'}`}>
                {fmt(todayTotal + parsedAmount)}
              </span>
            </div>
          </div>
        )}

        {/* Amount field */}
        <div>
          <label className="text-[10px] font-bold text-[#7a6e5e] uppercase tracking-wider mb-1.5 block">
            Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-light text-[#a09888]">₹</span>
            <input
              ref={amountRef}
              type="number"
              inputMode="numeric"
              min="1"
              className="w-full pl-8 pr-3 py-3 text-2xl font-black text-[#1a1a1a] bg-white border-2 border-[#d0c9be] rounded-xl outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all tabular-nums"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          {/* Quick amount add buttons */}
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {[50, 100, 200, 500].map((v) => (
              <button
                key={v}
                onClick={() => setAmount(String((parseInt(amount) || 0) + v))}
                className="py-1.5 text-[11px] font-bold text-[#4a4035] bg-[#f0ebe2] rounded-lg hover:bg-[#e8e0d5] active:scale-95 transition-all"
              >
                +{v}
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!nameInput.trim() || !parsedAmount}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-black text-white bg-accent rounded-xl hover:bg-accent-hover active:scale-95 transition-all disabled:opacity-35 disabled:cursor-not-allowed"
        >
          <Check size={15} />
          {parsedAmount > 0 ? `Save ${fmt(parsedAmount)}` : 'Save Entry'}
        </button>

        {/* Hint */}
        <p className="text-[10px] text-[#b0a898] text-center leading-relaxed">
          Press <kbd className="px-1 py-0.5 bg-[#e8e0d5] rounded text-[9px] font-mono">Enter</kbd> to save · New customers are created automatically
        </p>

        {/* ── Divider ── */}
        <div className="flex items-center gap-2 pt-1">
          <div className="flex-1 h-px bg-[#d0c9be]" />
          <span className="text-[9px] font-black text-[#a09888] uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-[#d0c9be]" />
        </div>

        {/* ── Quick Paid section ── */}
        <QuickPaidSection currentDateStr={currentDateStr} />

      </div>
    </div>
  );
}

// ── Quick Paid Section ───────────────────────────────────────────────────────
function QuickPaidSection({ currentDateStr }) {
  const { dispatch, state } = useKhata();
  const customers = useCustomers();

  const [nameInput, setNameInput] = useState('');
  const [amount, setAmount] = useState('');
  const [matched, setMatched] = useState(null);
  const [savedPayment, setSavedPayment] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const nameRef = useRef(null);
  const amountRef = useRef(null);

  // Autocomplete suggestions — only existing customers (can't pay for a non-existent customer)
  const suggestions = useMemo(() => {
    if (!nameInput.trim()) return [];
    const q = nameInput.toLowerCase();
    return customers
      .filter((c) => c.name.toLowerCase().includes(q) || (c.mobile && c.mobile.includes(q)))
      .filter((c) => c.outstanding > 0)   // only show customers who owe money
      .slice(0, 6);
  }, [nameInput, customers]);

  // Auto-match
  useEffect(() => {
    if (!nameInput.trim()) { setMatched(null); return; }
    const exact = customers.find((c) => c.name.toLowerCase() === nameInput.trim().toLowerCase());
    setMatched(exact || null);
  }, [nameInput, customers]);

  const parsedAmount = parseInt(amount, 10) || 0;
  const remaining = matched ? Math.max(0, matched.outstanding - parsedAmount) : null;

  function handleSelectSuggestion(c) {
    setNameInput(c.name);
    setMatched(c);
    setShowDropdown(false);
    setTimeout(() => amountRef.current?.focus(), 80);
  }

  function handleSavePayment() {
    if (!matched || !parsedAmount) return;
    dispatch({
      type: 'ADD_PAYMENT',
      payload: {
        id: `p${Date.now()}`,
        customerId: matched.id,
        amount: parsedAmount,
        date: currentDateStr,
        timestamp: new Date().toISOString(),
        type: 'payment',
        note: 'Cash payment received',
      },
    });
    setSavedPayment({ name: matched.name, amount: parsedAmount });
    setTimeout(() => {
      setSavedPayment(null);
      setNameInput('');
      setAmount('');
      setMatched(null);
      nameRef.current?.focus();
    }, 1100);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      if (document.activeElement === nameRef.current && suggestions.length === 1) {
        handleSelectSuggestion(suggestions[0]);
      } else if (parsedAmount > 0 && matched) {
        handleSavePayment();
      }
    }
    if (e.key === 'Escape') setShowDropdown(false);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Section label */}
      <div className="flex items-center gap-2">
        <IndianRupee size={13} className="text-green-600" />
        <span className="text-xs font-black text-[#4a4035] uppercase tracking-wider">Quick Paid</span>
      </div>

      {/* Payment saved flash */}
      {savedPayment && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
          <Check size={14} className="text-green-600 shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-green-700">{fmt(savedPayment.amount)} received!</div>
            <div className="text-green-600">{savedPayment.name}</div>
          </div>
        </div>
      )}

      {/* Customer name */}
      <div className="relative">
        <label className="text-[10px] font-bold text-[#7a6e5e] uppercase tracking-wider mb-1.5 block">
          Customer Name
        </label>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a09888]" />
          <input
            ref={nameRef}
            type="text"
            className="w-full pl-8 pr-3 py-2.5 text-sm bg-white border border-[#d0c9be] rounded-lg outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-500 transition-all placeholder:text-[#b0a898] text-[#1a1a1a]"
            placeholder="Who paid today?"
            value={nameInput}
            onChange={(e) => { setNameInput(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          {nameInput && (
            <button
              onClick={() => { setNameInput(''); setMatched(null); nameRef.current?.focus(); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#b0a898] hover:text-[#7a6e5e]"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#d0c9be] rounded-xl shadow-xl z-30 overflow-hidden">
            {suggestions.map((c) => (
              <button
                key={c.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelectSuggestion(c)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-green-50 text-left border-b border-[#ece7de] last:border-b-0 transition-colors"
              >
                <div>
                  <div className="text-sm font-semibold text-[#1a1a1a]">{c.name}</div>
                  {c.mobile && <div className="text-[10px] text-[#a09888]">{c.mobile}</div>}
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-accent">{fmt(c.outstanding)} due</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Outstanding balance display */}
      {matched && (
        <div className="bg-white border border-[#d0c9be] rounded-xl px-3 py-2.5 flex items-center justify-between">
          <span className="text-[10px] text-[#7a6e5e] font-bold uppercase tracking-wider">Outstanding</span>
          <span className={`text-sm font-black tabular-nums ${matched.outstanding > 0 ? 'text-accent' : 'text-green-600'}`}>
            {fmt(matched.outstanding)}
          </span>
        </div>
      )}

      {/* Amount */}
      <div>
        <label className="text-[10px] font-bold text-[#7a6e5e] uppercase tracking-wider mb-1.5 block">
          Amount Received (₹)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-light text-[#a09888]">₹</span>
          <input
            ref={amountRef}
            type="number"
            inputMode="numeric"
            min="1"
            className="w-full pl-8 pr-3 py-3 text-2xl font-black text-[#1a1a1a] bg-white border-2 border-[#d0c9be] rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-400/20 transition-all tabular-nums"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        {/* Quick amount buttons */}
        <div className="grid grid-cols-4 gap-1.5 mt-2">
          {[100, 200, 500, 1000].map((v) => (
            <button
              key={v}
              onClick={() => {
                const base = parseInt(amount) || 0;
                // Cap at outstanding if customer is matched
                const newVal = matched ? Math.min(matched.outstanding, base + v) : base + v;
                setAmount(String(newVal));
              }}
              className="py-1.5 text-[11px] font-bold text-green-700 bg-green-50 rounded-lg hover:bg-green-100 active:scale-95 transition-all"
            >
              +{v}
            </button>
          ))}
        </div>
      </div>

      {/* Remaining balance preview */}
      {matched && parsedAmount > 0 && (
        <div className={`px-3 py-2.5 rounded-xl border text-xs font-semibold ${
          remaining === 0
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-[#f0ebe2] border-[#d0c9be] text-[#4a4035]'
        }`}>
          {remaining === 0
            ? '✓ Fully settled after this payment'
            : `Remaining: ${fmt(remaining)}`
          }
        </div>
      )}

      {/* Save Payment button */}
      <button
        onClick={handleSavePayment}
        disabled={!matched || !parsedAmount}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-black text-white bg-green-600 rounded-xl hover:bg-green-700 active:scale-95 transition-all disabled:opacity-35 disabled:cursor-not-allowed"
      >
        <Check size={15} />
        {parsedAmount > 0 ? `Received ${fmt(parsedAmount)}` : 'Save Payment'}
      </button>

      <p className="text-[10px] text-[#b0a898] text-center leading-relaxed">
        Only existing customers with outstanding balance are shown
      </p>
    </div>
  );
}

// ── Main DailyBook Page ──────────────────────────────────────────────────────
export default function DailyBook() {
  const { state } = useKhata();
  const { entries, payments } = state;
  const customers = useCustomers();

  const [currentDate, setCurrentDate] = useState(new Date(TODAY));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [preSelectedCustomer, setPreSelectedCustomer] = useState(null);

  const currentDateStr = dateStr(currentDate);
  const todayObj = new Date(TODAY);
  const isToday = currentDateStr === TODAY;
  const isFuture = currentDate > todayObj;

  const dayEntries = entries.filter((e) => e.date === currentDateStr);
  const dayPayments = payments.filter((p) => p.date === currentDateStr);

  // Group entries by customer
  const byCustomer = {};
  dayEntries.forEach((e) => {
    if (!byCustomer[e.customerId]) byCustomer[e.customerId] = [];
    byCustomer[e.customerId].push(e);
  });

  const customerRows = Object.entries(byCustomer)
    .map(([customerId, cEntries]) => {
      const customer = customers.find((c) => c.id === customerId);
      const sorted = [...cEntries].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const total = sorted.reduce((s, e) => s + e.amount, 0);
      return { customerId, customer, total, sorted };
    })
    .sort((a, b) => b.total - a.total);

  const grandTotal = dayEntries.reduce((s, e) => s + e.amount, 0);
  const totalPayments = dayPayments.reduce((s, p) => s + p.amount, 0);
  const netOutstanding = grandTotal - totalPayments;
  const { dayName, day, month, year } = formatDayHeader(currentDateStr);

  return (
    <div className="flex h-full">

      {/* ── Main ledger area ── */}
      <div className="flex-1 min-w-0 overflow-y-auto pb-10">

        {/* Date navigation bar */}
        <div className="sticky top-0 z-20 bg-white border-b border-border flex items-center justify-between px-4 py-2.5 shadow-sm">
          <button onClick={() => setCurrentDate(shiftDate(currentDate, -1))} className="btn-ghost p-2">
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-text-muted" />
            <span className="text-sm font-semibold text-text-primary">{fmtDate(currentDateStr)}</span>
            {isToday && <span className="px-2 py-0.5 text-[10px] font-bold bg-accent text-white rounded-full">TODAY</span>}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentDate(shiftDate(currentDate, 1))}
              disabled={isFuture}
              className="btn-ghost p-2 disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
            {/* Tablet: always show Add (sidebar is hidden at md) */}
            <button
              onClick={() => setMobilePanelOpen(true)}
              className="lg:hidden btn-primary py-1.5 px-3 text-xs"
            >
              <Plus size={13} /> Add
            </button>
            {/* Desktop: toggle sidebar */}
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="hidden lg:flex btn-ghost p-2"
              title={sidebarOpen ? 'Hide entry panel' : 'Show entry panel'}
            >
              {sidebarOpen ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}
            </button>
          </div>
        </div>

        {/* Book header */}
        <div className="mx-4 mt-5 mb-0">
          <div className="h-1.5 rounded-t-lg bg-gradient-to-r from-[#1a1a1a] via-[#333] to-[#1a1a1a]" />
          <div className="border-x border-b border-[#d0c9be] bg-[#FDFAF5] px-5 pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-semibold text-[#7a6e5e] uppercase tracking-widest mb-1">
                  khataManager Daily Register
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-[#1a1a1a] tabular-nums leading-none">{pad(day)}</span>
                  <div>
                    <div className="text-lg font-bold text-[#1a1a1a] leading-tight">{month} {year}</div>
                    <div className="text-xs text-[#7a6e5e] font-medium">{dayName}</div>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div>
                  <div className="text-[10px] text-[#7a6e5e] uppercase tracking-wider">Total Credit</div>
                  <div className="text-xl font-black text-[#C0392B] tabular-nums">{fmt(grandTotal)}</div>
                </div>
                {totalPayments > 0 && (
                  <div>
                    <div className="text-[10px] text-[#7a6e5e] uppercase tracking-wider">Payments In</div>
                    <div className="text-sm font-bold text-green-700 tabular-nums">{fmt(totalPayments)}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 border-t-2 border-dashed border-[#c8bfb0]" />
          </div>
        </div>

        {/* Ledger table */}
        <div className="mx-4 border-x border-b border-[#d0c9be] bg-[#FDFAF5] overflow-hidden rounded-b-xl">
          {customerRows.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <BookOpen size={32} className="text-[#c8bfb0]" />
              <div className="text-sm font-bold text-[#7a6e5e]">No entries for this date</div>
              <div className="text-xs text-[#a09888]">Use the entry panel on the right →</div>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-12 border-b-2 border-[#c8bfb0] bg-[#f0ebe2]">
                <div className="col-span-1 px-3 py-2.5 text-[10px] font-black text-[#7a6e5e] uppercase tracking-wider border-r border-[#d0c9be]">#</div>
                <div className="col-span-4 px-3 py-2.5 text-[10px] font-black text-[#7a6e5e] uppercase tracking-wider border-r border-[#d0c9be]">Customer</div>
                <div className="col-span-5 px-3 py-2.5 text-[10px] font-black text-[#7a6e5e] uppercase tracking-wider border-r border-[#d0c9be]">Entries (₹)</div>
                <div className="col-span-2 px-3 py-2.5 text-[10px] font-black text-[#7a6e5e] uppercase tracking-wider text-right">Total</div>
              </div>

              {customerRows.map(({ customerId, customer, total, sorted }, idx) => (
                <div
                  key={customerId}
                  onClick={() => {
                    if (customer) {
                      setPreSelectedCustomer(customer);
                      // Force sidebar open on desktop, and open drawer on mobile/tablet
                      setSidebarOpen(true);
                      setMobilePanelOpen(true);
                    }
                  }}
                  className={`grid grid-cols-12 border-b border-[#ddd6cb] group transition-colors hover:bg-[#f0ebe2] cursor-pointer ${idx % 2 === 0 ? 'bg-[#FDFAF5]' : 'bg-[#F7F3EC]'}`}
                >
                  <div className="col-span-1 px-3 py-3.5 border-r border-[#d0c9be] flex items-center">
                    <span className="text-xs font-bold text-[#a09888]">{idx + 1}</span>
                  </div>
                  <div className="col-span-4 px-3 py-3.5 border-r border-[#d0c9be] flex flex-col justify-center">
                    <div className="text-sm font-bold text-[#1a1a1a] leading-tight group-hover:text-accent transition-colors">
                      {customer?.name || 'Unknown'}
                    </div>
                    {customer?.mobile && <div className="text-[10px] text-[#a09888] mt-0.5">{customer.mobile}</div>}
                  </div>
                  <div className="col-span-5 px-3 py-3.5 border-r border-[#d0c9be] flex items-center select-none">
                    {sorted.length > 1 ? (
                      <div className="text-xs font-mono text-[#555] leading-relaxed">
                        {sorted.map((e, i) => (
                          <span key={e.id}>
                            {i > 0 && <span className="text-[#a09888] mx-1">+</span>}
                            <span className="font-semibold text-[#1a1a1a]">{e.amount}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs font-mono font-semibold text-[#1a1a1a]">{sorted[0]?.amount}</span>
                    )}
                  </div>
                  <div className="col-span-2 px-3 py-3.5 flex items-center justify-end">
                    <span className="text-sm font-black text-[#1a1a1a] tabular-nums">{fmt(total)}</span>
                  </div>
                </div>
              ))}

              {/* Grand total row */}
              <div className="grid grid-cols-12 border-t-2 border-double border-[#b0a898] bg-[#ece7de]">
                <div className="col-span-1 border-r border-[#d0c9be]" />
                <div className="col-span-4 px-3 py-3 border-r border-[#d0c9be]">
                  <span className="text-xs font-black text-[#4a4035] uppercase tracking-wider">{customerRows.length} Customers</span>
                </div>
                <div className="col-span-5 px-3 py-3 border-r border-[#d0c9be]">
                  <span className="text-xs font-bold text-[#7a6e5e]">{dayEntries.length} transactions</span>
                </div>
                <div className="col-span-2 px-3 py-3 text-right">
                  <span className="text-base font-black text-[#C0392B] tabular-nums">{fmt(grandTotal)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Payments section */}
        {dayPayments.length > 0 && (
          <div className="mx-4 mt-5">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-[#c8bfb0] to-transparent mb-4" />
            <div className="text-[11px] font-black text-[#7a6e5e] uppercase tracking-widest mb-3">Payments Received</div>
            <div className="border border-[#d0c9be] bg-[#FDFAF5] rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 border-b border-[#d0c9be] bg-[#f0ebe2] px-4 py-2">
                <div className="col-span-7 text-[10px] font-black text-[#7a6e5e] uppercase tracking-wider">Customer</div>
                <div className="col-span-5 text-[10px] font-black text-[#7a6e5e] uppercase tracking-wider text-right">Amount</div>
              </div>
              {dayPayments.map((p) => {
                const customer = customers.find((c) => c.id === p.customerId);
                return (
                  <Link to={`/customers/${p.customerId}`} key={p.id}
                    className="grid grid-cols-12 px-4 py-3 border-b border-[#ddd6cb] last:border-b-0 hover:bg-[#f0ebe2] transition-colors">
                    <div className="col-span-7 text-sm font-semibold text-[#1a1a1a]">{customer?.name || 'Unknown'}</div>
                    <div className="col-span-5 text-right text-sm font-black text-green-700 tabular-nums">{fmt(p.amount)}</div>
                  </Link>
                );
              })}
              <div className="grid grid-cols-12 px-4 py-2.5 bg-green-50 border-t-2 border-green-100">
                <div className="col-span-7 text-xs font-bold text-green-700">Total Received</div>
                <div className="col-span-5 text-right text-sm font-black text-green-700 tabular-nums">{fmt(totalPayments)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Net summary footer */}
        {grandTotal > 0 && (
          <div className="mx-4 mt-5 mb-2">
            <div className="bg-[#1a1a1a] rounded-2xl px-5 py-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-12">
                  <span className="text-[11px] text-gray-400 uppercase tracking-wider">Credit Given</span>
                  <span className="text-sm font-bold text-white tabular-nums">{fmt(grandTotal)}</span>
                </div>
                {totalPayments > 0 && (
                  <div className="flex items-center justify-between gap-12">
                    <span className="text-[11px] text-gray-400 uppercase tracking-wider">Payments In</span>
                    <span className="text-sm font-bold text-green-400 tabular-nums">- {fmt(totalPayments)}</span>
                  </div>
                )}
                <div className="border-t border-gray-700 pt-1 flex items-center justify-between gap-12">
                  <span className="text-[11px] text-gray-300 uppercase tracking-wider font-bold">Net Outstanding</span>
                  <span className="text-base font-black text-[#E74C3C] tabular-nums">{fmt(netOutstanding)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-gray-600 uppercase tracking-widest">Recorded</div>
                <div className="text-[10px] text-gray-500 font-mono">{fmtDate(currentDateStr)}</div>
              </div>
            </div>
          </div>
        )}

        {!isToday && (
          <div className="mx-4 mt-4 text-center">
            <button onClick={() => setCurrentDate(new Date(TODAY))} className="btn-secondary text-xs">
              <CalendarDays size={12} /> Jump to Today
            </button>
          </div>
        )}
      </div>

      {/* ── Desktop sidebar — full on lg, hidden on md (use mobile drawer instead) ── */}
      {sidebarOpen && (
        <div className="hidden lg:flex flex-col w-72 shrink-0 border-l border-[#d0c9be] bg-[#FDFAF5] overflow-y-auto">
          <QuickEntrySidebar currentDateStr={currentDateStr} isMobile={false} preSelectedCustomer={preSelectedCustomer} />
        </div>
      )}

      {/* ── Tablet + Mobile bottom drawer (shown below lg) ── */}
      {mobilePanelOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setMobilePanelOpen(false); }}>
          <div className="bg-[#FDFAF5] rounded-t-2xl max-h-[80vh] overflow-y-auto"
            style={{ animation: 'slideUp 0.2s ease-out' }}>
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-[#d0c9be] rounded-full" />
            </div>
            <QuickEntrySidebar
              currentDateStr={currentDateStr}
              isMobile={true}
              onClose={() => setMobilePanelOpen(false)}
              preSelectedCustomer={preSelectedCustomer}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
