import React, { useMemo } from 'react';
import Chord from '@tombatossals/react-chords/lib/Chord';
import guitarData from '@tombatossals/chords-db/lib/guitar.json';

// Normalize notes to match chords-db keys
const normalizeKey = (key) => {
  const map = {
    'Db': 'C#',
    'D#': 'Eb',
    'Gb': 'F#',
    'G#': 'Ab',
    'A#': 'Bb'
  };
  return map[key] || key;
};

const parseChordName = (chordName) => {
  // Extract key and suffix. e.g. "C#m9" -> key: "C#", suffix: "m9"
  // "Fmaj7" -> key: "F", suffix: "maj7"
  // "B" -> key: "B", suffix: "major"

  // Clean slash chords for now, just take root
  const root = chordName.split('/')[0];

  const match = root.match(/^([CDEFGAB][b#]?)(.*)$/);
  if (!match) return null;

  const key = normalizeKey(match[1]);
  let suffix = match[2] || 'major';

  if (suffix === 'm') suffix = 'minor';
  if (suffix === 'maj') suffix = 'major';
  if (suffix === 'min') suffix = 'minor';
  if (suffix === 'dim') suffix = 'dim';
  if (suffix === 'aug') suffix = 'aug';
  if (suffix === 'sus') suffix = 'sus4';

  return { key, suffix };
};

export default function ChordDiagrams({ text }) {
  const uniqueChords = useMemo(() => {
    if (!text) return [];
    // Regex to find chords
    const chordRegex = /\b([CDEFGAB][b#]?(?:maj|min|m|dim|aug|sus|add|M)?\d*(?:\/[CDEFGAB][b#]?)?)\b/g;
    const matches = text.match(chordRegex);
    if (!matches) return [];

    // Deduplicate
    const unique = [...new Set(matches)];
    return unique;
  }, [text]);

  const chordDataList = useMemo(() => {
    return uniqueChords.map(chordName => {
      const parsed = parseChordName(chordName);
      if (!parsed) return null;

      const { key, suffix } = parsed;
      const keyData = guitarData.chords[key];
      if (!keyData) return null;

      const suffixData = keyData.find(c => c.suffix === suffix);
      if (!suffixData || !suffixData.positions || suffixData.positions.length === 0) return null;

      // Return the first position
      return {
        name: chordName,
        position: suffixData.positions[0]
      };
    }).filter(Boolean);
  }, [uniqueChords]);

  if (chordDataList.length === 0) return null;

  // Custom configuration to match user aesthetic
  const instrument = {
    strings: 6,
    fretsOnChord: 4,
    name: 'Guitar',
    keys: [],
    tunings: {
      standard: ['E', 'A', 'D', 'G', 'B', 'E']
    }
  };

  const liteOptions = {
    fontFamily: 'Inter, sans-serif',
    nutWidth: 5,
    stringWidth: 2,
    fretWidth: 2,
    dotRadius: 5,
    strokeWidth: 2
  };

  return (
    <div style={{ marginBottom: '2rem' }}>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
        {chordDataList.map((chord, idx) => (
          <div key={idx} style={{
            background: 'var(--bg-dark)',
            padding: '1rem',
            borderRadius: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
              fontWeight: 'bold',
              fontSize: '1.2rem',
              marginBottom: '0.5rem',
              color: 'var(--text-main)'
            }}>
              {chord.name}
            </div>
            <div style={{ width: '120px', filter: 'invert(1) hue-rotate(180deg)' }}>
              {/* We invert the SVG to get white lines/dots on dark background, 
                  because the default SVG usually draws black lines on white */}
              <Chord
                chord={chord.position}
                instrument={instrument}
                lite={false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
