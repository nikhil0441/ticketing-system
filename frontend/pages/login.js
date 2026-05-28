import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Head from 'next/head';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Login – TicketPro</title></Head>
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-logo">
            <i className="bi bi-ticket-perforated-fill"></i>
            <h2>TicketPro</h2>
            <p>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold small">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-envelope text-muted"></i>
                </span>
                <input
                  type="email"
                  className="form-control border-start-0 ps-0"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold small">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-lock text-muted"></i>
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control border-start-0 border-end-0 ps-0"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  required
                />
                <button type="button" className="input-group-text bg-light" onClick={() => setShowPass(!showPass)}>
                  <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Signing in...</> : 'Sign In'}
            </button>
          </form>

          <hr className="my-4" />
          <p className="text-center text-muted small mb-0">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary fw-semibold text-decoration-none">Create account</Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-3 p-3 rounded" style={{background:'#f8fafc',border:'1px dashed #e2e8f0'}}>
            <p className="text-muted small mb-2 fw-semibold"><i className="bi bi-info-circle me-1"></i>Demo Credentials</p>
            <div className="d-flex flex-column gap-1">
              {[
                {label:'Admin', email:'admin@demo.com', pwd:'admin123'},
                {label:'Agent', email:'agent@demo.com', pwd:'agent123'},
                {label:'User', email:'user@demo.com', pwd:'user123'},
              ].map(c => (
                <button key={c.label} type="button" className="btn btn-sm btn-outline-secondary text-start"
                  onClick={() => setForm({email: c.email, password: c.pwd})}>
                  <span className="fw-semibold">{c.label}:</span> {c.email}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
