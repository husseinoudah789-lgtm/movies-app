import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MovieCard from './components/MovieCard';
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
    { id: 'trending', tabTarget: 'home', title: t.sections.trending, icon: '🔥', data: trending, mediaType: null },
    { id: 'arabic_movies', tabTarget: 'arabic_movies', title: t.sections.arabicMovies, icon: '🇪🇬', data: arabicMovies, mediaType: 'movie' },
    { id: 'arabic_tv', tabTarget: 'arabic_tv', title: t.sections.arabicTV, icon: '📺', data: arabicTV, mediaType: 'tv' },
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
      className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-red-600 selection:text-white transition-all duration-300" 
      dir={t.dir}
    >
      {/* شريط التنقل العلوي */}
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
      />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* حالة البحث */}
        {searchQuery ? (
          <section className="space-y-6">
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>🔍</span>
                <span>{t.searchResultsFor} <span className="text-red-500">"{searchQuery}"</span></span>
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {searchResults.length} {t.foundResults}
              </p>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {searchResults.map(item => (
                  <MovieCard 
                    key={item.id} 
                    item={item} 
                    onClick={(selected) => setSelectedMedia(selected)}
                    appLang={appLang}
                    isFavorite={watchlist.some((w) => w.id === item.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800">
                <span className="text-5xl">🧐</span>
                <p className="text-gray-400 text-lg mt-3">{t.noResults}</p>
              </div>
            )}
          </section>
        ) : activeTab === 'home' ? (
          /* الصفحة الرئيسية */
          loading ? (
            <div className="flex flex-col justify-center items-center h-96 gap-4">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
              <p className="text-gray-400 text-sm animate-pulse">{t.loading}</p>
            </div>
          ) : (
            <div className="space-y-12">
              {homeSections.map((section) => (
                <section key={section.id} className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-900/80 px-5 py-3 rounded-xl border border-slate-800 shadow">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                      <span>{section.icon}</span>
                      <span>{section.title}</span>
                    </h2>
                    {section.tabTarget !== 'home' && (
                      <button
                        onClick={() => {
                          setActiveTab(section.tabTarget);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1"
                      >
                        <span>{t.browseSection}</span>
                        <span>{t.dir === 'rtl' ? '←' : '→'}</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {section.data.slice(0, 6).map((item) => (
                      <MovieCard 
                        key={`${item.id}-${section.id}`} 
                        item={{
                          ...item, 
                          media_type: section.mediaType || item.media_type
                        }} 
                        onClick={(selected) => setSelectedMedia(selected)}
                        appLang={appLang}
                        isFavorite={watchlist.some((w) => w.id === item.id)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )
        ) : (
          /* صفحات الأقسام المخصصة */
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
          />
        )}
      </main>

      {/* نافذة المشاهدة وعرض التفاصيل التفاعلية */}
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

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-800 bg-slate-900/80 py-8 text-center text-sm text-gray-500">
        <p>{t.footerText}</p>
      </footer>
    </div>
  );
}

export default App;
