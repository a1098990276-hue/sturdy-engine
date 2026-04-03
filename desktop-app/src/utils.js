/**
 * Utility functions for the SAQR ERP Desktop application
 */

/**
 * API base URL
 */
export const API_URL = 'http://localhost:3001/api';

/**
 * Determines the next language based on current language
 * @param {string} currentLang - Current language code
 * @returns {string} - Next language code
 */
export function getNextLanguage(currentLang) {
  return currentLang === 'ar' ? 'en' : 'ar';
}

/**
 * Determines if the text direction should be RTL
 * @param {string} lang - Language code
 * @returns {string} - 'rtl' or 'ltr'
 */
export function getTextDirection(lang) {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

/**
 * Gets the display name for a user
 * @param {Object} user - User object
 * @returns {string} - Display name
 */
export function getDisplayName(user) {
  if (!user) return '';
  return user.full_name || user.username || '';
}

/**
 * Creates authorization headers for API requests
 * @param {string} token - JWT token
 * @returns {Object} - Headers object
 */
export function createAuthHeaders(token) {
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`
  };
}

/**
 * Validates a login form
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.username - Username
 * @param {string} credentials.password - Password
 * @returns {Object} - Validation result with isValid and errors
 */
export function validateLoginForm(credentials) {
  const errors = {};
  
  if (!credentials.username || credentials.username.trim() === '') {
    errors.username = 'Username is required';
  }
  
  if (!credentials.password || credentials.password.trim() === '') {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Formats permissions count display
 * @param {Array} permissions - Array of permissions
 * @returns {number} - Permissions count
 */
export function getPermissionsCount(permissions) {
  if (!Array.isArray(permissions)) return 0;
  return permissions.length;
}

/**
 * Stores authentication token in localStorage
 * @param {string} token - JWT token
 */
export function storeToken(token) {
  if (token) {
    localStorage.setItem('token', token);
  }
}

/**
 * Retrieves authentication token from localStorage
 * @returns {string|null} - JWT token or null
 */
export function getStoredToken() {
  return localStorage.getItem('token');
}

/**
 * Removes authentication token from localStorage
 */
export function removeToken() {
  localStorage.removeItem('token');
}

/**
 * Stores language preference in localStorage
 * @param {string} lang - Language code
 */
export function storeLanguage(lang) {
  localStorage.setItem('lang', lang);
}

/**
 * Retrieves language preference from localStorage
 * @returns {string|null} - Language code or null
 */
export function getStoredLanguage() {
  return localStorage.getItem('lang');
}