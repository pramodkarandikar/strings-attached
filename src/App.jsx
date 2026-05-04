import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Guitar, Search, Star, Plus, Download, LogIn, LogOut, User, MoreVertical } from 'lucide-react';
import chordsData from './data/chords.json';
import SongList from './components/SongList';
import SongDetail from './components/SongDetail';
import AddSongModal from './components/AddSongModal';
import ChordBuilderModal from './components/ChordBuilderModal';
import LoginModal from './components/LoginModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import EditSongModal from './components/EditSongModal';
import { exportCustomSongsToExcel } from './utils/exportExcel';
import { useAuth } from './context/AuthContext';

function App() {
  const { currentUser, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSong, setSelectedSong] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isChordBuilderOpen, setIsChordBuilderOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState(null);
  const [songToEdit, setSongToEdit] = useState(null);
  const [pendingEditSong, setPendingEditSong] = useState(null);
  const [pendingDeleteSong, setPendingDeleteSong] = useState(null);
  const [toast, setToast] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

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

  const handleDeleteSong = (songId) => {
    const deletedSong = customSongs.find(s => s.id === songId);
    setCustomSongs(prev => prev.filter(s => s.id !== songId));
    // Clear selection if the deleted song was selected
    if (selectedSong && selectedSong.id === songId) {
      setSelectedSong(null);
    }
    // Also remove from favorites
    setFavorites(prev => prev.filter(id => id !== songId));
    showToast(`"${deletedSong?.title || 'Song'}" deleted successfully`);
  };

  const handleEditSong = (updatedSong) => {
    setCustomSongs(prev =>
      prev.map(s => s.id === updatedSong.id ? updatedSong : s)
    );
    // Update the selected song view if it's the same song
    if (selectedSong && selectedSong.id === updatedSong.id) {
      setSelectedSong(updatedSong);
    }
  };

  const handleEditRequest = (song) => {
    if (currentUser) {
      // User is authenticated — open edit modal directly
      setSongToEdit(song);
      setIsEditModalOpen(true);
    } else {
      // Store the song and open login modal first
      setPendingEditSong(song);
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    // If there was a pending edit, open the edit modal now
    if (pendingEditSong) {
      setSongToEdit(pendingEditSong);
      setPendingEditSong(null);
      setIsEditModalOpen(true);
    }
    // If there was a pending delete, open the delete modal now
    if (pendingDeleteSong) {
      setSongToDelete(pendingDeleteSong);
      setPendingDeleteSong(null);
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteRequest = (song) => {
    if (currentUser) {
      setSongToDelete(song);
      setIsDeleteModalOpen(true);
    } else {
      setPendingDeleteSong(song);
      setIsLoginModalOpen(true);
    }
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
        <div className="header-left">
          <div className="logo">
            <span>
              <span className="logo-lines">| &nbsp;</span>
              <span style={{ color: 'var(--primary)' }}>strings</span>
              <span style={{ color: 'var(--secondary)' }}>attached</span>
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-accent"
            onClick={() => setIsChordBuilderOpen(true)}
            title="Chord Builder"
          >
            <Guitar size={18} />
            <span>Chord Builder</span>
          </button>
          <button
            className={`dropdown-item ${showFavoritesOnly ? 'dropdown-item-active' : ''}`}
            onClick={() => { setShowFavoritesOnly(!showFavoritesOnly); setIsMenuOpen(false); }}
          >
            <Star size={16} fill={showFavoritesOnly ? "currentColor" : "none"} />
            {showFavoritesOnly ? "Show All" : "Show Starred"}
          </button>

          {/* Menu toggle */}
          <div className="menu-wrapper" ref={menuRef}>
            <button
              className={`btn btn-menu-toggle ${isMenuOpen ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(prev => !prev)}
              title="Menu"
            >
              <MoreVertical size={20} />
            </button>

            {isMenuOpen && (
              <div className="dropdown-menu">

                <button
                  className="dropdown-item"
                  onClick={() => { setIsAddModalOpen(true); setIsMenuOpen(false); }}
                >
                  <Plus size={16} />
                  Add New Song
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => { handleExportAllSongs(); setIsMenuOpen(false); }}
                  disabled={allSongs.length === 0}
                  style={{ opacity: allSongs.length === 0 ? 0.4 : 1 }}
                >
                  <Download size={16} />
                  Export All Songs
                </button>

                <div className="dropdown-divider" />

                {currentUser ? (
                  <button
                    className="dropdown-item dropdown-item-user"
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                  >
                    <User size={16} />
                    <span style={{ flex: 1 }}>{currentUser}</span>
                    <LogOut size={14} style={{ opacity: 0.5 }} />
                  </button>
                ) : (
                  <button
                    className="dropdown-item"
                    onClick={() => { setPendingEditSong(null); setIsLoginModalOpen(true); setIsMenuOpen(false); }}
                  >
                    <LogIn size={16} />
                    Login
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="song-list-wrapper">
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
          <SongList
            songs={filteredSongs}
            selectedSong={selectedSong}
            onSelectSong={setSelectedSong}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        </div>
        <SongDetail
          song={selectedSong}
          isFavorite={selectedSong ? favorites.includes(selectedSong.id) : false}
          onToggleFavorite={toggleFavorite}
          onEdit={handleEditRequest}
          onDelete={handleDeleteRequest}
          isAuthenticated={!!currentUser}
        />
      </main>

      <AddSongModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveCustomSong}
      />

      <ChordBuilderModal
        isOpen={isChordBuilderOpen}
        onClose={() => setIsChordBuilderOpen(false)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => { setIsLoginModalOpen(false); setPendingEditSong(null); setPendingDeleteSong(null); }}
        onLoginSuccess={handleLoginSuccess}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSongToDelete(null); }}
        song={songToDelete}
        onConfirmDelete={handleDeleteSong}
      />

      <EditSongModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSongToEdit(null); }}
        song={songToEdit}
        onSave={handleEditSong}
      />

      {/* Toast notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' && <span className="toast-icon">✓</span>}
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
