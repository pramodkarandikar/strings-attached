import { useState, useMemo, useEffect } from 'react';
import { Guitar, Search, Star, Plus, Download } from 'lucide-react';
import chordsData from './data/chords.json';
import SongList from './components/SongList';
import SongDetail from './components/SongDetail';
import AddSongModal from './components/AddSongModal';
import { exportCustomSongsToExcel } from './utils/exportExcel';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSong, setSelectedSong] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [customSongs, setCustomSongs] = useState(() => {
    try {
      const saved = localStorage.getItem('guitarTutorCustomSongs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
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

  useEffect(() => {
    localStorage.setItem('guitarTutorCustomSongs', JSON.stringify(customSongs));
  }, [customSongs]);

  const handleSaveCustomSong = (newSong) => {
    setCustomSongs(prev => [...prev, newSong]);
  };



  const toggleFavorite = (songId) => {
    setFavorites(prev =>
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const allSongs = useMemo(() => {
    return [...(chordsData.songs || []), ...customSongs];
  }, [customSongs]);

  const handleExportAllSongs = () => {
    exportCustomSongsToExcel(allSongs);
  };

  const filteredSongs = useMemo(() => {
    return allSongs.filter(song => {
      const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFav = showFavoritesOnly ? favorites.includes(song.id) : true;
      return matchesSearch && matchesFav;
    });
  }, [allSongs, searchQuery, showFavoritesOnly, favorites]);

  return (
    <div className="app-container">
      <header>
        <div className="logo">
          <span>
            <span className="logo-lines">| &nbsp;</span>
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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
            title="Add New Song"
          >
            <Plus size={18} />
            <span>Add New Song</span>
          </button>
          <button
            className="btn"
            onClick={handleExportAllSongs}
            title="Export All Songs"
            disabled={allSongs.length === 0}
            style={{
              opacity: allSongs.length === 0 ? 0.5 : 1,
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: 'var(--chord-color)',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}
          >
            <Download size={18} />
            <span>Export</span>
          </button>
          <button
            className={`btn ${showFavoritesOnly ? 'btn-primary' : ''}`}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Star size={18} fill={showFavoritesOnly ? "currentColor" : "none"} />
            {showFavoritesOnly ? "Starred" : "Show Starred"}
          </button>
        </div>
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

      <AddSongModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveCustomSong}
      />
    </div>
  );
}

export default App;
