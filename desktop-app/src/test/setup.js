import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});

// Mock fetch globally
global.fetch = vi.fn();

// Cleanup and reset mocks after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Suppress console errors for act() warnings in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (args[0]?.includes?.('Warning: An update to') && args[0]?.includes?.('act(...)')) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});
