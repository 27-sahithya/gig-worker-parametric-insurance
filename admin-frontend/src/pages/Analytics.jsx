import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Wallet, ShieldCheck, PieChart, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

const Analytics = () => {
  const [stats, setStats] = useState({
    total_workers: 0,
    active_policies: 0,
    pool_balance: 0,
    total_payout: 0,
    loss_ratio: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    axios.get(`${API}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setStats(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Stats error", err);
      setLoading(false);
    });
  }, []);

  const ChartPlaceholder = ({ title, height = "150px" }) => (
    <div className="glass-panel p-5 rounded-2xl border border-white/5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{title}</h3>
        <PieChart className="w-4 h-4 text-slate-500" />
      </div>
      <div className="flex-1 flex items-end gap-2 px-2" style={{ height }}>
        {[40, 70, 45, 90, 65, 80, 50, 85, 60, 95].map((h, i) => (
          <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.05 }}
            className="flex-1 rounded-t-lg" 
            style={{ background: 'linear-gradient(to top, #6366f1, #8b5cf6)' }} />
        ))}
      </div>
    </div>
  );

  return (
    <AdminLayout title="System Analytics">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Revenue Growth', value: '+12.5%', color: '#22c55e', icon: ArrowUpRight },
              { label: 'Loss Ratio', value: `${stats.loss_ratio}%`, color: stats.loss_ratio > 40 ? '#ef4444' : '#0ea5e9', icon: stats.loss_ratio > 40 ? ArrowUpRight : ArrowDownRight },
              { label: 'Retention Rate', value: '94%', color: '#a855f7', icon: Activity },
              { label: 'Payout Efficiency', value: '99.8%', color: '#f59e0b', icon: ShieldCheck }
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="glass-panel p-5 rounded-2xl border border-sky-500/20 bg-sky-500/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-sky-400 uppercase tracking-widest">{item.label}</p>
                  <item.icon className="w-4 h-4 text-sky-500" />
                </div>
                <p className="text-2xl font-bold text-sky-100">{item.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartPlaceholder title="Weekly Premium Collection" height="240px" />
            <ChartPlaceholder title="Policy Activation Trends" height="240px" />
          </div>

          {/* Deep Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/5 col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white">Revenue vs Payouts</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Total Premium Collected</span>
                  <span className="text-green-400 font-bold">₹{(stats.pool_balance + stats.total_payout).toLocaleString()}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                  <motion.div className="h-full bg-green-500 shadow-lg shadow-green-500/20" 
                    initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1 }} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Total Claims Disbursed</span>
                  <span className="text-red-400 font-bold">₹{stats.total_payout.toLocaleString()}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                  <motion.div className="h-full bg-red-500 shadow-lg shadow-red-500/20" 
                    initial={{ width: 0 }} animate={{ width: `${stats.loss_ratio}%` }} transition={{ duration: 1, delay: 0.5 }} />
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white">Zone Distribution</h3>
              </div>
              <div className="space-y-4">
                {['Mumbai North', 'Delhi South', 'Hyderabad', 'Bangalore East'].map((zone, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{zone}</span>
                    <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${Math.random() * 60 + 30}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Analytics;
