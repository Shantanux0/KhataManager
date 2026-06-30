import { useMemo } from 'react';
import { useKhata } from '../context/KhataContext';

export function useEntries() {
  const { state } = useKhata();
  return state.entries;
}

export function useEntriesForDate(dateStr) {
  const { state } = useKhata();
  return useMemo(
    () => state.entries.filter((e) => e.date === dateStr),
    [state.entries, dateStr],
  );
}

export function useEntriesForCustomer(customerId) {
  const { state } = useKhata();
  return useMemo(
    () =>
      state.entries
        .filter((e) => e.customerId === customerId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [state.entries, customerId],
  );
}

export function usePaymentsForCustomer(customerId) {
  const { state } = useKhata();
  return useMemo(
    () =>
      state.payments
        .filter((p) => p.customerId === customerId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [state.payments, customerId],
  );
}

export function useAllTransactions() {
  const { state } = useKhata();
  return useMemo(() => {
    const all = [
      ...state.entries.map((e) => ({ ...e, txnType: 'credit' })),
      ...state.payments.map((p) => ({ ...p, txnType: 'payment' })),
    ];
    return all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [state.entries, state.payments]);
}
