import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Plus, ChevronRight, Check, X, ArrowLeft } from 'lucide-react';
import { useKhata } from '../../context/KhataContext';
import { useCustomers } from '../../hooks/useCustomers';
import { Modal, fmt } from '../ui/index';

const TODAY = '2026-06-29';

// Extension point: add future integrations here (voice, OCR, WhatsApp)
// e.g. onEntryAdded(entry) will be called after every successful save
const ENTRY_ADDED_HOOKS = [];
function fireEntryAdded(entry) {
  ENTRY_ADDED_HOOKS.forEach((hook) => hook(entry));
}

export default function QuickAddEntry({ isOpen, onClose }) {
  const { dispatch, state } = useKhata();
  const customers = useCustomers();

  const [step, setStep] = useState(1); // 1: select customer, 2: enter amount
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [amount, setAmount] = useState('');
  const [saved, setSaved] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', mobile: '' });

  const searchRef = useRef(null);
  const amountRef = useRef(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSearch('');
      setSelectedCustomer(null);
      setAmount('');
      setSaved(false);
      setShowNewCustomerForm(false);
      setNewCustomer({ name: '', mobile: '' });
    }
  }, [isOpen]);

  // Auto-focus
  useEffect(() => {
    if (isOpen && step === 1 && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
    if (step === 2 && amountRef.current) {
      setTimeout(() => amountRef.current?.focus(), 100);
    }
  }, [isOpen, step]);

  // Filtered + sorted customer list
  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers.slice(0, 8);
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.mobile && c.mobile.includes(q)),
    );
  }, [customers, search]);

  // Today's existing entries for selected customer
  const todayEntries = useMemo(() => {
    if (!selectedCustomer) return [];
    return state.entries.filter(
      (e) => e.customerId === selectedCustomer.id && e.date === TODAY,
    );
  }, [selectedCustomer, state.entries]);

  const todayTotal = useMemo(
    () => todayEntries.reduce((s, e) => s + e.amount, 0),
    [todayEntries],
  );

  function handleSelectCustomer(customer) {
    setSelectedCustomer(customer);
    setStep(2);
  }

  function handleSave() {
    const parsedAmount = parseInt(amount, 10);
    if (!parsedAmount || parsedAmount <= 0) return;

    const entry = {
      id: `e${Date.now()}`,
      customerId: selectedCustomer.id,
      date: TODAY,
      amount: parsedAmount,
      timestamp: new Date().toISOString(),
      type: 'credit',
      note: '',
    };

    dispatch({ type: 'ADD_ENTRY', payload: entry });
    fireEntryAdded(entry); // extension point
    setSaved(true);

    // Auto-close after brief confirmation
    setTimeout(() => {
      onClose();
    }, 900);
  }

  function handleAddNewCustomer() {
    if (!newCustomer.name.trim()) return;
    const customer = {
      id: `c${Date.now()}`,
      name: newCustomer.name.trim(),
      mobile: newCustomer.mobile.trim(),
      address: '',
      notes: '',
      paymentCycle: 'monthly',
      createdAt: TODAY,
    };
    dispatch({ type: 'ADD_CUSTOMER', payload: customer });
    setSelectedCustomer({ ...customer, outstanding: 0 });
    setShowNewCustomerForm(false);
    setStep(2);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      if (step === 1 && filteredCustomers.length === 1) {
        handleSelectCustomer(filteredCustomers[0]);
      }
      if (step === 2) handleSave();
    }
  }

  const numericAmount = parseInt(amount, 10) || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        step === 2 && selectedCustomer
          ? `Entry for ${selectedCustomer.name}`
          : 'Quick Add Entry'
      }
      size="md"
    >
      {/* ── Step 1: Customer Selection ── */}
      {step === 1 && !showNewCustomerForm && (
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              ref={searchRef}
              type="text"
              className="input-base pl-9"
              placeholder="Search customer name or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Customer list */}
          <div className="max-h-64 overflow-y-auto -mx-5 border-t border-border">
            {filteredCustomers.length === 0 && (
              <div className="px-5 py-6 text-center text-sm text-text-muted">
                No customers found
              </div>
            )}
            {filteredCustomers.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectCustomer(c)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 border-b border-border/60 text-left transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-text-primary">{c.name}</div>
                  {c.mobile && (
                    <div className="text-xs text-text-muted">{c.mobile}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {c.outstanding > 0 && (
                    <span className={`text-xs font-semibold tabular-nums ${c.overdue ? 'text-accent' : 'text-text-secondary'}`}>
                      {fmt(c.outstanding)}
                    </span>
                  )}
                  <ChevronRight size={14} className="text-text-muted" />
                </div>
              </button>
            ))}
          </div>

          {/* Add new customer */}
          <button
            onClick={() => setShowNewCustomerForm(true)}
            className="btn-ghost w-full justify-center border border-dashed border-border"
          >
            <Plus size={14} />
            Add New Customer
          </button>
        </div>
      )}

      {/* ── New Customer Form ── */}
      {step === 1 && showNewCustomerForm && (
        <div className="space-y-4">
          <button
            onClick={() => setShowNewCustomerForm(false)}
            className="btn-ghost -ml-1"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Customer Name *</label>
            <input
              autoFocus
              type="text"
              className="input-base"
              placeholder="e.g. Ramesh Gupta"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Mobile (optional)</label>
            <input
              type="tel"
              className="input-base"
              placeholder="e.g. 9876543210"
              value={newCustomer.mobile}
              onChange={(e) => setNewCustomer({ ...newCustomer, mobile: e.target.value })}
            />
          </div>
          <button
            onClick={handleAddNewCustomer}
            disabled={!newCustomer.name.trim()}
            className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
            Add & Continue
          </button>
        </div>
      )}

      {/* ── Step 2: Amount Entry ── */}
      {step === 2 && !saved && (
        <div className="space-y-5">
          {/* Back button */}
          <button onClick={() => setStep(1)} className="btn-ghost -ml-1 -mt-1">
            <ArrowLeft size={14} />
            {selectedCustomer?.name}
          </button>

          {/* Today's running total */}
          {todayEntries.length > 0 && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 border border-border">
              <div className="text-xs text-text-muted mb-0.5">Today's total so far</div>
              <div className="text-sm font-semibold text-text-primary tabular-nums">
                {todayEntries.map((e) => e.amount).join(' + ')}
                {numericAmount > 0 && (
                  <span className="text-accent"> + {numericAmount}</span>
                )}
                {' '}={' '}
                <span className={numericAmount > 0 ? 'text-accent' : ''}>
                  {fmt(todayTotal + numericAmount)}
                </span>
              </div>
            </div>
          )}

          {/* Large amount input */}
          <div>
            <label className="text-xs font-medium text-text-secondary mb-2 block">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-light text-text-muted">₹</span>
              <input
                ref={amountRef}
                type="number"
                inputMode="numeric"
                className="w-full pl-10 pr-4 py-4 text-3xl font-bold text-text-primary bg-gray-50 border-2 border-border rounded-xl outline-none focus:border-accent focus:bg-white transition-all duration-150 tabular-nums"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={handleKeyDown}
                min="1"
              />
            </div>
          </div>

          {/* Quick amount buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[50, 100, 200, 500].map((v) => (
              <button
                key={v}
                onClick={() => setAmount(String((parseInt(amount) || 0) + v))}
                className="py-2 text-sm font-medium text-text-secondary bg-gray-100 rounded-lg hover:bg-gray-200 hover:text-text-primary transition-colors active:scale-95"
              >
                +{v}
              </button>
            ))}
          </div>

          {/* Outstanding info */}
          {selectedCustomer && selectedCustomer.outstanding > 0 && (
            <div className="text-xs text-text-muted">
              Current outstanding:{' '}
              <span className={`font-semibold ${selectedCustomer.overdue ? 'text-accent' : 'text-text-primary'}`}>
                {fmt(selectedCustomer.outstanding)}
              </span>
              {numericAmount > 0 && (
                <span> → New: <span className="font-semibold text-accent">{fmt(selectedCustomer.outstanding + numericAmount)}</span></span>
              )}
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!numericAmount || numericAmount <= 0}
            className="btn-primary w-full justify-center py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Entry {fmt(numericAmount)}
          </button>
        </div>
      )}

      {/* ── Saved Confirmation ── */}
      {saved && (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="w-14 h-14 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
            <Check size={28} className="text-green-600" />
          </div>
          <div className="text-base font-bold text-text-primary">Entry Saved!</div>
          <div className="text-sm text-text-muted text-center">
            {fmt(numericAmount)} added for{' '}
            <span className="font-medium text-text-primary">{selectedCustomer?.name}</span>
          </div>
        </div>
      )}
    </Modal>
  );
}
