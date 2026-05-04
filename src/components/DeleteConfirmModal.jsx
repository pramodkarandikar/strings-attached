import { useState, useEffect, useCallback } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, song, onConfirmDelete }) {
  const [confirmText, setConfirmText] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setConfirmText('');
      onClose();
    }, 250);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    setConfirmText('');
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen || !song) return null;

  const isMatch = confirmText === song.title;

  const handleDelete = () => {
    if (!isMatch) return;
    onConfirmDelete(song.id);
    setConfirmText('');
    onClose();
  };

  return (
    <div className={`modal-overlay ${isClosing ? 'modal-closing' : ''}`} onClick={handleClose}>
      <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={{ color: 'var(--text-main)', margin: 0 }}>Delete Song</h2>
          <button onClick={handleClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {/* Warning banner */}
        <div className="delete-warning">
          <AlertTriangle size={20} />
          <span>This action <strong>cannot</strong> be undone.</span>
        </div>

        <p style={{ color: 'var(--text-muted)', margin: '1rem 0', lineHeight: 1.6 }}>
          This will permanently delete the song <strong style={{ color: 'var(--secondary)' }}>{song.title}</strong>
          {song.artist && song.artist !== 'Unknown' && (
            <> by <strong style={{ color: 'var(--text-main)' }}>{song.artist}</strong></>
          )}
          , including all its chords and notes.
        </p>

        <div style={{ margin: '1.5rem 0 1rem' }}>
          <label style={styles.label}>
            To confirm, type <strong style={{ color: 'var(--secondary)' }}>{song.title}</strong> below:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            className="delete-confirm-input"
            placeholder={song.title}
            autoFocus
            spellCheck={false}
          />
        </div>

        <button
          className={`btn btn-danger ${isMatch ? '' : 'btn-disabled'}`}
          onClick={handleDelete}
          disabled={!isMatch}
          style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
        >
          I understand, delete this song
        </button>
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-main)',
    cursor: 'pointer'
  },
  label: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    display: 'block',
    marginBottom: '0.5rem'
  }
};
