import { useState, useEffect, useCallback } from 'react';
import { X, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { login } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setUserId('');
      setPassword('');
      setError('');
      onClose();
    }, 250);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim()) {
      setError('Both fields are required');
      return;
    }
    setIsLoading(true);
    setError('');

    const result = await login(userId.trim(), password);
    setIsLoading(false);

    if (result.success) {
      setUserId('');
      setPassword('');
      setError('');
      onClose();
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className={`modal-overlay ${isClosing ? 'modal-closing' : ''}`} onClick={handleClose}>
      <div className="modal-content" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h2 style={{ marginBottom: '0.2rem', color: 'var(--text-main)' }}>Login Required</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Authenticate to edit songs
            </p>
          </div>
          <button onClick={handleClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>User ID</label>
            <input
              type="text"
              value={userId}
              onChange={e => { setUserId(e.target.value); setError(''); }}
              style={styles.input}
              placeholder="Enter your user ID"
              autoFocus
              autoComplete="username"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              style={styles.input}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={isLoading}
          >
            <LogIn size={18} />
            {isLoading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-main)',
    cursor: 'pointer'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  label: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    color: 'var(--text-main)'
  },
  input: {
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: '#0F172A',
    color: 'var(--text-main)',
    fontSize: '1rem',
    fontFamily: 'inherit'
  },
  submitBtn: {
    marginTop: '0.5rem',
    width: '100%',
    justifyContent: 'center'
  }
};
