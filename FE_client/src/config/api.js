/**
 * API Configuration
 * Centralized configuration for API endpoints and utilities
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Convert relative storage path to full URL
 * @param {string} relativePath - Relative path from backend (e.g., "storage/batch123/frame.jpg")
 * @returns {string} Full URL to the resource
 * 
 * Examples:
 *   "storage/batch/frame.jpg" -> "http://localhost:8000/storage/batch/frame.jpg"
 *   "http://example.com/image.jpg" -> "http://example.com/image.jpg" (unchanged)
 */
export const getImageUrl = (relativePath) => {
  if (!relativePath) return '';
  
  // If already a full URL, return as is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  
  return `${API_BASE_URL}/${cleanPath}`;
};

/**
 * Get full API endpoint URL
 * @param {string} endpoint - API endpoint path
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

