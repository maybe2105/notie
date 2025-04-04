// Track active users by note ID
const activeUsers = new Map();

// Add user to a note
const addUser = (noteId, username) => {
  if (!activeUsers.has(noteId)) {
    activeUsers.set(noteId, new Set());
  }
  activeUsers.get(noteId).add(username);
};

// Remove user from a note
const removeUser = (noteId, username) => {
  if (noteId && username && activeUsers.has(noteId)) {
    activeUsers.get(noteId).delete(username);

    if (activeUsers.get(noteId).size === 0) {
      activeUsers.delete(noteId);
      return true; // note has no more users
    }
  }
  return false;
};

// Get all users in a note
const getUsersInNote = (noteId) => {
  const usersInNote = activeUsers.get(noteId) || new Set();
  return Array.from(usersInNote);
};

export default {
  activeUsers,
  addUser,
  removeUser,
  getUsersInNote,
};
