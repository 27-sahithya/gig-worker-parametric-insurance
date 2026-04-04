import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, AlertTriangle, Wallet, TrendingUp, Activity, Clock, Shield } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import axios from 'axios';

const StatCard = ({ icon: Icon, label, value, color, sub, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="glass-panel rounded-2xl p-5">
    <div className="flex items-start justify-between mb-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className="text-xs text-green-400 font-medium px-2 py-0.5 rounded-full bg-green-400/10">Live</span>
    </div>
    <p className="text-3xl font-bold" style={{ color: '#020617' }}>{value}</p>
    <p className="text-sm text-slate-800 mt-1 font-medium">{label}</p>
    {sub && <p className="text-xs text-slate-700 mt-1">{sub}</p>}
  </motion.div>
);

const AdminDashboard = () => {
  const [time, setTime] = useState(new Date());
  const [statsData, setStatsData] = useState({
    total_workers: 0,
    pending_approvals: 0,
    active_policies: 12,
    fraud_alerts: 0,
    total_payout: 0,
    claims_this_week: 0,
    pool_balance: 1000000,
    loss_ratio: 0,
    forecast_alerts: []
  });

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    const token = localStorage.getItem('admin_token');
    
    axios.get('http://127.0.0.1:8000/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setStatsData(res.data))
      .catch(err => console.error("Stats fetch error:", err));

    return () => clearInterval(t);
  }, []);

  const stats = [
    { icon: Wallet, label: 'Total Insurance Pool', value: `₹${statsData.pool_balance?.toLocaleString()}`, color: '#22c55e', sub: 'Live Treasury Balance', delay: 0 },
    { icon: TrendingUp, label: 'Loss Ratio', value: `${statsData.loss_ratio}%`, color: statsData.loss_ratio > 40 ? '#ef4444' : '#0ea5e9', sub: `MTD Payout vs Pool`, delay: 0.1 },
    { icon: Users, label: 'Registered Workers', value: statsData.total_workers, color: '#6366f1', delay: 0.2 },
    { icon: ShieldCheck, label: 'Active Policies', value: statsData.active_policies, color: '#a855f7', sub: 'Live protection', delay: 0.3 },
    { icon: AlertTriangle, label: 'Fraud Alerts', value: statsData.fraud_alerts, color: '#ef4444', sub: 'AI Flagged Operations', delay: 0.4 },
    { icon: Shield, label: 'Total Payouts', value: `₹${statsData.total_payout}`, color: '#f59e0b', sub: 'Disbursed cash flow', delay: 0.5 },
  ];

  const recentActivity = [
    { text: 'System Initialized', time: 'Just now', type: 'info' },
    { text: 'Monitoring Gig Economy Risks...', time: 'Live', type: 'success' },
  ];

  const typeColor = { success: '#22c55e', info: '#0ea5e9', danger: '#ef4444', neutral: '#94a3b8' };

  return (
    <AdminLayout title="Admin Overview">
      {/* Live Status Banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="rounded-2xl p-5 mb-6 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
        <div className="flex-1">
          <p className="font-bold text-lg" style={{ color: '#38bdf8' }}>System Status: All Operational ✅</p>
          <p className="text-sky-100 text-sm opacity-90">AI models active · Weather API connected · Auto-claim engine running</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="font-bold text-xl" style={{ color: '#38bdf8' }}>{time.toLocaleTimeString('en-IN')}</p>
          <p className="text-sky-100 text-xs opacity-80 font-bold tracking-widest">IST LIVE</p>
        </div>
      </motion.div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* AI Predictive Insights */}
      {statsData.forecast_alerts && statsData.forecast_alerts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="glass-panel rounded-2xl p-5 mb-6 border border-orange-500/20 bg-orange-500/5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <h3 className="font-semibold text-white">AI Predictive Insights (Next 7 Days)</h3>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full text-black font-bold bg-orange-400">Forecasting</span>
          </div>
          <div className="flex flex-col gap-3">
            {statsData.forecast_alerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-black/20 rounded-xl border border-orange-500/10">
                <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300 leading-relaxed font-medium">{alert}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="glass-panel rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">Live Activity Feed</h3>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400">Live</span>
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {recentActivity.map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.06 }}
              className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: typeColor[a.type] }} />
              <span className="text-sm text-sky-100 flex-1">{a.text}</span>
              <span className="text-xs text-sky-400 shrink-0">{a.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminDashboard;
