import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Eye, User, Phone, Mail, FileText, Clock, Search, AlertTriangle, Shield } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

const MOCK_USERS = [
  { id: 1, name: 'Rahul Mehta', email: 'rahul@example.com', phone: '9876543210', role: 'user', status: 'pending', gov_proof: 'aadhaar.jpg', worker_proof: 'swiggy_id.jpg' },
  { id: 2, name: 'Priya Kumari', email: 'priya@example.com', phone: '9876543211', role: 'user', status: 'pending', gov_proof: 'pan.pdf', worker_proof: 'zomato_id.jpg' },
  { id: 3, name: 'Arjun Singh', email: 'arjun@example.com', phone: '9876543212', role: 'user', status: 'approved', gov_proof: 'voter.jpg', worker_proof: 'amazon_id.jpg' },
  { id: 4, name: 'Meera Nair', email: 'meera@example.com', phone: '9876543213', role: 'user', status: 'pending', gov_proof: 'dl.jpg', worker_proof: 'zepto_id.jpg' },
  { id: 5, name: 'Suresh Babu', email: 'suresh@example.com', phone: '9876543214', role: 'user', status: 'rejected', gov_proof: 'aadhaar.jpg', worker_proof: 'dunzo_id.jpg' },
];

const statusConfig = {
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Pending' },
  approved: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'Approved' },
  rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Rejected' },
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [viewDoc, setViewDoc] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter out admin users from the approval list
      const workers = (res.data || []).filter(u => u.role === 'user');
      setUsers(workers);
      setError(null);
    } catch (err) {
      console.error("Users fetch error:", err);
      setError("Failed to load users. Please check your connection or re-login.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter(u => {
    const matchFilter = filter === 'all' || u.status === filter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleAction = async (id, action) => {
    const token = localStorage.getItem('admin_token');
    setActionError(null);
    setActionLoading(id);
    if (!token) {
      setActionError('Admin authorization is missing. Please log in again and retry.');
      setActionLoading(null);
      setSelected(null);
      return;
    }
    try {
      await axios.post(`${API}/admin/${action}/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh list after action
      const res = await axios.get(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(`Action ${action} failed:`, err);
      setActionError(`Approval failed. Please refresh the page and try again.`);
    }
    setSelected(null);
    setActionLoading(null);
  };

  return (
    <AdminLayout title="User Approvals">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-gray-200 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filter === f ? 'text-white' : 'text-gray-400 hover:text-gray-200 bg-white/5'}`}
              style={filter === f ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : {}}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Status Messages */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-indigo-400">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium">Fetching secure records...</p>
        </div>
      ) : error ? (
        <div className="glass-panel rounded-2xl p-10 text-center flex flex-col items-center gap-4">
          <div className="p-3 rounded-full bg-red-400/10 text-red-400"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-white font-semibold">Connection Error</p>
            <p className="text-gray-400 text-xs mt-1">{error}</p>
          </div>
          <button onClick={fetchUsers} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all">Try Again</button>
        </div>
      ) : (
      <>
        {actionError && (
          <div className="mb-4 p-4 rounded-xl text-sm text-red-300 bg-red-500/10 border border-red-500/20">
            {actionError}
          </div>
        )}
      {/* Pending banner */}
      {users.filter(u => u.status === 'pending').length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-xl p-3 mb-4 flex items-center gap-3"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300">
            <strong>{users.filter(u => u.status === 'pending').length} users</strong> awaiting approval — review and approve to activate their policies
          </p>
        </motion.div>
      )}

      {/* Table */}
      <motion.div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Worker', 'Plan', 'Contact', 'Proofs', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((u, i) => {
                  const sc = statusConfig[u.status];
                  return (
                    <motion.tr key={u.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                            {u.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-sky-200">{u.name}</p>
                            <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest">{u.zone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase ${
                          u.selected_plan === 'Standard' ? 'text-blue-400 border-blue-400/30 bg-blue-400/5' :
                          u.selected_plan === 'Premium' ? 'text-amber-400 border-amber-400/30 bg-amber-400/5' :
                          'text-slate-400 border-slate-700 bg-slate-800'
                        }`}>
                          {u.selected_plan || 'Basic'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-sky-200 font-medium"><Mail className="w-3 h-3 text-sky-500" />{u.email}</div>
                          <div className="flex items-center gap-1.5 text-[11px] text-sky-200 font-medium"><Phone className="w-3 h-3 text-sky-500" />{u.phone}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          {u.gov_proof && (
                            <button onClick={() => setViewDoc(`${API}/${u.gov_proof.startsWith('uploads/') ? u.gov_proof : 'uploads/' + u.gov_proof}`)} className="flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded-lg hover:bg-blue-400/20 transition-all">
                              <Eye className="w-3 h-3" /> GOV ID
                            </button>
                          )}
                          {u.worker_proof && (
                            <button onClick={() => setViewDoc(`${API}/${u.worker_proof.startsWith('uploads/') ? u.worker_proof : 'uploads/' + u.worker_proof}`)} className="flex items-center gap-1 text-[10px] font-bold text-purple-400 bg-purple-400/10 px-2 py-1 rounded-lg hover:bg-purple-400/20 transition-all">
                              <Eye className="w-3 h-3" /> WORK ID
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
                      </td>
                      <td className="px-5 py-4">
                        {u.status === 'pending' && (
                          <div className="flex gap-2">
                             <motion.button  whileTap={{ scale: 0.95 }}
                              onClick={() => handleAction(u.id, 'approve')}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-green-600 hover:bg-green-500 transition-all">
                              Approve
                            </motion.button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mx-auto mb-3">
                <Shield className="w-6 h-6 border-dashed opacity-30" />
              </div>
              <p className="text-gray-500 text-sm">No verification records found</p>
            </div>
          )}
        </div>
      </motion.div>
      </>
      )}
      {/* Proof Modal */}
      <AnimatePresence>
        {viewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm" onClick={() => setViewDoc(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-full bg-slate-900 rounded-3xl border border-white/10 p-2 overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setViewDoc(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-all z-10">✕</button>
              <img src={viewDoc} alt="Document Proof" className="max-w-full max-h-[85vh] rounded-2xl object-contain" />
              <div className="p-4 text-center">
                 <p className="text-gray-400 text-sm font-medium">Verify identifying details and security features before approval</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default Users;
