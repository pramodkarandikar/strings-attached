import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const USERS_KEY = 'stringsAttachedUsers';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('stringsAttachedCurrentUser');
      return saved || null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (userId, password) => {
    const users = getStoredUsers();
    const storedHash = users[userId];
    if (!storedHash) {
      return { success: false, error: 'User not found' };
    }
    const inputHash = await hashPassword(password);
    if (inputHash !== storedHash) {
      return { success: false, error: 'Incorrect password' };
    }
    setCurrentUser(userId);
    sessionStorage.setItem('stringsAttachedCurrentUser', userId);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    sessionStorage.removeItem('stringsAttachedCurrentUser');
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Expose console helper for adding users in dev
if (typeof window !== 'undefined') {
  window.__SA_addUser = async function (userId, password) {
    const hash = await hashPassword(password);
    const users = getStoredUsers();
    users[userId] = hash;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    console.log(`%c✓ User "${userId}" added successfully.`, 'color: #00F0FF; font-weight: bold;');
  };

  window.__SA_listUsers = function () {
    const users = getStoredUsers();
    const userIds = Object.keys(users);
    if (userIds.length === 0) {
      console.log('%cNo users found. Use __SA_addUser(id, password) to add one.', 'color: #FF00AA;');
    } else {
      console.log(`%c${userIds.length} user(s):`, 'color: #00F0FF; font-weight: bold;');
      userIds.forEach(id => console.log(`  • ${id}`));
    }
    return userIds;
  };

  window.__SA_removeUser = function (userId) {
    const users = getStoredUsers();
    if (!users[userId]) {
      console.log(`%cUser "${userId}" not found.`, 'color: #FF00AA;');
      return;
    }
    delete users[userId];
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    console.log(`%c✓ User "${userId}" removed.`, 'color: #FFE600; font-weight: bold;');
  };
}
