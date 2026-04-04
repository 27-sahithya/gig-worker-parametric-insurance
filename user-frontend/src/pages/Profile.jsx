import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, ShieldCheck, Calendar, Zap, CreditCard } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import TiltCard from '../components/ui/TiltCard';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

const Profile = () => {
  const { user, token } = useContext(AuthContext);
  const [activePolicy, setActivePolicy] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ email: '', upi_id: '' });
  const [avatarObj, setAvatarObj] = useState(null);
  
  useEffect(() => {
    if (token) {
      axios.get(`${API}/policy/my-policy`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setActivePolicy(res.data))
      .catch(() => setActivePolicy(null));
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      setFormData({ email: user.email || '', upi_id: user.upi_id || '' });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      if(formData.email !== user.email) data.append('email', formData.email);
      if(formData.upi_id !== user.upi_id) data.append('upi_id', formData.upi_id);
      if(avatarObj) data.append('image', avatarObj);

      const res = await axios.put(`${API}/auth/profile/update`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // A full app would update AuthContext here, we'll force reload to trigger /me
      window.location.reload();
    } catch (err) {
      alert("Update failed: " + (err.response?.data?.detail || "Unknown error"));
    }
  };

  const profileItems = [
    { icon: User, label: 'Full Name', value: user?.name || 'Worker' },
    { icon: Mail, label: 'Email Address', value: user?.email || 'N/A', editable: 'email' },
    { icon: Phone, label: 'Phone Number', value: user?.phone || 'N/A' },
    { icon: MapPin, label: 'Active Zone', value: user?.zone || 'Mumbai (MH)' },
  ];

  return (
    <DashboardLayout title="My Profile">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Basic Info */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-1">
          <TiltCard className="text-center h-full relative">
            <button onClick={() => setEditMode(!editMode)} className="absolute top-4 right-4 text-xs font-bold text-orange-400 border border-orange-400/20 px-2 py-1 rounded-lg hover:bg-orange-400/10 transition-all">
              {editMode ? 'CANCEL' : 'EDIT'}
            </button>

            {editMode ? (
              <form onSubmit={handleUpdate} className="mt-8 flex flex-col gap-4 text-left">
                <p className="text-xs text-gray-400 text-center mb-2">Upload new avatar</p>
                <input type="file" accept="image/*" onChange={(e) => setAvatarObj(e.target.files[0])} className="text-xs text-gray-300 w-full mb-2" />
                
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Update Email</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
                    className="w-full px-3 py-2 rounded-xl text-slate-50 text-sm outline-none border border-white/10 bg-white/5 focus:border-orange-500/50" />
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Update UPI ID</label>
                  <input type="text" required value={formData.upi_id} onChange={e => setFormData({...formData, upi_id: e.target.value})} 
                    className="w-full px-3 py-2 rounded-xl text-slate-50 text-sm outline-none border border-white/10 bg-white/5 focus:border-orange-500/50" />
                </div>
                
                <button type="submit" className="w-full mt-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-bold text-sm text-white shadow-lg hover:opacity-90">
                  Save Changes
                </button>
              </form>
            ) : (
              <>
                <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-orange-500/20 p-1 mt-6">
                  {user?.user_image ? (
                    <img src={`${API}/${user.user_image}`} className="w-full h-full rounded-full object-cover" alt="Profile" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                      {user?.name?.[0] || 'W'}
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold mb-1" style={{ color: '#e2e8f0' }}>{user?.name || 'Worker'}</h2>
                <p className="text-xs text-gray-400 mb-4 px-2 py-1 rounded-full bg-white/5 inline-block">Gig Partner · ID #{user?.id || '0000'}</p>
                <div className="text-left mt-6 space-y-4">
                  {profileItems.map(({ icon: Icon, label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-slate-400 flex items-center gap-2 mb-1 uppercase font-bold tracking-tighter opacity-80">
                        <Icon className="w-3.5 h-3.5 text-sky-500" /> {label}
                      </p>
                      <p className="text-sm font-medium break-words overflow-hidden text-ellipsis w-full" style={{ color: '#f1f5f9' }}>{value}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TiltCard>
        </motion.div>

        {/* Right Column: Policy & Protection Details */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-2 space-y-6">
          <TiltCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2" style={{ color: '#e2e8f0' }}>
                <ShieldCheck className="w-5 h-5 text-green-400" /> Active Protection
              </h3>
              {activePolicy && (
                <span className="text-xs px-2 py-1 rounded-full bg-green-400/10 text-green-400 border border-green-400/20">
                  ACTIVE
                </span>
              )}
            </div>

            {activePolicy ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-1 opacity-60" style={{ color: 'var(--text-color)' }}>Current Plan</p>
                    <p className="text-lg font-bold text-sky-400">{user?.selected_plan || 'Basic'} Plan</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs mb-1 opacity-60" style={{ color: 'var(--text-color)' }}>Weekly Premium</p>
                    <p className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>₹{activePolicy ? activePolicy.weekly_premium : '0'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-500 mb-1">Coverage Start</p>
                    <p className="text-sm font-medium" style={{ color: '#f1f5f9' }}>{new Date(activePolicy.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-500 mb-1">Expiry Date</p>
                    <p className="text-sm font-medium" style={{ color: '#f1f5f9' }}>{new Date(activePolicy.expires_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <ShieldCheck className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400">No active policy found. Buy protection to safeguard your income.</p>
                <button className="mt-4 text-xs text-orange-400 underline">View Plans</button>
              </div>
            )}
          </TiltCard>

          <TiltCard>
            <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#e2e8f0' }}>
              <CreditCard className="w-5 h-5 text-blue-400" /> Payment & Payouts
            </h3>
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-400/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-50">Instant UPI Payout</p>
                  <p className="text-xs text-gray-500">Verified ID: worker@upi</p>
                </div>
              </div>
              <span className="text-xs text-green-400 font-bold">VERIFIED</span>
            </div>
            <p className="text-xs text-slate-400 mt-4 italic text-center font-medium">Your linked account is active. Payouts are credited within 15 minutes of auto-approval.</p>
          </TiltCard>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
