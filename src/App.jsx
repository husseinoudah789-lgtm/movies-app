import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MovieCard from './components/MovieCard';
import CategoryView from './components/CategoryView';
import MediaModal from './components/MediaModal';
import { translations } from './translations';
import { 
  fetchTrending, 
  fetchPopularMovies, 
  fetchPopularTVShows, 
  fetchFamilyContent, 
  fetchTopRated, 
  searchContent 
} from './services/api';

function App() {
  const [appLang, setAppLang] = useState('ar'); // لغة الموقع العامة
  const t = translations[appLang] || translations.ar;

  const [activeTab, setActiveTab] = useState('home');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [trending, setTrending] = useState([]);
  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [family, setFamily] = useState([]);
  const [topRated, setTopRated] = useState([]);
  
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // جلب البيانات باللغة المحددة للموقع
  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      const [trendingData, moviesData, tvData, familyData, topRatedData] = await Promise.all([
        fetchTrending(1, appLang),
        fetchPopularMovies(1, appLang),
        fetchPopularTVShows(1, appLang),
        fetchFamilyContent('movie', 1, appLang),
        fetchTopRated('movie', 1, appLang)
      ]);
      setTrending(trendingData.results || []);
      setMovies(moviesData.results || []);
      setTvShows(tvData.results || []);
      setFamily(familyData.results || []);
      setTopRated(topRatedData.results || []);
      setLoading(false);
    };
    loadHomeData();
  }, [appLang]);

  // البحث باللغة المختارة
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim()) {
        const results = await searchContent(searchQuery, appLang);
        setSearchResults(results.results || []);
      } else {
        setSearchResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, appLang]);

  const homeSections = [
    { id: 'trending', tabTarget: 'home', title: t.sections.trending, icon: '🔥', data: trending, mediaType: null },
    { id: 'movies', tabTarget: 'movies', title: t.sections.movies, icon: '🎬', data: movies, mediaType: 'movie' },
    { id: 'tv', tabTarget: 'tv', title: t.sections.tv, icon: '📺', data: tvShows, mediaType: 'tv' },
    { id: 'family', tabTarget: 'family', title: t.sections.family, icon: '👨‍👩‍👧‍👦', data: family, mediaType: 'movie' },
    { id: 'top_rated', tabTarget: 'top_rated', title: t.sections.topRated, icon: '⭐', data: topRated, mediaType: 'movie' },
  ];

  return (
    <div 
      className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-red-600 selection:text-white transition-all duration-300" 
      dir={t.dir}
    >
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSearch={setSearchQuery} 
        searchQuery={searchQuery}
        appLang={appLang}
        setAppLang={setAppLang}
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
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1"
                      >
                        <span>{t.browseSection}</span>
                        <span>{t.dir === 'rtl' ? '←' : '→'}</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {section.data.slice(0, 6).map((item) => (
                      <MovieCard 
                        key={item.id} 
                        item={{
                          ...item, 
                          media_type: section.mediaType || item.media_type
                        }} 
                        onClick={(selected) => setSelectedMedia(selected)}
                        appLang={appLang}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )
        ) : activeTab === 'movies' ? (
          <CategoryView 
            initialType="movies" 
            title={t.movies} 
            icon="🎬" 
            onSelectMedia={(selected) => setSelectedMedia(selected)}
            appLang={appLang}
          />
        ) : activeTab === 'tv' ? (
          <CategoryView 
            initialType="tv" 
            title={t.tv} 
            icon="📺" 
            onSelectMedia={(selected) => setSelectedMedia(selected)}
            appLang={appLang}
          />
        ) : activeTab === 'family' ? (
          <CategoryView 
            initialType="family" 
            title={t.family} 
            icon="👨‍👩‍👧‍👦" 
            onSelectMedia={(selected) => setSelectedMedia(selected)}
            appLang={appLang}
          />
        ) : activeTab === 'top_rated' ? (
          <CategoryView 
            initialType="top_rated" 
            title={t.topRated} 
            icon="⭐" 
            onSelectMedia={(selected) => setSelectedMedia(selected)}
            appLang={appLang}
          />
        ) : null}
      </main>

      {/* نافذة المشاهدة وعرض التفاصيل التفاعلية */}
      {selectedMedia && (
        <MediaModal 
          media={selectedMedia} 
          onClose={() => setSelectedMedia(null)} 
        />
      )}

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-800 bg-slate-900/80 py-8 text-center text-sm text-gray-500">
        <p>{t.footerText}</p>
      </footer>
    </div>
  );
}

export default App;
