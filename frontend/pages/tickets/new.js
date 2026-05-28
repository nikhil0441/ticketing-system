import { useState } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { ticketsApi } from '../../utils/api';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Head from 'next/head';
import Link from 'next/link';

export default function NewTicketPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ subject: '', description: '', priority: 'MEDIUM' });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const res = await ticketsApi.create(form);
      const ticketId = res.data.id;
      // Upload attachments if any
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        await ticketsApi.uploadAttachment(ticketId, fd);
      }
      toast.success('Ticket created successfully!');
      router.push(`/tickets/${ticketId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const priorities = [
    { value: 'LOW', label: 'Low', icon: 'bi-arrow-down', color: '#22c55e' },
    { value: 'MEDIUM', label: 'Medium', icon: 'bi-dash', color: '#f59e0b' },
    { value: 'HIGH', label: 'High', icon: 'bi-arrow-up', color: '#f97316' },
    { value: 'URGENT', label: 'Urgent', icon: 'bi-exclamation-triangle', color: '#ef4444' },
  ];

  return (
    <>
      <Head><title>New Ticket – TicketPro</title></Head>
      <Layout title="Create Ticket">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            {/* Breadcrumb */}
            <nav className="mb-4">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link href="/dashboard" className="text-decoration-none">Dashboard</Link></li>
                <li className="breadcrumb-item"><Link href="/tickets" className="text-decoration-none">Tickets</Link></li>
                <li className="breadcrumb-item active">New Ticket</li>
              </ol>
            </nav>

            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom py-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="stat-icon" style={{background:'#eff6ff',color:'#2563eb',width:40,height:40}}>
                    <i className="bi bi-plus-circle"></i>
                  </div>
                  <div>
                    <h5 className="mb-0 fw-semibold">Submit New Ticket</h5>
                    <small className="text-muted">Fill in the details below</small>
                  </div>
                </div>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Subject <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" placeholder="Brief summary of your issue"
                      value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required maxLength={200} />
                    <div className="form-text">{form.subject.length}/200 characters</div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Description <span className="text-danger">*</span></label>
                    <textarea className="form-control" rows={6} placeholder="Describe your issue in detail. Include steps to reproduce, error messages, etc."
                      value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold d-block">Priority <span className="text-danger">*</span></label>
                    <div className="d-flex gap-3 flex-wrap">
                      {priorities.map(p => (
                        <div key={p.value} className="form-check" style={{cursor:'pointer'}}>
                          <input type="radio" className="form-check-input" name="priority" id={`prio-${p.value}`}
                            checked={form.priority === p.value} onChange={() => setForm({...form, priority: p.value})} />
                          <label className="form-check-label d-flex align-items-center gap-1" htmlFor={`prio-${p.value}`}
                            style={{cursor:'pointer'}}>
                            <i className={`bi ${p.icon}`} style={{color: p.color}}></i>
                            <span className="fw-medium">{p.label}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selected priority visual */}
                  <div className="mb-4 p-3 rounded" style={{
                    background: priorities.find(p => p.value === form.priority)?.value === 'URGENT' ? '#fef2f2' :
                      form.priority === 'HIGH' ? '#fff7ed' : form.priority === 'MEDIUM' ? '#fefce8' : '#f0fdf4',
                    border: '1px solid ' + (form.priority === 'URGENT' ? '#fca5a5' : form.priority === 'HIGH' ? '#fdba74' : form.priority === 'MEDIUM' ? '#fde047' : '#86efac')
                  }}>
                    <small className="fw-semibold" style={{color: priorities.find(p => p.value === form.priority)?.color}}>
                      <i className={`bi ${priorities.find(p => p.value === form.priority)?.icon} me-1`}></i>
                      {form.priority} Priority selected — {
                        form.priority === 'URGENT' ? 'This will be addressed immediately' :
                        form.priority === 'HIGH' ? 'Response within 4 hours' :
                        form.priority === 'MEDIUM' ? 'Response within 1 business day' :
                        'Response within 3 business days'
                      }
                    </small>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Attachments <span className="text-muted small fw-normal">(Optional)</span></label>
                    <input type="file" className="form-control" multiple accept="image/*,.pdf,.doc,.docx,.txt"
                      onChange={e => setFiles(Array.from(e.target.files))} />
                    <div className="form-text">Max 10MB per file. Supported: images, PDF, Word, text files</div>
                    {files.length > 0 && (
                      <div className="mt-2 d-flex flex-wrap gap-2">
                        {files.map((f, i) => (
                          <span key={i} className="badge bg-light text-dark border px-3 py-2">
                            <i className="bi bi-paperclip me-1"></i>{f.name}
                            <button type="button" className="btn-close btn-close-sm ms-2"
                              onClick={() => setFiles(files.filter((_, j) => j !== i))} style={{fontSize:'0.6rem'}}></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="d-flex gap-3">
                    <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                      {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</> : <><i className="bi bi-send me-2"></i>Submit Ticket</>}
                    </button>
                    <Link href="/tickets" className="btn btn-outline-secondary px-4">Cancel</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
