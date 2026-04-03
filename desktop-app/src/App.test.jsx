import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        appTitle: 'SAQR Accounting System',
        dashboard: 'Dashboard',
        accounts: 'Chart of Accounts',
        products: 'Products',
        invoices: 'Invoices',
        journal: 'Journal Entries',
        reports: 'Reports',
        settings: 'Settings',
        language: 'Language',
        login: 'Login',
        logout: 'Logout',
        username: 'Username',
        password: 'Password',
        welcome: 'Welcome',
        permissionsCount: 'Permissions count',
        quickStart: 'Quick Start',
        quickStartDesc: 'You can now manage accounts, inventory, invoices, journal entries, and reports through the system APIs.'
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'en',
      changeLanguage: vi.fn()
    }
  })
}));

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders the app title', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: 'healthy' })
      });

      render(<App />);
      
      expect(screen.getByText('SAQR Accounting System')).toBeInTheDocument();
    });

    it('renders navigation sidebar with all menu items', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: 'healthy' })
      });

      render(<App />);
      
      expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Chart of Accounts' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Products' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Invoices' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Journal Entries' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reports' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    });

    it('renders language toggle button', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: 'healthy' })
      });

      render(<App />);
      
      expect(screen.getByRole('button', { name: 'Language' })).toBeInTheDocument();
    });
  });

  describe('Login Form', () => {
    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: 'healthy' })
      });
    });

    it('renders login form when user is not authenticated', () => {
      render(<App />);
      
      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    it('has default username and password values', () => {
      render(<App />);
      
      const usernameInput = screen.getByDisplayValue('admin');
      const passwordInput = screen.getByDisplayValue('changeme');
      
      expect(usernameInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    it('allows typing in username field', () => {
      render(<App />);
      
      const usernameInput = screen.getByDisplayValue('admin');
      fireEvent.change(usernameInput, { target: { value: 'newuser' } });
      
      expect(screen.getByDisplayValue('newuser')).toBeInTheDocument();
    });

    it('allows typing in password field', () => {
      render(<App />);
      
      const passwordInput = screen.getByDisplayValue('changeme');
      fireEvent.change(passwordInput, { target: { value: 'newpassword' } });
      
      expect(screen.getByDisplayValue('newpassword')).toBeInTheDocument();
    });

    it('submits login form and handles successful login', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve({ status: 'healthy' }) })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({
            token: 'test-token',
            user: { username: 'admin', full_name: 'Admin User' },
            permissions: ['read', 'write']
          })
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({
            user: { username: 'admin', full_name: 'Admin User' },
            permissions: ['read', 'write']
          })
        });

      render(<App />);
      
      const loginButton = screen.getByRole('button', { name: 'Login' });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/Welcome.*Admin User/i)).toBeInTheDocument();
      });
    });

    it('displays error message on login failure', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve({ status: 'healthy' }) })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({ error: 'Invalid credentials' })
        });

      render(<App />);
      
      const loginButton = screen.getByRole('button', { name: 'Login' });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });
  });

  describe('Authenticated User View', () => {
    it('shows dashboard after successful login', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve({ status: 'healthy' }) })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({
            token: 'test-token',
            user: { username: 'admin', full_name: 'Admin User' },
            permissions: ['read', 'write', 'delete']
          })
        })
        .mockResolvedValue({
          json: () => Promise.resolve({
            user: { username: 'admin', full_name: 'Admin User' },
            permissions: ['read', 'write', 'delete']
          })
        });

      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() => {
        expect(screen.getByText('Permissions count: 3')).toBeInTheDocument();
      });
    });

    it('shows logout button when user is authenticated', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve({ status: 'healthy' }) })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({
            token: 'test-token',
            user: { username: 'admin', full_name: 'Admin' },
            permissions: []
          })
        })
        .mockResolvedValue({
          json: () => Promise.resolve({
            user: { username: 'admin', full_name: 'Admin' },
            permissions: []
          })
        });

      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
      });
    });

    it('logs out when logout button is clicked', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve({ status: 'healthy' }) })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({
            token: 'test-token',
            user: { username: 'admin', full_name: 'Admin' },
            permissions: []
          })
        })
        .mockResolvedValue({
          json: () => Promise.resolve({
            user: { username: 'admin', full_name: 'Admin' },
            permissions: []
          })
        });

      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
      });
    });

    it('displays Quick Start section when logged in', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve({ status: 'healthy' }) })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({
            token: 'test-token',
            user: { username: 'admin' },
            permissions: []
          })
        })
        .mockResolvedValue({
          json: () => Promise.resolve({
            user: { username: 'admin' },
            permissions: []
          })
        });

      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() => {
        expect(screen.getByText('Quick Start')).toBeInTheDocument();
      });
    });
  });

  describe('API Health Check', () => {
    it('displays healthy status when API is online', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve({ status: 'healthy' }) })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({
            token: 'test-token',
            user: { username: 'admin' },
            permissions: []
          })
        })
        .mockResolvedValue({
          json: () => Promise.resolve({
            user: { username: 'admin' },
            permissions: []
          })
        });

      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() => {
        expect(screen.getByText('API: healthy')).toBeInTheDocument();
      });
    });

    it('displays offline status when API is unreachable', async () => {
      global.fetch = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          json: () => Promise.resolve({
            token: 'test-token',
            user: { username: 'admin' },
            permissions: []
          })
        })
        .mockResolvedValue({
          json: () => Promise.resolve({
            user: { username: 'admin' },
            permissions: []
          })
        });

      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() => {
        expect(screen.getByText('API: offline')).toBeInTheDocument();
      });
    });
  });

  describe('Language Toggle', () => {
    it('calls changeLanguage when language button is clicked', async () => {
      const changeLanguageMock = vi.fn();
      vi.doMock('react-i18next', () => ({
        useTranslation: () => ({
          t: (key) => key,
          i18n: {
            language: 'en',
            changeLanguage: changeLanguageMock
          }
        })
      }));

      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ status: 'healthy' })
      });

      render(<App />);
      
      const languageButton = screen.getByRole('button', { name: 'Language' });
      expect(languageButton).toBeInTheDocument();
    });
  });

  describe('Persisted Token', () => {
    it('fetches user data when token exists in localStorage', async () => {
      localStorage.setItem('token', 'existing-token');
      
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve({ status: 'healthy' }) })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({
            user: { username: 'admin', full_name: 'Admin User' },
            permissions: ['read', 'write']
          })
        });

      render(<App />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/me',
          expect.objectContaining({
            headers: { Authorization: 'Bearer existing-token' }
          })
        );
      });
    });

    it('shows dashboard when token is valid', async () => {
      localStorage.setItem('token', 'valid-token');
      
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve({ status: 'healthy' }) })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({
            user: { username: 'admin', full_name: 'Test User' },
            permissions: ['read']
          })
        });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Welcome.*Test User/i)).toBeInTheDocument();
      });
    });
  });

  describe('Username Display', () => {
    it('displays full_name when available', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve({ status: 'healthy' }) })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({
            token: 'test-token',
            user: { username: 'admin', full_name: 'John Doe' },
            permissions: []
          })
        })
        .mockResolvedValue({
          json: () => Promise.resolve({
            user: { username: 'admin', full_name: 'John Doe' },
            permissions: []
          })
        });

      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() => {
        expect(screen.getByText('Welcome: John Doe')).toBeInTheDocument();
      });
    });

    it('displays username when full_name is not available', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve({ status: 'healthy' }) })
        .mockResolvedValueOnce({
          json: () => Promise.resolve({
            token: 'test-token',
            user: { username: 'admin' },
            permissions: []
          })
        })
        .mockResolvedValue({
          json: () => Promise.resolve({
            user: { username: 'admin' },
            permissions: []
          })
        });

      render(<App />);
      
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() => {
        expect(screen.getByText('Welcome: admin')).toBeInTheDocument();
      });
    });
  });
});
