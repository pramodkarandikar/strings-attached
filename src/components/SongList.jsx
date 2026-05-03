import { Music, Star, ChevronRight } from 'lucide-react';

export default function SongList({ songs, selectedSong, onSelectSong, favorites, onToggleFavorite }) {
  if (songs.length === 0) {
    return (
      <div className="song-list-container">
        <div className="empty-state">
          <Music size={48} />
          <p>No songs found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="song-list-container">
      <div className="song-list-scroll">
        {songs.map((song) => {
          const isFav = favorites.includes(song.id);
          return (
            <div 
              key={song.id} 
              className={`song-card ${selectedSong?.id === song.id ? 'active' : ''}`}
              onClick={() => onSelectSong(song)}
            >
              <div>
                <div className="song-title">
                  {song.title}
                </div>
                {song.artist && song.artist !== "Unknown" && (
                  <div className="song-artist">{song.artist}</div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star 
                  size={18} 
                  fill={isFav ? "#F59E0B" : "none"} 
                  color={isFav ? "#F59E0B" : "rgba(255,255,255,0.3)"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(song.id);
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <ChevronRight size={16} className="text-muted" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
