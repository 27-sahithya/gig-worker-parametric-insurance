import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, ShieldCheck, Clock, CreditCard, Smartphone, Zap, Upload, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

const API = 'http://127.0.0.1:8000';

const Payments = () => {
  const { token, user } = useContext(AuthContext);
  const [status, setStatus] = useState({ is_paid: false });
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [step, setStep] = useState(1); // 1: Select Method, 2: Upload Image, 3: Success
  const [method, setMethod] = useState('UPI');
  const [image, setImage] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [sRes, hRes] = await Promise.all([
          axios.get(`${API}/payments/status`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/payments/history`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (active) {
          setStatus(sRes.data);
          setHistory(hRes.data);
        }
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (token) {
      load();
    } else {
      setLoading(false);
    }
    
    const timeout = setTimeout(() => {
      if (active) setLoading(false);
    }, 3000);

    return () => { active = false; clearTimeout(timeout); };
  }, [token]);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API}/payments/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus(res.data);
    } catch (err) {
      console.error("Status fetch failed", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API}/payments/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) {
      console.error("History fetch failed", err);
    }
  };

  const planPrices = { 'Basic': 49.0, 'Premium': 89.0, 'Pro': 129.0 };
  const amount = planPrices[user?.selected_plan] || 49.0;

  const handlePay = async () => {
    setPaying(true);
    const formData = new FormData();
    formData.append('amount', amount); 
    formData.append('method', method);
    if (image) {
      formData.append('image', image);
    }

    try {
      await axios.post(`${API}/payments/pay`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setStep(3);
      fetchStatus();
      fetchHistory();
    } catch (err) {
      const errorMsg = err.response?.data?.detail;
      const displayMsg = Array.isArray(errorMsg) ? errorMsg[0].msg : (errorMsg || err.message);
      console.error("Payment failed:", displayMsg);
      alert("Payment failed: " + displayMsg);
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <DashboardLayout title="Payments">Loading...</DashboardLayout>;

  return (
    <DashboardLayout title="Income Protection Payments">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Payment Section */}
        <div className="lg:col-span-2">
          {status.is_paid ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl p-8 text-center border border-green-500/30"
              style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.05) 100%)' }}>
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#f8fafc' }}>Protection Active</h2>
              <p className="text-slate-400 mb-6">Your income is protected for the current week.</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full text-green-400 text-sm font-bold">
                <Clock className="w-4 h-4" /> Valid until: {new Date(status.paid_until).toLocaleDateString()}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-3xl p-8 border border-orange-500/20 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl -mr-16 -mt-16" />
              
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-xl font-bold mb-1" style={{ color: '#f8fafc' }}>Weekly Protection Fee</h2>
                    <p className="text-slate-400 text-sm mb-8">Secure your earnings for the upcoming week (Mon - Sun).</p>
                    
                    <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/10 mb-8">
                      <div>
                        <p className="text-xs text-slate-800 uppercase font-bold tracking-wider">Amount to Pay</p>
                        <p className="text-3xl font-bold flex items-baseline gap-1" style={{ color: '#020617' }}>
                          <IndianRupee className="w-6 h-6 text-blackish" /> {amount}
                          <span className="text-sm font-normal text-slate-600">/week</span>
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-orange-500" />
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 tracking-widest">Select Payment Method</h3>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {['UPI', 'Card'].map(m => (
                        <button key={m} onClick={() => setMethod(m)}
                          className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${method === m ? 'border-orange-500 bg-orange-500/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                          {m === 'UPI' ? <Smartphone className={`w-6 h-6 ${method === m ? 'text-orange-500' : 'text-gray-400'}`} /> : <CreditCard className={`w-6 h-6 ${method === m ? 'text-orange-500' : 'text-gray-400'}`} />}
                          <span className={`font-bold ${method === m ? 'text-slate-50' : 'text-slate-500'}`}>{m}</span>
                        </button>
                      ))}
                    </div>

                    <button onClick={handlePay} disabled={paying}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20">
                      {paying ? 'Processing...' : `Pay ₹${amount} Now`} <ArrowRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: '#f8fafc' }}>Payment Done!</h2>
                    <p className="text-slate-400 mb-8 font-medium">Your protection is active. A confirmation email has been sent to your inbox.</p>
                    <button onClick={() => setStep(1)} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-all border border-white/10">
                      View History
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Alert */}
          {!status.is_paid && (
            <div className="mt-6 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-sm text-orange-200">
                <strong>Attention:</strong> Your income protection is currently inactive. In case of accidents or severe weather, you will not be eligible for payouts. Pay now to stay covered.
              </p>
            </div>
          )}
        </div>

        {/* History Section */}
        <div className="lg:col-span-1">
          <div className="glass-panel rounded-3xl p-6 border border-white/5">
            <h3 className="text-lg font-bold mb-6" style={{ color: '#e2e8f0' }}>Payment History</h3>
            <div className="space-y-4">
              {history.length > 0 ? history.map((h, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-sm">₹{h.amount}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{h.payment_method}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">{new Date(h.paid_at).toLocaleDateString()}</p>
                    <p className="text-[10px] text-green-500 font-bold uppercase">Success</p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-sm text-center py-8">No payment history found.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Payments;
