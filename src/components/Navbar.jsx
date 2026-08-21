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
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const t = translations[appLang] || translations.ar;

  // جميع الأقسام مع الأيقونات والأوصاف
  const allCategories = [
    { id: 'home', label: t.home, icon: '🏠', desc: 'الصفحة الرئيسية وموجز العروض' },
    { id: 'arabic', label: t.arabic, icon: '🇪🇬', desc: 'أقوى الأفلام والمسلسلات والدراما العربية' },
    { id: 'movies', label: t.movies, icon: '🎬', desc: 'أحدث الأفلام العالمية والسينمائية' },
    { id: 'tv', label: t.tv, icon: '📺', desc: 'أفضل المسلسلات التلفزيونية العالمية' },
    { id: 'anime', label: t.anime, icon: '🎌', desc: 'عالم الأنمي والرسوم المتحركة' },
    { id: 'kdrama', label: t.kdrama, icon: '🎎', desc: 'الدراما والمسلسلات الكورية والآسيوية' },
    { id: 'action', label: t.action, icon: '💥', desc: 'أقوى أفلام ومسلسلات الحركة والإثارة' },
    { id: 'upcoming', label: t.upcoming, icon: '🍿', desc: 'أحدث الأفلام في دور العرض وقريباً' },
    { id: 'top_rated', label: t.topRated, icon: '⭐', desc: 'الأعمال الفنية الأعلى تقييماً' },
    { id: 'family', label: t.family, icon: '👨‍👩‍👧‍👦', desc: 'محتوى آمن وممتع للعائلة والأطفال' },
    { id: 'docs', label: t.docs, icon: '🌍', desc: 'روائع الأفلام الوثائقية واستكشاف العالم' },
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

  const handleSelectCategory = (categoryId) => {
    setActiveTab(categoryId);
    onSearch('');
    setCategoriesModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <nav className="bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-800 shadow-xl">
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
            
            {/* الشعار واختيار اللغة والمفضلة والمستخدم */}
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

              {/* أدوات الزاوية: المفضلة + اللغة + المستخدم */}
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

            {/* شريط الأقسام السريع مع زر "جميع الأقسام" */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto py-1 scrollbar-none justify-start lg:justify-center">
              {allCategories.slice(0, 7).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleSelectCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 shrink-0 ${
                    activeTab === tab.id && !searchQuery
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 scale-105'
                      : 'bg-slate-800/80 text-gray-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}

              {/* زر تصفح جميع الأقسام */}
              <button
                onClick={() => setCategoriesModalOpen(true)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 shrink-0 ${
                  allCategories.slice(7).some(c => c.id === activeTab) && !searchQuery
                    ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-amber-500/30 scale-105'
                    : 'bg-gradient-to-r from-amber-500/20 to-red-500/20 hover:from-amber-500/30 hover:to-red-500/30 text-amber-300 border border-amber-500/40'
                }`}
                title="عرض جميع الأقسام والتصنيفات"
              >
                <span>✨</span>
                <span>{t.moreSections}</span>
                <span className="bg-amber-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  +{allCategories.length - 7}
                </span>
              </button>
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

      {/* نافذة استعراض جميع الأقسام والتصنيفات */}
      {categoriesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="fixed inset-0" onClick={() => setCategoriesModalOpen(false)}></div>

          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            {/* زر الإغلاق */}
            <button
              onClick={() => setCategoriesModalOpen(false)}
              className="absolute top-4 left-4 bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white rounded-full w-9 h-9 flex items-center justify-center text-sm transition-colors"
            >
              ✕
            </button>

            {/* العنوان */}
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 inline-block">✨</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {t.moreSections} والتصنيفات
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                اختر القسم الذي ترغب بتصفحه واستمتع بأفضل العروض
              </p>
            </div>

            {/* شبكة الأقسام */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {allCategories.map((cat) => {
                const isActive = activeTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3.5 group relative overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-r from-red-600/30 to-amber-600/30 border-red-500 shadow-lg shadow-red-600/20'
                        : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-3xl p-2.5 rounded-xl bg-slate-800/80 group-hover:scale-110 transition-transform shrink-0 border border-slate-700/50">
                      {cat.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`font-black text-sm ${isActive ? 'text-amber-400' : 'text-white group-hover:text-red-400 transition-colors'}`}>
                          {cat.label}
                        </h3>
                        {cat.badge > 0 && (
                          <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                            {cat.badge}
                          </span>
                        )}
                        {isActive && (
                          <span className="text-xs text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
                            محدد حالياً
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">
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
