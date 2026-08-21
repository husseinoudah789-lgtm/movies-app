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
  historyCount = 0,
  isSafeMode = true,
  onToggleSafeMode
}) {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const t = translations[appLang] || translations.ar;

  // روابط التنقل الرئيسية العلوية للكمبيوتر
  const navTabs = [
    { id: 'home', label: t.home, icon: '🏠' },
    { id: 'arabic', label: t.arabic, icon: '🇪🇬' },
    { id: 'movies', label: t.movies, icon: '🎬' },
    { id: 'tv', label: t.tv, icon: '📺' },
    { id: 'anime', label: t.anime, icon: '🎌' },
  ];

  // روابط شريط التنقل السفلي للموبايل (Mobile Bottom App Bar)
  const mobileBottomTabs = [
    { id: 'home', label: t.home, icon: '🏠' },
    { id: 'arabic', label: 'عربي', icon: '🇪🇬' },
    { id: 'movies', label: t.movies, icon: '🎬' },
    { id: 'tv', label: t.tv, icon: '📺' },
    { id: 'watchlist', label: t.watchlist, icon: '❤️', badge: watchlistCount },
    { id: 'categories', label: t.categories, icon: '✨' },
  ];

  // جميع الأقسام لنافذة التصنيفات
  const allCategories = [
    { id: 'home', label: t.home, icon: '🏠', desc: 'الصفحة الرئيسية والعروض الرائجة' },
    { id: 'arabic', label: t.arabic, icon: '🇪🇬', desc: 'أحدث الأفلام والمسلسلات والدراما العربية' },
    { id: 'movies', label: t.movies, icon: '🎬', desc: 'أحدث الأفلام العالمية والسينمائية' },
    { id: 'tv', label: t.tv, icon: '📺', desc: 'أفضل المسلسلات التلفزيونية العالمية' },
    { id: 'anime', label: t.anime, icon: '🎌', desc: 'عالم الأنمي والرسوم المتحركة' },
    { id: 'kdrama', label: t.kdrama, icon: '🎎', desc: 'الدراما الكورية والآسيوية' },
    { id: 'action', label: t.action, icon: '💥', desc: 'أقوى أفلام ومسلسلات الحركة والإثارة' },
    { id: 'upcoming', label: t.upcoming, icon: '🍿', desc: 'أحدث الأفلام في دور العرض وقريباً' },
    { id: 'top_rated', label: t.topRated, icon: '⭐', desc: 'الأعمال الفنية الأعلى تقييماً' },
    { id: 'family', label: t.family, icon: '👨‍👩‍👧‍👦', desc: 'محتوى آمن وممتع للعائلة والأطفال' },
    { id: 'docs', label: t.docs, icon: '🌍', desc: 'أفلام وثائقية واستكشاف العالم' },
    { id: 'history', label: t.history, icon: '⏱️', badge: historyCount, desc: 'استكمل مشاهدة أعمالك السابقة' },
    { id: 'watchlist', label: t.watchlist, icon: '❤️', badge: watchlistCount, desc: 'أعمالك المفضلة المحفوظة' },
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

  const handleSelectTab = (tabId) => {
    if (tabId === 'categories') {
      setCategoriesModalOpen(true);
      return;
    }
    setActiveTab(tabId);
    onSearch('');
    setCategoriesModalOpen(false);
    setMobileSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* 1. شريط التنقل العلوي المتجاوب للهواتف والحواسيب */}
      <nav className="bg-[#0f111a]/95 backdrop-blur-2xl sticky top-0 z-40 border-b border-orange-500/20 shadow-2xl shadow-orange-950/20 pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto px-3 sm:px-6 py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            
            {/* الشعار وروابط التنقل للكمبيوتر */}
            <div className="flex items-center gap-3 lg:gap-6 shrink-0">
              <div 
                className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
                onClick={() => handleSelectTab('home')}
              >
                <span className="text-2xl sm:text-3xl filter drop-shadow group-hover:scale-110 transition-transform">🍿</span>
                <div>
                  <h1 className="text-base sm:text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-white tracking-tight whitespace-nowrap drop-shadow">
                    {t.appName}
                  </h1>
                </div>
              </div>

              {/* أزرار الشاشات الكبيرة */}
              <div className="hidden lg:flex items-center gap-1">
                {navTabs.map((tab) => {
                  const isActive = activeTab === tab.id && !searchQuery;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleSelectTab(tab.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white font-black shadow-lg shadow-orange-600/40 scale-105 border border-orange-400/40'
                          : 'text-gray-300 hover:text-white hover:bg-orange-500/10'
                      }`}
                    >
                      <span className="text-sm">{tab.icon}</span>
                      <span className="whitespace-nowrap">{tab.label}</span>
                    </button>
                  );
                })}

                <button
                  onClick={() => setCategoriesModalOpen(true)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    allCategories.slice(5).some(c => c.id === activeTab) && !searchQuery
                      ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-md'
                      : 'text-orange-400 hover:text-white bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30'
                  }`}
                  title="عرض جميع التصنيفات"
                >
                  <span>✨</span>
                  <span className="whitespace-nowrap">{t.categories}</span>
                </button>
              </div>
            </div>

            {/* أدوات البحث والحساب واللغة */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              
              {/* زر تفعيل المشاهدة العائلية النظيفة */}
              <button
                onClick={onToggleSafeMode}
                className={`p-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1 sm:gap-1.5 border shadow ${
                  isSafeMode
                    ? 'bg-orange-950/90 text-orange-300 border-orange-500/50 shadow-orange-500/20'
                    : 'bg-slate-900 text-gray-400 border-slate-800 hover:text-gray-200'
                }`}
                title={isSafeMode ? 'المشاهدة العائلية النظيفة مفعلة 🛡️' : 'تفعيل المشاهدة العائلية النظيفة'}
              >
                <span className="text-xs sm:text-sm">🛡️</span>
                <span className="hidden md:inline whitespace-nowrap">{isSafeMode ? 'المشاهدة النظيفة' : 'الوضع العائلي'}</span>
                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isSafeMode ? 'bg-orange-400 animate-pulse' : 'bg-gray-600'}`}></span>
              </button>

              {/* زر البحث للموبايل */}
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="lg:hidden p-2 rounded-full bg-slate-900 border border-slate-800 text-orange-400 hover:text-white text-xs"
                title="بحث"
              >
                🔍
              </button>

              {/* مربع البحث للأجهزة الأكبر */}
              <div className="relative hidden lg:block w-44 xl:w-56">
                <input
                  type="text"
                  value={searchQuery}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-7 pr-8 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-xs"
                  onChange={(e) => onSearch(e.target.value)}
                />
                <span className="absolute right-2.5 top-2 text-orange-400 text-xs">🔍</span>
                {searchQuery && (
                  <button
                    onClick={() => onSearch('')}
                    className="absolute left-2 top-2 text-gray-400 hover:text-white text-[10px] bg-slate-800 rounded-full w-3.5 h-3.5 flex items-center justify-center"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* زر المفضلة للكمبيوتر */}
              <button
                onClick={() => handleSelectTab('watchlist')}
                className={`relative hidden sm:flex p-2 rounded-full border transition-all ${
                  activeTab === 'watchlist' && !searchQuery
                    ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white border-orange-400 shadow-md shadow-orange-600/30'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-gray-300 border-slate-800 hover:text-white'
                }`}
                title={t.watchlist}
              >
                <span className="text-xs sm:text-sm block">❤️</span>
                {watchlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow">
                    {watchlistCount}
                  </span>
                )}
              </button>

              {/* اختيار اللغة */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="bg-slate-900/90 hover:bg-slate-800 text-white px-2 py-1.5 sm:px-2.5 rounded-full border border-slate-800 text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <span className="text-sm">{currentLang.flag}</span>
                  <span className="hidden md:inline text-[11px] whitespace-nowrap">{currentLang.name}</span>
                </button>

                {langMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setLangMenuOpen(false)}></div>
                    <div className="absolute top-full mt-2 left-0 lg:left-auto lg:right-0 bg-slate-900 border border-orange-500/30 rounded-2xl shadow-2xl py-1 z-40 w-36 overflow-hidden animate-fadeIn">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setAppLang(lang.code);
                            setLangMenuOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-xs font-bold flex items-center gap-2 transition-colors ${
                            appLang === lang.code
                              ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white font-black'
                              : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span className="whitespace-nowrap">{lang.name}</span>
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
                    className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 hover:opacity-95 text-white p-1 sm:px-2.5 sm:py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-md shadow-orange-600/30 transition-all border border-orange-400/40"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-950/40 flex items-center justify-center text-xs">
                      {currentUser.avatar || '🍿'}
                    </span>
                    <span className="hidden sm:inline max-w-[70px] truncate whitespace-nowrap">{currentUser.name}</span>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)}></div>
                      <div className="absolute top-full mt-2 left-0 lg:left-auto lg:right-0 bg-slate-900 border border-orange-500/30 rounded-2xl shadow-2xl p-2 z-40 w-48 animate-fadeIn space-y-1">
                        <div className="px-3 py-2 border-b border-slate-800 mb-1">
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
                          className="w-full px-3 py-2 text-xs font-bold text-gray-300 hover:bg-slate-800 hover:text-white rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <span>👤</span>
                          <span className="whitespace-nowrap">{t.profile}</span>
                        </button>

                        <button
                          onClick={() => {
                            handleSelectTab('watchlist');
                            setUserMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-xs font-bold text-gray-300 hover:bg-slate-800 hover:text-white rounded-xl flex items-center justify-between transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <span>❤️</span>
                            <span className="whitespace-nowrap">{t.watchlist}</span>
                          </span>
                          {watchlistCount > 0 && (
                            <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                              {watchlistCount}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            handleSelectTab('history');
                            setUserMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-xs font-bold text-gray-300 hover:bg-slate-800 hover:text-white rounded-xl flex items-center justify-between transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <span>⏱️</span>
                            <span className="whitespace-nowrap">{t.history}</span>
                          </span>
                          {historyCount > 0 && (
                            <span className="bg-amber-400 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-black">
                              {historyCount}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            onLogout();
                            setUserMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-xs font-bold text-orange-400 hover:bg-orange-600/20 rounded-xl flex items-center gap-2 transition-colors border-t border-slate-800 mt-1"
                        >
                          <span>🚪</span>
                          <span className="whitespace-nowrap">{t.logout}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-400 text-white px-2.5 py-1.5 sm:px-4 sm:py-1.5 rounded-full text-xs font-black shadow-md shadow-orange-600/30 transition-all flex items-center gap-1 active:scale-95 whitespace-nowrap border border-orange-400/40"
                >
                  <span>👤</span>
                  <span className="hidden sm:inline whitespace-nowrap">{t.login}</span>
                </button>
              )}

            </div>
          </div>

          {/* شريط البحث المنسدل للموبايل */}
          {mobileSearchOpen && (
            <div className="lg:hidden pt-2 pb-1 animate-fadeIn">
              <div className="relative w-full">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-8 pr-9 py-2 rounded-2xl bg-slate-900 border border-orange-500/40 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 text-xs shadow-inner"
                  onChange={(e) => onSearch(e.target.value)}
                />
                <span className="absolute right-3 top-2.5 text-orange-400 text-xs">🔍</span>
                {searchQuery ? (
                  <button
                    onClick={() => onSearch('')}
                    className="absolute left-3 top-2 text-gray-400 hover:text-white text-xs bg-slate-800 rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ✕
                  </button>
                ) : (
                  <button
                    onClick={() => setMobileSearchOpen(false)}
                    className="absolute left-3 top-2 text-gray-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </nav>

      {/* 2. شريط التنقل السفلي الاحترافي للهواتف (Mobile Bottom Navigation Bar) */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#0c0e17]/95 backdrop-blur-2xl border-t border-orange-500/20 px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="flex items-center justify-around">
          {mobileBottomTabs.map((tab) => {
            const isActive = activeTab === tab.id && !searchQuery;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-orange-400 font-black scale-105'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span className="text-lg relative">
                  {tab.icon}
                  {tab.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black">
                      {tab.badge}
                    </span>
                  )}
                </span>
                <span className="text-[10px] mt-0.5 tracking-tight font-bold">
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-0.5"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. نافذة التصنيفات الشاملة */}
      {categoriesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setCategoriesModalOpen(false)}></div>

          <div className="relative w-full max-w-2xl bg-[#0f111a] border border-orange-500/30 rounded-3xl p-5 sm:p-8 shadow-2xl z-10 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setCategoriesModalOpen(false)}
              className="absolute top-4 left-4 bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white rounded-full w-9 h-9 flex items-center justify-center text-sm transition-colors"
            >
              ✕
            </button>

            <div className="text-center mb-5">
              <span className="text-3xl sm:text-4xl mb-1.5 inline-block animate-bounce">✨</span>
              <h2 className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-white">
                {t.categories}
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                اختر التصنيف المفضل لديك واستمتع بأفضل العروض الحصرية
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pb-4">
              {allCategories.map((cat) => {
                const isActive = activeTab === cat.id && !searchQuery;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectTab(cat.id)}
                    className={`p-3 sm:p-3.5 rounded-2xl border text-right transition-all flex items-start gap-3 group relative overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-600/30 to-amber-500/30 border-orange-500 shadow-lg shadow-orange-600/20'
                        : 'bg-slate-950/80 hover:bg-slate-900 border-slate-800 hover:border-orange-500/40'
                    }`}
                  >
                    <div className="text-2xl p-2 rounded-xl bg-slate-800 group-hover:scale-110 transition-transform shrink-0 border border-slate-700/50">
                      {cat.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`font-black text-xs sm:text-sm truncate ${isActive ? 'text-orange-400' : 'text-white group-hover:text-orange-300 transition-colors'}`}>
                          {cat.label}
                        </h3>
                        {cat.badge > 0 && (
                          <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black shrink-0">
                            {cat.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-[11px] mt-0.5 line-clamp-1">
                        {cat.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
