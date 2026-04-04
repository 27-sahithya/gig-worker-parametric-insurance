import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, AlertTriangle, CloudRain, Zap, IndianRupee, Activity, Bell } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import TiltCard from '../components/ui/TiltCard';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

// Animated counter
const AnimatedNumber = ({ value, prefix = '', suffix = '' }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseFloat(value);
    const duration = 1200;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{display}{suffix}</span>;
};

// Risk level color
const riskColor = (score) => {
  if (score < 0.33) return '#22c55e';
  if (score < 0.66) return '#f59e0b';
  return '#ef4444';
};

const riskLabel = (score) => {
  if (score < 0.33) return 'Low';
  if (score < 0.66) return 'Moderate';
  return 'High';
};

const Dashboard = () => {
  const { user, token } = useContext(AuthContext);
  const { t } = useTranslation();
  const [riskData, setRiskData] = useState({ risk_score: 0.15, weekly_premium: 20 });
  const [activePolicy, setActivePolicy] = useState(null);
  const [claimsCount, setClaimsCount] = useState(0);
  const [totalPayout, setTotalPayout] = useState(0);
  const [alerts] = useState([
    { icon: CloudRain, text: 'Heavy rain forecast for your zone tomorrow', color: '#0ea5e9' },
    { icon: AlertTriangle, text: 'Pollution levels high in South Zone', color: '#f59e0b' },
  ]);
  const [paymentStatus, setPaymentStatus] = useState({ is_paid: false });

  useEffect(() => {
    if (token) {
      const headers = { Authorization: `Bearer ${token}` };
      
      // 1. Fetch current risk estimate
      axios.post(`${API}/ai/predict-risk`, {
        rainfall: 45, temperature: 30, pollution_level: 150, past_claims_count: 0,
        zone: user?.zone || 'Mumbai'
      }).then(res => setRiskData(res.data)).catch(() => {});

      // 2. Fetch active policy
      axios.get(`${API}/policy/my-policy`, { headers })
        .then(res => setActivePolicy(res.data))
        .catch(() => setActivePolicy(null));

      // 3. Fetch claims for stats
      axios.get(`${API}/claims/my-claims`, { headers })
        .then(res => {
          setClaimsCount(res.data.length);
          const approved = res.data.filter(c => c.status === 'approved');
          setTotalPayout(approved.reduce((sum, c) => sum + c.amount, 0));
        })
        .catch(() => {});

      // 4. Fetch payment status
      axios.get(`${API}/payments/status`, { headers })
        .then(res => setPaymentStatus(res.data))
        .catch(() => {});
    }
  }, [token]);

  const statCards = [
    {
      icon: IndianRupee,
      label: t('Earnings Protected'),
      value: totalPayout,
      prefix: '₹',
      suffix: '',
      color: '#22c55e',
      caption: 'Paid out to date'
    },
    {
      icon: ShieldCheck,
      label: 'Active Policy',
      value: activePolicy ? 1 : 0,
      prefix: '',
      suffix: activePolicy ? ' Active' : ' None',
      color: '#0ea5e9',
      caption: activePolicy ? `${activePolicy.persona.toUpperCase()} Coverage` : 'Buy protection now'
    },
    {
      icon: TrendingUp,
      label: 'Weekly Premium',
      value: activePolicy ? activePolicy.weekly_premium : riskData.weekly_premium,
      prefix: '₹',
      suffix: '/wk',
      color: '#f97316',
      caption: 'AI-calculated rate'
    },
    {
      icon: Activity,
      label: 'Claims Filed',
      value: claimsCount,
      prefix: '',
      suffix: '',
      color: '#a855f7',
      caption: 'Total recorded'
    }
  ];

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  return (
    <DashboardLayout title={t('Dashboard')}>
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)' }}>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
          <Zap className="w-32 h-32 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#020617' }}>
          {t('Welcome')}, {user?.name || 'Worker'} 👋
        </h2>
        <p className="text-slate-900 text-sm opacity-90 font-medium tracking-wide">Your income is protected. Stay safe on the road today.</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${(!user?.is_paused && paymentStatus.is_paid) ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-xs text-orange-100 font-bold uppercase tracking-tight">
              {user?.is_paused ? 'Plan Paused' : (paymentStatus.is_paid ? 'Active Protection' : 'Protection Inactive')}
            </span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <span className="text-xs text-orange-100 flex items-center gap-2">
             <span className="font-bold bg-white/20 px-2 py-0.5 rounded uppercase tracking-tighter">{user?.selected_plan || 'Basic'} Plan</span>
             {user?.paid_until && ` • Protected until ${new Date(user.paid_until).toLocaleDateString()}`}
          </span>
        </div>
        
        {!paymentStatus.is_paid && (
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="mt-6 p-4 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-between border border-white/20">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-300 animate-bounce" />
              <div>
                <p className="text-sm font-bold text-white">Payment Required</p>
                <p className="text-[10px] text-orange-100">Pay weekly fee to activate insurance coverage</p>
              </div>
            </div>
            <button onClick={() => navigate('/payments')} className="bg-white text-orange-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-50 transition-all">
              Pay Now
            </button>
          </motion.div>
        )}

        {paymentStatus.is_paid && (
          <div className="mt-4 px-3 py-1.5 bg-green-500/20 rounded-lg inline-flex items-center gap-2 border border-green-500/30">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Weekly Premium Paid</span>
          </div>
        )}
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ icon: Icon, label, value, prefix, suffix, color, caption }, i) => (
          <motion.div key={i} variants={item}>
            <TiltCard>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}20` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
              </div>
              <p className="text-2xl font-bold mb-0.5" style={{ color }}>
                <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
              </p>
              <p className="text-xs font-bold" style={{ color: 'var(--text-color)' }}>{label}</p>
              <p className="text-[10px] mt-1 opacity-70 font-medium" style={{ color: 'var(--text-color)' }}>{caption}</p>
            </TiltCard>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Gauge Card */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <TiltCard>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-color)' }}>
              {t('Current Risk')}
            </h3>
            <div className="flex flex-col items-center">
              <div className="relative w-36 h-36 mb-4">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none"
                    stroke={riskColor(riskData.risk_score)}
                    strokeWidth="10"
                    strokeDasharray={`${314 * riskData.risk_score} 314`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold" style={{ color: riskColor(riskData.risk_score) }}>
                    {Math.round(riskData.risk_score * 100)}%
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-tight opacity-60" style={{ color: 'var(--text-color)' }}>risk</span>
                </div>
              </div>
              <span className="px-4 py-1 rounded-full text-sm font-bold text-white shadow-lg"
                style={{ background: riskColor(riskData.risk_score) }}>
                {riskLabel(riskData.risk_score)} Risk
              </span>
              <p className="text-[10px] mt-3 text-center font-medium opacity-70" style={{ color: 'var(--text-color)' }}>
                Based on current weather, pollution, and your claim history
              </p>
            </div>
          </TiltCard>
        </motion.div>

        {/* Alerts Card */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <TiltCard>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5" style={{ color: '#f97316' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-color)' }}>Live Alerts</h3>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full text-white" style={{ background: '#ef4444' }}>
                {alerts.length} New
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {alerts.map(({ icon: Icon, text, color }, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
                  <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />
                  <p className="text-xs text-gray-300">{text}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl flex items-center gap-3"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
              <p className="text-xs text-green-400 font-medium">Auto-claim monitoring is active 24/7</p>
            </div>
          </TiltCard>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
