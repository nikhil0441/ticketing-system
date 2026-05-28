import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { ticketsApi } from '../../utils/api';
import { StatusBadge, PriorityBadge } from '../../components/Badges';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Head from 'next/head';
import { format } from 'date-fns';

export default function TicketsPage() {
  const { user, isAdmin, isAgent } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    status: '', priority: '', search: '', page: 0, size: 10
  });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    loadTickets();
  }, [user, filters]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      params.page = filters.page;
      params.size = filters.size;
      const res = await ticketsApi.getAll(params);
      setTickets(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadTickets();
  };

  return (
    <>
      <Head><title>Tickets – TicketPro</title></Head>
      <Layout title="Tickets">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <h5 className="fw-bold mb-1">Support Tickets</h5>
            <p className="text-muted small mb-0">Manage and track all support requests</p>
          </div>
          {!isAdmin() && (
            <Link href="/tickets/new" className="btn btn-primary">
              <i className="bi bi-plus-circle me-2"></i>New Ticket
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <form onSubmit={handleSearch}>
              <div className="row g-3 align-items-end">
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">Search</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><i className="bi bi-search text-muted"></i></span>
                    <input type="text" className="form-control" placeholder="Search by subject..."
                      value={filters.search} onChange={e => setFilters(p => ({...p, search: e.target.value}))} />
                  </div>
                </div>
                <div className="col-6 col-md-2">
                  <label className="form-label small fw-semibold">Status</label>
                  <select className="form-select" value={filters.status}
                    onChange={e => handleFilterChange('status', e.target.value)}>
                    <option value="">All Status</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <div className="col-6 col-md-2">
                  <label className="form-label small fw-semibold">Priority</label>
                  <select className="form-select" value={filters.priority}
                    onChange={e => handleFilterChange('priority', e.target.value)}>
                    <option value="">All Priority</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div className="col-12 col-md-2">
                  <button type="submit" className="btn btn-primary w-100">
                    <i className="bi bi-funnel me-1"></i>Filter
                  </button>
                </div>
                <div className="col-12 col-md-2">
                  <button type="button" className="btn btn-outline-secondary w-100"
                    onClick={() => setFilters({ status: '', priority: '', search: '', page: 0, size: 10 })}>
                    <i className="bi bi-arrow-counterclockwise me-1"></i>Reset
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Tickets */}
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : tickets.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="empty-state">
              <i className="bi bi-ticket text-muted"></i>
              <h5 className="text-muted">No tickets found</h5>
              <p className="text-muted small">Try adjusting your filters or create a new ticket</p>
              {!isAdmin() && <Link href="/tickets/new" className="btn btn-primary mt-2">Create Ticket</Link>}
            </div>
          </div>
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
                      <th>Created By</th>
                      <th>Assigned To</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map(ticket => (
                      <tr key={ticket.id}>
                        <td><span className="badge bg-light text-secondary">#{ticket.id}</span></td>
                        <td>
                          <div className="fw-semibold" style={{maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                            {ticket.subject}
                          </div>
                          <small className="text-muted">{ticket.description?.slice(0,50)}...</small>
                        </td>
                        <td><PriorityBadge priority={ticket.priority} /></td>
                        <td><StatusBadge status={ticket.status} /></td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="avatar" style={{background:'#2563eb',color:'#fff',width:28,height:28,fontSize:'0.7rem',minWidth:28}}>
                              {ticket.createdBy?.name?.charAt(0)}
                            </div>
                            <small>{ticket.createdBy?.name}</small>
                          </div>
                        </td>
                        <td>
                          {ticket.assignedTo ? (
                            <div className="d-flex align-items-center gap-2">
                              <div className="avatar" style={{background:'#7c3aed',color:'#fff',width:28,height:28,fontSize:'0.7rem',minWidth:28}}>
                                {ticket.assignedTo?.name?.charAt(0)}
                              </div>
                              <small>{ticket.assignedTo?.name}</small>
                            </div>
                          ) : <span className="text-muted small">Unassigned</span>}
                        </td>
                        <td><small className="text-muted">{ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yy') : '—'}</small></td>
                        <td>
                          <Link href={`/tickets/${ticket.id}`} className="btn btn-sm btn-primary">
                            <i className="bi bi-eye me-1"></i>View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
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
