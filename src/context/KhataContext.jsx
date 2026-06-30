import React, { createContext, useContext, useReducer, useMemo, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const KhataContext = createContext(null);

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
          c.id === action.payload.id ? { ...c, ...action.payload } : c,
        ),
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
          fetch('http://localhost:8082/api/customers', { headers }),
          fetch('http://localhost:8082/api/entries', { headers }),
          fetch('http://localhost:8082/api/payments', { headers })
        ]);
        
        if (custRes.ok && entRes.ok && payRes.ok) {
          const customers = await custRes.json();
          const entries = await entRes.json();
          const payments = await payRes.json();
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
        const res = await fetch('http://localhost:8082/api/customers', {
          method: 'POST',
          headers,
          body: JSON.stringify(action.payload)
        });
        if (res.ok) {
          const savedCustomer = await res.json();
          dispatch({ type: 'ADD_CUSTOMER', payload: savedCustomer });
          // If this was initiated by ADD_ENTRY or ADD_PAYMENT, we need the new ID.
          // For simplicity, we just dispatch and return the new ID to callers if they await.
          return savedCustomer;
        }
      } else if (action.type === 'UPDATE_CUSTOMER') {
        const res = await fetch(`http://localhost:8082/api/customers/${action.payload.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(action.payload)
        });
        if (res.ok) {
          const updatedCustomer = await res.json();
          dispatch({ type: 'UPDATE_CUSTOMER', payload: updatedCustomer });
        }
      } else if (action.type === 'ADD_ENTRY') {
        const res = await fetch('http://localhost:8082/api/entries', {
          method: 'POST',
          headers,
          body: JSON.stringify(action.payload)
        });
        if (res.ok) {
          const savedEntry = await res.json();
          dispatch({ type: 'ADD_ENTRY', payload: savedEntry });
        }
      } else if (action.type === 'ADD_PAYMENT') {
        const res = await fetch('http://localhost:8082/api/payments', {
          method: 'POST',
          headers,
          body: JSON.stringify(action.payload)
        });
        if (res.ok) {
          const savedPayment = await res.json();
          dispatch({ type: 'ADD_PAYMENT', payload: savedPayment });
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
