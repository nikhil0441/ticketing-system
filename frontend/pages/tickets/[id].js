import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { ticketsApi, adminApi } from '../../utils/api';
import { StatusBadge, PriorityBadge, StarRating } from '../../components/Badges';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Head from 'next/head';
import { format } from 'date-fns';

export default function TicketDetailPage() {
  const { user, isAdmin, isAgent } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [agents, setAgents] = useState([]);
  const [rating, setRating] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (id && user) {
      loadTicket();
      if (isAdmin()) loadAgents();
    }
  }, [id, user]);

  const loadTicket = async () => {
    try {
      const res = await ticketsApi.getById(id);
      setTicket(res.data);
    } catch (err) {
      toast.error('Ticket not found');
      router.push('/tickets');
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const res = await adminApi.getAgents();
      setAgents(res.data);
    } catch {}
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await ticketsApi.addComment(id, { content: comment });
      toast.success('Comment added');
      setComment('');
      loadTicket();
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      await ticketsApi.update(id, { status });
      toast.success('Status updated');
      loadTicket();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const assignToAgent = async (agentId) => {
    try {
      await ticketsApi.assign(id, { agentId: parseInt(agentId) });
      toast.success('Ticket assigned');
      loadTicket();
    } catch (err) {
      toast.error('Failed to assign ticket');
    }
  };

  const submitRating = async () => {
    if (rating === 0) { toast.error('Please select a rating'); return; }
    try {
      await ticketsApi.rate(id, { rating, feedback: ratingFeedback });
      toast.success('Rating submitted! Thank you.');
      setShowRating(false);
      loadTicket();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  const canChangeStatus = isAdmin() || isAgent();
  const isTicketOwner = ticket?.createdBy?.id === user?.id;

  const statusFlow = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

  if (loading) return (
    <Layout title="Ticket Details">
      <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
    </Layout>
  );

  if (!ticket) return null;

  return (
    <>
      <Head><title>Ticket #{ticket.id} – TicketPro</title></Head>
      <Layout title={`Ticket #${ticket.id}`}>
        {/* Breadcrumb */}
        <nav className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link href="/dashboard" className="text-decoration-none">Dashboard</Link></li>
            <li className="breadcrumb-item"><Link href="/tickets" className="text-decoration-none">Tickets</Link></li>
            <li className="breadcrumb-item active">#{ticket.id}</li>
          </ol>
        </nav>

        {/* Status Timeline */}
        <div className="card border-0 shadow-sm mb-4 p-4">
          <div className="status-timeline">
            {statusFlow.map((s, i) => {
              const currentIndex = statusFlow.indexOf(ticket.status);
              const isDone = i < currentIndex;
              const isActive = s === ticket.status;
              return (
                <div key={s} className="status-step">
                  <div className={`step-dot ${isActive ? 'active' : isDone ? 'done' : ''}`}>
                    {isDone ? <i className="bi bi-check"></i> : i + 1}
                  </div>
                  <div className={`step-label ${isActive ? 'fw-semibold' : ''}`} style={{color: isActive ? '#2563eb' : undefined}}>
                    {s.replace('_',' ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="row g-4">
          {/* Main Content */}
          <div className="col-12 col-lg-8">
            {/* Ticket Header */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                  <div>
                    <h4 className="fw-bold mb-2">{ticket.subject}</h4>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <StatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.priority} />
                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>
                        {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy HH:mm') : '—'}
                      </small>
                    </div>
                  </div>
                  <span className="badge bg-light text-secondary px-3 py-2 fs-6">#{ticket.id}</span>
                </div>
                <div className="p-3 rounded" style={{background:'#f8fafc',border:'1px solid #e2e8f0'}}>
                  <p className="mb-0" style={{whiteSpace:'pre-wrap',lineHeight:1.7}}>{ticket.description}</p>
                </div>

                {/* Attachments */}
                {ticket.attachments?.length > 0 && (
                  <div className="mt-3">
                    <div className="small fw-semibold text-muted mb-2"><i className="bi bi-paperclip me-1"></i>Attachments</div>
                    <div className="d-flex flex-wrap gap-2">
                      {ticket.attachments.map(att => (
                        <a key={att.id} href={att.downloadUrl} target="_blank" rel="noreferrer"
                          className="btn btn-sm btn-outline-secondary">
                          <i className="bi bi-file-earmark me-1"></i>{att.fileName}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button className={`nav-link ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
                  <i className="bi bi-chat-left-text me-1"></i>Comments ({ticket.comments?.length || 0})
                </button>
              </li>
              {isTicketOwner && (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && !ticket.rating && (
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'rate' ? 'active' : ''}`} onClick={() => setActiveTab('rate')}>
                    <i className="bi bi-star me-1"></i>Rate Resolution
                  </button>
                </li>
              )}
            </ul>

            {activeTab === 'details' && (
              <div>
                {/* Comments */}
                <div className="d-flex flex-column gap-3 mb-4">
                  {ticket.comments?.length === 0 && (
                    <div className="text-center py-4 text-muted">
                      <i className="bi bi-chat d-block fs-2 mb-2"></i>No comments yet. Be the first to comment!
                    </div>
                  )}
                  {ticket.comments?.map(c => (
                    <div key={c.id} className={`comment-item ${c.author?.role === 'SUPPORT_AGENT' ? 'agent' : c.author?.role === 'ADMIN' ? 'admin' : ''}`}>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div className="avatar" style={{
                          background: c.author?.role === 'ADMIN' ? '#8b5cf6' : c.author?.role === 'SUPPORT_AGENT' ? '#2563eb' : '#64748b',
                          color:'#fff', minWidth:32, width:32, height:32, fontSize:'0.75rem'
                        }}>
                          {c.author?.name?.charAt(0)}
                        </div>
                        <div>
                          <span className="fw-semibold small">{c.author?.name}</span>
                          <span className="ms-2 badge rounded-pill" style={{fontSize:'0.65rem', background:'#f1f5f9', color:'#64748b'}}>
                            {c.author?.role?.replace('_',' ')}
                          </span>
                        </div>
                        <small className="text-muted ms-auto">
                          {c.createdAt ? format(new Date(c.createdAt), 'MMM d, HH:mm') : ''}
                        </small>
                      </div>
                      <p className="mb-0 small" style={{whiteSpace:'pre-wrap'}}>{c.content}</p>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                {ticket.status !== 'CLOSED' && (
                  <div className="card border-0" style={{background:'#f8fafc'}}>
                    <div className="card-body p-3">
                      <label className="form-label small fw-semibold">Add Comment</label>
                      <textarea className="form-control mb-2" rows={3} placeholder="Type your message..."
                        value={comment} onChange={e => setComment(e.target.value)} />
                      <button className="btn btn-primary btn-sm px-4" onClick={addComment} disabled={submitting || !comment.trim()}>
                        {submitting ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="bi bi-send me-1"></i>}
                        Send Comment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rating Tab */}
            {activeTab === 'rate' && (
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h6 className="fw-semibold mb-3">Rate the Resolution</h6>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Your Rating</label>
                    <StarRating rating={rating} onChange={setRating} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Feedback (Optional)</label>
                    <textarea className="form-control" rows={3} placeholder="Share your experience..."
                      value={ratingFeedback} onChange={e => setRatingFeedback(e.target.value)} />
                  </div>
                  <button className="btn btn-primary px-4" onClick={submitRating}>
                    <i className="bi bi-star-fill me-2"></i>Submit Rating
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-12 col-lg-4">
            {/* Ticket Info */}
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-header bg-white border-bottom py-3">
                <h6 className="mb-0 fw-semibold"><i className="bi bi-info-circle me-2 text-primary"></i>Ticket Info</h6>
              </div>
              <div className="card-body">
                <div className="d-flex flex-column gap-3">
                  <div>
                    <div className="text-muted small mb-1">Submitted By</div>
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar" style={{background:'#2563eb',color:'#fff',minWidth:32,width:32,height:32,fontSize:'0.75rem'}}>{ticket.createdBy?.name?.charAt(0)}</div>
                      <div>
                        <div className="fw-semibold small">{ticket.createdBy?.name}</div>
                        <div className="text-muted" style={{fontSize:'0.75rem'}}>{ticket.createdBy?.email}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-muted small mb-1">Assigned To</div>
                    {ticket.assignedTo ? (
                      <div className="d-flex align-items-center gap-2">
                        <div className="avatar" style={{background:'#7c3aed',color:'#fff',minWidth:32,width:32,height:32,fontSize:'0.75rem'}}>{ticket.assignedTo?.name?.charAt(0)}</div>
                        <div>
                          <div className="fw-semibold small">{ticket.assignedTo?.name}</div>
                          <div className="text-muted" style={{fontSize:'0.75rem'}}>{ticket.assignedTo?.email}</div>
                        </div>
                      </div>
                    ) : <span className="text-muted small">Not assigned yet</span>}
                  </div>
                  <div>
                    <div className="text-muted small mb-1">Created</div>
                    <div className="small">{ticket.createdAt ? format(new Date(ticket.createdAt), 'PPpp') : '—'}</div>
                  </div>
                  {ticket.resolvedAt && (
                    <div>
                      <div className="text-muted small mb-1">Resolved</div>
                      <div className="small">{format(new Date(ticket.resolvedAt), 'PPpp')}</div>
                    </div>
                  )}
                  {ticket.rating && (
                    <div>
                      <div className="text-muted small mb-1">Resolution Rating</div>
                      <StarRating rating={ticket.rating} />
                      {ticket.ratingFeedback && <p className="small text-muted mt-1">{ticket.ratingFeedback}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Admin/Agent Controls */}
            {canChangeStatus && (
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-header bg-white border-bottom py-3">
                  <h6 className="mb-0 fw-semibold"><i className="bi bi-sliders me-2 text-primary"></i>Controls</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Update Status</label>
                    <div className="d-flex flex-column gap-2">
                      {['OPEN','IN_PROGRESS','RESOLVED','CLOSED'].map(s => (
                        <button key={s} className={`btn btn-sm ${ticket.status === s ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => updateStatus(s)} disabled={ticket.status === s}>
                          {s.replace('_',' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {isAdmin() && agents.length > 0 && (
                    <div>
                      <label className="form-label small fw-semibold">Assign to Agent</label>
                      <select className="form-select form-select-sm" defaultValue={ticket.assignedTo?.id || ''}
                        onChange={e => e.target.value && assignToAgent(e.target.value)}>
                        <option value="">Select Agent...</option>
                        {agents.map(a => (
                          <option key={a.id} value={a.id}>{a.name} – {a.email}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}
