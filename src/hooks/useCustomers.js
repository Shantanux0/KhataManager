import { useMemo } from 'react';
import { useKhata } from '../context/KhataContext';
import {
  getTotalCreditForCustomer,
  getLastTransactionDate,
  isOverdue,
} from '../services/khataService';

export function useCustomers() {
  const { state } = useKhata();
  const { customers, entries, payments } = state;

  return useMemo(() => {
    return customers
      .map((c) => ({
        ...c,
        outstanding: getTotalCreditForCustomer(c.id, entries, payments),
        lastTransactionDate: getLastTransactionDate(c.id, entries, payments),
        overdue: isOverdue(c.id, entries, payments),
      }))
      .sort((a, b) => b.outstanding - a.outstanding);
  }, [customers, entries, payments]);
}

export function useCustomer(id) {
  const customers = useCustomers();
  return useMemo(() => customers.find((c) => c.id === id) || null, [customers, id]);
}
