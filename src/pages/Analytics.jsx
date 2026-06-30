import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { useAnalytics } from '../hooks/useAnalytics';
import { StatCard, fmt, fmtDate, fmtShortDate } from '../components/ui/index';
import { TrendingUp, Calendar, Users, IndianRupee, Star } from 'lucide-react';

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

export default function Analytics() {
  const [period, setPeriod] = useState('monthly'); // daily | weekly | monthly

  const {
    dailySummaries,
    totalOutstanding,
    todayCredit,
    customersYetToPay,
    highestCreditDay,
    avgDailyCredit,
    topCustomersByOutstanding,
    mostCreditCustomer,
  } = useAnalytics();

  // Chart data based on period
  let chartData = [];
  if (period === 'daily') {
    chartData = [...dailySummaries]
      .slice(0, 14)
      .reverse()
      .map((d) => ({ label: fmtShortDate(d.date), credit: d.totalCredit, isToday: d.date === TODAY }));
  } else if (period === 'weekly') {
    // Group into 7-day buckets
    const weeks = [];
    const sorted = [...dailySummaries].sort((a, b) => new Date(a.date) - new Date(b.date));
    for (let i = 0; i < sorted.length; i += 7) {
      const chunk = sorted.slice(i, i + 7);
      const credit = chunk.reduce((s, d) => s + d.totalCredit, 0);
      weeks.push({ label: fmtShortDate(chunk[0]?.date || ''), credit });
    }
    chartData = weeks;
  } else {
    // Monthly — use all 35 days, group into 4 weeks
    chartData = [...dailySummaries]
      .slice(0, 30)
      .reverse()
      .map((d) => ({ label: fmtShortDate(d.date), credit: d.totalCredit, isToday: d.date === TODAY }));
  }

  const totalPaymentsAll = dailySummaries.reduce((s, d) => s + d.totalPayments, 0);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-primary">Analytics</h1>
          <p className="text-xs text-text-muted mt-0.5">Last 35 days</p>
        </div>
        {/* Period toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 gap-0.5">
          {['daily', 'weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${
                period === p ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards — 2 col mobile, 3 col tablet+ */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard
          label="Total Outstanding"
          value={fmt(totalOutstanding)}
          icon={IndianRupee}
          accent
        />
        <StatCard
          label="Avg Daily Credit"
          value={fmt(avgDailyCredit)}
          icon={TrendingUp}
          subtext="Active days"
        />
        <StatCard
          label="Highest Credit Day"
          value={highestCreditDay ? fmt(highestCreditDay.totalCredit) : 'N/A'}
          icon={Calendar}
          subtext={highestCreditDay ? fmtDate(highestCreditDay.date) : ''}
        />
        <StatCard
          label="Total Payments Rcvd"
          value={fmt(totalPaymentsAll)}
          subtext="All time"
        />
        <StatCard
          label="Yet To Pay"
          value={customersYetToPay}
          icon={Users}
          subtext="customers"
        />
        <StatCard
          label="Top Customer"
          value={mostCreditCustomer?.name || 'N/A'}
          icon={Star}
          subtext="Most credit given"
        />
      </div>

      {/* Chart */}
      <div className="card p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="section-title">Credit Trend</div>
            <div className="text-xs text-text-muted capitalize">{period} view</div>
          </div>
        </div>
        <div className="h-52 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#A1A1AA', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={period === 'monthly' ? 4 : 0}
              />
              <YAxis
                tick={{ fill: '#A1A1AA', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="credit" radius={[3, 3, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isToday ? '#C0392B' : '#E4E4E7'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-2 text-[11px] text-text-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-accent" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-border" />
            <span>Other days</span>
          </div>
        </div>
      </div>

      {/* Top customers leaderboard */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="section-title">Outstanding Leaderboard</span>
          <Link to="/customers" className="text-xs text-text-muted hover:text-accent font-medium">
            View All →
          </Link>
        </div>
        <div className="divide-y divide-border">
          {topCustomersByOutstanding.slice(0, 10).map((item, idx) => (
            <Link
              to={`/customers/${item.customerId}`}
              key={item.customerId}
              className="flex items-center gap-3 px-4 py-3.5 row-hover"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                idx === 0 ? 'bg-accent text-white' :
                idx === 1 ? 'bg-gray-200 text-text-secondary' :
                idx === 2 ? 'bg-gray-100 text-text-secondary' :
                'bg-gray-50 text-text-muted'
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text-primary truncate">{item.customer?.name}</div>
                {item.customer?.mobile && (
                  <div className="text-xs text-text-muted">{item.customer.mobile}</div>
                )}
              </div>
              {/* Mini bar */}
              <div className="hidden sm:flex items-center gap-2 w-32">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent/60"
                    style={{
                      width: `${Math.min(100, (item.outstanding / (topCustomersByOutstanding[0]?.outstanding || 1)) * 100)}%`
                    }}
                  />
                </div>
              </div>
              <div className="text-sm font-bold text-accent tabular-nums shrink-0">
                {fmt(item.outstanding)}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
