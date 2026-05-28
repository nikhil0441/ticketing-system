import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Head from 'next/head';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome aboard 🎉');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Register – TicketPro</title></Head>
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-logo">
            <i className="bi bi-ticket-perforated-fill"></i>
            <h2>Create Account</h2>
            <p>Join TicketPro today</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold small">Full Name</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><i className="bi bi-person text-muted"></i></span>
                <input type="text" className="form-control border-start-0 ps-0" placeholder="John Doe"
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} required minLength={2} />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold small">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><i className="bi bi-envelope text-muted"></i></span>
                <input type="email" className="form-control border-start-0 ps-0" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold small">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock text-muted"></i></span>
                <input type="password" className="form-control border-start-0 ps-0" placeholder="Min 6 characters"
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold small">Confirm Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock-fill text-muted"></i></span>
                <input type="password" className="form-control border-start-0 ps-0" placeholder="Repeat password"
                  value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating account...</> : 'Create Account'}
            </button>
          </form>

          <hr className="my-4" />
          <p className="text-center text-muted small mb-0">
            Already have an account?{' '}
            <Link href="/login" className="text-primary fw-semibold text-decoration-none">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
