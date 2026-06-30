import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, FileText, Edit3, Check, X, IndianRupee } from 'lucide-react';
import { useCustomer } from '../hooks/useCustomers';
import { useEntriesForCustomer, usePaymentsForCustomer } from '../hooks/useEntries';
import { useKhata } from '../context/KhataContext';
import { Modal, Badge, fmt, fmtDate, fmtTime, EmptyState } from '../components/ui/index';

import { getTodayIST } from '../utils/dateUtils';
const TODAY = getTodayIST();

// Group entries by date
function groupByDate(entries) {
  const map = {};
  entries.forEach((e) => {
    if (!map[e.date]) map[e.date] = [];
    map[e.date].push(e);
  });
  return Object.entries(map)
    .sort(([a], [b]) => new Date(b) - new Date(a))
    .map(([date, dayEntries]) => ({ date, entries: dayEntries }));
}

function PaymentModal({ customer, isOpen, onClose }) {
  const { dispatch } = useKhata();
  const [amount, setAmount] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const parsedAmount = parseInt(amount, 10) || 0;
  const remaining = Math.max(0, (customer?.outstanding || 0) - parsedAmount);

  function handleSave() {
    if (!parsedAmount || parsedAmount <= 0) return;
    dispatch({
      type: 'ADD_PAYMENT',
      payload: {
        id: `p${Date.now()}`,
        customerId: customer.id,
        amount: parsedAmount,
        date: TODAY,
        timestamp: new Date().toISOString(),
        type: 'payment',
        note: 'Cash payment received',
      },
    });
    setConfirmed(true);
    setTimeout(() => {
      setConfirmed(false);
      setAmount('');
      onClose();
    }, 1000);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receive Payment" size="sm">
      {!confirmed ? (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-text-muted">Outstanding balance</span>
            <span className={`text-base font-bold tabular-nums ${customer?.overdue ? 'text-accent' : 'text-text-primary'}`}>
              {fmt(customer?.outstanding)}
            </span>
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary mb-2 block">Payment Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-light text-text-muted">₹</span>
              <input
                autoFocus
                type="number"
                inputMode="numeric"
                className="w-full pl-9 pr-4 py-3.5 text-2xl font-bold text-text-primary bg-gray-50 border-2 border-border rounded-xl outline-none focus:border-accent focus:bg-white transition-all tabular-nums"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
              />
            </div>
          </div>

          {parsedAmount > 0 && (
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <div className="flex justify-between text-xs text-text-muted mb-1">
                <span>Remaining after payment</span>
              </div>
              <div className={`text-lg font-bold tabular-nums ${remaining === 0 ? 'text-green-600' : 'text-text-primary'}`}>
                {remaining === 0 ? '✓ Fully Settled' : fmt(remaining)}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button
              onClick={handleSave}
              disabled={!parsedAmount || parsedAmount <= 0}
              className="btn-primary flex-1 justify-center disabled:opacity-40"
            >
              <Check size={14} />
              Confirm Payment
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center py-6 gap-3">
          <div className="w-14 h-14 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
            <Check size={28} className="text-green-600" />
          </div>
          <div className="font-bold text-text-primary">{fmt(parsedAmount)} received!</div>
        </div>
      )}
    </Modal>
  );
}

function EditCustomerModal({ customer, isOpen, onClose }) {
  const { dispatch } = useKhata();
  const [form, setForm] = useState({ ...customer });

  function handleSave() {
    dispatch({ type: 'UPDATE_CUSTOMER', payload: form });
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Customer" size="md">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-text-secondary mb-1.5 block">Name</label>
          <input className="input-base" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-medium text-text-secondary mb-1.5 block">Mobile</label>
          <input className="input-base" type="tel" value={form.mobile || ''}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-medium text-text-secondary mb-1.5 block">Address</label>
          <input className="input-base" value={form.address || ''}
            onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-medium text-text-secondary mb-1.5 block">Payment Cycle</label>
          <select className="input-base" value={form.paymentCycle || 'monthly'}
            onChange={(e) => setForm({ ...form, paymentCycle: e.target.value })}>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-text-secondary mb-1.5 block">Notes</label>
          <textarea className="input-base resize-none" rows={3} value={form.notes || ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleSave} className="btn-primary flex-1 justify-center">
            <Check size={14} /> Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function CustomerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const customer = useCustomer(id);
  const entries = useEntriesForCustomer(id);
  const payments = usePaymentsForCustomer(id);
  const { dispatch } = useKhata();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [activeTab, setActiveTab] = useState('history');

  if (!customer) {
    return (
      <div className="p-6 text-center">
        <div className="text-text-muted">Customer not found.</div>
        <Link to="/customers" className="btn-primary mt-4 inline-flex">Back to Customers</Link>
      </div>
    );
  }

  const todayEntries = entries.filter((e) => e.date === TODAY);
  const todayTotal = todayEntries.reduce((s, e) => s + e.amount, 0);
  const todayAddStr = todayEntries
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .map((e) => e.amount)
    .join(' + ');

  const groupedHistory = groupByDate(entries.filter((e) => e.date !== TODAY));

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost p-1.5 -ml-1.5">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">{customer.name}</h1>
            {customer.mobile && (
              <div className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
                <Phone size={10} />
                {customer.mobile}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setNotesValue(customer.notes || ''); setShowEditModal(true); }} className="btn-ghost p-2">
            <Edit3 size={15} />
          </button>
          <button onClick={() => setShowPaymentModal(true)} className="btn-primary py-2">
            <IndianRupee size={14} />
            <span className="hidden sm:inline">Receive Payment</span>
            <span className="sm:hidden">Pay</span>
          </button>
        </div>
      </div>

      {/* Outstanding balance hero */}
      <div className={`mx-4 mt-4 px-5 py-4 rounded-2xl border ${customer.outstanding === 0 ? 'bg-green-50 border-green-100' : customer.overdue ? 'bg-accent/5 border-accent/20' : 'bg-gray-50 border-border'}`}>
        <div className="text-xs font-medium text-text-muted mb-1">Outstanding Balance</div>
        <div className={`text-4xl font-bold tabular-nums ${customer.outstanding === 0 ? 'text-green-600' : customer.overdue ? 'text-accent' : 'text-text-primary'}`}>
          {fmt(customer.outstanding)}
        </div>
        <div className="flex items-center gap-2 mt-2">
          {customer.outstanding === 0
            ? <Badge variant="paid">Fully Settled</Badge>
            : customer.overdue
              ? <Badge variant="overdue">Overdue no payment in 30+ days</Badge>
              : <Badge variant="gray">Active</Badge>
          }
        </div>
      </div>

      {/* Today's entries */}
      {todayEntries.length > 0 && (
        <div className="mx-4 mt-4 card p-4">
          <div className="text-xs text-text-muted mb-2">Today's Entries</div>
          <div className="flex flex-wrap items-center gap-y-1 text-sm font-mono select-none">
            {todayEntries
              .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
              .map((e, idx) => (
                <span key={e.id} className="whitespace-nowrap">
                  <span className="font-semibold text-text-primary">₹{e.amount}</span>
                  <span className="text-[10px] text-text-muted ml-0.5 font-sans">({fmtTime(e.timestamp)})</span>
                  {idx < todayEntries.length - 1 && <span className="text-text-muted mx-2 font-sans">+</span>}
                </span>
              ))}
            <span className="text-text-secondary mx-2 font-sans">=</span>
            <span className="text-accent font-bold font-sans">{fmt(todayTotal)}</span>
          </div>
        </div>
      )}

      {/* Meta info strip */}
      <div className="mx-4 mt-3 grid grid-cols-2 gap-2">
        {customer.address && (
          <div className="flex items-start gap-1.5 text-xs text-text-muted">
            <MapPin size={11} className="mt-0.5 shrink-0" />
            <span>{customer.address}</span>
          </div>
        )}
        {customer.paymentCycle && (
          <div className="text-xs text-text-muted">
            Cycle: <span className="font-medium text-text-secondary capitalize">{customer.paymentCycle}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="mx-4 mt-3">
        {!editingNotes ? (
          <div
            className="flex items-start gap-2 text-xs text-text-muted cursor-pointer hover:text-text-secondary"
            onClick={() => { setNotesValue(customer.notes || ''); setEditingNotes(true); }}
          >
            <FileText size={11} className="mt-0.5 shrink-0" />
            <span className="italic">{customer.notes || 'Add notes...'}</span>
          </div>
        ) : (
          <div className="flex gap-2 items-end">
            <textarea
              autoFocus
              className="input-base text-xs resize-none flex-1"
              rows={2}
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
            />
            <div className="flex flex-col gap-1">
              <button
                className="p-1.5 rounded-lg bg-accent text-white"
                onClick={() => {
                  dispatch({ type: 'UPDATE_CUSTOMER', payload: { ...customer, notes: notesValue } });
                  setEditingNotes(false);
                }}
              ><Check size={13} /></button>
              <button className="p-1.5 rounded-lg border border-border" onClick={() => setEditingNotes(false)}>
                <X size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mx-4 mt-5 flex gap-0 border-b border-border">
        {[['history', 'Credit History'], ['payments', 'Payments']].map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Credit History Tab */}
      {activeTab === 'history' && (
        <div className="px-4 pt-4 pb-8 space-y-3">
          {groupedHistory.length === 0 && todayEntries.length === 0 ? (
            <EmptyState title="No entries yet" subtitle="Add an entry using the Quick Add button." />
          ) : (
            <>
              {todayEntries.length > 0 && (
                <Link to={`/daily/${TODAY}`} className="card block overflow-hidden hover:border-gray-300 transition-colors">
                  <div className="px-4 py-2 bg-accent/5 border-b border-accent/10">
                    <span className="text-xs font-semibold text-accent">Today</span>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex flex-wrap gap-x-2 gap-y-1 items-center select-none font-mono text-xs">
                      {todayEntries
                        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                        .map((e, idx) => (
                          <span key={e.id} className="whitespace-nowrap">
                            <span className="font-semibold text-text-primary">₹{e.amount}</span>
                            <span className="text-[10px] text-text-muted ml-0.5 font-sans">({fmtTime(e.timestamp)})</span>
                            {idx < todayEntries.length - 1 && <span className="text-text-muted mx-1.5 font-sans">+</span>}
                          </span>
                        ))}
                    </div>
                    <div className="text-sm font-bold text-accent tabular-nums shrink-0 ml-4">= {fmt(todayTotal)}</div>
                  </div>
                </Link>
              )}
              {groupedHistory.map(({ date, entries: dayEntries }) => {
                const total = dayEntries.reduce((s, e) => s + e.amount, 0);
                const sorted = [...dayEntries].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                return (
                  <Link to={`/daily/${date}`} key={date} className="card block overflow-hidden hover:border-gray-300 transition-colors">
                    <div className="px-4 py-2 bg-gray-50 border-b border-border">
                      <span className="text-xs font-semibold text-text-muted">{fmtDate(date)}</span>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div className="flex flex-wrap gap-x-2 gap-y-1 items-center select-none font-mono text-xs">
                        {sorted.map((e, idx) => (
                          <span key={e.id} className="whitespace-nowrap">
                            <span className="font-semibold text-text-primary">₹{e.amount}</span>
                            <span className="text-[10px] text-text-muted ml-0.5 font-sans">({fmtTime(e.timestamp)})</span>
                            {idx < sorted.length - 1 && <span className="text-text-muted mx-1.5 font-sans">+</span>}
                          </span>
                        ))}
                      </div>
                      <div className="text-sm font-bold text-text-primary tabular-nums shrink-0 ml-4">= {fmt(total)}</div>
                    </div>
                  </Link>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="px-4 pt-4 pb-8">
          {payments.length === 0 ? (
            <EmptyState title="No payments recorded" subtitle="Use the 'Receive Payment' button to log a payment." />
          ) : (
            <div className="card overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-gray-50 border-b border-border">
                <div className="col-span-5 table-header">Date</div>
                <div className="col-span-4 table-header">Note</div>
                <div className="col-span-3 table-header text-right">Amount</div>
              </div>
              <div className="divide-y divide-border">
                {payments.map((p) => (
                  <div key={p.id} className="grid grid-cols-12 gap-2 px-4 py-3 row-hover items-center">
                    <div className="col-span-5">
                      <div className="text-sm text-text-primary">{fmtDate(p.date)}</div>
                      <div className="text-[10px] text-text-muted">{fmtTime(p.timestamp)}</div>
                    </div>
                    <div className="col-span-4 text-xs text-text-muted">{p.note}</div>
                    <div className="col-span-3 text-right text-sm font-bold text-green-600 tabular-nums">
                      {fmt(p.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <PaymentModal customer={customer} isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
      <EditCustomerModal customer={customer} isOpen={showEditModal} onClose={() => setShowEditModal(false)} />
    </div>
  );
}
