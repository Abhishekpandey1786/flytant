// D:\my company work\day 6\backend\utils\chatUtils.js

/**
 * Creates a unique and consistent Room ID for two users.
 * The IDs are sorted to ensure the same Room ID is generated regardless of who initiates the chat.
 * * @param {string} prefix - A prefix like 'general' or 'camp'
 * @param {string} id1 - User ID 1
 * @param {string} id2 - User ID 2
 * @returns {string} 
 */
const getRoomId = (prefix, id1, id2) => {
  const sortedIds = [id1, id2].sort().join(":");
  return `${prefix}:${sortedIds}`; 
};

module.exports = { getRoomId };