import { useState } from 'react';
import { X } from 'lucide-react';
import { sanitizeText, extractAndSanitizeYouTubeId } from '../utils/security';

export default function AddSongModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [chords, setChords] = useState('');
  const [notes, setNotes] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Title is required!");
      return;
    }

    const newSong = {
      id: `custom-${Date.now()}`,
      title: sanitizeText(title.trim()),
      artist: sanitizeText(artist.trim()) || "Unknown",
      chords: sanitizeText(chords),
      extra: sanitizeText(notes.trim()),
      youtubeId: extractAndSanitizeYouTubeId(youtubeLink)
    };

    onSave(newSong);
    setTitle('');
    setArtist('');
    setChords('');
    setNotes('');
    setYoutubeLink('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={styles.header}>
          <div>
            <h2 style={{ marginBottom: '0.2rem', color: 'var(--text-main)' }}>Add New Song</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Add new songs on the go!</p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} />
          </button>
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
            <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '-0.2rem' }}>Diagrams will be generated automatically.</small>
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
          <button type="submit" className="btn btn-primary" style={styles.submitBtn}>
            Save Song
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#1E293B',
    padding: '2rem',
    borderRadius: '1rem',
    width: '90%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
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
  submitBtn: {
    marginTop: '1rem',
    width: '100%',
    justifyContent: 'center'
  }
};
