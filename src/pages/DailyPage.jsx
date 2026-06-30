import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { useEntriesForDate } from '../hooks/useEntries';
import { useCustomers } from '../hooks/useCustomers';
import { fmt, fmtDate, buildAdditionString, EmptyState } from '../components/ui/index';

export default function DailyPage() {
  const { date } = useParams(); // YYYY-MM-DD
  const navigate = useNavigate();
  const { state } = useKhata();
  const entries = useEntriesForDate(date);
  const payments = state.payments.filter((p) => p.date === date);
  const customers = useCustomers();

  // Group entries by customer
  const byCustomer = {};
  entries.forEach((e) => {
    if (!byCustomer[e.customerId]) byCustomer[e.customerId] = [];
    byCustomer[e.customerId].push(e);
  });

  const totalCredit = entries.reduce((s, e) => s + e.amount, 0);
  const totalPayments = payments.reduce((s, p) => s + p.amount, 0);

  const customerRows = Object.entries(byCustomer).map(([customerId, dayEntries]) => {
    const customer = customers.find((c) => c.id === customerId);
    const total = dayEntries.reduce((s, e) => s + e.amount, 0);
    const addStr = dayEntries
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map((e) => e.amount)
      .join(' + ');
    return { customerId, customer, total, addStr, dayEntries };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost p-1.5 -ml-1.5">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">{fmtDate(date)}</h1>
            <div className="text-xs text-text-muted mt-0.5">
              {customerRows.length} customers · {entries.length} transactions
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-text-muted">Total Credit</div>
          <div className="text-lg font-bold text-accent tabular-nums">{fmt(totalCredit)}</div>
        </div>
      </div>

      {/* Summary strip */}
      {totalPayments > 0 && (
        <div className="mx-4 mt-4 bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-medium text-green-700">Payments received</span>
          <span className="text-sm font-bold text-green-700 tabular-nums">{fmt(totalPayments)}</span>
        </div>
      )}

      {/* Customer rows table */}
      <div className="px-4 mt-4">
        {customerRows.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No entries for this date"
            subtitle="Navigate to another date or add a new entry."
          />
        ) : (
          <div className="card overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 border-b border-border">
              <div className="col-span-4 table-header">Customer</div>
              <div className="col-span-5 table-header">Entries</div>
              <div className="col-span-3 table-header text-right">Total</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border">
              {customerRows.map(({ customerId, customer, total, addStr }) => (
                <Link
                  key={customerId}
                  to={`/customers/${customerId}`}
                  className="grid grid-cols-12 gap-2 px-4 py-3.5 row-hover items-center"
                >
                  <div className="col-span-4">
                    <div className="text-sm font-semibold text-text-primary leading-tight">
                      {customer?.name || 'Unknown'}
                    </div>
                    {customer?.mobile && (
                      <div className="text-[10px] text-text-muted mt-0.5">{customer.mobile}</div>
                    )}
                  </div>
                  <div className="col-span-5">
                    <div className="text-xs text-text-secondary font-mono tabular-nums">
                      {addStr}
                    </div>
                  </div>
                  <div className="col-span-3 text-right">
                    <div className="text-sm font-bold text-text-primary tabular-nums">
                      = {fmt(total)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Footer total */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 border-t border-border">
              <div className="col-span-4 text-xs font-semibold text-text-secondary">Day Total</div>
              <div className="col-span-5" />
              <div className="col-span-3 text-right text-sm font-bold text-accent tabular-nums">
                {fmt(totalCredit)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment records */}
      {payments.length > 0 && (
        <div className="px-4 mt-4 pb-6">
          <div className="section-title mb-2">Payments Received</div>
          <div className="card divide-y divide-border overflow-hidden">
            {payments.map((p) => {
              const customer = customers.find((c) => c.id === p.customerId);
              return (
                <Link
                  key={p.id}
                  to={`/customers/${p.customerId}`}
                  className="flex items-center justify-between px-4 py-3 row-hover"
                >
                  <span className="text-sm text-text-primary">{customer?.name}</span>
                  <span className="text-sm font-bold text-green-600 tabular-nums">{fmt(p.amount)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
