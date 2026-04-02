import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const API = 'http://localhost:3001/api';

export default function App() {
  const { t, i18n } = useTranslation();
  const [health, setHealth] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [error, setError] = useState('');
  const [login, setLogin] = useState({ username: 'admin', password: 'changeme' });

  useEffect(() => {
    fetch(`${API}/health`).then((res) => res.json()).then(setHealth).catch(() => setHealth({ status: 'offline' }));
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return;
        setUser(data.user);
        setPermissions(data.permissions || []);
      })
      .catch(() => {});
  }, [token]);

  const toggleLang = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(login)
    });
    const data = await res.json();
    if (data.error) {
      setError(data.error);
      return;
    }
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    setPermissions(data.permissions || []);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  return (
    <div className="app">
      <header className="topbar">
        <h1>{t('appTitle')}</h1>
        <div className="topbar-actions">
          <button onClick={toggleLang}>{t('language')}</button>
          {user && <button onClick={logout}>{t('logout')}</button>}
        </div>
      </header>
      <nav className="sidebar">
        <button>{t('dashboard')}</button>
        <button>{t('accounts')}</button>
        <button>{t('products')}</button>
        <button>{t('invoices')}</button>
        <button>{t('journal')}</button>
        <button>{t('reports')}</button>
        <button>{t('settings')}</button>
      </nav>
      <main className="content">
        {!user && (
          <section className="card">
            <h2>{t('login')}</h2>
            <form className="login-form" onSubmit={handleLogin}>
              <label>
                {t('username')}
                <input value={login.username} onChange={(e) => setLogin({ ...login, username: e.target.value })} />
              </label>
              <label>
                {t('password')}
                <input type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
              </label>
              {error && <p className="error">{error}</p>}
              <button type="submit">{t('login')}</button>
            </form>
          </section>
        )}
        {user && (
          <>
            <section className="card">
              <h2>{t('dashboard')}</h2>
              <p>{t('welcome')}: {user.full_name || user.username}</p>
              <p>{t('permissionsCount')}: {permissions.length}</p>
              <p>API: {health ? health.status : 'loading...'}</p>
            </section>
            <section className="card">
              <h2>{t('quickStart')}</h2>
              <p>{t('quickStartDesc')}</p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}