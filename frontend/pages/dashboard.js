import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { ticketsApi } from '../utils/api';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user, isAdmin, isAgent } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        ticketsApi.getStats(),
        ticketsApi.getAll({ size: 5, sortBy: 'createdAt' })
      ]);
      setStats(statsRes.data);
      setRecentTickets(ticketsRes.data.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const statCards = [
    { label: 'Total Tickets', value: stats?.totalTickets ?? '—', icon: 'bi-ticket-detailed', color: '#2563eb', bg: '#eff6ff' },
    { label: 'Open', value: stats?.openTickets ?? '—', icon: 'bi-circle', color: '#2563eb', bg: '#dbeafe' },
    { label: 'In Progress', value: stats?.inProgressTickets ?? '—', icon: 'bi-arrow-repeat', color: '#92400e', bg: '#fef3c7' },
    { label: 'Resolved', value: stats?.resolvedTickets ?? '—', icon: 'bi-check-circle', color: '#15803d', bg: '#dcfce7' },
  ];

  if (isAdmin()) {
    statCards.push(
      { label: 'Closed', value: stats?.closedTickets ?? '—', icon: 'bi-x-circle', color: '#475569', bg: '#f1f5f9' },
      { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: 'bi-people', color: '#7c3aed', bg: '#f5f3ff' },
      { label: 'Agents', value: stats?.totalAgents ?? '—', icon: 'bi-headset', color: '#0891b2', bg: '#ecfeff' },
    );
  }

  return (
    <>
      <Head><title>Dashboard – TicketPro</title></Head>
      <Layout title="Dashboard">
        {/* Welcome Banner */}
        <div className="p-4 mb-4 rounded-3" style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
          color: '#fff'
        }}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h4 className="fw-bold mb-1">Good {getGreeting()}, {user?.name?.split(' ')[0]}! 👋</h4>
              <p className="mb-0 opacity-75">
                {isAdmin() ? 'Here\'s your system overview' : isAgent() ? 'Manage your assigned tickets' : 'Track your support tickets'}
              </p>
            </div>
            {!isAdmin() && (
              <Link href="/tickets/new" className="btn btn-light fw-semibold">
                <i className="bi bi-plus-circle me-2"></i>New Ticket
              </Link>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : (
          <>
            <div className="row g-3 mb-4">
              {statCards.map((card, i) => (
                <div key={i} className={`col-6 col-md-4 col-lg-${isAdmin() ? '3' : '3'}`}>
                  <div className="stat-card bg-white shadow-sm h-100">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="text-muted small mb-1">{card.label}</div>
                        <div className="fs-2 fw-bold" style={{color: card.color}}>{card.value}</div>
                      </div>
                      <div className="stat-icon" style={{background: card.bg, color: card.color}}>
                        <i className={`bi ${card.icon}`}></i>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Tickets */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3">
                <h6 className="mb-0 fw-semibold"><i className="bi bi-clock-history me-2 text-primary"></i>Recent Tickets</h6>
                <Link href="/tickets" className="btn btn-sm btn-outline-primary">View All</Link>
              </div>
              <div className="card-body p-0">
                {recentTickets.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-ticket text-muted"></i>
                    <h6 className="text-muted">No tickets yet</h6>
                    <Link href="/tickets/new" className="btn btn-primary btn-sm mt-2">Create First Ticket</Link>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-modern mb-0">
                      <thead>
                        <tr>
                          <th>#ID</th>
                          <th>Subject</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTickets.map(ticket => (
                          <tr key={ticket.id}>
                            <td><span className="text-muted small">#{ticket.id}</span></td>
                            <td>
                              <div className="fw-semibold" style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                                {ticket.subject}
                              </div>
                              {ticket.assignedTo && (
                                <small className="text-muted">Assigned: {ticket.assignedTo.name}</small>
                              )}
                            </td>
                            <td><PriorityBadge priority={ticket.priority} /></td>
                            <td><StatusBadge status={ticket.status} /></td>
                            <td><small className="text-muted">{ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy') : '—'}</small></td>
                            <td>
                              <Link href={`/tickets/${ticket.id}`} className="btn btn-sm btn-outline-secondary">
                                <i className="bi bi-eye"></i>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </Layout>
    </>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
