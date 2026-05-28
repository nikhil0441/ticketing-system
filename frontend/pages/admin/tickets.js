import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { ticketsApi, adminApi } from '../../utils/api';
import { StatusBadge, PriorityBadge } from '../../components/Badges';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Head from 'next/head';
import { format } from 'date-fns';

export default function AdminTicketsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '', page: 0, size: 15 });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (!isAdmin()) { router.push('/dashboard'); return; }
    loadData();
  }, [user, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, size: filters.size };
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      const [ticketsRes, agentsRes] = await Promise.all([
        ticketsApi.getAll(params),
        adminApi.getAgents(),
      ]);
      setTickets(ticketsRes.data.content || []);
      setTotalPages(ticketsRes.data.totalPages || 0);
      setAgents(agentsRes.data);
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const quickAssign = async (ticketId, agentId) => {
    if (!agentId) return;
    try {
      await ticketsApi.assign(ticketId, { agentId: parseInt(agentId) });
      toast.success('Assigned');
      loadData();
    } catch { toast.error('Failed to assign'); }
  };

  const quickStatus = async (ticketId, status) => {
    try {
      await ticketsApi.update(ticketId, { status });
      toast.success('Status updated');
      loadData();
    } catch { toast.error('Failed to update'); }
  };

  return (
    <>
      <Head><title>All Tickets – Admin – TicketPro</title></Head>
      <Layout title="All Tickets (Admin)">
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <h5 className="fw-bold mb-1">Ticket Management</h5>
            <p className="text-muted small mb-0">Oversee and manage all support tickets</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-light"><i className="bi bi-search text-muted"></i></span>
                  <input type="text" className="form-control" placeholder="Search subject..."
                    value={filters.search} onChange={e => setFilters(p => ({...p, search: e.target.value, page: 0}))} />
                </div>
              </div>
              <div className="col-6 col-md-2">
                <select className="form-select" value={filters.status} onChange={e => setFilters(p => ({...p, status: e.target.value, page: 0}))}>
                  <option value="">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div className="col-6 col-md-2">
                <select className="form-select" value={filters.priority} onChange={e => setFilters(p => ({...p, priority: e.target.value, page: 0}))}>
                  <option value="">All Priority</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="col-12 col-md-2">
                <button className="btn btn-outline-secondary w-100" onClick={() => setFilters({ status: '', priority: '', search: '', page: 0, size: 15 })}>
                  <i className="bi bi-arrow-counterclockwise me-1"></i>Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : (
          <>
            <div className="card border-0 shadow-sm">
              <div className="table-responsive">
                <table className="table table-modern mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Subject</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Submitted By</th>
                      <th>Assign Agent</th>
                      <th>Quick Status</th>
                      <th>Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.length === 0 ? (
                      <tr><td colSpan={9} className="text-center py-5 text-muted">No tickets found</td></tr>
                    ) : tickets.map(t => (
                      <tr key={t.id}>
                        <td><span className="badge bg-light text-dark">#{t.id}</span></td>
                        <td>
                          <div className="fw-semibold small" style={{maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.subject}</div>
                          {t.assignedTo && <small className="text-muted">→ {t.assignedTo.name}</small>}
                        </td>
                        <td><PriorityBadge priority={t.priority} /></td>
                        <td><StatusBadge status={t.status} /></td>
                        <td>
                          <small className="text-muted">{t.createdBy?.name}</small>
                        </td>
                        <td>
                          <select className="form-select form-select-sm" style={{minWidth:130}}
                            defaultValue={t.assignedTo?.id || ''}
                            onChange={e => quickAssign(t.id, e.target.value)}>
                            <option value="">Unassigned</option>
                            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                          </select>
                        </td>
                        <td>
                          <select className="form-select form-select-sm" style={{minWidth:120}}
                            value={t.status}
                            onChange={e => quickStatus(t.id, e.target.value)}>
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                          </select>
                        </td>
                        <td><small className="text-muted">{t.createdAt ? format(new Date(t.createdAt), 'MMM d') : '—'}</small></td>
                        <td>
                          <Link href={`/tickets/${t.id}`} className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-eye"></i>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <nav>
                  <ul className="pagination">
                    <li className={`page-item ${filters.page === 0 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setFilters(p => ({...p, page: p.page - 1}))}>
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    {Array.from({length: totalPages}, (_, i) => (
                      <li key={i} className={`page-item ${filters.page === i ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setFilters(p => ({...p, page: i}))}>{i + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item ${filters.page === totalPages - 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setFilters(p => ({...p, page: p.page + 1}))}>
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </>
        )}
      </Layout>
    </>
  );
}
