import React from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { Bell } from 'lucide-react';

const AdminLayout = ({ children, title }) => (
  <div className="min-h-screen" style={{ background: '#0f172a' }}>
    <AdminSidebar />
    {/* Top bar */}
    <header className="fixed top-0 right-0 left-20 md:left-64 z-30 h-16 glass-panel border-b border-sky-500/20 flex items-center justify-between px-6">
      <h1 className="text-lg font-bold" style={{ color: '#0ea5e9' }}>{title}</h1>
      <div className="flex items-center gap-3">
        <div className="relative">
          <button className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all">
            <Bell className="w-4 h-4 text-slate-300" />
          </button>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center"
            style={{ background: '#ef4444', fontSize: '9px' }}>3</span>
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>A</div>
      </div>
    </header>
    <main className="ml-20 md:ml-64 pt-16 min-h-screen">
      <div className="p-6">{children}</div>
    </main>
  </div>
);

export default AdminLayout;
