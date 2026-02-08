/**
 * Format a timestamp as a relative time string
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Formatted relative time (e.g., "5m ago", "2h ago", "3d ago")
 */
export function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

/**
 * Generate a smart title from text
 * Truncates at word boundary if longer than maxLength
 * @param {string} text - Text to generate title from
 * @param {number} maxLength - Maximum length (default 50)
 * @returns {string} Generated title
 */
export function generateSmartTitle(text, maxLength = 50) {
  if (!text || text.trim().length === 0) {
    return `New Chat - ${new Date().toLocaleDateString()}`;
  }

  const trimmed = text.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  // Find last space before maxLength
  const truncated = trimmed.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.6) {
    // If we found a space in the last 40% of the string, use it
    return truncated.substring(0, lastSpace) + '...';
  }

  // Otherwise just hard truncate
  return truncated + '...';
}
