import React, { useState } from 'react';
import { translations } from '../translations';

export default function Navbar({ activeTab, setActiveTab, onSearch, searchQuery, appLang, setAppLang }) {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const t = translations[appLang] || translations.ar;

  const tabs = [
    { id: 'home', label: t.home, icon: '🏠' },
    { id: 'movies', label: t.movies, icon: '🎬' },
    { id: 'tv', label: t.tv, icon: '📺' },
    { id: 'family', label: t.family, icon: '👨‍👩‍👧‍👦' },
    { id: 'top_rated', label: t.topRated, icon: '⭐' },
  ];

  const languages = [
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ];

  const currentLang = languages.find((l) => l.code === appLang) || languages[0];

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-800 shadow-xl">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* الشعار واختيار اللغة للشاشات الكبيرة */}
          <div className="flex items-center justify-between w-full lg:w-auto gap-4">
            <div 
              className="flex items-center gap-2.5 cursor-pointer select-none"
              onClick={() => { setActiveTab('home'); onSearch(''); }}
            >
              <span className="text-3xl animate-bounce">🍿</span>
              <div>
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-red-500">
                  {t.appName}
                </h1>
                <p className="text-[11px] text-gray-400 font-medium">{t.appTagline}</p>
              </div>
            </div>

            {/* قائمة تغيير لغة الموقع */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow"
              >
                <span>{currentLang.flag}</span>
                <span>{currentLang.name}</span>
                <span className="text-[10px] text-gray-400">▼</span>
              </button>

              {langMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setLangMenuOpen(false)}></div>
                  <div className="absolute top-full mt-2 left-0 lg:left-auto lg:right-0 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 z-40 w-36 overflow-hidden animate-fadeIn">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setAppLang(lang.code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-xs font-bold flex items-center gap-2 transition-colors ${
                          appLang === lang.code
                            ? 'bg-red-600 text-white'
                            : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* الأقسام الرئيسية */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto py-1 scrollbar-none justify-start lg:justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  onSearch('');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id && !searchQuery
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 scale-105'
                    : 'bg-slate-800/80 text-gray-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* مربع البحث */}
          <div className="w-full lg:w-64">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                placeholder={t.searchPlaceholder}
                className="w-full pl-4 pr-10 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-xs sm:text-sm"
                onChange={(e) => onSearch(e.target.value)}
              />
              <span className="absolute right-3 top-2.5 text-gray-500 text-xs sm:text-sm">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => onSearch('')}
                  className="absolute left-3 top-2 text-gray-400 hover:text-white text-xs bg-slate-800 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}
