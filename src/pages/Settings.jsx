import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, Store, User, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    shopName: user?.shopName || '',
    email: user?.email || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.shopName.trim() || !form.email.trim()) {
      toast.error('All fields are required');
      return;
    }
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Settings updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full px-4 py-6">
      <div className="page-header mb-6">
        <h1 className="page-title">Shop Settings</h1>
        <p className="text-xs text-text-muted mt-1">Manage your shop name and account profile</p>
      </div>

      <div className="card p-6 bg-white border border-border rounded-2xl shadow-sm">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">
              Shop / Business Name
            </label>
            <div className="relative">
              <Store size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-border rounded-xl outline-none focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-text-primary font-medium"
                placeholder="Enter Shop Name"
                value={form.shopName}
                onChange={(e) => setForm({ ...form, shopName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">
              Owner Name
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-border rounded-xl outline-none focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-text-primary font-medium"
                placeholder="Enter Owner Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-border rounded-xl outline-none focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-text-primary font-medium"
                placeholder="Enter Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-black text-white bg-accent rounded-xl hover:bg-accent-hover active:scale-95 transition-all disabled:opacity-50"
          >
            <Check size={16} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
