import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, AlertTriangle, BarChart3, Zap, LogOut, ShieldCheck } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/users', icon: Users, label: 'User Approvals' },
  { to: '/paid-users', icon: ShieldCheck, label: 'Paid Users' },
  { to: '/claims', icon: FileText, label: 'Claims Monitor' },
  { to: '/fraud', icon: AlertTriangle, label: 'Fraud Detection' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

const AdminSidebar = () => (
  <aside className="flex flex-col h-screen w-20 md:w-64 fixed left-0 top-0 z-40 glass-panel border-r border-white/5 px-3 py-6">
    {/* Logo */}
    <div className="flex items-center gap-3 px-2 mb-10">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'linear-gradient(135deg, #0ea5e9, #2563eb)' }}>
        <Zap className="w-5 h-5 text-white" />
      </div>
      <div className="hidden md:block">
        <p className="font-bold text-sm" style={{ color: '#38bdf8' }}>Rakshak AI</p>
        <p className="text-xs text-sky-400 font-bold tracking-widest uppercase">Admin Panel</p>
      </div>
    </div>

    {/* Nav */}
    <nav className="flex flex-col gap-1 flex-1">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-3 rounded-xl font-bold transition-all duration-200
            ${isActive ? 'text-white shadow-lg shadow-sky-500/20' : 'text-sky-200 hover:text-white hover:bg-sky-500/10'}`
          }
          style={({ isActive }) => isActive
            ? { background: 'linear-gradient(135deg, #0ea5e9, #2563eb)' }
            : {}
          }
        >
          <Icon className="w-5 h-5 shrink-0" />
          <span className="hidden md:block">{label}</span>
        </NavLink>
      ))}
    </nav>

    {/* Logout */}
    <button className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200">
      <LogOut className="w-5 h-5 shrink-0" />
      <span className="hidden md:block">Logout</span>
    </button>
  </aside>
);

export default AdminSidebar;
