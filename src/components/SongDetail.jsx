import { useState, useEffect, useRef } from 'react';
import { Play, Square, Guitar, Star } from 'lucide-react';
import ChordDiagrams from './ChordDiagrams';

export default function SongDetail({ song, isFavorite, onToggleFavorite }) {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollRef = useRef(null);
  const scrollInterval = useRef(null);

  useEffect(() => {
    // Reset scroll state when song changes
    setIsScrolling(false);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
    }
  }, [song]);

  const toggleScroll = () => {
    if (isScrolling) {
      clearInterval(scrollInterval.current);
      setIsScrolling(false);
    } else {
      setIsScrolling(true);
      scrollInterval.current = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop += 1;
        }
      }, 50); // 1px every 50ms = ~20px per second
    }
  };

  if (!song) {
    return (
      <div className="song-detail-container">
        <div className="empty-state">
          <Guitar size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h2>Select a song to start playing</h2>
        </div>
      </div>
    );
  }

  // Format chords: try to wrap suspected chords in a span
  const formatText = (text) => {
    if (!text) return "";
    
    return text.split('\n').map((line, idx) => {
      const chordRegex = /\b([CDEFGAB][b#]?(?:maj|min|m|dim|aug|sus|add|M)?\d*(?:\/[CDEFGAB][b#]?)?)\b/g;
      
      const parts = line.split(chordRegex);
      return (
        <div key={idx}>
          {parts.map((part, i) => {
            if (part.match(chordRegex)) {
              return <span key={i} className="chord">{part}</span>;
            }
            return part;
          })}
        </div>
      );
    });
  };

  return (
    <div className="song-detail-container">
      <div className="detail-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 className="detail-title">{song.title}</h1>
            <Star 
              size={28} 
              fill={isFavorite ? "#F59E0B" : "none"} 
              color={isFavorite ? "#F59E0B" : "rgba(255,255,255,0.3)"}
              onClick={() => onToggleFavorite(song.id)}
              style={{ cursor: 'pointer', marginTop: '-0.5rem' }}
            />
          </div>
          {song.artist && song.artist !== "Unknown" && (
            <div className="detail-artist">{song.artist}</div>
          )}
        </div>
        <div className="action-buttons">
          <button 
            className={`btn ${isScrolling ? '' : 'btn-primary'}`} 
            onClick={toggleScroll}
          >
            {isScrolling ? <><Square size={18} /> Stop Scroll</> : <><Play size={18} /> Auto-Scroll</>}
          </button>
        </div>
      </div>
      
      <div className="detail-content" ref={scrollRef}>
        
        {/* Render Chord Diagrams automatically */}
        <ChordDiagrams text={song.chords} />

        {song.youtubeId && (
          <div className="youtube-container" style={{ marginBottom: '2rem' }}>
            <iframe 
              src={`https://www.youtube.com/embed/${song.youtubeId}`} 
              title="YouTube video player" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
        )}
        
        {song.chords ? formatText(song.chords) : <div className="text-muted">No chords available.</div>}
        
        {song.extra && !song.youtubeId && (
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
            <strong>Notes:</strong> <br/>
            {song.extra}
          </div>
        )}
      </div>
    </div>
  );
}
