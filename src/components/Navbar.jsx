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

  // القائمة الرئيسية في الهيدر (أنيقة ومنظمة)
  const primaryTabs = [
    { id: 'home', label: t.home, icon: '🏠' },
    { id: 'arabic', label: t.arabic, icon: '🇪🇬' },
    { id: 'movies', label: t.movies, icon: '🎬' },
    { id: 'tv', label: t.tv, icon: '📺' },
    { id: 'anime', label: t.anime, icon: '🎌' },
    { id: 'kdrama', label: t.kdrama, icon: '🎎' },
  ];

  // جميع الأقسام مع الأيقونات والأوصاف لنافذة التصنيفات الشاملة
  const allCategories = [
    { id: 'home', label: t.home, icon: '🏠', desc: 'الصفحة الرئيسية وموجز العروض الرائجة' },
    { id: 'arabic', label: t.arabic, icon: '🇪🇬', desc: 'أقوى الأفلام والمسلسلات والدراما العربية' },
    { id: 'movies', label: t.movies, icon: '🎬', desc: 'أحدث الأفلام العالمية والسينمائية' },
    { id: 'tv', label: t.tv, icon: '📺', desc: 'أفضل المسلسلات التلفزيونية العالمية' },
    { id: 'anime', label: t.anime, icon: '🎌', desc: 'عالم الأنمي والرسوم المتحركة اليابانية' },
    { id: 'kdrama', label: t.kdrama, icon: '🎎', desc: 'الدراما والمسلسلات الكورية والآسيوية' },
    { id: 'action', label: t.action, icon: '💥', desc: 'أقوى أفلام ومسلسلات الحركة والإثارة' },
    { id: 'upcoming', label: t.upcoming, icon: '🍿', desc: 'أحدث الأفلام في دور العرض وقريباً' },
    { id: 'top_rated', label: t.topRated, icon: '⭐', desc: 'الأعمال الفنية الأعلى تقييماً ونقداً' },
    { id: 'family', label: t.family, icon: '👨‍👩‍👧‍👦', desc: 'محتوى آمن وممتع للعائلة والأطفال' },
    { id: 'docs', label: t.docs, icon: '🌍', desc: 'روائع الأفلام الوثائقية واستكشاف الطبيعة' },
    { id: 'history', label: t.history, icon: '⏱️', badge: historyCount, desc: 'استكمل مشاهدة أعمالك وحلقاتك السابقة' },
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
      <nav className="bg-slate-950/90 backdrop-blur-2xl sticky top-0 z-40 border-b border-slate-800/80 shadow-2xl transition-all">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            
            {/* الشعار وروابط التنقل الرئيسية (Netflix/Shahid Style) */}
            <div className="flex items-center gap-6 lg:gap-8">
              {/* الشعار */}
              <div 
                className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
                onClick={() => handleSelectCategory('home')}
              >
                <span className="text-3xl filter drop-shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">🍿</span>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-amber-400 tracking-tight leading-none">
                    {t.appName}
                  </h1>
                  <p className="text-[10px] text-gray-400 font-bold hidden sm:block mt-0.5">{t.appTagline}</p>
                </div>
              </div>

              {/* روابط الأقسام الرئيسية (سطح المكتب) */}
              <div className="hidden lg:flex items-center gap-1.5">
                {primaryTabs.map((tab) => {
                  const isActive = activeTab === tab.id && !searchQuery;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleSelectCategory(tab.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 relative ${
                        isActive
                          ? 'bg-red-600 text-white font-black shadow-lg shadow-red-600/40 scale-105'
                          : 'text-gray-300 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <span className="text-sm">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}

                {/* زر تصفح جميع الأقسام */}
                <button
                  onClick={() => setCategoriesModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-black text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center gap-1.5 shadow-sm ml-1"
                  title="عرض جميع الأقسام"
                >
                  <span>✨</span>
                  <span>{t.moreSections}</span>
                </button>
              </div>
            </div>

            {/* الأدوات الجانبية: البحث + المفضلة + اللغة + الملف الشخصي */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              
              {/* مربع البحث الحديث */}
              <div className="relative w-36 sm:w-52 md:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-8 pr-9 py-2 rounded-full bg-slate-900/90 border border-slate-800 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-xs shadow-inner"
                  onChange={(e) => onSearch(e.target.value)}
                />
                <span className="absolute right-3 top-2.5 text-gray-500 text-xs">🔍</span>
                {searchQuery && (
                  <button
                    onClick={() => onSearch('')}
                    className="absolute left-2.5 top-2.5 text-gray-400 hover:text-white text-xs bg-slate-800 rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* زر المفضلة الدائري الأنيق */}
              <button
                onClick={() => handleSelectCategory('watchlist')}
                className={`relative p-2 rounded-full border transition-all shadow-md ${
                  activeTab === 'watchlist' && !searchQuery
                    ? 'bg-red-600 border-red-500 text-white shadow-red-600/40'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-gray-300 border-slate-800 hover:text-white'
                }`}
                title={t.watchlist}
              >
                <span className="text-sm block">❤️</span>
                {watchlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow">
                    {watchlistCount}
                  </span>
                )}
              </button>

              {/* اختيار اللغة */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="bg-slate-900/90 hover:bg-slate-800 text-white px-2.5 py-1.5 rounded-full border border-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                >
                  <span>{currentLang.flag}</span>
                  <span className="hidden md:inline">{currentLang.name}</span>
                  <span className="text-[8px] text-gray-400">▼</span>
                </button>

                {langMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setLangMenuOpen(false)}></div>
                    <div className="absolute top-full mt-2 left-0 lg:left-auto lg:right-0 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1.5 z-40 w-40 overflow-hidden animate-fadeIn">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setAppLang(lang.code);
                            setLangMenuOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 text-xs font-bold flex items-center gap-2 transition-colors ${
                            appLang === lang.code
                              ? 'bg-red-600 text-white font-black'
                              : 'text-gray-300 hover:bg-slate-800 hover:text-white'
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
                    className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:opacity-95 text-white p-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-black flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all active:scale-95"
                  >
                    <span className="w-6 h-6 rounded-full bg-slate-950/40 flex items-center justify-center text-xs">
                      {currentUser.avatar || '🍿'}
                    </span>
                    <span className="hidden sm:inline max-w-[75px] truncate">{currentUser.name}</span>
                    <span className="text-[8px]">▼</span>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)}></div>
                      <div className="absolute top-full mt-2 left-0 lg:left-auto lg:right-0 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-40 w-52 animate-fadeIn space-y-1">
                        <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
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
                          <span>{t.profile}</span>
                        </button>

                        <button
                          onClick={() => {
                            handleSelectCategory('watchlist');
                            setUserMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-xs font-bold text-gray-300 hover:bg-slate-800 hover:text-white rounded-xl flex items-center justify-between transition-colors"
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
                            handleSelectCategory('history');
                            setUserMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-xs font-bold text-gray-300 hover:bg-slate-800 hover:text-white rounded-xl flex items-center justify-between transition-colors"
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
                          className="w-full px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-600/20 rounded-xl flex items-center gap-2 transition-colors border-t border-slate-800/80 mt-1"
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
                  className="bg-gradient-to-r from-red-600 to-amber-600 hover:opacity-95 text-white px-4 py-2 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all active:scale-95"
                >
                  <span>👤</span>
                  <span>{t.login}</span>
                </button>
              )}

            </div>
          </div>

          {/* شريط الأقسام السريع للهواتف والأجهزة اللوحية (Mobile / Tablet Sub-bar) */}
          <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto pt-2.5 pb-0.5 scrollbar-none">
            {primaryTabs.map((tab) => {
              const isActive = activeTab === tab.id && !searchQuery;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 flex items-center gap-1 ${
                    isActive
                      ? 'bg-red-600 text-white font-black shadow-md shadow-red-600/40 scale-105'
                      : 'bg-slate-900/90 text-gray-300 border border-slate-800/80 hover:text-white'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => setCategoriesModalOpen(true)}
              className="px-3 py-1.5 rounded-full text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              <span>✨</span>
              <span>{t.moreSections}</span>
            </button>
          </div>

        </div>
      </nav>

      {/* نافذة استعراض جميع الأقسام والتصنيفات الشاملة */}
      {categoriesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
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
              <span className="text-4xl mb-2 inline-block animate-bounce">✨</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {t.moreSections} والتصنيفات
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                اختر القسم الذي ترغب بتصفحه واستمتع بأفضل العروض الحصرية
              </p>
            </div>

            {/* شبكة الأقسام والتصنيفات */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {allCategories.map((cat) => {
                const isActive = activeTab === cat.id && !searchQuery;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3.5 group relative overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-r from-red-600/30 to-amber-600/30 border-red-500 shadow-xl shadow-red-600/20'
                        : 'bg-slate-950/80 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700'
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
