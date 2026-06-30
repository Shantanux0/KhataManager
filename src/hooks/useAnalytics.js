import { useMemo } from 'react';
import { useKhata } from '../context/KhataContext';
import { getDailySummaries, getOutstandingByCustomer } from '../services/khataService';

const TODAY = '2026-06-29';

export function useAnalytics() {
  const { state } = useKhata();
  const { customers, entries, payments } = state;

  const dailySummaries = useMemo(
    () => getDailySummaries(entries, payments, 35),
    [entries, payments],
  );

  const outstandingByCustomer = useMemo(
    () => getOutstandingByCustomer(entries, payments),
    [entries, payments],
  );

  const totalOutstanding = useMemo(
    () => outstandingByCustomer.reduce((s, o) => s + o.outstanding, 0),
    [outstandingByCustomer],
  );

  const todayEntries = useMemo(
    () => entries.filter((e) => e.date === TODAY),
    [entries],
  );
  const todayPayments = useMemo(
    () => payments.filter((p) => p.date === TODAY),
    [payments],
  );

  const todayCredit = useMemo(
    () => todayEntries.reduce((s, e) => s + e.amount, 0),
    [todayEntries],
  );
  const todayPaymentsTotal = useMemo(
    () => todayPayments.reduce((s, p) => s + p.amount, 0),
    [todayPayments],
  );

  const customersYetToPay = useMemo(
    () =>
      outstandingByCustomer.filter((o) => o.outstanding > 0).length,
    [outstandingByCustomer],
  );

  const highestCreditDay = useMemo(
    () => dailySummaries.reduce((max, d) => (d.totalCredit > max.totalCredit ? d : max), dailySummaries[0]),
    [dailySummaries],
  );

  const avgDailyCredit = useMemo(() => {
    const activeDays = dailySummaries.filter((d) => d.totalCredit > 0);
    if (!activeDays.length) return 0;
    return Math.round(activeDays.reduce((s, d) => s + d.totalCredit, 0) / activeDays.length);
  }, [dailySummaries]);

  const topCustomersByOutstanding = useMemo(() => {
    return outstandingByCustomer
      .map((o) => ({
        ...o,
        customer: customers.find((c) => c.id === o.customerId),
      }))
      .filter((o) => o.customer && o.outstanding > 0)
      .sort((a, b) => b.outstanding - a.outstanding);
  }, [outstandingByCustomer, customers]);

  const mostCreditCustomer = useMemo(() => {
    const creditByCustomer = {};
    entries.forEach((e) => {
      creditByCustomer[e.customerId] = (creditByCustomer[e.customerId] || 0) + e.amount;
    });
    const maxId = Object.entries(creditByCustomer).sort(([, a], [, b]) => b - a)[0]?.[0];
    return maxId ? customers.find((c) => c.id === maxId) : null;
  }, [entries, customers]);

  return {
    dailySummaries,
    totalOutstanding,
    todayCredit,
    todayPaymentsTotal,
    customersYetToPay,
    highestCreditDay,
    avgDailyCredit,
    topCustomersByOutstanding,
    mostCreditCustomer,
  };
}
