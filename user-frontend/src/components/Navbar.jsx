import React, { useContext } from 'react';
import { Sun, Moon, Globe } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'HI' },
  { code: 'te', label: 'TE' },
];

const Navbar = ({ title }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 right-0 left-20 md:left-64 z-30 h-16 glass-panel border-b border-white/10 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold" style={{ color: 'var(--text-color)' }}>
        {title}
      </h1>

      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <Globe className="w-4 h-4 text-gray-400 ml-1" />
          {LANGUAGES.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => i18n.changeLanguage(code)}
              className={`text-xs font-medium px-2 py-1 rounded-md transition-all duration-200 ${
                i18n.language === code
                  ? 'text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              style={i18n.language === code ? { background: '#f97316' } : {}}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4 text-yellow-400" />
            : <Moon className="w-4 h-4 text-blue-400" />
          }
        </button>

        {/* User Avatar */}
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
          {user?.name?.charAt(0) || 'U'}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
