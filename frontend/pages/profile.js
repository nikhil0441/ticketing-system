import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/Badges';
import Head from 'next/head';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <>
      <Head><title>Profile – TicketPro</title></Head>
      <Layout title="My Profile">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-7">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                {/* Cover */}
                <div className="p-5 text-center" style={{background:'linear-gradient(135deg, #1e3a5f, #2563eb)',borderRadius:'10px 10px 0 0'}}>
                  <div className="avatar mx-auto mb-3" style={{background:'#fff',color:'#2563eb',width:80,height:80,fontSize:'2rem',border:'4px solid rgba(255,255,255,0.3)'}}>
                    {user?.name?.charAt(0)}
                  </div>
                  <h4 className="text-white fw-bold mb-1">{user?.name}</h4>
                  <p className="text-white opacity-75 mb-2">{user?.email}</p>
                  <RoleBadge role={user?.role} />
                </div>

                {/* Details */}
                <div className="p-4">
                  <h6 className="fw-semibold text-muted mb-3 small text-uppercase">Account Information</h6>
                  <div className="row g-3">
                    {[
                      { label: 'Full Name', value: user?.name, icon: 'bi-person' },
                      { label: 'Email', value: user?.email, icon: 'bi-envelope' },
                      { label: 'Role', value: user?.role?.replace('_',' '), icon: 'bi-shield' },
                      { label: 'Status', value: user?.active ? 'Active' : 'Inactive', icon: 'bi-circle-fill' },
                      { label: 'Member Since', value: user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : '—', icon: 'bi-calendar' },
                    ].map((item, i) => (
                      <div key={i} className="col-12">
                        <div className="d-flex align-items-center p-3 rounded" style={{background:'#f8fafc'}}>
                          <div className="me-3" style={{color:'#64748b'}}>
                            <i className={`bi ${item.icon}`}></i>
                          </div>
                          <div>
                            <div className="text-muted" style={{fontSize:'0.75rem'}}>{item.label}</div>
                            <div className="fw-semibold small">{item.value}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
