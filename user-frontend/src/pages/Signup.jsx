import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, User, Phone, Mail, Lock, Upload, ArrowRight, CheckCircle, MapPin, Map, Briefcase, CircleDollarSign, Navigation, ShieldAlert, BadgeIndianRupee, Shield, Crown, Diamond } from 'lucide-react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const API = 'http://127.0.0.1:8000';

const steps = ['Personal Info', 'Work & Location', 'Verification Docs'];

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ 
    name: '', email: '', phone: '', password: '', 
    avg_income: 25000,
    latitude: '', longitude: '', upi_id: '',
    selected_plan: 'Basic', zone: 'Mumbai'
  });
  const [govProof, setGovProof] = useState(null);
  const [workerProof, setWorkerProof] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [locating, setLocating] = useState(false);
  const [riskInfo, setRiskInfo] = useState({ level: 'Calculating...', price: 0 });

  const calculateRisk = (lat, lng, selectedZone = form.zone) => {
    const isHighRisk = selectedZone === 'Mumbai' || selectedZone === 'Delhi';
    const level = isHighRisk ? 'High' : 'Low';
    
    setRiskInfo({ level });
  };

  const ChangeMapView = ({ coords }) => {
    const map = useMap();
    map.setView(coords, map.getZoom());
    return null;
  };

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setForm(f => ({ ...f, latitude: lat, longitude: lng }));
        calculateRisk(lat, lng);
      },
    });
    return null;
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const getPosition = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm(f => ({ ...f, latitude, longitude }));
        calculateRisk(latitude, longitude);
        setLocating(false);
      },
      () => {
        setError('Location access denied. Please enter manually.');
        setLocating(false);
      }
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      // Don't send empty strings for coordinates as it breaks float validation
      if ((k === 'latitude' || k === 'longitude') && v === '') return;
      data.append(k, v);
    });
    data.append('gov_proof', govProof);
    data.append('worker_proof', workerProof);
    try {
      await axios.post(`${API}/auth/signup`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(true);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map(d => `${d.loc[d.loc.length-1]}: ${d.msg}`).join(', '));
      } else {
        setError(detail || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const FileUploadBox = ({ label, icon: Icon, file, onChange, id }) => (
    <label htmlFor={id} className="cursor-pointer block">
      <div className={`rounded-xl p-4 border-2 border-dashed transition-all duration-200 flex flex-col items-center gap-2
        ${file ? 'border-green-500 bg-green-500/10' : 'border-gray-600 hover:border-orange-500 bg-white/5'}`}>
        {file
          ? <CheckCircle className="w-8 h-8 text-green-400" />
          : <Icon className="w-8 h-8 text-gray-400" />
        }
        <p className="text-sm font-medium text-gray-300">{file ? file.name : label}</p>
        <p className="text-xs text-gray-500">Click to {file ? 'change' : 'upload'} file</p>
      </div>
      <input id={id} type="file" className="hidden" accept="image/*,.pdf" onChange={onChange} />
    </label>
  );

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Registration Submitted!</h2>
          <p className="text-gray-400 mb-6">Your documents are under review. You'll receive an email once approved by our admin team.</p>
          <button onClick={() => navigate('/login')}
            className="px-6 py-3 rounded-xl font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 top-0 right-0" style={{ background: '#f97316' }} />
      <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 bottom-0 left-0" style={{ background: '#0ea5e9' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="rounded-2xl p-8 w-full max-w-md mx-4 relative z-10"
        style={{ background: 'rgba(30, 41, 59, 0.85)', border: '1px solid rgba(255,255,255,0.1)' }}>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Rakshak AI</h2>
            <p className="text-gray-400 text-xs">Join 50,000+ protected gig workers</p>
          </div>
        </div>

        {/* Step Progress */}
        <div className="flex gap-2 mb-7">
          {steps.map((s, i) => (
            <div key={i} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'bg-orange-500' : 'bg-gray-700'}`} />
              <p className={`text-xs mt-1 font-medium ${i === step ? 'text-orange-400' : 'text-gray-500'}`}>{s}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm text-red-300 border border-red-500/30" style={{ background: 'rgba(239,68,68,0.1)' }}>
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h1 className="text-xl font-bold text-white mb-1">Personal Info</h1>
              <p className="text-gray-400 text-sm mb-5">Tell us about yourself</p>
              <div className="flex flex-col gap-4">
                {[
                  { name: 'name', placeholder: 'Full Name', icon: User, type: 'text' },
                  { name: 'phone', placeholder: 'Phone Number', icon: Phone, type: 'tel' },
                  { name: 'email', placeholder: 'Email Address', icon: Mail, type: 'email' },
                  { name: 'password', placeholder: 'Create Password', icon: Lock, type: 'password' },
                ].map(({ name, placeholder, icon: Icon, type }) => (
                  <div key={name} className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={type} name={name} placeholder={placeholder} value={form[name]} onChange={handleChange} required
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                ))}
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => { 
                  console.log("Form check:", form);
                  if (form.name && form.email && form.phone && form.password) {
                    setStep(1);
                    setError('');
                  } else {
                    setError('Please fill all fields: Name, Phone, Email, and Password.');
                  }
                }}
                className="w-full mt-6 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                Next: Professional Details <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h1 className="text-xl font-bold text-white mb-1">Work & Location</h1>
              <p className="text-gray-400 text-sm mb-5">Select your work area and insurance plan</p>
              
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select name="zone" value={form.zone} onChange={(e) => {
                      handleChange(e);
                      calculateRisk(null, null, e.target.value);
                    }} className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm outline-none mt-1 focus:ring-2 focus:ring-orange-500 transition-all appearance-none" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <option value="Mumbai" className="bg-slate-800">Mumbai Zone (Flood Prone)</option>
                    <option value="Hyderabad" className="bg-slate-800">Hyderabad Zone (Moderate)</option>
                    <option value="Delhi" className="bg-slate-800">Delhi Zone (High AQI)</option>
                    <option value="Bangalore" className="bg-slate-800">Bangalore Zone</option>
                    <option value="Pune" className="bg-slate-800">Pune Zone (Low Risk)</option>
                  </select>
                </div>

                <div className="relative">
                  <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="number" name="avg_income" placeholder="Monthly Avg Income (₹)" value={form.avg_income} onChange={handleChange} required
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>

                <div className="relative">
                  <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" name="upi_id" placeholder="UPI ID for Payouts" value={form.upi_id} onChange={handleChange} required
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>

                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select name="selected_plan" value={form.selected_plan} onChange={handleChange} className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all appearance-none" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <option value="Basic" className="bg-slate-800">Basic Plan</option>
                    <option value="Standard" className="bg-slate-800">Standard Plan</option>
                    <option value="Premium" className="bg-slate-800">Premium Plan</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button onClick={getPosition} disabled={locating}
                    type="button" className="flex-1 py-3 px-4 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5 transition-all">
                    {locating ? 'Locating...' : <><Navigation className="w-4 h-4 text-orange-400" /> Auto-Detect</>}
                  </button>
                  <div className="flex-1 px-4 py-1.5 flex flex-col justify-center bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <p className="text-[9px] text-gray-500 truncate">Lat: {parseFloat(form.latitude).toFixed(4) || '0.0000'}</p>
                    <p className="text-[9px] text-gray-500 truncate">Lng: {parseFloat(form.longitude).toFixed(4) || '0.0000'}</p>
                  </div>
                </div>

                {/* Interactive Map Box */}
                <div className="h-44 w-full rounded-xl overflow-hidden border border-white/10 relative cursor-crosshair">
                  <MapContainer center={[form.latitude || 19.076, form.longitude || 72.877]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapEvents />
                    {form.latitude && (
                      <>
                        <Marker position={[form.latitude, form.longitude]} />
                        <ChangeMapView coords={[form.latitude, form.longitude]} />
                      </>
                    )}
                  </MapContainer>
                  <div className="absolute bottom-2 right-2 z-[1000] bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[9px] text-white pointer-events-none">
                    Click map to move marker
                  </div>
                </div>

                {/* Plan Selection */}
                {form.latitude && (
                  <div className="flex flex-col gap-3">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest px-1">Select Protection Plan</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'Basic', icon: Shield, low: 250, high: 350, color: '#94a3b8', desc: 'Accidents Only' },
                        { id: 'Standard', icon: Crown, low: 350, high: 550, color: '#f59e0b', desc: 'Weather + Health' },
                        { id: 'Premium', icon: Diamond, low: 600, high: 800, color: '#0ea5e9', desc: 'Full Coverage' }
                      ].map(plan => {
                        const currentPrice = riskInfo.level === 'High' ? plan.high : plan.low;
                        const isSelected = form.selected_plan === plan.id;
                        return (
                          <button key={plan.id} type="button" onClick={() => setForm({ ...form, selected_plan: plan.id })}
                            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${isSelected ? 'border-orange-500 bg-orange-500/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}>
                            <plan.icon className="w-5 h-5 flex-shrink-0" style={{ color: isSelected ? '#f97316' : plan.color }} />
                            <div className="text-center">
                              <p className="text-[10px] font-bold text-white uppercase">{plan.id}</p>
                              <p className="text-xs font-bold text-orange-400">₹{currentPrice}</p>
                              <p className="text-[8px] text-gray-500 mt-0.5 leading-tight">{plan.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-xl font-semibold text-gray-300 border border-gray-600 hover:bg-white/5 transition-all">
                  Back
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(2)}
                  className="flex-2 flex-grow py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                  Next: Upload Docs <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h1 className="text-xl font-bold text-white mb-1">Verification Docs</h1>
              <p className="text-gray-400 text-sm mb-5">Upload your ID & work proof for verification</p>
              <div className="flex flex-col gap-4">
                <FileUploadBox label="Government ID (Aadhaar/PAN)" icon={Upload} file={govProof}
                  onChange={(e) => setGovProof(e.target.files[0])} id="gov" />
                <FileUploadBox label="Worker Proof (Zomato/Swiggy ID)" icon={Upload} file={workerProof}
                  onChange={(e) => setWorkerProof(e.target.files[0])} id="worker" />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl font-semibold text-gray-300 border border-gray-600 hover:bg-white/5 transition-all">
                  Back
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit}
                  disabled={!govProof || !workerProof || loading}
                  className="flex-2 flex-grow py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
                  style={{ background: (!govProof || !workerProof || loading) ? '#64748b' : 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                  {loading ? 'Submitting...' : <> Submit <ArrowRight className="w-4 h-4" /></>}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-orange-400 font-semibold hover:text-orange-300 transition-colors">Login here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
