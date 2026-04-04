import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, CheckCircle, Clock, XCircle, AlertTriangle, Zap, IndianRupee } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import TiltCard from '../components/ui/TiltCard';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

const Claims = () => {
  const { token } = useContext(AuthContext);
  const [claims, setClaims] = useState([]);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const [spoofGps, setSpoofGps] = useState(false);

  const statusConfig = {
    approved: { icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'Approved' },
    pending: { icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Pending' },
    rejected: { icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Suspicious' },
  };

  useEffect(() => {
    if (token) {
      axios.get(`${API}/claims/my-claims`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setClaims(res.data))
      .catch(err => console.error("Claims fetch error:", err));
    }
  }, [token]);

  const simulateEvent = async (eventType) => {
    setSimulating(true);
    setSimResult(null);
    try {
      const [res] = await Promise.all([
        axios.post(`${API}/claims/auto-trigger?event_type=${eventType}&simulate_gps_spoof=${spoofGps}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        new Promise(r => setTimeout(r, 3000))
      ]);
      
      if (res.data.triggered) {
        setSimResult({
          trigger: res.data.trigger,
          payout: res.data.amount,
          id: res.data.claim_id,
          status: res.data.status,
          receipt: res.data.receipt
        });
        // Refresh history
        const refreshed = await axios.get(`${API}/claims/my-claims`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClaims(refreshed.data);
      } else {
        alert(res.data.message || "No disruption detected.");
      }
    } catch (err) {
      console.error("Simulation failed:", err);
      alert("Simulation failed. Ensure you have an active policy.");
    } finally {
      setSimulating(false);
    }
  };

  const totalPayout = claims.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.amount, 0);

  return (
    <DashboardLayout title="Claims">
      <div className="max-w-2xl mx-auto">

        {/* Auto-Trigger Demo */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <TiltCard className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold" style={{ color: '#818cf8' }}>Auto-Claim Simulator</h3>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full text-slate-50 bg-green-600">LIVE DEMO</span>
            </div>
            <p className="text-gray-400 text-xs mb-3">
              Simulate an extreme weather event to see real-time automated claim triggering and instant payout processing.
            </p>

            <div className="flex items-center justify-between p-3 mb-5 rounded-xl border border-white/5 bg-white/5">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${spoofGps ? 'text-red-500' : 'text-gray-500'}`} />
                <div>
                  <p className="text-xs font-bold text-slate-100">Simulate GPS Spoofing</p>
                  <p className="text-[10px] text-gray-400">Trigger location fraud detection</p>
                </div>
              </div>
              <button onClick={() => setSpoofGps(!spoofGps)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${spoofGps ? 'bg-red-500' : 'bg-gray-700'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${spoofGps ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {!simulating && !simResult && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => simulateEvent('heavy_rain')} className="py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 text-sm" style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}><CloudRain className="w-4 h-4" /> Heavy Rain</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => simulateEvent('extreme_heat')} className="py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 text-sm" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}><AlertTriangle className="w-4 h-4" /> Extreme Heat</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => simulateEvent('curfew')} className="py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 text-sm" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}><XCircle className="w-4 h-4" /> Curfew / Strike</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => simulateEvent('aqi')} className="py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 text-sm" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}><Zap className="w-4 h-4" /> Severe AQI</motion.button>
                </div>
              )}

              {simulating && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="py-4 flex flex-col items-center gap-4">
                  <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-300">
                    {[
                      { text: '📍 Initiated', color: '#6366f1' },
                      { text: '🔍 Under Review', color: '#f59e0b' },
                      { text: '✅ Approved', color: '#22c55e' },
                      { text: '💰 Paid', color: '#0ea5e9' }
                    ].map((step, i) => (
                      <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 1.0 }}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5"
                        style={{ border: `1px solid ${step.color}30` }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: step.color }} />
                        {step.text}
                      </motion.span>
                    ))}
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden bg-gray-700">
                    <motion.div className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #6366f1, #0ea5e9, #22c55e)' }}
                      initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 4 }} />
                  </div>
                </motion.div>
              )}

              {simResult && (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-1 rounded-xl" style={{ 
                    background: simResult.status === 'approved' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', 
                    border: `1px solid ${simResult.status === 'approved' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` 
                  }}>
                  
                  <div className="p-4 flex items-start gap-3">
                    {simResult.status === 'approved' ? <CheckCircle className="w-8 h-8 text-green-400 shrink-0 mt-1" /> : <XCircle className="w-8 h-8 text-red-400 shrink-0 mt-1" />}
                    <div className="flex-1">
                      <p className={`font-bold mb-1 ${simResult.status === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
                        {simResult.status === 'approved' ? 'Claim Auto-Approved!' : 'Claim Rejected (AI Flagged)'}
                      </p>
                      <p className="text-xs text-gray-400">Trigger: {simResult.trigger}</p>
                      <p className="text-xs text-gray-400">Claim ID: {simResult.id}</p>
                      {simResult.status === 'approved' && (
                        <p className="text-xl font-bold text-slate-50 mt-2">₹{simResult.payout} <span className="text-xs text-slate-400 font-normal">processed</span></p>
                      )}
                      
                      {simResult.status === 'fraudulent' && (
                        <div className="mt-3 p-2 bg-red-500/20 rounded border border-red-500/30 text-[10px] text-red-200">
                          <strong>Fraud Reason:</strong> Location Spoofing mismatch detected against working zone. Claim blocked.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mock Razorpay Receipt */}
                  {simResult.receipt && (
                    <div className="mx-4 mb-4 mt-2 p-3 bg-white/5 border border-white/10 rounded-lg">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                        <div className="flex items-center gap-1.5 opacity-80">
                          <Zap className="w-3 h-3 text-blue-400" />
                          <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400">{simResult.receipt.gateway}</span>
                        </div>
                        <span className="text-[10px] text-gray-500">{simResult.receipt.timestamp}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase">Transaction ID</p>
                          <p className="text-xs font-mono text-slate-300">{simResult.receipt.txn_id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500 uppercase">Method</p>
                          <p className="text-xs text-gray-300">{simResult.receipt.method}</p>
                        </div>
                      </div>
                      <div className="mt-3 py-1 flex items-center justify-center gap-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle className="w-3 h-3" /> Instantly Credited to Account
                      </div>
                    </div>
                  )}

                  <button onClick={() => setSimResult(null)}
                    className="mt-1 w-full py-2 rounded-b-xl text-xs text-gray-400 hover:bg-white/5 transition-all text-center">
                    Reset & Run again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </TiltCard>
        </motion.div>

        {/* Claims History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <TiltCard>
            <h3 className="font-semibold mb-4" style={{ color: '#e2e8f0' }}>Claims History</h3>
            <div className="flex flex-col gap-3">
              {claims.length > 0 ? claims.map((claim, i) => {
                const status = statusConfig[claim.status] || statusConfig.pending;
                const Icon = status.icon;
                return (
                  <motion.div key={claim.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="p-4 rounded-xl flex items-center gap-4"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: status.bg }}>
                      <Icon className="w-5 h-5" style={{ color: status.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-500">CLM-{claim.id.toString().padStart(4, '0')}</span>
                        {claim.fraud_score > 0.7 && (
                          <span className="flex items-center gap-1 text-xs text-red-400">
                            <AlertTriangle className="w-3 h-3" /> Flagged
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium mt-0.5 truncate" style={{ color: '#f8fafc' }}>{claim.trigger}</p>
                      <p className="text-xs text-gray-500">{new Date(claim.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-lg" style={{ color: claim.amount > 0 ? '#22c55e' : '#ef4444' }}>
                        {claim.amount > 0 ? `₹${claim.amount}` : '—'}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                    </div>
                  </motion.div>
                );
              }) : (
                <p className="text-gray-500 text-sm text-center py-4">No claims record found.</p>
              )}
            </div>
            <div className="mt-4 p-3 rounded-xl flex items-center gap-3"
              style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' }}>
              <IndianRupee className="w-4 h-4 text-orange-400 shrink-0" />
              <p className="text-xs text-orange-300">Total earnings protected: <strong>₹{totalPayout}</strong></p>
            </div>
          </TiltCard>
        </motion.div>

      </div>
    </DashboardLayout>
  );
};

export default Claims;
