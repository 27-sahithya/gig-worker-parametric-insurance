import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-color)' }}>
      <Sidebar />
      <Navbar title={title} />
      <main className="ml-20 md:ml-64 pt-16 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
