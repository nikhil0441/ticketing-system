import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{
        duration: 3000,
        style: { borderRadius: '10px', background: '#1e293b', color: '#fff', fontSize: '0.9rem' }
      }} />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
