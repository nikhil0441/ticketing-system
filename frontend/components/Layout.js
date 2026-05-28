import { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function Layout({ children, title = 'Dashboard' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div>
      <Sidebar show={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        {/* Top Navbar */}
        <nav className="top-navbar">
          <button
            className="btn btn-sm btn-light d-md-none me-3"
            onClick={() => setSidebarOpen(true)}
          >
            <i className="bi bi-list fs-5"></i>
          </button>
          <div className="d-flex align-items-center flex-grow-1">
            <h5 className="mb-0 fw-semibold text-dark">{title}</h5>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="badge rounded-pill px-3 py-2" style={{
              background: user?.role === 'ADMIN' ? '#f5f3ff' : user?.role === 'SUPPORT_AGENT' ? '#eff6ff' : '#f0fdf4',
              color: user?.role === 'ADMIN' ? '#6d28d9' : user?.role === 'SUPPORT_AGENT' ? '#1d4ed8' : '#15803d',
              fontSize: '0.75rem', fontWeight: 600
            }}>
              <i className={`bi ${user?.role === 'ADMIN' ? 'bi-shield-check' : user?.role === 'SUPPORT_AGENT' ? 'bi-headset' : 'bi-person'} me-1`}></i>
              {user?.role?.replace('_', ' ')}
            </span>
            <div className="avatar" style={{background:'#2563eb',color:'#fff',cursor:'pointer'}}
              title={user?.name}>
              {user?.name?.charAt(0)}
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="page-content fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}
