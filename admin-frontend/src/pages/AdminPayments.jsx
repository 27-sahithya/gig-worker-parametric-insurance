import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, User, Mail, CreditCard, ShieldCheck, Eye, Download, TrendingUp } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewImage, setViewImage] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${API}/admin/paid-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(res.data);
    } catch (err) {
      console.error("Failed to fetch payments", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = payments.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Paid Users & Revenue">
      
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-panel p-4 rounded-2xl border border-white/5">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Total Revenue (Weekly)</p>
          <p className="text-2xl font-bold text-white flex items-center gap-2">
            ₹{payments.reduce((sum, p) => sum + p.amount, 0)}
            <TrendingUp className="w-4 h-4 text-green-500" />
          </p>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/5">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Active Protected Users</p>
          <p className="text-2xl font-bold text-white">{payments.length}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/5">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Last Payment</p>
          <p className="text-sm font-bold text-gray-300">
            {payments.length > 0 ? new Date(payments[0].paid_at).toLocaleString() : 'N/A'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 text-gray-200 text-sm outline-none border border-white/5 focus:border-purple-500/50 transition-all" />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/3">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Worker</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Method</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Week Range</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Verification</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <motion.tr key={p.payment_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs uppercase">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{p.name}</p>
                        <p className="text-[10px] text-gray-500">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-white">₹{p.amount}</p>
                    <p className="text-[10px] text-gray-500">{new Date(p.paid_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <CreditCard className="w-3 h-3 text-purple-400" />
                      {p.method}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {p.week_range}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {p.user_image ? (
                      <button onClick={() => setViewImage(`${API}/${p.user_image}`)} 
                        className="flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded-lg hover:bg-blue-400/20 transition-all">
                        <Eye className="w-3 h-3" /> VIEW IMAGE
                      </button>
                    ) : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-bold uppercase">
                      <ShieldCheck className="w-3 h-3" /> Paid
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500 text-sm italic">No paid users found.</div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {viewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm" onClick={() => setViewImage(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-2xl bg-slate-900 rounded-3xl border border-white/10 p-2 shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setViewImage(null)} className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center border border-white/10 shadow-xl hover:bg-slate-700 transition-all">✕</button>
              <img src={viewImage} alt="Payment Verification" className="w-full rounded-2xl object-cover aspect-square" />
              <div className="p-4 text-center">
                <p className="text-gray-400 text-sm font-medium">Payment verification image uploaded by worker</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </AdminLayout>
  );
};

export default AdminPayments;
