import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, ArrowUpDown, ArrowUp, ArrowDown, Users } from 'lucide-react';
import { useCustomers } from '../hooks/useCustomers';
import { useKhata } from '../context/KhataContext';
import { Modal, Badge, fmt, fmtDate, EmptyState } from '../components/ui/index';

const TODAY = '2026-06-29';

export default function CustomerList() {
  const customers = useCustomers();
  const { dispatch } = useKhata();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('outstanding');
  const [sortDir, setSortDir] = useState('desc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '', mobile: '', address: '', notes: '', paymentCycle: 'monthly',
  });

  const filtered = useMemo(() => {
    let list = customers;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.mobile && c.mobile.includes(q)),
      );
    }
    return [...list].sort((a, b) => {
      let aVal = a[sortKey] || 0;
      let bVal = b[sortKey] || 0;
      if (sortKey === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      }
      if (sortKey === 'lastTransactionDate') {
        aVal = a.lastTransactionDate ? new Date(a.lastTransactionDate).getTime() : 0;
        bVal = b.lastTransactionDate ? new Date(b.lastTransactionDate).getTime() : 0;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [customers, search, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  function handleAddCustomer() {
    if (!newCustomer.name.trim()) return;
    dispatch({
      type: 'ADD_CUSTOMER',
      payload: {
        id: `c${Date.now()}`,
        ...newCustomer,
        name: newCustomer.name.trim(),
        createdAt: TODAY,
      },
    });
    setShowAddModal(false);
    setNewCustomer({ name: '', mobile: '', address: '', notes: '', paymentCycle: 'monthly' });
  }

  function SortIcon({ col }) {
    if (sortKey !== col) return <ArrowUpDown size={11} className="text-text-muted ml-1" />;
    return sortDir === 'asc'
      ? <ArrowUp size={11} className="text-accent ml-1" />
      : <ArrowDown size={11} className="text-accent ml-1" />;
  }

  const SortableHeader = ({ col, label, align = 'left' }) => (
    <button
      onClick={() => toggleSort(col)}
      className={`table-header flex items-center gap-0 hover:text-text-primary transition-colors ${align === 'right' ? 'ml-auto' : ''}`}
    >
      {label}<SortIcon col={col} />
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <div className="text-xs text-text-muted mt-0.5">{customers.length} total</div>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <Plus size={15} />
          <span className="hidden sm:inline">Add Customer</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Search + Filter bar */}
      <div className="px-4 md:px-6 pt-4 pb-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            className="input-base pl-9"
            placeholder="Search by name or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="px-4 md:px-6 pb-6">
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="No customers found" subtitle="Add a new customer to get started." />
        ) : (
          <div className="card overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-gray-50 border-b border-border">
              <div className="col-span-6 sm:col-span-5 md:col-span-4">
                <SortableHeader col="name" label="Name" />
              </div>
              <div className="col-span-6 sm:col-span-4 md:col-span-3 flex justify-end">
                <SortableHeader col="outstanding" label="Outstanding" align="right" />
              </div>
              <div className="hidden sm:col-span-3 sm:flex md:col-span-3 justify-end">
                <SortableHeader col="lastTransactionDate" label="Last Txn" align="right" />
              </div>
              <div className="hidden md:block md:col-span-2 text-right">
                <span className="table-header">Status</span>
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border">
              {filtered.map((c) => (
                <Link
                  key={c.id}
                  to={`/customers/${c.id}`}
                  className="grid grid-cols-12 gap-2 px-4 py-3.5 row-hover items-center"
                >
                  <div className="col-span-6 sm:col-span-5 md:col-span-4 min-w-0">
                    <div className="text-sm font-semibold text-text-primary truncate">{c.name}</div>
                    {c.mobile && <div className="text-[10px] text-text-muted">{c.mobile}</div>}
                  </div>
                  <div className="col-span-6 sm:col-span-4 md:col-span-3 text-right">
                    <span className={`text-sm font-bold tabular-nums ${c.outstanding > 0 && c.overdue ? 'text-accent' : 'text-text-primary'}`}>
                      {fmt(c.outstanding)}
                    </span>
                  </div>
                  <div className="hidden sm:block sm:col-span-3 text-right">
                    <span className="text-xs text-text-muted">
                      {c.lastTransactionDate ? fmtDate(c.lastTransactionDate) : 'N/A'}
                    </span>
                  </div>
                  <div className="hidden md:flex md:col-span-2 justify-end">
                    {c.outstanding === 0
                      ? <Badge variant="paid">Settled</Badge>
                      : c.overdue
                        ? <Badge variant="overdue">Overdue</Badge>
                        : <Badge variant="gray">Active</Badge>
                    }
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Customer" size="md">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Name *</label>
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
            <input type="tel" className="input-base" placeholder="e.g. 9876543210"
              value={newCustomer.mobile}
              onChange={(e) => setNewCustomer({ ...newCustomer, mobile: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Address (optional)</label>
            <input type="text" className="input-base" placeholder="e.g. House No. 5, Gandhi Nagar"
              value={newCustomer.address}
              onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Payment Cycle</label>
            <select className="input-base" value={newCustomer.paymentCycle}
              onChange={(e) => setNewCustomer({ ...newCustomer, paymentCycle: e.target.value })}>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Notes (optional)</label>
            <textarea
              className="input-base resize-none"
              rows={2}
              placeholder="e.g. Pays every 1st of month"
              value={newCustomer.notes}
              onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button
              onClick={handleAddCustomer}
              disabled={!newCustomer.name.trim()}
              className="btn-primary flex-1 justify-center disabled:opacity-40"
            >
              <Plus size={14} /> Add Customer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
