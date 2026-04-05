import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getModuleById, navigationItems, utilityItems } from './navigation';

const API = 'http://localhost:3001/api';

export default function App() {
  const { t, i18n } = useTranslation();
  const [health, setHealth] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [error, setError] = useState('');
  const [login, setLogin] = useState({ username: 'admin', password: 'changeme' });
  const [currentPage, setCurrentPage] = useState('home');
  const [settingsMessage, setSettingsMessage] = useState('');
  const fileInputRef = useRef(null);

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
    setCurrentPage('home');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setCurrentPage('home');
  };

  const getAllSettings = () => {
    const settings = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== 'token') {
        settings[key] = localStorage.getItem(key);
      }
    }
    return {
      exportDate: new Date().toISOString(),
      appVersion: '0.2.1',
      settings
    };
  };

  const exportSettings = () => {
    const data = getAllSettings();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saqr-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSettingsMessage(t('settingsExported'));
    setTimeout(() => setSettingsMessage(''), 3000);
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.settings && typeof data.settings === 'object') {
          Object.entries(data.settings).forEach(([key, value]) => {
            localStorage.setItem(key, value);
          });
          const savedLang = data.settings.lang;
          if (savedLang) {
            i18n.changeLanguage(savedLang);
            document.documentElement.lang = savedLang;
            document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
          }
          setSettingsMessage(t('settingsImported'));
          setTimeout(() => setSettingsMessage(''), 3000);
        } else {
          setSettingsMessage(t('settingsImportError'));
          setTimeout(() => setSettingsMessage(''), 3000);
        }
      } catch {
        setSettingsMessage(t('settingsImportError'));
        setTimeout(() => setSettingsMessage(''), 3000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderSettingsPage = () => (
    <>
      <section className="card">
        <h2>{t('settingsPage')}</h2>
        <button className="back-btn" onClick={() => setCurrentPage('home')}>{t('back')}</button>
      </section>

      <section className="card">
        <h3>{t('settingsBackup')}</h3>
        {settingsMessage && <p className="success-message">{settingsMessage}</p>}

        <div className="settings-actions">
          <div className="settings-action">
            <h4>{t('exportSettings')}</h4>
            <p>{t('exportSettingsDesc')}</p>
            <button className="primary-btn" onClick={exportSettings}>{t('exportSettings')}</button>
          </div>

          <div className="settings-action">
            <h4>{t('importSettings')}</h4>
            <p>{t('importSettingsDesc')}</p>
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              ref={fileInputRef}
              style={{ display: 'none' }}
              id="settings-file-input"
            />
            <button className="primary-btn" onClick={() => fileInputRef.current?.click()}>
              {t('importSettings')}
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <h3>{t('currentSettings')}</h3>
        <div className="current-settings">
          {localStorage.length > 0 ? (
            <ul className="settings-list">
              {Array.from({ length: localStorage.length }).map((_, i) => {
                const key = localStorage.key(i);
                if (key === 'token') return null;
                return (
                  <li key={key}>
                    <strong>{key}:</strong> {localStorage.getItem(key)}
                  </li>
                );
              }).filter(Boolean)}
            </ul>
          ) : (
            <p>{t('noSettingsFound')}</p>
          )}
        </div>
      </section>
    </>
  );

  const renderHomePage = () => (
    <>
      <section className="card">
        <h2>{t('home')}</h2>
        <p>{t('welcome')}: {user.full_name || user.username}</p>
        <p>{t('permissionsCount')}: {permissions.length}</p>
        <p>API: {health ? health.status : 'loading...'}</p>
      </section>
      <section className="card">
        <h2>{t('quickStart')}</h2>
        <p>{t('quickStartDesc')}</p>
      </section>
    </>
  );

  const renderModulePage = () => {
    const currentModule = getModuleById(currentPage);

    if (!currentModule) return null;

    return (
      <section className="card">
        <h2>{t(currentModule.labelKey)}</h2>
        <p>{t('modulePlaceholder')}</p>
      </section>
    );
  };

  const renderAboutPage = () => (
    <>
      <section className="card">
        <h2>{t('aboutPage')}</h2>
        <button className="back-btn" onClick={() => setCurrentPage('home')}>{t('back')}</button>
      </section>

      <section className="card about-card">
        <div className="about-header">
          <div className="app-logo">🦅</div>
          <h3>{t('aboutApp')}</h3>
        </div>
        <p className="about-desc">{t('aboutAppDesc')}</p>

        <div className="about-info">
          <div className="info-item">
            <span className="info-label">{t('version')}:</span>
            <span className="info-value">0.2.1</span>
          </div>
          <div className="info-item">
            <span className="info-label">{t('developer')}:</span>
            <span className="info-value">{t('developerName')}</span>
          </div>
          <div className="info-item">
            <span className="info-label">{t('license')}:</span>
            <span className="info-value">{t('licenseType')}</span>
          </div>
          <div className="info-item">
            <span className="info-label">{t('builtWith')}:</span>
            <span className="info-value">{t('technologies')}</span>
          </div>
        </div>
      </section>

      <section className="card">
        <h3>{t('appFeatures')}</h3>
        <ul className="features-list">
          <li>✓ {t('feature1')}</li>
          <li>✓ {t('feature2')}</li>
          <li>✓ {t('feature3')}</li>
          <li>✓ {t('feature4')}</li>
          <li>✓ {t('feature5')}</li>
          <li>✓ {t('feature6')}</li>
          <li>✓ {t('feature7')}</li>
        </ul>
      </section>

      <section className="card">
        <h3>{t('contactInfo')}</h3>
        <div className="contact-info">
          <p>
            <span className="info-label">{t('github')}:</span>{' '}
            <a href="https://github.com/a1098990276-hue" target="_blank" rel="noopener noreferrer">
              github.com/a1098990276-hue
            </a>
          </p>
        </div>
        <p className="copyright">© 2024 {t('developerName')} - {t('copyright')}</p>
      </section>
    </>
  );

  return (
    <div className="app">
      <header className="topbar">
        <h1>{t('appTitle')}</h1>
        <div className="topbar-actions">
          {user && <button onClick={logout}>{t('logout')}</button>}
        </div>
      </header>
      <aside className="sidebar">
        <nav className="sidebar-nav" aria-label={t('moduleNavigation')}>
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={currentPage === item.id ? 'active' : ''}
              onClick={() => setCurrentPage(item.id)}
            >
              {t(item.labelKey)}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="support-card">
            <p>{t('supportPrompt')}</p>
            <button type="button" className="support-link" disabled>{t('whatsApp')}</button>
          </div>
          <div className="sidebar-utility">
            {utilityItems.map((item) => (
              <button
                key={item.id}
                className={currentPage === item.id ? 'active' : ''}
                onClick={() => setCurrentPage(item.id)}
              >
                {t(item.labelKey)}
              </button>
            ))}
            <button onClick={toggleLang}>{t(i18n.language === 'ar' ? 'switchToEnglish' : 'switchToArabic')}</button>
          </div>
        </div>
      </aside>
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
        {user && currentPage === 'home' && renderHomePage()}
        {user && currentPage === 'settings' && renderSettingsPage()}
        {user && currentPage === 'about' && renderAboutPage()}
        {user && !['home', 'settings', 'about'].includes(currentPage) && renderModulePage()}
      </main>
    </div>
  );
}
