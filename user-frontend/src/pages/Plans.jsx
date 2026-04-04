import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, Pause, Play, RefreshCw, Star, Crown, Diamond, CheckCircle, AlertTriangle, ArrowRight, IndianRupee } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import TiltCard from '../components/ui/TiltCard';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

const Plans = () => {
  const { token, user, checkAuth } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showChangeModal, setShowChangeModal] = useState(false);

  const planInfo = {
    'Basic':    { icon: Star,   color: '#94a3b8', price: 49,  features: ['Accident Coverage', 'Basic Health Support'] },
    'Standard': { icon: Crown,  color: '#f59e0b', price: 89,  features: ['Accident + Weather', 'Priority Support', 'Full Health Hub'] },
    'Premium':  { icon: Diamond,color: '#0ea5e9', price: 149, features: ['All Standard features', 'Family Coverage Add-on', 'Legal Aid Support'] }
  };

  const currentPlan = planInfo[user?.selected_plan] || planInfo['Basic'];

  const handleTogglePause = async () => {
    setLoading(true);
    try {
      await axios.put(`${API}/plans/toggle-pause`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await checkAuth(); // Refresh user state
      setSuccess(`Plan ${user?.is_paused ? 'Resumed' : 'Paused'} successfully!`);
    } catch (err) {
      setError('Failed to update plan status.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async (newPlan) => {
    if (newPlan === user?.selected_plan) return;
    setLoading(true);
    try {
      await axios.put(`${API}/plans/change`, { plan: newPlan }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await checkAuth();
      setShowChangeModal(false);
      setSuccess(`Plan changed to ${newPlan} successfully!`);
    } catch (err) {
      setError('Failed to change plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="My Protection Plan">
      <div className="max-w-4xl mx-auto">
        
        {/* Status Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-3xl -mr-32 -mt-32 rounded-full" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl`}
              style={{ background: `linear-gradient(135deg, ${currentPlan.color}, #1e293b)`, boxShadow: `0 0 30px ${currentPlan.color}40` }}>
              <currentPlan.icon className="w-12 h-12 text-white" />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h2 className="text-3xl font-bold text-white tracking-tight">{user?.selected_plan} Plan</h2>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${user?.is_paused ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500 animate-pulse'}`}>
                  {user?.is_paused ? 'Paused' : 'Active'}
                </span>
              </div>
              <p className="text-slate-300 text-sm mb-4">Protection secured for your work location.</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-sky-500" />
                  <span className="font-bold" style={{ color: 'var(--text-color)' }}>₹{currentPlan.price}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-60" style={{ color: 'var(--text-color)' }}>/week</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-500" />
                  <span className="font-bold" style={{ color: 'var(--text-color)' }}>{currentPlan.features.length} Features</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button onClick={handleTogglePause} disabled={loading}
                className={`py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${user?.is_paused ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30'}`}>
                {user?.is_paused ? <><Play className="w-4 h-4" /> Resume Plan</> : <><Pause className="w-4 h-4" /> Pause Plan</>}
              </button>
              <button onClick={() => setShowChangeModal(true)}
                className="py-3 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20">
                <RefreshCw className="w-4 h-4" /> Change Plan
              </button>
            </div>
          </div>

          {user?.is_paused && (
            <div className="mt-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">
                <strong>Attention:</strong> Your protection is currently paused. Automated claims for rainfall and pollution are disabled until you resume.
              </p>
            </div>
          )}
        </motion.div>

        {success && <div className="p-4 mb-6 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium flex items-center gap-2 animate-bounce"><CheckCircle className="w-4 h-4" /> {success}</div>}
        {error && <div className="p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {error}</div>}

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TiltCard className="p-6">
            <h3 className="font-bold mb-6 flex items-center gap-2" style={{ color: '#e2e8f0' }}>
              <Zap className="w-5 h-5 text-orange-400" /> Plan Features
            </h3>
            <div className="space-y-4">
              {currentPlan.features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-sky-400" />
                  <span className="text-sm text-slate-100 font-medium">{f}</span>
                </div>
              ))}
            </div>
          </TiltCard>

          <TiltCard className="p-6">
            <h3 className="font-bold mb-6 flex items-center gap-2" style={{ color: '#e2e8f0' }}>
              <ShieldCheck className="w-5 h-5 text-blue-400" /> Security Info
            </h3>
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Your protection is powered by **Rakshak Core AI**. We monitor weather patterns and pollution levels 24/7. Claims are triggered automatically when risk thresholds are exceeded.
              </p>
              <div className="p-3 rounded-xl bg-blue-400/5 border border-blue-400/20 text-[11px] text-blue-400">
                Verified secure by Guidewire Cloud Integrity
              </div>
            </div>
          </TiltCard>
        </div>

        {/* Change Plan Modal */}
        <AnimatePresence>
          {showChangeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="bg-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold" style={{ color: '#818cf8' }}>Upgrade or Switch Plan</h3>
                  <button onClick={() => setShowChangeModal(false)} className="text-slate-500 hover:text-white">✕</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {Object.entries(planInfo).map(([name, info]) => {
                    const isCurrent = user?.selected_plan === name;
                    return (
                      <button key={name} onClick={() => handleChangePlan(name)}
                        disabled={loading || isCurrent}
                        className={`p-6 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-4 ${isCurrent ? 'border-orange-500 bg-orange-500/10 opacity-50' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                        <info.icon className="w-10 h-10" style={{ color: info.color }} />
                        <div>
                          <p className="font-bold text-white">{name}</p>
                          <p className="text-orange-400 font-bold">₹{info.price}</p>
                        </div>
                        {isCurrent ? <span className="text-[10px] text-orange-400 uppercase font-bold tracking-widest">Current Plan</span> : <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Select</span>}
                      </button>
                    );
                  })}
                </div>

                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-8">
                  <p className="text-xs text-orange-200 leading-relaxed">
                    <strong>Note:</strong> Plan changes take effect immediately. If you upgrade, you'll gain access to new features and higher coverage thresholds instantly.
                  </p>
                </div>

                <button onClick={() => setShowChangeModal(false)} className="w-full py-4 text-gray-400 font-bold hover:text-white transition-colors">
                  Cancel
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default Plans;
