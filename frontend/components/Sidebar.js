import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ show, onClose }) {
  const { user, logout, isAdmin, isAgent } = useAuth();
  const router = useRouter();

  const isActive = (path) => router.pathname === path || router.pathname.startsWith(path + '/');

  return (
    <>
      {show && <div className="sidebar-overlay d-md-none" onClick={onClose} />}
      <aside className={`sidebar ${show ? 'show' : ''}`}>
        <div className="sidebar-brand">
          <h4><i className="bi bi-ticket-perforated me-2" style={{color:'#60a5fa'}}></i>
            <span>Ticket</span>Pro
          </h4>
          <small style={{color:'rgba(255,255,255,0.4)',fontSize:'0.75rem'}}>Support System</small>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Main</div>

          <Link href="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={onClose}>
            <i className="bi bi-speedometer2"></i> Dashboard
          </Link>

          <Link href="/tickets" className={`nav-link ${isActive('/tickets') ? 'active' : ''}`} onClick={onClose}>
            <i className="bi bi-ticket-detailed"></i> Tickets
          </Link>

          {(isAdmin() || isAgent()) && (
            <Link href="/tickets?view=assigned" className={`nav-link ${router.query?.view === 'assigned' ? 'active' : ''}`} onClick={onClose}>
              <i className="bi bi-person-check"></i> Assigned to Me
            </Link>
          )}

          {isAdmin() && (
            <>
              <div className="nav-section-title">Admin</div>
              <Link href="/admin/users" className={`nav-link ${isActive('/admin/users') ? 'active' : ''}`} onClick={onClose}>
                <i className="bi bi-people"></i> User Management
              </Link>
              <Link href="/admin/tickets" className={`nav-link ${isActive('/admin/tickets') ? 'active' : ''}`} onClick={onClose}>
                <i className="bi bi-kanban"></i> All Tickets
              </Link>
            </>
          )}

          <div className="nav-section-title">Account</div>
          <Link href="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`} onClick={onClose}>
            <i className="bi bi-person-circle"></i> Profile
          </Link>

          <button onClick={logout} className="nav-link btn btn-link text-start w-100 border-0" style={{color:'rgba(255,255,255,0.7)'}}>
            <i className="bi bi-box-arrow-left"></i> Logout
          </button>
        </nav>

        {/* User info at bottom */}
        <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'1rem 1.25rem',borderTop:'1px solid rgba(255,255,255,0.1)',background:'rgba(0,0,0,0.2)'}}>
          <div className="d-flex align-items-center gap-2">
            <div className="avatar" style={{background:'#3b82f6',color:'#fff',minWidth:'36px'}}>
              {user?.name?.charAt(0)}
            </div>
            <div style={{overflow:'hidden'}}>
              <div style={{color:'#fff',fontSize:'0.85rem',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.name}</div>
              <div style={{color:'rgba(255,255,255,0.5)',fontSize:'0.7rem'}}>{user?.role?.replace('_',' ')}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
