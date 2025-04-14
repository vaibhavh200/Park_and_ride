/**
 * Generate a unique booking code for reference
 * @returns {string} Unique booking code
 */
exports.generateUniqueCode = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `BOOK-${timestamp}-${randomPart}`;
}; 