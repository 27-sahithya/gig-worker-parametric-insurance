import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, FileText, User, LogOut, Zap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/plans', icon: ShieldCheck, label: 'My Plan' },
  { to: '/payments', icon: Zap, label: 'Payments' },
  { to: '/claims', icon: FileText, label: 'Claims' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const { t } = useTranslation();

  return (
    <aside className="flex flex-col h-screen w-20 md:w-64 fixed left-0 top-0 z-40 glass-panel border-r border-white/10 px-3 py-6">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="hidden md:block font-bold text-lg" style={{ color: 'var(--text-color)' }}>
          Rakshak AI
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 group
              ${isActive
                ? 'text-white shadow-lg'
                : 'hover:bg-white/10'
              }`
            }
            style={({ isActive }) => isActive
              ? { background: 'linear-gradient(135deg, #f97316, #ea580c)', color: 'white' }
              : { color: 'var(--text-color)' }
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-5 h-5 shrink-0" />
                <motion.span
                  className="hidden md:block"
                  initial={false}
                >
                  {t(label)}
                </motion.span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 hover:bg-red-500/10 text-red-400 hover:text-red-500"
      >
        <LogOut className="w-5 h-5 shrink-0" />
        <span className="hidden md:block">Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;
