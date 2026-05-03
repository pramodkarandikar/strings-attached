import React, { useState, useMemo } from 'react';
import { X, LayoutTemplate } from 'lucide-react';
import Chord from '@tombatossals/react-chords/lib/Chord';
import guitarData from '@tombatossals/chords-db/lib/guitar.json';
import { getFormulaForSuffix, getNotesForChord, formatSuffixLabel } from '../utils/chordFormulas';

export default function ChordBuilderModal({ isOpen, onClose }) {
  const [root, setRoot] = useState('C');
  const [suffix, setSuffix] = useState('major');

  const roots = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

  // Get available suffixes for the selected root
  const availableSuffixes = useMemo(() => {
    const dbRoot = root === 'C#' ? 'Csharp' : root === 'F#' ? 'Fsharp' : root;
    if (!guitarData.chords[dbRoot]) return [];
    return guitarData.chords[dbRoot].map(c => c.suffix);
  }, [root]);

  // Ensure suffix is valid when root changes
  React.useEffect(() => {
    if (availableSuffixes.length > 0 && !availableSuffixes.includes(suffix)) {
      setSuffix(availableSuffixes[0]);
    }
  }, [root, availableSuffixes, suffix]);

  const variations = useMemo(() => {
    const dbRoot = root === 'C#' ? 'Csharp' : root === 'F#' ? 'Fsharp' : root;
    const rootData = guitarData.chords[dbRoot];
    if (!rootData) return [];
    const suffixData = rootData.find(c => c.suffix === suffix);
    if (!suffixData) return [];
    // Return up to 3 variations
    return suffixData.positions.slice(0, 3);
  }, [root, suffix]);

  const instrument = {
    strings: 6,
    fretsOnChord: 4,
    name: 'Guitar',
    keys: [],
    tunings: {
      standard: ['E', 'A', 'D', 'G', 'B', 'E']
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content chord-builder-modal" style={{ maxWidth: '1024px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2><LayoutTemplate size={24} style={{ marginRight: '10px', display: 'inline', verticalAlign: 'middle' }} /> Chord Builder</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="chord-builder-controls" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Root Note</label>
              <select value={root} onChange={e => setRoot(e.target.value)} className="form-input">
                {roots.map(r => (
                  <option key={r} value={r}>{r.replace('b', '♭')}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: 2 }}>
              <label>Chord Quality</label>
              <select value={suffix} onChange={e => setSuffix(e.target.value)} className="form-input">
                {availableSuffixes.map(s => (
                  <option key={s} value={s}>{formatSuffixLabel(s)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="chord-formula-display" style={{
            background: 'rgba(255, 230, 0, 0.1)',
            border: '1px solid var(--tertiary)',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className="formula-text" style={{ color: 'var(--tertiary)', fontSize: '1.2em', fontWeight: 'bold' }}>
                {getFormulaForSuffix(suffix)}
              </span>
              {getNotesForChord(root, suffix) && (
                <>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>→</span>
                  <span style={{ color: 'var(--primary)', fontSize: '1.2em', fontWeight: 'bold' }}>
                    {getNotesForChord(root, suffix)}
                  </span>
                </>
              )}
            </h3>
          </div>

          <div className="chord-variations" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {variations.length > 0 ? (
              variations.map((position, idx) => (
                <div key={idx} className="chord-variation-card" style={{
                  background: 'var(--bg-dark)',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div className="variation-label" style={{ fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                    Variation {idx + 1}
                  </div>
                  <div className="chord-svg-container" style={{ width: '240px', filter: 'invert(1) hue-rotate(180deg)' }}>
                    <Chord
                      chord={position}
                      instrument={instrument}
                      lite={false}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p>No diagrams found for this chord.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
