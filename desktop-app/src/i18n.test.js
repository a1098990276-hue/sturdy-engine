import { describe, it, expect } from 'vitest';
import arTranslations from './locales/ar.json';
import enTranslations from './locales/en.json';

describe('i18n Translations', () => {
  describe('Translation Keys Consistency', () => {
    it('should have the same keys in both Arabic and English translations', () => {
      const arKeys = Object.keys(arTranslations).sort();
      const enKeys = Object.keys(enTranslations).sort();
      
      expect(arKeys).toEqual(enKeys);
    });

    it('should not have empty translation values in Arabic', () => {
      Object.entries(arTranslations).forEach(([key, value]) => {
        expect(value, `Arabic translation for '${key}' should not be empty`).toBeTruthy();
        expect(typeof value, `Arabic translation for '${key}' should be a string`).toBe('string');
      });
    });

    it('should not have empty translation values in English', () => {
      Object.entries(enTranslations).forEach(([key, value]) => {
        expect(value, `English translation for '${key}' should not be empty`).toBeTruthy();
        expect(typeof value, `English translation for '${key}' should be a string`).toBe('string');
      });
    });
  });

  describe('Required Translation Keys', () => {
    const requiredKeys = [
      'appTitle',
      'dashboard',
      'accounts',
      'products',
      'invoices',
      'journal',
      'reports',
      'settings',
      'language',
      'login',
      'logout',
      'username',
      'password',
      'welcome',
      'permissionsCount',
      'quickStart',
      'quickStartDesc'
    ];

    it.each(requiredKeys)('should have %s key in Arabic translations', (key) => {
      expect(arTranslations).toHaveProperty(key);
    });

    it.each(requiredKeys)('should have %s key in English translations', (key) => {
      expect(enTranslations).toHaveProperty(key);
    });
  });

  describe('Arabic Translation Content', () => {
    it('should have Arabic content for appTitle', () => {
      expect(arTranslations.appTitle).toBe('نظام الصقر المحاسبي');
    });

    it('should have Arabic RTL content indicators', () => {
      // Arabic text should contain Arabic characters (Unicode range)
      const arabicRegex = /[\u0600-\u06FF]/;
      const allowedNonArabicKeys = ['developerName', 'github', 'licenseType', 'technologies'];
      
      Object.entries(arTranslations).forEach(([key, value]) => {
        if (allowedNonArabicKeys.includes(key)) {
          return;
        }

        expect(arabicRegex.test(value), `'${key}' should contain Arabic characters`).toBe(true);
      });
    });
  });

  describe('English Translation Content', () => {
    it('should have English content for appTitle', () => {
      expect(enTranslations.appTitle).toBe('SAQR Accounting System');
    });

    it('should have proper English content', () => {
      // English should not contain Arabic characters
      const arabicRegex = /[\u0600-\u06FF]/;
      
      Object.entries(enTranslations).forEach(([key, value]) => {
        expect(arabicRegex.test(value), `'${key}' should not contain Arabic characters`).toBe(false);
      });
    });
  });

  describe('Translation Completeness', () => {
    it('should have at least 15 translation keys', () => {
      expect(Object.keys(arTranslations).length).toBeGreaterThanOrEqual(15);
      expect(Object.keys(enTranslations).length).toBeGreaterThanOrEqual(15);
    });

    it('should have all navigation keys', () => {
      const navigationKeys = ['dashboard', 'accounts', 'products', 'invoices', 'journal', 'reports', 'settings'];
      
      navigationKeys.forEach(key => {
        expect(arTranslations).toHaveProperty(key);
        expect(enTranslations).toHaveProperty(key);
      });
    });

    it('should have all authentication keys', () => {
      const authKeys = ['login', 'logout', 'username', 'password'];
      
      authKeys.forEach(key => {
        expect(arTranslations).toHaveProperty(key);
        expect(enTranslations).toHaveProperty(key);
      });
    });
  });
});
