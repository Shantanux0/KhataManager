import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  TrendingUp, IndianRupee, Users, AlertCircle, ArrowUpRight, Plus,
} from 'lucide-react';
import { StatCard, fmt, fmtDate, fmtShortDate, fmtTime } from '../components/ui/index';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAllTransactions } from '../hooks/useEntries';
import { useCustomers } from '../hooks/useCustomers';
import { useKhata } from '../context/KhataContext';

import { getTodayIST } from '../utils/dateUtils';
const TODAY = getTodayIST();

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
        <div className="text-text-muted mb-0.5">{label}</div>
        <div className="font-bold text-text-primary">{fmt(payload[0].value)}</div>
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  const {
    totalOutstanding,
    todayCredit,
    todayPaymentsTotal,
    customersYetToPay,
    dailySummaries,
    topCustomersByOutstanding,
  } = useAnalytics();

  const allTransactions = useAllTransactions();
  const customers = useCustomers();
  const { state } = useKhata();

  // Chart data: last 30 days reversed so oldest is leftmost
  const chartData = [...dailySummaries]
    .slice(0, 30)
    .reverse()
    .map((d) => ({
      date: fmtShortDate(d.date),
      credit: d.totalCredit,
      isToday: d.date === TODAY,
    }));

  // Recent transactions (last 20)
  const recentActivity = allTransactions.slice(0, 20).map((txn) => {
    const customer = customers.find((c) => String(c.id) === String(txn.customerId));
    return { ...txn, customerName: customer?.name || 'Unknown' };
  });

  const top5 = topCustomersByOutstanding.slice(0, 5);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">

      {/* KPI Cards — 2 col on mobile, 4 col on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Outstanding"
          value={fmt(totalOutstanding)}
          icon={IndianRupee}
          accent
        />
        <StatCard
          label="Today's Credit"
          value={fmt(todayCredit)}
          icon={TrendingUp}
          subtext="Given today"
        />
        <StatCard
          label="Today's Payments"
          value={fmt(todayPaymentsTotal)}
          subtext="Received today"
        />
        <StatCard
          label="Yet To Pay"
          value={customersYetToPay}
          icon={Users}
          subtext="customers"
        />
      </div>

      {/* Trend Chart */}
      <div className="card p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="section-title">Credit Trend</div>
            <div className="text-xs text-text-muted">Last 30 days</div>
          </div>
        </div>
        <div className="h-44 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="creditGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C0392B" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#C0392B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#A1A1AA', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: '#A1A1AA', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="credit"
                stroke="#C0392B"
                strokeWidth={2}
                fill="url(#creditGrad)"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.isToday) {
                    return <circle key={`dot-today`} cx={cx} cy={cy} r={4} fill="#C0392B" stroke="#fff" strokeWidth={2} />;
                  }
                  return null;
                }}
                activeDot={{ r: 5, fill: '#C0392B', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom two-column layout — stacked on tablet, side-by-side on xl */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="section-title">Recent Activity</span>
          </div>
          <div className="divide-y divide-border">
            {recentActivity.slice(0, 10).map((txn) => (
              <div key={txn.id} className="flex items-center justify-between px-4 py-3 row-hover">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">{txn.customerName}</div>
                  <div className="text-xs text-text-muted">{fmtDate(txn.date)} · {fmtTime(txn.timestamp)}</div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className={`text-sm font-semibold tabular-nums ${txn.txnType === 'payment' ? 'text-green-600' : 'text-text-primary'}`}>
                    {txn.txnType === 'payment' ? '-' : '+'}{fmt(txn.amount)}
                  </div>
                  <div className={`text-[10px] font-medium ${txn.txnType === 'payment' ? 'text-green-600' : 'text-text-muted'}`}>
                    {txn.txnType === 'payment' ? 'Payment' : 'Credit'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Outstanding */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="section-title">Top Outstanding</span>
            <Link to="/customers" className="text-xs text-text-muted hover:text-accent font-medium flex items-center gap-1">
              View All <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {top5.map((item, idx) => (
              <Link
                to={`/customers/${item.customerId}`}
                key={item.customerId}
                className="flex items-center gap-3 px-4 py-3 row-hover"
              >
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-text-muted shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">
                    {item.customer?.name}
                  </div>
                  {item.customer?.mobile && (
                    <div className="text-xs text-text-muted">{item.customer.mobile}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold tabular-nums text-accent">
                    {fmt(item.outstanding)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
