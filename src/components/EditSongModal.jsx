import { useState, useEffect, useCallback } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { sanitizeText, extractAndSanitizeYouTubeId } from '../utils/security';

export default function EditSongModal({ isOpen, onClose, song, onSave }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [chords, setChords] = useState('');
  const [notes, setNotes] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  // Populate form when song changes or modal opens
  useEffect(() => {
    if (song && isOpen) {
      setTitle(song.title || '');
      setArtist(song.artist === 'Unknown' ? '' : (song.artist || ''));
      setChords(song.chords || '');
      setNotes(song.extra || '');
      setYoutubeLink(song.youtubeId ? `https://www.youtube.com/watch?v=${song.youtubeId}` : '');
    }
  }, [song, isOpen]);

  const handleReset = () => {
    if (!song) return;
    setTitle(song.title || '');
    setArtist(song.artist === 'Unknown' ? '' : (song.artist || ''));
    setChords(song.chords || '');
    setNotes(song.extra || '');
    setYoutubeLink(song.youtubeId ? `https://www.youtube.com/watch?v=${song.youtubeId}` : '');
  };

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
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

  if (!isOpen || !song) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Title is required!");
      return;
    }

    const updatedSong = {
      ...song,
      title: sanitizeText(title.trim()),
      artist: sanitizeText(artist.trim()) || "Unknown",
      chords: sanitizeText(chords),
      extra: sanitizeText(notes.trim()),
      youtubeId: extractAndSanitizeYouTubeId(youtubeLink)
    };

    onSave(updatedSong);
    handleClose();
  };

  return (
    <div className={`modal-overlay ${isClosing ? 'modal-closing' : ''}`} onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <h2 style={{ marginBottom: '0.2rem', color: 'var(--text-main)' }}>Edit Song</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Modify your song details
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={handleReset}
              style={styles.resetButton}
              title="Reset to original"
              type="button"
            >
              <RotateCcw size={20} />
            </button>
            <button onClick={handleClose} style={styles.closeButton}>
              <X size={24} />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={styles.input}
                placeholder="e.g. Wonderwall"
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Artist</label>
              <input
                type="text"
                value={artist}
                onChange={e => setArtist(e.target.value)}
                style={styles.input}
                placeholder="e.g. Oasis"
              />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Chords</label>
            <textarea
              value={chords}
              onChange={e => setChords(e.target.value)}
              style={{ ...styles.input, minHeight: '60px' }}
              placeholder="e.g. C G Am F"
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '-0.2rem' }}>Diagrams will be regenerated automatically.</small>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ ...styles.input, minHeight: '60px' }}
              placeholder="Any additional instructions or lyrics..."
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>YouTube Link</label>
            <input
              type="url"
              value={youtubeLink}
              onChange={e => setYoutubeLink(e.target.value)}
              style={styles.input}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          <div style={styles.buttonRow}>
            <button
              type="button"
              className="btn"
              onClick={handleClose}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
              Save Changes
            </button>
          </div>
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
  resetButton: {
    background: 'none',
    border: 'none',
    color: 'var(--tertiary)',
    cursor: 'pointer',
    transition: 'color 0.2s',
    display: 'flex',
    alignItems: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem'
  },
  row: {
    display: 'flex',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    flex: 1
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
  buttonRow: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem'
  }
};
