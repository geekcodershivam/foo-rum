/**
 * Formats a date to a relative time string (e.g., "2h ago", "just now")
 * @param date - The date to format
 * @returns A formatted relative time string
 */
export const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  
  return `${Math.floor(seconds / 31536000)}y ago`;
};