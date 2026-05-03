export const chordFormulas = {
  "major": "1, 3, 5",
  "minor": "1, ♭3, 5",
  "dim": "1, ♭3, ♭5",
  "dim7": "1, ♭3, ♭5, ♭♭7",
  "sus2": "1, 2, 5",
  "sus4": "1, 4, 5",
  "7sus4": "1, 4, 5, ♭7",
  "alt": "1, 3, ♭7, (altered 5/9)",
  "aug": "1, 3, #5",
  "6": "1, 3, 5, 6",
  "69": "1, 3, 5, 6, 9",
  "7": "1, 3, 5, ♭7",
  "7b5": "1, 3, ♭5, ♭7",
  "7sg": "1, 5, ♭7",
  "aug7": "1, 3, #5, ♭7",
  "9": "1, 3, 5, ♭7, 9",
  "9b5": "1, 3, ♭5, ♭7, 9",
  "aug9": "1, 3, #5, ♭7, 9",
  "7b9": "1, 3, 5, ♭7, ♭9",
  "7#9": "1, 3, 5, ♭7, #9",
  "11": "1, 3, 5, ♭7, 9, 11",
  "9#11": "1, 3, 5, ♭7, 9, #11",
  "13": "1, 3, 5, ♭7, 9, 11, 13",
  "maj7": "1, 3, 5, 7",
  "maj7b5": "1, 3, ♭5, 7",
  "maj7#5": "1, 3, #5, 7",
  "maj9": "1, 3, 5, 7, 9",
  "maj11": "1, 3, 5, 7, 9, 11",
  "maj13": "1, 3, 5, 7, 9, 11, 13",
  "m6": "1, ♭3, 5, 6",
  "m7": "1, ♭3, 5, ♭7",
  "m7b5": "1, ♭3, ♭5, ♭7",
  "m9": "1, ♭3, 5, ♭7, 9",
  "m69": "1, ♭3, 5, 6, 9",
  "m11": "1, ♭3, 5, ♭7, 9, 11",
  "mmaj7": "1, ♭3, 5, 7",
  "mmaj7b5": "1, ♭3, ♭5, 7",
  "mmaj9": "1, ♭3, 5, 7, 9",
  "mmaj11": "1, ♭3, 5, 7, 9, 11",
  "add9": "1, 3, 5, 9",
  "madd9": "1, ♭3, 5, 9"
};

export const getFormulaForSuffix = (suffix) => {
  if (chordFormulas[suffix]) return chordFormulas[suffix];
  if (suffix.startsWith('/')) return `1, 3, 5 with ${suffix.substring(1).replace(/b/g, '♭')} in bass`;
  if (suffix.startsWith('m/')) return `1, ♭3, 5 with ${suffix.substring(2).replace(/b/g, '♭')} in bass`;
  return 'N/A';
};

// Chromatic scale using sharps and flats for display
const CHROMATIC_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHROMATIC_FLAT  = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

// Map each interval token to semitones from root
const INTERVAL_SEMITONES = {
  '1': 0,
  '♭2': 1, '2': 2, '#2': 3,
  '♭3': 3, '3': 4, '#3': 5,
  '4': 5, '#4': 6,
  '♭5': 6, '5': 7, '#5': 8,
  '6': 9, '♭♭7': 9,
  '♭7': 10, '7': 11,
  '♭9': 13, '9': 14, '#9': 15,
  '♭11': 16, '11': 17, '#11': 18,
  '♭13': 20, '13': 21
};

// Roots that conventionally use flats
const FLAT_ROOTS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb']);

export const getNotesForChord = (root, suffix) => {
  const formula = getFormulaForSuffix(suffix);
  if (formula === 'N/A') return null;

  // Determine which chromatic spelling to use based on the root
  const useFlats = FLAT_ROOTS.has(root) || root.includes('b');
  const chromatic = useFlats ? CHROMATIC_FLAT : CHROMATIC_SHARP;

  // Find root index (normalise display root to lookup root)
  const lookupRoot = root.replace('♭', 'b');
  const sharpIdx = CHROMATIC_SHARP.indexOf(lookupRoot);
  const flatIdx = CHROMATIC_FLAT.indexOf(root);
  const rootIdx = sharpIdx >= 0 ? sharpIdx : (flatIdx >= 0 ? flatIdx : -1);
  if (rootIdx < 0) return null;

  // Parse interval tokens from formula string
  const tokens = formula.split(',').map(t => t.trim()).filter(t => !t.includes('with') && !t.includes('bass') && !t.includes('altered'));

  const notes = tokens.map(token => {
    // Remove parentheses if present
    const clean = token.replace(/[()]/g, '').trim();
    const semitones = INTERVAL_SEMITONES[clean];
    if (semitones === undefined) return null;
    return chromatic[(rootIdx + semitones) % 12];
  }).filter(Boolean);

  // For slash chords, append the bass note
  if (suffix.startsWith('/') || suffix.startsWith('m/')) {
    const bassNote = suffix.includes('/') ? suffix.split('/')[1] : null;
    if (bassNote) {
      const displayBass = bassNote.replace('b', '♭');
      notes.push(displayBass + ' (bass)');
    }
  }

  return notes.length > 0 ? notes.join(', ') : null;
};

export const formatSuffixLabel = (suffix) => {
  const map = {
    "major": "Major",
    "minor": "Minor",
    "dim": "Diminished (dim)",
    "dim7": "Diminished 7th (dim7)",
    "sus2": "Suspended 2nd (sus2)",
    "sus4": "Suspended 4th (sus4)",
    "7sus4": "7th Suspended 4th (7sus4)",
    "alt": "Altered (alt)",
    "aug": "Augmented (aug)",
    "6": "Major 6th (6)",
    "69": "6/9 (69)",
    "7": "Dominant 7th (7)",
    "7b5": "7 ♭5 (7♭5)",
    "7sg": "7 Sus Guitar (7sg)",
    "aug7": "Augmented 7th (aug7)",
    "9": "Dominant 9th (9)",
    "9b5": "9 ♭5 (9♭5)",
    "aug9": "Augmented 9th (aug9)",
    "7b9": "7 ♭9 (7♭9)",
    "7#9": "7 #9 (7#9)",
    "11": "Dominant 11th (11)",
    "9#11": "9 #11 (9#11)",
    "13": "Dominant 13th (13)",
    "maj7": "Major 7th (maj7)",
    "maj7b5": "Major 7th ♭5 (maj7♭5)",
    "maj7#5": "Major 7th #5 (maj7#5)",
    "maj9": "Major 9th (maj9)",
    "maj11": "Major 11th (maj11)",
    "maj13": "Major 13th (maj13)",
    "m6": "Minor 6th (m6)",
    "m7": "Minor 7th (m7)",
    "m7b5": "Half-Diminished (m7♭5)",
    "m9": "Minor 9th (m9)",
    "m69": "Minor 6/9 (m69)",
    "m11": "Minor 11th (m11)",
    "mmaj7": "Minor/Major 7th (mmaj7)",
    "mmaj7b5": "Minor/Major 7th ♭5 (mmaj7♭5)",
    "mmaj9": "Minor/Major 9th (mmaj9)",
    "mmaj11": "Minor/Major 11th (mmaj11)",
    "add9": "Add 9 (add9)",
    "madd9": "Minor Add 9 (madd9)"
  };
  if (map[suffix]) return map[suffix];
  const replacedSuffix = suffix.replace(/b/g, '♭');
  if (suffix.startsWith('/')) return `Major slash ${replacedSuffix.substring(1)} (${replacedSuffix})`;
  if (suffix.startsWith('m/')) return `Minor slash ${replacedSuffix.substring(2)} (${replacedSuffix})`;
  return replacedSuffix;
};
