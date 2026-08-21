import React, { useState } from 'react';
import { translations } from '../translations';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onSearch, 
  searchQuery, 
  appLang, 
  setAppLang, 
  currentUser, 
  onOpenAuth, 
  onOpenProfile,
  onLogout,
  watchlistCount = 0,
  historyCount = 0
}) {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const t = translations[appLang] || translations.ar;

  const primaryTabs = [
    { id: 'home', label: t.home, icon: '🏠' },
    { id: 'movies', label: t.movies, icon: '🎬' },
    { id: 'tv', label: t.tv, icon: '📺' },
    { id: 'anime', label: t.anime, icon: '🎌' },
    { id: 'kdrama', label: t.kdrama, icon: '🎎' },
  ];

  const secondaryTabs = [
    { id: 'action', label: t.action, icon: '💥' },
    { id: 'upcoming', label: t.upcoming, icon: '🍿' },
    { id: 'top_rated', label: t.topRated, icon: '⭐' },
    { id: 'family', label: t.family, icon: '👨‍👩‍👧‍👦' },
    { id: 'docs', label: t.docs, icon: '🌍' },
    { id: 'history', label: t.history, icon: '⏱️', badge: historyCount },
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

  const isSecondaryActive = secondaryTabs.some((tab) => tab.id === activeTab);

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-800 shadow-xl">
      <div className="container mx-auto px-4 py-2.5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* الشعار واختيار اللغة وتسجيل الدخول */}
          <div className="flex items-center justify-between w-full lg:w-auto gap-3">
            <div 
              className="flex items-center gap-2 cursor-pointer select-none group"
              onClick={() => { setActiveTab('home'); onSearch(''); }}
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">🍿</span>
              <div>
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-red-500">
                  {t.appName}
                </h1>
                <p className="text-[10px] text-gray-400 font-medium">{t.appTagline}</p>
              </div>
            </div>

            {/* أدوات الزاوية: اللغة + المفضلة + المستخدم */}
            <div className="flex items-center gap-2">
              
              {/* زر المفضلة السريع */}
              <button
                onClick={() => { setActiveTab('watchlist'); onSearch(''); }}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow ${
                  activeTab === 'watchlist'
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-gray-300 border-slate-700'
                }`}
                title={t.watchlist}
              >
                <span>❤️</span>
                {watchlistCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                    {watchlistCount}
                  </span>
                )}
              </button>

              {/* اختيار اللغة */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-2 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                >
                  <span>{currentLang.flag}</span>
                  <span className="hidden sm:inline">{currentLang.name}</span>
                  <span className="text-[9px] text-gray-400">▼</span>
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

              {/* زر تسجيل الدخول أو قائمة الحساب */}
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="bg-gradient-to-r from-red-600 to-amber-600 hover:opacity-90 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
                  >
                    <span className="text-base">{currentUser.avatar || '🍿'}</span>
                    <span className="max-w-[70px] truncate">{currentUser.name}</span>
                    <span className="text-[9px]">▼</span>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)}></div>
                      <div className="absolute top-full mt-2 left-0 lg:left-auto lg:right-0 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-2 z-40 w-52 animate-fadeIn space-y-1">
                        <div className="px-3 py-2 border-b border-slate-700/60 mb-1">
                          <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                            <span>{currentUser.avatar || '🍿'}</span>
                            <span>{currentUser.name}</span>
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">{currentUser.email}</p>
                        </div>

                        <button
                          onClick={() => {
                            onOpenProfile && onOpenProfile();
                            setUserMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-xs font-bold text-gray-300 hover:bg-slate-700 hover:text-white rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <span>👤</span>
                          <span>{t.profile}</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveTab('watchlist');
                            setUserMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-xs font-bold text-gray-300 hover:bg-slate-700 hover:text-white rounded-xl flex items-center justify-between transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <span>❤️</span>
                            <span>{t.watchlist}</span>
                          </span>
                          {watchlistCount > 0 && (
                            <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                              {watchlistCount}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setActiveTab('history');
                            setUserMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-xs font-bold text-gray-300 hover:bg-slate-700 hover:text-white rounded-xl flex items-center justify-between transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <span>⏱️</span>
                            <span>{t.history}</span>
                          </span>
                          {historyCount > 0 && (
                            <span className="bg-amber-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-black">
                              {historyCount}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            onLogout();
                            setUserMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-600/20 rounded-xl flex items-center gap-2 transition-colors border-t border-slate-700/60 mt-1"
                        >
                          <span>🚪</span>
                          <span>{t.logout}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all active:scale-95"
                >
                  <span>👤</span>
                  <span>{t.login}</span>
                </button>
              )}

            </div>
          </div>

          {/* شريط الأقسام المباشرة + القائمة المنسدلة للأقسام الإضافية */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto py-1 scrollbar-none justify-start lg:justify-center">
            {primaryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  onSearch('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id && !searchQuery
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 scale-105'
                    : 'bg-slate-800/80 text-gray-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}

            {/* زر القائمة المنسدلة للأقسام الإضافية */}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 ${
                  isSecondaryActive && !searchQuery
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 font-black'
                    : 'bg-slate-800/80 text-gray-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                }`}
              >
                <span>✨</span>
                <span>{t.moreSections}</span>
                <span className="text-[10px]">▼</span>
              </button>

              {moreMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMoreMenuOpen(false)}></div>
                  <div className="absolute top-full mt-2 right-0 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-2 z-40 w-52 animate-fadeIn space-y-1">
                    {secondaryTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          onSearch('');
                          setMoreMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-xs font-bold flex items-center justify-between rounded-xl transition-colors ${
                          activeTab === tab.id && !searchQuery
                            ? 'bg-red-600 text-white'
                            : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{tab.icon}</span>
                          <span>{tab.label}</span>
                        </span>
                        {tab.badge > 0 && (
                          <span className="bg-amber-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* مربع البحث */}
          <div className="w-full lg:w-60">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                placeholder={t.searchPlaceholder}
                className="w-full pl-4 pr-9 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-xs"
                onChange={(e) => onSearch(e.target.value)}
              />
              <span className="absolute right-3 top-2.5 text-gray-500 text-xs">🔍</span>
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
