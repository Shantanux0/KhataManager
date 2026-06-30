import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit3, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/ui/index';
import toast from 'react-hot-toast';

export default function ItemsInventory() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', unit: 'kg' });
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api';

  useEffect(() => {
    if (user?.token) {
      fetchItems();
    }
  }, [user]);

  const fetchItems = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API_URL}/items`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({ name: '', price: '', unit: 'kg' });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({ name: item.name, price: item.price.toString(), unit: item.unit });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price.trim()) {
      toast.error('All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      const url = editingItem ? `${API_URL}/items/${editingItem.id}` : `${API_URL}/items`;
      const method = editingItem ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          name: form.name.trim(),
          price: parseFloat(form.price),
          unit: form.unit
        })
      });
      if (res.ok) {
        toast.success(editingItem ? 'Item updated successfully!' : 'Item added successfully!');
        fetchItems();
        setShowModal(false);
      } else {
        toast.error('Failed to save item');
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await fetch(`${API_URL}/items/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        toast.success('Item deleted successfully');
        fetchItems();
      } else {
        toast.error('Failed to delete item');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-6">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title text-2xl font-bold">Grocery Items Master</h1>
          <p className="text-xs text-text-muted mt-1">Configure default selling prices and measurement units</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-xl font-bold text-sm">
          <Plus size={16} />
          Add Item
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-border rounded-xl outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-text-primary font-medium"
            placeholder="Search items by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-accent" size={32} />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card p-12 text-center text-text-muted bg-white border border-border rounded-2xl">
          No items found. Click "Add Item" to set up your grocery list.
        </div>
      ) : (
        <div className="card overflow-hidden bg-white border border-border rounded-2xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="px-5 py-3.5 text-xs font-bold text-text-secondary uppercase tracking-wider">Item Name</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-text-secondary uppercase tracking-wider">Default Unit</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Selling Price</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-semibold text-text-primary">{item.name}</td>
                    <td className="px-5 py-4 text-sm text-text-secondary"><span className="badge bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs uppercase font-bold">{item.unit}</span></td>
                    <td className="px-5 py-4 text-sm font-bold text-text-primary text-right">₹{item.price.toFixed(2)} per {item.unit}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenEdit(item)} className="p-1.5 rounded-lg text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-all">
                          <Edit3 size={15} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-all">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Item' : 'Add Item'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5 block">Item Name</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-border rounded-xl outline-none focus:bg-white focus:border-accent transition-all text-text-primary font-medium"
                placeholder="e.g. Sugar, Rice, Milk"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5 block">Default Unit</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-border rounded-xl outline-none focus:bg-white focus:border-accent transition-all text-text-primary font-medium"
                  placeholder="e.g. 1 kg, 500 g, 1 litre"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5 block">Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-border rounded-xl outline-none focus:bg-white focus:border-accent transition-all text-text-primary font-medium"
                  placeholder="Selling Price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 text-sm font-bold text-white bg-accent rounded-xl hover:bg-accent-hover transition-all disabled:opacity-50 mt-4"
            >
              {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Item'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
