import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/auth/login`, form);
      login(res.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 403) {
        setError(err.response.data.detail);
      } else {
        setError(err.response?.data?.detail || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      {/* Background orbs */}
      <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 top-0 left-0"
        style={{ background: '#f97316' }} />
      <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 bottom-0 right-0"
        style={{ background: '#0ea5e9' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-panel rounded-2xl p-8 w-full max-w-md mx-4 relative z-10"
        style={{ background: 'rgba(30, 41, 59, 0.8)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Rakshak AI</h2>
            <p className="text-gray-400 text-xs">Gig Worker Income Protection</p>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
        <p className="text-gray-400 mb-7 text-sm">Sign in to access your protection dashboard</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm text-red-300 border border-red-500/30"
            style={{ background: 'rgba(239,68,68,0.1)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPwd ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-10 py-3 rounded-xl text-white text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
            style={{ background: loading ? '#64748b' : 'linear-gradient(135deg, #f97316, #ea580c)' }}
          >
            {loading ? 'Signing in...' : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </motion.button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          No account?{' '}
          <Link to="/signup" className="text-orange-400 font-semibold hover:text-orange-300 transition-colors">
            Register here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
