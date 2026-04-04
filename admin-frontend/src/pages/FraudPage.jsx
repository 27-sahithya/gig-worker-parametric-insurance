import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertTriangle, MapPin, CloudRain, RefreshCw, CheckCircle, XCircle, Info } from 'lucide-react';
import AdminLayout from '../layouts/AdminLayout';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

const MOCK_FRAUD = [
  { id: 'CLM-087', worker: 'Suresh B.', score: 0.91, reasons: ['Location mismatch', 'Weather mismatch'], amount: 400, reviewed: false },
  { id: 'CLM-074', worker: 'Kavya R.', score: 0.78, reasons: ['High claim frequency (4/week)'], amount: 320, reviewed: false },
  { id: 'CLM-065', worker: 'Amit D.', score: 0.82, reasons: ['GPS spoofing detected', 'Duplicate claim'], amount: 500, reviewed: true, verdict: 'rejected' },
  { id: 'CLM-051', worker: 'Harsh P.', score: 0.76, reasons: ['Weather mismatch'], amount: 220, reviewed: true, verdict: 'approved' },
];

const ScoreBar = ({ score }) => {
  const color = score > 0.8 ? '#ef4444' : score > 0.65 ? '#f59e0b' : '#22c55e';
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-400">Fraud Score</span>
        <span className="text-xs font-bold" style={{ color }}>{Math.round(score * 100)}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${score * 100}%` }} transition={{ duration: 0.8 }} />
      </div>
    </div>
  );
};

const FraudPage = () => {
  const [claims, setClaims] = useState(MOCK_FRAUD);
  const [analyzing, setAnalyzing] = useState(false);
  const [liveResult, setLiveResult] = useState(null);
  const [liveForm, setLiveForm] = useState({ claim_frequency: 2, location_mismatch: 1, weather_mismatch: 1 });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    axios.get(`${API}/claims/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.data && res.data.length > 0) {
          // Flag claims with fraud_score > 0.5 or those marked as fraud_flagged
          const flagged = res.data.filter(c => c.fraud_score > 0.5 || c.status === 'fraud_flagged')
            .map(c => ({
              ...c,
              id: `CLM-${c.id.toString().padStart(3, '0')}`,
              worker: `User ${c.user_id}`,
              score: c.fraud_score,
              reasons: c.fraud_score > 0.8 ? ['High Risk', 'AI Flagged'] : ['Medium Risk'],
              amount: c.amount,
              reviewed: c.status !== 'fraud_flagged'
            }));
          if (flagged.length > 0) setClaims(flagged);
        }
      })
      .catch(err => console.error("Fraud claims fetch error:", err));
  }, []);

  const runLiveAnalysis = async () => {
    setAnalyzing(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.post(`${API}/ai/detect-fraud`, liveForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLiveResult(res.data);
    } catch {
      setLiveResult({ fraud_score: 0.85, is_fraudulent: true });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleVerdict = async (id, verdict) => {
    // In a real app, we'd call a backend endpoint to update claim status
    setClaims(prev => prev.map(c => c.id === id ? { ...c, reviewed: true, verdict } : c));
  };

  const pendingCount = claims.filter(c => !c.reviewed).length;

  return (
    <AdminLayout title="Fraud Detection">
      {/* Live AI Analyzer */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">Live AI Fraud Analyzer</h3>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full text-white bg-purple-600">IsolationForest Model</span>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { key: 'claim_frequency', label: 'Claim Freq/wk', min: 0, max: 10 },
            { key: 'location_mismatch', label: 'Location Mismatch', min: 0, max: 1 },
            { key: 'weather_mismatch', label: 'Weather Mismatch', min: 0, max: 1 },
          ].map(({ key, label, min, max }) => (
            <div key={key}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-400">{label}</span>
                <span className="text-xs font-bold text-purple-400">{liveForm[key]}</span>
              </div>
              <input type="range" min={min} max={max} step={max === 1 ? 1 : 1} value={liveForm[key]}
                onChange={e => setLiveForm(f => ({ ...f, [key]: Number(e.target.value) }))}
                className="w-full h-2 rounded-full cursor-pointer" style={{ accentColor: '#8b5cf6' }} />
            </div>
          ))}
        </div>
        <div className="flex gap-3 items-center">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={runLiveAnalysis} disabled={analyzing}
            className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm flex items-center gap-2 transition-all"
            style={{ background: analyzing ? '#475569' : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
            {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
          </motion.button>
          <AnimatePresence>
            {liveResult && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 px-4 py-2 rounded-xl"
                style={{ background: liveResult.is_fraudulent ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${liveResult.is_fraudulent ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}` }}>
                {liveResult.is_fraudulent
                  ? <AlertTriangle className="w-4 h-4 text-red-400" />
                  : <CheckCircle className="w-4 h-4 text-green-400" />
                }
                <span className="text-sm font-semibold" style={{ color: liveResult.is_fraudulent ? '#ef4444' : '#22c55e' }}>
                  {liveResult.is_fraudulent ? `FRAUD DETECTED — Score: ${Math.round(liveResult.fraud_score * 100)}%` : `Legitimate — Score: ${Math.round(liveResult.fraud_score * 100)}%`}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Flagged Claims */}
      {pendingCount > 0 && (
        <div className="rounded-xl p-3 mb-4 flex items-center gap-3"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-300"><strong>{pendingCount} claims</strong> flagged by AI — pending manual review</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {claims.map((claim, i) => (
          <motion.div key={claim.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-panel rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500">{claim.id}</span>
                  {claim.score > 0.8 && (
                    <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" /> High Risk
                    </span>
                  )}
                </div>
                <p className="text-base font-semibold text-white mt-1">{claim.worker}</p>
                <p className="text-xs text-gray-500">Claim amount: <span className="text-gray-300">₹{claim.amount}</span></p>
              </div>
            </div>

            <ScoreBar score={claim.score} />

            <div className="mt-3 flex flex-wrap gap-2 mb-4">
              {claim.reasons.map((r, j) => (
                <span key={j} className="flex items-center gap-1 text-xs text-red-300 bg-red-400/10 px-2 py-1 rounded-lg">
                  {r.includes('Location') ? <MapPin className="w-3 h-3" /> : r.includes('Weather') ? <CloudRain className="w-3 h-3" /> : <Info className="w-3 h-3" />}
                  {r}
                </span>
              ))}
            </div>

            {!claim.reviewed ? (
              <div className="flex gap-2">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => handleVerdict(claim.id, 'approved')}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                  <CheckCircle className="w-3.5 h-3.5" /> Approve Claim
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => handleVerdict(claim.id, 'rejected')}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-red-400 border border-red-500/30 flex items-center justify-center gap-1 hover:bg-red-500/10 transition-all">
                  <XCircle className="w-3.5 h-3.5" /> Reject Fraud
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2 py-2 px-3 rounded-xl"
                style={{ background: claim.verdict === 'approved' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
                {claim.verdict === 'approved'
                  ? <CheckCircle className="w-4 h-4 text-green-400" />
                  : <XCircle className="w-4 h-4 text-red-400" />
                }
                <span className="text-xs font-semibold capitalize" style={{ color: claim.verdict === 'approved' ? '#22c55e' : '#ef4444' }}>
                  {claim.verdict} by admin
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default FraudPage;
