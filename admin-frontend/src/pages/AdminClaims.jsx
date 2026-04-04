import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, CloudRain, Wind, AlertTriangle, Filter } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';

const MOCK_CLAIMS = [
  { id: 'CLM-091', worker: 'Rahul M.', trigger: 'Heavy Rain (95mm)', amount: 320, status: 'auto_approved', fraud_score: 0.05, time: '10 min ago', zone: 'Mumbai South' },
  { id: 'CLM-089', worker: 'Priya K.', trigger: 'Severe Pollution (AQI 465)', amount: 180, status: 'auto_approved', fraud_score: 0.09, time: '42 min ago', zone: 'Delhi NCR' },
  { id: 'CLM-088', worker: 'Arjun S.', trigger: 'Local Curfew — Zone 4', amount: 250, status: 'pending_review', fraud_score: 0.44, time: '1h ago', zone: 'Bengaluru West' },
  { id: 'CLM-087', worker: 'Suresh B.', trigger: 'Heavy Rain (claimed)', amount: 400, status: 'fraud_flagged', fraud_score: 0.91, time: '2h ago', zone: 'Chennai Central' },
  { id: 'CLM-085', worker: 'Meera N.', trigger: 'Flood Alert', amount: 500, status: 'auto_approved', fraud_score: 0.07, time: '3h ago', zone: 'Hyderabad' },
  { id: 'CLM-082', worker: 'Kavya R.', trigger: 'Strike — No pickup', amount: 200, status: 'auto_approved', fraud_score: 0.12, time: '5h ago', zone: 'Pune' },
];

const statusConfig = {
  auto_approved: { icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'Auto Approved' },
  pending_review: { icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Pending Review' },
  fraud_flagged: { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Fraud Flagged' },
};

const AdminClaims = () => {
  const [claims, setClaims] = useState(MOCK_CLAIMS);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    axios.get('http://127.0.0.1:8000/claims/all', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.data && res.data.length > 0) {
          setClaims(res.data.map(c => ({
              ...c,
              id: `CLM-${c.id.toString().padStart(3, '0')}`,
              worker: c.user_id ? `User ${c.user_id}` : 'Unknown', // In real app, we'd join with User
              time: new Date(c.created_at).toLocaleTimeString()
          })));
        }
      })
      .catch(err => console.error("Claims fetch error:", err));
  }, []);

  const filtered = filter === 'all' ? claims : claims.filter(c => c.status === filter);
  const totals = {
    total: MOCK_CLAIMS.length,
    approved: MOCK_CLAIMS.filter(c => c.status === 'auto_approved').length,
    pending: MOCK_CLAIMS.filter(c => c.status === 'pending_review').length,
    fraud: MOCK_CLAIMS.filter(c => c.status === 'fraud_flagged').length,
    payout: MOCK_CLAIMS.filter(c => c.status === 'auto_approved').reduce((a, c) => a + c.amount, 0),
  };

  return (
    <AdminLayout title="Claims Monitor">
      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Today', value: totals.total, color: '#6366f1' },
          { label: 'Auto Approved', value: totals.approved, color: '#22c55e' },
          { label: 'Pending Review', value: totals.pending, color: '#f59e0b' },
          { label: 'Total Payout', value: `₹${totals.payout}`, color: '#0ea5e9' },
        ].map(({ label, value, color }, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-panel rounded-xl p-4 text-center">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        <Filter className="w-4 h-4 text-gray-500 self-center" />
        {[
          { key: 'all', label: 'All' },
          { key: 'auto_approved', label: 'Approved' },
          { key: 'pending_review', label: 'Pending' },
          { key: 'fraud_flagged', label: 'Fraud' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === key ? 'text-white' : 'text-gray-400 bg-white/5 hover:text-gray-200'}`}
            style={filter === key ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : {}}>
            {label}
          </button>
        ))}
      </div>

      {/* Claims List */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Claim ID', 'Worker', 'Trigger', 'Zone', 'Payout', 'Fraud Score', 'Status', 'Time'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const sc = statusConfig[c.status];
                const Icon = sc.icon;
                const fraudColor = c.fraud_score > 0.7 ? '#ef4444' : c.fraud_score > 0.4 ? '#f59e0b' : '#22c55e';
                return (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-mono text-purple-400">{c.id}</td>
                    <td className="px-5 py-3.5 text-sm text-white font-medium">{c.worker}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-300">
                        {c.trigger.includes('Rain') || c.trigger.includes('Flood') ? <CloudRain className="w-3 h-3 text-blue-400" /> : <Wind className="w-3 h-3 text-gray-400" />}
                        {c.trigger}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">{c.zone}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-white">₹{c.amount}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold" style={{ color: fraudColor }}>
                        {Math.round(c.fraud_score * 100)}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-fit"
                        style={{ color: sc.color, background: sc.bg }}>
                        <Icon className="w-3 h-3" />{sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{c.time}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminClaims;
