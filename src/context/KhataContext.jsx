import React, { createContext, useContext, useReducer, useMemo, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const KhataContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api';

const initialState = {
  customers: [],
  entries: [],
  payments: [],
};

function khataReducer(state, action) {
  switch (action.type) {
    case 'SET_DATA': {
      return {
        customers: action.payload.customers,
        entries: action.payload.entries,
        payments: action.payload.payments,
      };
    }
    case 'ADD_ENTRY': {
      return {
        ...state,
        entries: [action.payload, ...state.entries],
      };
    }
    case 'ADD_PAYMENT': {
      return {
        ...state,
        payments: [action.payload, ...state.payments],
      };
    }
    case 'ADD_CUSTOMER': {
      return {
        ...state,
        customers: [action.payload, ...state.customers],
      };
    }
    case 'UPDATE_CUSTOMER': {
      return {
        ...state,
        customers: state.customers.map((c) =>
          String(c.id) === String(action.payload.id) ? { ...c, ...action.payload } : c,
        ),
      };
    }
    case 'DELETE_TRANSACTION': {
      return {
        ...state,
        entries: state.entries.filter((e) => String(e.id) !== String(action.payload)),
        payments: state.payments.filter((p) => String(p.id) !== String(action.payload)),
      };
    }
    case 'DELETE_TRANSACTIONS': {
      const idsToDelete = new Set(action.payload.map(id => String(id)));
      return {
        ...state,
        entries: state.entries.filter((e) => !idsToDelete.has(String(e.id))),
        payments: state.payments.filter((p) => !idsToDelete.has(String(p.id))),
      };
    }
    default:
      return state;
  }
}

export function KhataProvider({ children }) {
  const [state, dispatch] = useReducer(khataReducer, initialState);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function loadData() {
      if (!user || !user.token) {
        setLoading(false);
        return;
      }
      try {
        const headers = { 'Authorization': `Bearer ${user.token}` };
        const [custRes, entRes, payRes] = await Promise.all([
          fetch(`${API_URL}/customers`, { headers }),
          fetch(`${API_URL}/entries`, { headers }),
          fetch(`${API_URL}/payments`, { headers })
        ]);
        
        if (custRes.ok && entRes.ok && payRes.ok) {
          const customers = await custRes.json();
          let entries = await entRes.json();
          let payments = await payRes.json();

          entries = entries.map(e => ({ ...e, customerId: e.customer?.id || e.customerId }));
          payments = payments.map(p => ({ ...p, customerId: p.customer?.id || p.customerId }));

          dispatch({ type: 'SET_DATA', payload: { customers, entries, payments } });
        }
      } catch (e) {
        console.error('Failed to fetch khata data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Wrap dispatch to make real API calls
  const asyncDispatch = async (action) => {
    if (!user || !user.token) return;
    const headers = { 
      'Authorization': `Bearer ${user.token}`,
      'Content-Type': 'application/json'
    };
    
    try {
      if (action.type === 'ADD_CUSTOMER') {
        const { id, ...payloadWithoutId } = action.payload;
        const res = await fetch(`${API_URL}/customers`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payloadWithoutId)
        });
        if (res.ok) {
          const savedCustomer = await res.json();
          dispatch({ type: 'ADD_CUSTOMER', payload: savedCustomer });
          return savedCustomer;
        }
      } else if (action.type === 'UPDATE_CUSTOMER') {
        const res = await fetch(`${API_URL}/customers/${action.payload.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(action.payload)
        });
        if (res.ok) {
          const updatedCustomer = await res.json();
          dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer });
        }
      } else if (action.type === 'ADD_ENTRY') {
        const { id, ...payloadWithoutId } = action.payload;
        const res = await fetch(`${API_URL}/entries`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payloadWithoutId)
        });
        if (res.ok) {
          const savedEntry = await res.json();
          savedEntry.customerId = savedEntry.customer?.id || savedEntry.customerId;
          dispatch({ type: 'ADD_ENTRY', payload: savedEntry });
          return savedEntry;
        }
      } else if (action.type === 'ADD_PAYMENT') {
        const { id, ...payloadWithoutId } = action.payload;
        const res = await fetch(`${API_URL}/payments`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payloadWithoutId)
        });
        if (res.ok) {
          const savedPayment = await res.json();
          savedPayment.customerId = savedPayment.customer?.id || savedPayment.customerId;
          dispatch({ type: 'ADD_PAYMENT', payload: savedPayment });
          return savedPayment;
        }
      } else if (action.type === 'DELETE_TRANSACTION') {
        const res = await fetch(`${API_URL}/transactions/${action.payload}`, {
          method: 'DELETE',
          headers
        });
        if (res.ok) {
          dispatch({ type: 'DELETE_TRANSACTION', payload: action.payload });
        }
      } else if (action.type === 'DELETE_TRANSACTIONS') {
        const res = await fetch(`${API_URL}/transactions?ids=${action.payload.join(',')}`, {
          method: 'DELETE',
          headers
        });
        if (res.ok) {
          dispatch({ type: 'DELETE_TRANSACTIONS', payload: action.payload });
        }
      } else {
        dispatch(action);
      }
    } catch (e) {
      console.error('API Error:', e);
    }
  };

  const value = useMemo(() => ({ state, dispatch: asyncDispatch, loading }), [state, user]);

  return <KhataContext.Provider value={value}>{children}</KhataContext.Provider>;
}

export function useKhata() {
  const ctx = useContext(KhataContext);
  if (!ctx) throw new Error('useKhata must be used within KhataProvider');
  return ctx;
}
