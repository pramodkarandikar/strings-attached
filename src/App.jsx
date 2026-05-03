import { useState, useMemo, useEffect } from 'react';
import { Guitar, Search, Star } from 'lucide-react';
import chordsData from './data/chords.json';
import SongList from './components/SongList';
import SongDetail from './components/SongDetail';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSong, setSelectedSong] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('guitarTutorFavorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('guitarTutorFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (songId) => {
    setFavorites(prev =>
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const songs = chordsData.songs || [];

  const filteredSongs = useMemo(() => {
    return songs.filter(song => {
      const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFav = showFavoritesOnly ? favorites.includes(song.id) : true;
      return matchesSearch && matchesFav;
    });
  }, [songs, searchQuery, showFavoritesOnly, favorites]);

  return (
    <div className="app-container">
      <header>
        <div className="logo">
          <span>
            <span className="logo-lines">||</span>
            <span style={{ color: 'var(--primary)' }}>strings</span>
            <span style={{ color: 'var(--secondary)' }}>attached</span>
          </span>
        </div>
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="Search songs or artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          className={`btn ${showFavoritesOnly ? 'btn-primary' : ''}`}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Star size={18} fill={showFavoritesOnly ? "currentColor" : "none"} />
          {showFavoritesOnly ? "Starred" : "Show Starred"}
        </button>
      </header>

      <main className="main-content">
        <SongList
          songs={filteredSongs}
          selectedSong={selectedSong}
          onSelectSong={setSelectedSong}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
        <SongDetail
          song={selectedSong}
          isFavorite={selectedSong ? favorites.includes(selectedSong.id) : false}
          onToggleFavorite={toggleFavorite}
        />
      </main>
    </div>
  );
}

export default App;
