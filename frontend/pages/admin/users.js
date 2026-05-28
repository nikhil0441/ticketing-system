import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../utils/api';
import { RoleBadge } from '../../components/Badges';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Head from 'next/head';
import { format } from 'date-fns';

const ROLES = ['USER', 'SUPPORT_AGENT', 'ADMIN'];

export default function AdminUsersPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (!isAdmin()) { router.push('/dashboard'); return; }
    loadUsers();
  }, [user]);

  const loadUsers = async () => {
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditUser(null);
    setForm({ name: '', email: '', password: '', role: 'USER' });
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editUser) {
        await adminApi.updateUser(editUser.id, { name: form.name, role: form.role, active: editUser.active });
        toast.success('User updated');
      } else {
        await adminApi.createUser(form);
        toast.success('User created');
      }
      setShowModal(false);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u) => {
    try {
      await adminApi.updateUser(u.id, { active: !u.active });
      toast.success(u.active ? 'User deactivated' : 'User activated');
      loadUsers();
    } catch {
      toast.error('Failed to update user');
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head><title>User Management – TicketPro</title></Head>
      <Layout title="User Management">
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <h5 className="fw-bold mb-1">User Management</h5>
            <p className="text-muted small mb-0">{users.length} total users registered</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <i className="bi bi-person-plus me-2"></i>Add User
          </button>
        </div>

        {/* Summary Cards */}
        <div className="row g-3 mb-4">
          {[
            { role: 'USER', label: 'Regular Users', icon: 'bi-person', bg: '#f0fdf4', color: '#15803d' },
            { role: 'SUPPORT_AGENT', label: 'Support Agents', icon: 'bi-headset', bg: '#eff6ff', color: '#1d4ed8' },
            { role: 'ADMIN', label: 'Admins', icon: 'bi-shield-check', bg: '#f5f3ff', color: '#6d28d9' },
          ].map(r => (
            <div key={r.role} className="col-4">
              <div className="stat-card bg-white shadow-sm">
                <div className="d-flex align-items-center gap-3">
                  <div className="stat-icon" style={{background:r.bg, color:r.color}}>
                    <i className={`bi ${r.icon}`}></i>
                  </div>
                  <div>
                    <div className="text-muted small">{r.label}</div>
                    <div className="fs-4 fw-bold" style={{color:r.color}}>
                      {users.filter(u => u.role === r.role).length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body py-3">
            <div className="input-group" style={{maxWidth: 400}}>
              <span className="input-group-text bg-light"><i className="bi bi-search text-muted"></i></span>
              <input type="text" className="form-control" placeholder="Search by name or email..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-modern mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-4 text-muted">No users found</td></tr>
                  ) : filtered.map(u => (
                    <tr key={u.id}>
                      <td><span className="text-muted small">#{u.id}</span></td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar" style={{
                            background: u.role === 'ADMIN' ? '#8b5cf6' : u.role === 'SUPPORT_AGENT' ? '#2563eb' : '#64748b',
                            color: '#fff', minWidth:36
                          }}>
                            {u.name?.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-semibold small">{u.name}</div>
                            {u.id === user.id && <span className="badge bg-warning text-dark" style={{fontSize:'0.65rem'}}>You</span>}
                          </div>
                        </div>
                      </td>
                      <td><small>{u.email}</small></td>
                      <td><RoleBadge role={u.role} /></td>
                      <td>
                        <span className={`badge rounded-pill px-3 ${u.active ? 'bg-success' : 'bg-danger'}`} style={{fontSize:'0.75rem'}}>
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td><small className="text-muted">{u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}</small></td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(u)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          {u.id !== user.id && (
                            <button className={`btn btn-sm ${u.active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                              onClick={() => toggleActive(u)}>
                              <i className={`bi ${u.active ? 'bi-person-x' : 'bi-person-check'}`}></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal show d-block" style={{background:'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header border-bottom">
                  <h5 className="modal-title fw-semibold">
                    {editUser ? 'Edit User' : 'Add New User'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleSave}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Full Name *</label>
                      <input type="text" className="form-control" placeholder="John Doe"
                        value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Email *</label>
                      <input type="email" className="form-control" placeholder="email@example.com"
                        value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                        required disabled={!!editUser} />
                    </div>
                    {!editUser && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold small">Password *</label>
                        <input type="password" className="form-control" placeholder="Min 6 characters"
                          value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                          required minLength={6} />
                      </div>
                    )}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Role *</label>
                      <select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                        {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer border-top">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                      {editUser ? 'Save Changes' : 'Create User'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}
