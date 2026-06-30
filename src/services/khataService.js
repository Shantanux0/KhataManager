// ─── Khata Service ─────────────────────────────────────────────────────────
// This is the ONLY file that reads raw mock data.
// When a real backend is available, replace only this file.
// All other code imports from this service, not from mockData directly.

import { CUSTOMERS, ENTRIES, PAYMENTS } from '../data/mockData';
import { getTodayIST } from '../utils/dateUtils';

// ── Helpers ────────────────────────────────────────────────────────────────
export function getCustomers() {
  return [...CUSTOMERS];
}

export function getCustomerById(id) {
  return CUSTOMERS.find((c) => c.id === id) || null;
}

export function getEntries() {
  return [...ENTRIES];
}

export function getEntriesForCustomer(customerId) {
  return ENTRIES.filter((e) => e.customerId === customerId).sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
  );
}

export function getEntriesForDate(dateStr) {
  return ENTRIES.filter((e) => e.date === dateStr);
}

export function getPayments() {
  return [...PAYMENTS];
}

export function getPaymentsForCustomer(customerId) {
  return PAYMENTS.filter((p) => p.customerId === customerId).sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
  );
}

// ── Computed aggregates ────────────────────────────────────────────────────
export function getTotalCreditForCustomer(customerId, entries, payments) {
  const totalCredit = entries
    .filter((e) => e.customerId === customerId)
    .reduce((sum, e) => sum + e.amount, 0);
  const totalPaid = payments
    .filter((p) => p.customerId === customerId)
    .reduce((sum, p) => sum + p.amount, 0);
  return Math.max(0, totalCredit - totalPaid);
}



export function getDailySummaries(entries, payments, days = 35) {
  const today = new Date(getTodayIST());
  const summaries = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayEntries = entries.filter((e) => e.date === dateStr);
    const dayPayments = payments.filter((p) => p.date === dateStr);
    const totalCredit = dayEntries.reduce((s, e) => s + e.amount, 0);
    const totalPayments = dayPayments.reduce((s, p) => s + p.amount, 0);
    const customers = [...new Set(dayEntries.map((e) => e.customerId))];
    summaries.push({
      date: dateStr,
      totalCredit,
      totalPayments,
      transactions: dayEntries.length,
      customerCount: customers.length,
      customers,
    });
  }
  return summaries;
}

export function getOutstandingByCustomer(entries, payments) {
  const allCustomerIds = [
    ...new Set([...entries.map((e) => e.customerId), ...payments.map((p) => p.customerId)]),
  ];
  return allCustomerIds.map((id) => ({
    customerId: id,
    outstanding: getTotalCreditForCustomer(id, entries, payments),
  }));
}

export function getLastTransactionDate(customerId, entries, payments) {
  const allTxns = [
    ...entries.filter((e) => e.customerId === customerId),
    ...payments.filter((p) => p.customerId === customerId),
  ];
  if (!allTxns.length) return null;
  return allTxns.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0].date;
}

export function isOverdue(customerId, entries, payments, thresholdDays = 30) {
  const lastPayment = payments
    .filter((p) => p.customerId === customerId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  if (!lastPayment) {
    const firstEntry = entries
      .filter((e) => e.customerId === customerId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[0];
    if (!firstEntry) return false;
    const daysSince = Math.floor(
      (new Date(getTodayIST()) - new Date(firstEntry.date)) / (1000 * 60 * 60 * 24),
    );
    return daysSince > thresholdDays;
  }
  const daysSince = Math.floor(
    (new Date(getTodayIST()) - new Date(lastPayment.date)) / (1000 * 60 * 60 * 24),
  );
  return daysSince > thresholdDays;
}
