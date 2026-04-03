import { describe, it, expect, beforeEach } from 'vitest';
import {
  API_URL,
  getNextLanguage,
  getTextDirection,
  getDisplayName,
  createAuthHeaders,
  validateLoginForm,
  getPermissionsCount,
  storeToken,
  getStoredToken,
  removeToken,
  storeLanguage,
  getStoredLanguage
} from './utils';

describe('Utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('API_URL', () => {
    it('should export the correct API URL', () => {
      expect(API_URL).toBe('http://localhost:3001/api');
    });
  });

  describe('getNextLanguage', () => {
    it('should return "en" when current language is "ar"', () => {
      expect(getNextLanguage('ar')).toBe('en');
    });

    it('should return "ar" when current language is "en"', () => {
      expect(getNextLanguage('en')).toBe('ar');
    });

    it('should return "ar" for any unknown language', () => {
      expect(getNextLanguage('fr')).toBe('ar');
      expect(getNextLanguage('')).toBe('ar');
      expect(getNextLanguage(undefined)).toBe('ar');
    });
  });

  describe('getTextDirection', () => {
    it('should return "rtl" for Arabic', () => {
      expect(getTextDirection('ar')).toBe('rtl');
    });

    it('should return "ltr" for English', () => {
      expect(getTextDirection('en')).toBe('ltr');
    });

    it('should return "ltr" for any other language', () => {
      expect(getTextDirection('fr')).toBe('ltr');
      expect(getTextDirection('')).toBe('ltr');
    });
  });

  describe('getDisplayName', () => {
    it('should return full_name when available', () => {
      const user = { username: 'admin', full_name: 'Admin User' };
      expect(getDisplayName(user)).toBe('Admin User');
    });

    it('should return username when full_name is not available', () => {
      const user = { username: 'admin' };
      expect(getDisplayName(user)).toBe('admin');
    });

    it('should return empty string when user is null', () => {
      expect(getDisplayName(null)).toBe('');
    });

    it('should return empty string when user is undefined', () => {
      expect(getDisplayName(undefined)).toBe('');
    });

    it('should return empty string when user has no name fields', () => {
      expect(getDisplayName({})).toBe('');
    });

    it('should prefer full_name over username', () => {
      const user = { username: 'admin', full_name: 'Administrator' };
      expect(getDisplayName(user)).toBe('Administrator');
    });
  });

  describe('createAuthHeaders', () => {
    it('should create proper Authorization header with token', () => {
      const headers = createAuthHeaders('test-token');
      expect(headers).toEqual({ Authorization: 'Bearer test-token' });
    });

    it('should return empty object when token is null', () => {
      expect(createAuthHeaders(null)).toEqual({});
    });

    it('should return empty object when token is undefined', () => {
      expect(createAuthHeaders(undefined)).toEqual({});
    });

    it('should return empty object when token is empty string', () => {
      expect(createAuthHeaders('')).toEqual({});
    });
  });

  describe('validateLoginForm', () => {
    it('should return valid for proper credentials', () => {
      const result = validateLoginForm({ username: 'admin', password: 'password123' });
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return error for missing username', () => {
      const result = validateLoginForm({ username: '', password: 'password123' });
      expect(result.isValid).toBe(false);
      expect(result.errors.username).toBe('Username is required');
    });

    it('should return error for missing password', () => {
      const result = validateLoginForm({ username: 'admin', password: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Password is required');
    });

    it('should return errors for both missing fields', () => {
      const result = validateLoginForm({ username: '', password: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.username).toBe('Username is required');
      expect(result.errors.password).toBe('Password is required');
    });

    it('should trim whitespace and detect empty username', () => {
      const result = validateLoginForm({ username: '   ', password: 'password' });
      expect(result.isValid).toBe(false);
      expect(result.errors.username).toBe('Username is required');
    });

    it('should trim whitespace and detect empty password', () => {
      const result = validateLoginForm({ username: 'admin', password: '   ' });
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBe('Password is required');
    });

    it('should handle null values', () => {
      const result = validateLoginForm({ username: null, password: null });
      expect(result.isValid).toBe(false);
    });

    it('should handle undefined values', () => {
      const result = validateLoginForm({ username: undefined, password: undefined });
      expect(result.isValid).toBe(false);
    });
  });

  describe('getPermissionsCount', () => {
    it('should return count of permissions', () => {
      expect(getPermissionsCount(['read', 'write', 'delete'])).toBe(3);
    });

    it('should return 0 for empty array', () => {
      expect(getPermissionsCount([])).toBe(0);
    });

    it('should return 0 for null', () => {
      expect(getPermissionsCount(null)).toBe(0);
    });

    it('should return 0 for undefined', () => {
      expect(getPermissionsCount(undefined)).toBe(0);
    });

    it('should return 0 for non-array', () => {
      expect(getPermissionsCount('string')).toBe(0);
      expect(getPermissionsCount({})).toBe(0);
      expect(getPermissionsCount(123)).toBe(0);
    });
  });

  describe('Token Storage', () => {
    describe('storeToken', () => {
      it('should store token in localStorage', () => {
        storeToken('my-token');
        expect(localStorage.getItem('token')).toBe('my-token');
      });

      it('should not store when token is empty', () => {
        storeToken('');
        expect(localStorage.getItem('token')).toBeNull();
      });

      it('should not store when token is null', () => {
        storeToken(null);
        expect(localStorage.getItem('token')).toBeNull();
      });
    });

    describe('getStoredToken', () => {
      it('should retrieve stored token', () => {
        localStorage.setItem('token', 'stored-token');
        expect(getStoredToken()).toBe('stored-token');
      });

      it('should return null when no token stored', () => {
        expect(getStoredToken()).toBeNull();
      });
    });

    describe('removeToken', () => {
      it('should remove token from localStorage', () => {
        localStorage.setItem('token', 'my-token');
        removeToken();
        expect(localStorage.getItem('token')).toBeNull();
      });
    });
  });

  describe('Language Storage', () => {
    describe('storeLanguage', () => {
      it('should store language in localStorage', () => {
        storeLanguage('ar');
        expect(localStorage.getItem('lang')).toBe('ar');
      });

      it('should store English language', () => {
        storeLanguage('en');
        expect(localStorage.getItem('lang')).toBe('en');
      });
    });

    describe('getStoredLanguage', () => {
      it('should retrieve stored language', () => {
        localStorage.setItem('lang', 'ar');
        expect(getStoredLanguage()).toBe('ar');
      });

      it('should return null when no language stored', () => {
        expect(getStoredLanguage()).toBeNull();
      });
    });
  });
});