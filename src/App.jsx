import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSpotlight from './components/HeroSpotlight';
import MovieCard from './components/MovieCard';
import SectionRow from './components/SectionRow';
import CategoryView from './components/CategoryView';
import MediaModal from './components/MediaModal';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import { translations } from './translations';
import { 
  fetchTrending, 
  fetchPopularMovies, 
  fetchPopularTVShows, 
  fetchFamilyContent, 
  fetchTopRated, 
  fetchArabicContent,
  fetchAnimeContent,
  fetchKDramaContent,
  fetchUpcomingMovies,
  fetchActionContent,
  fetchDocumentaries,
  searchContent 
} from './services/api';

function App() {
  const [appLang, setAppLang] = useState('ar');
  const t = translations[appLang] || translations.ar;

  // حالة المستخدم والمصادقة والملف الشخصي
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // قوائم المفضلة وسجل المشاهدات
  const [watchlist, setWatchlist] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);

  // وضع المشاهدة العائلية النظيفة (حذف وتخطي المشاهد غير اللائقة الشامل)
  const [isSafeMode, setIsSafeMode] = useState(() => {
    const saved = localStorage.getItem('cinema_plus_safe_mode');
    return saved !== null ? saved === 'true' : true;
  });

  const [activeTab, setActiveTab] = useState('home');
  const [selectedMedia, setSelectedMedia] = useState(null);

  // بيانات الأقسام الرئيسية
  const [trending, setTrending] = useState([]);
  const [arabicMovies, setArabicMovies] = useState([]);
  const [arabicTV, setArabicTV] = useState([]);
  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [anime, setAnime] = useState([]);
  const [kdrama, setKdrama] = useState([]);
  const [actionMedia, setActionMedia] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [family, setFamily] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [documentaries, setDocumentaries] = useState([]);
  
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // تبديل وضع المشاهدة العائلية النظيفة
  const handleToggleSafeMode = () => {
    setIsSafeMode((prev) => {
      const next = !prev;
      localStorage.setItem('cinema_plus_safe_mode', String(next));
      return next;
    });
  };

  // استعادة جلسة المستخدم والمفضلة وسجل المشاهدات عند بدء التطبيق
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('cinema_plus_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        
        const savedWatchlist = localStorage.getItem(`cinema_plus_watchlist_${parsed.id}`);
        if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));

        const savedHistory = localStorage.getItem(`cinema_plus_history_${parsed.id}`);
        if (savedHistory) setWatchHistory(JSON.parse(savedHistory));
      } else {
        const guestWatchlist = localStorage.getItem('cinema_plus_watchlist_guest');
        if (guestWatchlist) setWatchlist(JSON.parse(guestWatchlist));

        const guestHistory = localStorage.getItem('cinema_plus_history_guest');
        if (guestHistory) setWatchHistory(JSON.parse(guestHistory));
      }
    } catch (e) {
      console.error('Error loading stored session:', e);
    }
  }, []);

  // جلب البيانات لجميع الأقسام باللغة المحددة
  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        const [
          trendingData, 
          arabicMoviesData,
          arabicTVData,
          moviesData, 
          tvData, 
          animeData,
          kdramaData,
          actionData,
          upcomingData,
          familyData, 
          topRatedData,
          docsData
        ] = await Promise.all([
          fetchTrending(1, appLang),
          fetchArabicContent('movie', 1, appLang),
          fetchArabicContent('tv', 1, appLang),
          fetchPopularMovies(1, appLang),
          fetchPopularTVShows(1, appLang),
          fetchAnimeContent('tv', 1, appLang),
          fetchKDramaContent('tv', 1, appLang),
          fetchActionContent('movie', 1, appLang),
          fetchUpcomingMovies(1, appLang),
          fetchFamilyContent('movie', 1, appLang),
          fetchTopRated('movie', 1, appLang),
          fetchDocumentaries('movie', 1, appLang)
        ]);

        setTrending(trendingData.results || []);
        setArabicMovies(arabicMoviesData.results || []);
        setArabicTV(arabicTVData.results || []);
        setMovies(moviesData.results || []);
        setTvShows(tvData.results || []);
        setAnime(animeData.results || []);
        setKdrama(kdramaData.results || []);
        setActionMedia(actionData.results || []);
        setUpcoming(upcomingData.results || []);
        setFamily(familyData.results || []);
        setTopRated(topRatedData.results || []);
        setDocumentaries(docsData.results || []);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, [appLang]);

  // البحث التلقائي
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim()) {
        const results = await searchContent(searchQuery, appLang);
        setSearchResults(results.results || []);
      } else {
        setSearchResults([]);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, appLang]);

  // تسجيل الدخول الناجح
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    const savedWatchlist = localStorage.getItem(`cinema_plus_watchlist_${user.id}`);
    if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));

    const savedHistory = localStorage.getItem(`cinema_plus_history_${user.id}`);
    if (savedHistory) setWatchHistory(JSON.parse(savedHistory));
  };

  // تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem('cinema_plus_current_user');
    setCurrentUser(null);
    const guestWatchlist = localStorage.getItem('cinema_plus_watchlist_guest');
    setWatchlist(guestWatchlist ? JSON.parse(guestWatchlist) : []);
    const guestHistory = localStorage.getItem('cinema_plus_history_guest');
    setWatchHistory(guestHistory ? JSON.parse(guestHistory) : []);
    if (activeTab === 'watchlist' || activeTab === 'history') setActiveTab('home');
  };

  // تحديث بيانات المستخدم
  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  // إضافة أو إزالة عمل من المفضلة
  const handleToggleFavorite = (media) => {
    const exists = watchlist.some((w) => w.id === media.id);
    let updated;
    if (exists) {
      updated = watchlist.filter((w) => w.id !== media.id);
    } else {
      updated = [media, ...watchlist];
    }
    setWatchlist(updated);

    const storageKey = currentUser
      ? `cinema_plus_watchlist_${currentUser.id}`
      : 'cinema_plus_watchlist_guest';
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  // تفريغ المفضلة
  const handleClearWatchlist = () => {
    setWatchlist([]);
    const storageKey = currentUser
      ? `cinema_plus_watchlist_${currentUser.id}`
      : 'cinema_plus_watchlist_guest';
    localStorage.removeItem(storageKey);
  };

  // إضافة عمل إلى سجل المشاهدات تلقائياً
  const handleAddToHistory = (item) => {
    const filtered = watchHistory.filter((h) => h.id !== item.id);
    const updated = [item, ...filtered].slice(0, 30);
    setWatchHistory(updated);

    const storageKey = currentUser
      ? `cinema_plus_history_${currentUser.id}`
      : 'cinema_plus_history_guest';
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  // تفريغ سجل المشاهدات
  const handleClearHistory = () => {
    setWatchHistory([]);
    const storageKey = currentUser
      ? `cinema_plus_history_${currentUser.id}`
      : 'cinema_plus_history_guest';
    localStorage.removeItem(storageKey);
  };

  const handleBrowseSection = (tabTarget) => {
    setActiveTab(tabTarget);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // أقسام الصفحة الرئيسية
  const homeSections = [
    ...(watchHistory.length > 0 ? [{
      id: 'history',
      tabTarget: 'history',
      title: t.sections.continueWatching,
      icon: '⏱️',
      data: watchHistory,
      mediaType: null
    }] : []),
    { id: 'arabic_movies', tabTarget: 'arabic_movies', title: t.sections.arabicMovies, icon: '🇪🇬', data: arabicMovies, mediaType: 'movie' },
    { id: 'arabic_tv', tabTarget: 'arabic_tv', title: t.sections.arabicTV, icon: '📺', data: arabicTV, mediaType: 'tv' },
    { id: 'trending', tabTarget: 'home', title: t.sections.trending, icon: '🔥', data: trending, mediaType: null },
    { id: 'movies', tabTarget: 'movies', title: t.sections.movies, icon: '🎬', data: movies, mediaType: 'movie' },
    { id: 'tv', tabTarget: 'tv', title: t.sections.tv, icon: '📺', data: tvShows, mediaType: 'tv' },
    { id: 'anime', tabTarget: 'anime', title: t.sections.anime, icon: '🎌', data: anime, mediaType: 'tv' },
    { id: 'kdrama', tabTarget: 'kdrama', title: t.sections.kdrama, icon: '🎎', data: kdrama, mediaType: 'tv' },
    { id: 'action', tabTarget: 'action', title: t.sections.action, icon: '💥', data: actionMedia, mediaType: 'movie' },
    { id: 'upcoming', tabTarget: 'upcoming', title: t.sections.upcoming, icon: '🍿', data: upcoming, mediaType: 'movie' },
    { id: 'top_rated', tabTarget: 'top_rated', title: t.sections.topRated, icon: '⭐', data: topRated, mediaType: 'movie' },
    { id: 'family', tabTarget: 'family', title: t.sections.family, icon: '👨‍👩‍👧‍👦', data: family, mediaType: 'movie' },
    { id: 'docs', tabTarget: 'docs', title: t.sections.docs, icon: '🌍', data: documentaries, mediaType: 'movie' },
  ];

  return (
    <div 
      className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-red-600 selection:text-white transition-all duration-300 relative overflow-x-hidden" 
      dir={t.dir}
    >
      {/* خلفيات التوهج المحيطي */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full filter blur-[140px] pointer-events-none -z-10"></div>
      <div className="fixed top-1/3 right-10 w-96 h-96 bg-amber-500/10 rounded-full filter blur-[140px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-10 left-10 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-[160px] pointer-events-none -z-10"></div>

      {/* شريط التنقل العلوي مع أداة المشاهدة النظيفة لجميع الأعمال */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSearch={setSearchQuery} 
        searchQuery={searchQuery}
        appLang={appLang}
        setAppLang={setAppLang}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        watchlistCount={watchlist.length}
        historyCount={watchHistory.length}
        isSafeMode={isSafeMode}
        onToggleSafeMode={handleToggleSafeMode}
      />
      
      <main className="container mx-auto px-4 sm:px-6 py-5 max-w-7xl relative z-10">
        {/* حالة البحث */}
        {searchQuery ? (
          <section className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
              <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                <span className="text-3xl">🔍</span>
                <span>{t.searchResultsFor} <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-400">"{searchQuery}"</span></span>
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1.5 font-medium">
                {searchResults.length} {t.foundResults}
              </p>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
                {searchResults.map(item => (
                  <MovieCard 
                    key={item.id} 
                    item={item} 
                    onClick={(selected) => setSelectedMedia(selected)}
                    appLang={appLang}
                    isFavorite={watchlist.some((w) => w.id === item.id)}
                    onToggleFavorite={handleToggleFavorite}
                    isSafeMode={isSafeMode}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800/80 space-y-3">
                <span className="text-6xl inline-block animate-bounce">🧐</span>
                <p className="text-gray-400 text-lg font-bold">{t.noResults}</p>
              </div>
            )}
          </section>
        ) : activeTab === 'home' ? (
          /* الصفحة الرئيسية */
          loading ? (
            <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-red-500 animate-spin"></div>
                <span className="absolute inset-0 flex items-center justify-center text-2xl">🍿</span>
              </div>
              <p className="text-gray-400 text-sm font-bold animate-pulse">{t.loading}</p>
            </div>
          ) : (
            <div className="space-y-10 animate-fadeIn">
              {/* بانر البطل السينمائي الرئيسي */}
              <HeroSpotlight 
                items={trending.length > 0 ? trending : movies} 
                onSelectMedia={(selected) => setSelectedMedia(selected)}
                appLang={appLang}
                watchlist={watchlist}
                onToggleFavorite={handleToggleFavorite}
              />

              {/* شريط التصنيفات السريع في الصفحة الرئيسية */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {homeSections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => {
                      const el = document.getElementById(`section-${sec.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap bg-slate-900/80 hover:bg-slate-800 text-gray-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-1.5 shrink-0 shadow"
                  >
                    <span>{sec.icon}</span>
                    <span className="whitespace-nowrap">{sec.title.split(' ')[0]} {sec.title.split(' ')[1] || ''}</span>
                  </button>
                ))}
              </div>

              {/* صفوف الأقسام بتمرير أفقي سلس */}
              <div className="space-y-10">
                {homeSections.map((section) => (
                  <SectionRow
                    key={section.id}
                    id={section.id}
                    title={section.title}
                    icon={section.icon}
                    data={section.data}
                    mediaType={section.mediaType}
                    tabTarget={section.tabTarget}
                    onSelectMedia={(selected) => setSelectedMedia(selected)}
                    onBrowseAll={handleBrowseSection}
                    appLang={appLang}
                    watchlist={watchlist}
                    onToggleFavorite={handleToggleFavorite}
                    isSafeMode={isSafeMode}
                  />
                ))}
              </div>
            </div>
          )
        ) : (
          /* صفحات الأقسام المخصصة */
          <div className="animate-fadeIn">
            <CategoryView 
              initialType={activeTab} 
              title={
                activeTab === 'arabic' ? t.arabic :
                activeTab === 'arabic_movies' ? t.arabicMovies :
                activeTab === 'arabic_tv' ? t.arabicTV :
                activeTab === 'movies' ? t.movies :
                activeTab === 'tv' ? t.tv :
                activeTab === 'anime' ? t.anime :
                activeTab === 'kdrama' ? t.kdrama :
                activeTab === 'action' ? t.action :
                activeTab === 'upcoming' ? t.upcoming :
                activeTab === 'top_rated' ? t.topRated :
                activeTab === 'family' ? t.family :
                activeTab === 'docs' ? t.docs :
                activeTab === 'watchlist' ? t.watchlist :
                activeTab === 'history' ? t.history :
                t.appName
              } 
              icon={
                activeTab === 'arabic' || activeTab === 'arabic_movies' ? '🇪🇬' :
                activeTab === 'arabic_tv' ? '📺' :
                activeTab === 'movies' ? '🎬' :
                activeTab === 'tv' ? '📺' :
                activeTab === 'anime' ? '🎌' :
                activeTab === 'kdrama' ? '🎎' :
                activeTab === 'action' ? '💥' :
                activeTab === 'upcoming' ? '🍿' :
                activeTab === 'top_rated' ? '⭐' :
                activeTab === 'family' ? '👨‍👩‍👧‍👦' :
                activeTab === 'docs' ? '🌍' :
                activeTab === 'watchlist' ? '❤️' :
                activeTab === 'history' ? '⏱️' :
                '🍿'
              } 
              onSelectMedia={(selected) => setSelectedMedia(selected)}
              appLang={appLang}
              watchlist={watchlist}
              watchHistory={watchHistory}
              onToggleFavorite={handleToggleFavorite}
              onClearHistory={handleClearHistory}
              onClearWatchlist={handleClearWatchlist}
              isSafeMode={isSafeMode}
            />
          </div>
        )}
      </main>

      {/* نافذة المشاهدة وعرض التفاصيل التفاعلية مع أداة المشاهدة النظيفة */}
      {selectedMedia && (
        <MediaModal 
          media={selectedMedia} 
          onClose={() => setSelectedMedia(null)} 
          appLang={appLang}
          isFavorite={watchlist.some((w) => w.id === selectedMedia.id)}
          onToggleFavorite={handleToggleFavorite}
          onAddToHistory={handleAddToHistory}
        />
      )}

      {/* نافذة تسجيل الدخول وإنشاء الحساب */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        appLang={appLang}
      />

      {/* نافذة الملف الشخصي للمستخدم */}
      <UserProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
        watchlistCount={watchlist.length}
        historyCount={watchHistory.length}
        onClearHistory={handleClearHistory}
        onClearWatchlist={handleClearWatchlist}
        appLang={appLang}
      />

      {/* Footer الفاخر */}
      <footer className="mt-24 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl py-10 text-center text-xs sm:text-sm text-gray-500 relative">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍿</span>
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-400 text-base">
              {t.appName}
            </span>
          </div>
          <p className="text-gray-400">{t.footerText}</p>
          <div className="flex items-center gap-4 text-gray-400 text-xs">
            <span>🛡️ أداة حذف المشاهد غير اللائقة مفعلة لجميع الأعمال</span>
            <span>•</span>
            <span>4K Ultra HD</span>
            <span>•</span>
            <span>2026 VIP</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
