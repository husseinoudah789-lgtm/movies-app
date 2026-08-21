import React, { useState, useEffect } from 'react';
import MovieCard from './MovieCard';
import { translations } from '../translations';
import { 
  fetchPopularMovies, 
  fetchPopularTVShows, 
  fetchByGenre, 
  fetchFamilyContent, 
  fetchTopRated,
  fetchArabicContent,
  fetchAnimeContent,
  fetchKDramaContent,
  fetchUpcomingMovies,
  fetchActionContent,
  fetchDocumentaries
} from '../services/api';

const GENRE_CONFIG = [
  { id: 'all', key: 'all', movieGenre: null, tvGenre: null },
  { id: 'action', key: 'action', movieGenre: 28, tvGenre: 10759 },
  { id: 'comedy', key: 'comedy', movieGenre: 35, tvGenre: 35 },
  { id: 'drama', key: 'drama', movieGenre: 18, tvGenre: 18 },
  { id: 'horror_crime', key: 'horror_crime', movieGenre: 27, tvGenre: 80 },
  { id: 'scifi', key: 'scifi', movieGenre: 878, tvGenre: 10765 },
  { id: 'animation', key: 'animation', movieGenre: 16, tvGenre: 16 },
  { id: 'mystery', key: 'mystery', movieGenre: 53, tvGenre: 9648 },
  { id: 'family', key: 'family', movieGenre: 10751, tvGenre: 10762 },
];

export default function CategoryView({ 
  initialType = 'all', 
  title, 
  icon, 
  onSelectMedia, 
  appLang = 'ar',
  watchlist = [],
  watchHistory = [],
  onToggleFavorite,
  onClearHistory,
  onClearWatchlist,
  isSafeMode = true
}) {
  const t = translations[appLang] || translations.ar;
  
  // ضبط الفلتر الافتراضي
  const getDefaultMediaFilter = (type) => {
    if (type === 'movies' || type === 'arabic_movies' || type === 'upcoming' || type === 'action' || type === 'family' || type === 'top_rated' || type === 'docs') {
      return 'movie';
    }
    if (type === 'tv' || type === 'arabic_tv' || type === 'anime' || type === 'kdrama') {
      return 'tv';
    }
    return 'all';
  };

  const [mediaFilter, setMediaFilter] = useState(() => getDefaultMediaFilter(initialType));
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const isLocalList = initialType === 'watchlist' || initialType === 'history';

  useEffect(() => {
    setMediaFilter(getDefaultMediaFilter(initialType));
    setSelectedGenre('all');
    setPage(1);
  }, [initialType]);

  useEffect(() => {
    if (isLocalList) {
      const source = initialType === 'watchlist' ? watchlist : watchHistory;
      let filtered = [...source];
      if (mediaFilter === 'movie') {
        filtered = filtered.filter((i) => i.media_type === 'movie' || (!i.media_type && i.title));
      } else if (mediaFilter === 'tv') {
        filtered = filtered.filter((i) => i.media_type === 'tv' || (!i.media_type && i.name));
      }
      setItems(filtered);
      setLoading(false);
      return;
    }

    const loadCategoryData = async () => {
      setLoading(true);
      try {
        let results = [];
        const activeGenreObj = GENRE_CONFIG.find((g) => g.id === selectedGenre);

        if (initialType === 'arabic' || initialType === 'arabic_movies' || initialType === 'arabic_tv') {
          const typeToFetch = initialType === 'arabic_movies' ? 'movie' : initialType === 'arabic_tv' ? 'tv' : mediaFilter === 'all' ? 'movie' : mediaFilter;
          const data = await fetchArabicContent(typeToFetch, 1, appLang);
          results = (data.results || []).map((i) => ({ ...i, media_type: typeToFetch }));

          if (initialType === 'arabic' && mediaFilter === 'all') {
            const tvData = await fetchArabicContent('tv', 1, appLang);
            const tvItems = (tvData.results || []).map((i) => ({ ...i, media_type: 'tv' }));
            results = [...results, ...tvItems];
          }
        } else if (initialType === 'anime') {
          const typeToFetch = mediaFilter === 'movie' ? 'movie' : 'tv';
          const data = await fetchAnimeContent(typeToFetch, 1, appLang);
          results = (data.results || []).map((i) => ({ ...i, media_type: typeToFetch }));
        } else if (initialType === 'kdrama') {
          const typeToFetch = mediaFilter === 'movie' ? 'movie' : 'tv';
          const data = await fetchKDramaContent(typeToFetch, 1, appLang);
          results = (data.results || []).map((i) => ({ ...i, media_type: typeToFetch }));
        } else if (initialType === 'action') {
          const typeToFetch = mediaFilter === 'tv' ? 'tv' : 'movie';
          const data = await fetchActionContent(typeToFetch, 1, appLang);
          results = (data.results || []).map((i) => ({ ...i, media_type: typeToFetch }));
        } else if (initialType === 'upcoming') {
          const data = await fetchUpcomingMovies(1, appLang);
          results = (data.results || []).map((i) => ({ ...i, media_type: 'movie' }));
        } else if (initialType === 'family') {
          const typeToFetch = mediaFilter === 'tv' ? 'tv' : 'movie';
          const data = await fetchFamilyContent(typeToFetch, 1, appLang);
          results = (data.results || []).map((i) => ({ ...i, media_type: typeToFetch }));
        } else if (initialType === 'top_rated') {
          const typeToFetch = mediaFilter === 'tv' ? 'tv' : 'movie';
          const data = await fetchTopRated(typeToFetch, 1, appLang);
          results = (data.results || []).map((i) => ({ ...i, media_type: typeToFetch }));
        } else if (initialType === 'docs') {
          const typeToFetch = mediaFilter === 'tv' ? 'tv' : 'movie';
          const data = await fetchDocumentaries(typeToFetch, 1, appLang);
          results = (data.results || []).map((i) => ({ ...i, media_type: typeToFetch }));
        } else if (selectedGenre !== 'all' && activeGenreObj) {
          if (mediaFilter === 'movie' || mediaFilter === 'all') {
            const data = await fetchByGenre('movie', activeGenreObj.movieGenre, 1, appLang);
            results = (data.results || []).map((i) => ({ ...i, media_type: 'movie' }));
          } else if (mediaFilter === 'tv') {
            const data = await fetchByGenre('tv', activeGenreObj.tvGenre, 1, appLang);
            results = (data.results || []).map((i) => ({ ...i, media_type: 'tv' }));
          }
        } else if (mediaFilter === 'movie' || initialType === 'movies') {
          const data = await fetchPopularMovies(1, appLang);
          results = (data.results || []).map((i) => ({ ...i, media_type: 'movie' }));
        } else if (mediaFilter === 'tv' || initialType === 'tv') {
          const data = await fetchPopularTVShows(1, appLang);
          results = (data.results || []).map((i) => ({ ...i, media_type: 'tv' }));
        } else {
          const [m, tData] = await Promise.all([
            fetchPopularMovies(1, appLang),
            fetchPopularTVShows(1, appLang),
          ]);
          const mList = (m.results || []).map((i) => ({ ...i, media_type: 'movie' }));
          const tList = (tData.results || []).map((i) => ({ ...i, media_type: 'tv' }));
          results = [...mList, ...tList];
        }

        setItems(results);
      } catch (err) {
        console.error('Error loading category data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryData();
  }, [initialType, mediaFilter, selectedGenre, page, isLocalList, appLang, watchlist, watchHistory]);

  const handleLoadMore = async () => {
    if (isLocalList) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      let nextResults = [];
      const activeGenreObj = GENRE_CONFIG.find((g) => g.id === selectedGenre);

      if (initialType.startsWith('arabic')) {
        const typeToFetch = initialType === 'arabic_movies' ? 'movie' : initialType === 'arabic_tv' ? 'tv' : mediaFilter === 'all' ? 'movie' : mediaFilter;
        const data = await fetchArabicContent(typeToFetch, nextPage, appLang);
        nextResults = (data.results || []).map((i) => ({ ...i, media_type: typeToFetch }));
      } else if (initialType === 'anime') {
        const typeToFetch = mediaFilter === 'movie' ? 'movie' : 'tv';
        const data = await fetchAnimeContent(typeToFetch, nextPage, appLang);
        nextResults = (data.results || []).map((i) => ({ ...i, media_type: typeToFetch }));
      } else if (initialType === 'kdrama') {
        const typeToFetch = mediaFilter === 'movie' ? 'movie' : 'tv';
        const data = await fetchKDramaContent(typeToFetch, nextPage, appLang);
        nextResults = (data.results || []).map((i) => ({ ...i, media_type: typeToFetch }));
      } else if (initialType === 'action') {
        const typeToFetch = mediaFilter === 'tv' ? 'tv' : 'movie';
        const data = await fetchActionContent(typeToFetch, nextPage, appLang);
        nextResults = (data.results || []).map((i) => ({ ...i, media_type: typeToFetch }));
      } else if (initialType === 'upcoming') {
        const data = await fetchUpcomingMovies(nextPage, appLang);
        nextResults = (data.results || []).map((i) => ({ ...i, media_type: 'movie' }));
      } else if (initialType === 'family') {
        const typeToFetch = mediaFilter === 'tv' ? 'tv' : 'movie';
        const data = await fetchFamilyContent(typeToFetch, nextPage, appLang);
        nextResults = (data.results || []).map((i) => ({ ...i, media_type: typeToFetch }));
      } else if (initialType === 'top_rated') {
        const typeToFetch = mediaFilter === 'tv' ? 'tv' : 'movie';
        const data = await fetchTopRated(typeToFetch, nextPage, appLang);
        nextResults = (data.results || []).map((i) => ({ ...i, media_type: typeToFetch }));
      } else if (initialType === 'docs') {
        const typeToFetch = mediaFilter === 'tv' ? 'tv' : 'movie';
        const data = await fetchDocumentaries(typeToFetch, nextPage, appLang);
        nextResults = (data.results || []).map((i) => ({ ...i, media_type: typeToFetch }));
      } else if (selectedGenre !== 'all' && activeGenreObj) {
        if (mediaFilter === 'movie' || mediaFilter === 'all') {
          const data = await fetchByGenre('movie', activeGenreObj.movieGenre, nextPage, appLang);
          nextResults = (data.results || []).map((i) => ({ ...i, media_type: 'movie' }));
        } else if (mediaFilter === 'tv') {
          const data = await fetchByGenre('tv', activeGenreObj.tvGenre, nextPage, appLang);
          nextResults = (data.results || []).map((i) => ({ ...i, media_type: 'tv' }));
        }
      } else if (mediaFilter === 'movie' || initialType === 'movies') {
        const data = await fetchPopularMovies(nextPage, appLang);
        nextResults = (data.results || []).map((i) => ({ ...i, media_type: 'movie' }));
      } else if (mediaFilter === 'tv' || initialType === 'tv') {
        const data = await fetchPopularTVShows(nextPage, appLang);
        nextResults = (data.results || []).map((i) => ({ ...i, media_type: 'tv' }));
      }

      setItems((prev) => [...prev, ...nextResults]);
      setPage(nextPage);
    } catch (err) {
      console.error('Error loading more:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f111a]/80 p-6 rounded-2xl border border-orange-500/20 shadow-xl">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <span>{icon}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-white">{title}</span>
          </h2>
          <p className="text-gray-300 text-sm mt-1">
            {initialType === 'history' 
              ? `${t.lastWatched} (${items.length})` 
              : initialType === 'watchlist'
              ? `${t.watchlist} (${items.length})`
              : `${t.exploreBest} ${mediaFilter === 'movie' ? t.movies : mediaFilter === 'tv' ? t.tv : `${t.movies} & ${t.tv}`}`}
          </p>
        </div>

        {/* أزرار التبديل */}
        {!isLocalList && initialType !== 'upcoming' && (
          <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-orange-500/30 self-start md:self-auto shadow-inner">
            <button
              onClick={() => setMediaFilter('all')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                mediaFilter === 'all'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md font-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.allMedia}
            </button>
            <button
              onClick={() => setMediaFilter('movie')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                mediaFilter === 'movie'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md font-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {initialType.startsWith('arabic') ? t.arabicMovies : t.moviesOnly}
            </button>
            <button
              onClick={() => setMediaFilter('tv')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                mediaFilter === 'tv'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md font-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {initialType.startsWith('arabic') ? t.arabicTV : t.tvOnly}
            </button>
          </div>
        )}

        {/* زر إفراغ السجل أو المفضلة */}
        {initialType === 'history' && items.length > 0 && (
          <button
            onClick={onClearHistory}
            className="bg-slate-800 hover:bg-orange-600/20 text-gray-300 hover:text-orange-400 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all"
          >
            🗑️ {t.clearHistory}
          </button>
        )}
        {initialType === 'watchlist' && items.length > 0 && (
          <button
            onClick={onClearWatchlist}
            className="bg-slate-800 hover:bg-orange-600/20 text-gray-300 hover:text-orange-400 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all"
          >
            💔 {t.clearWatchlist}
          </button>
        )}
      </div>

      {/* شريط التصنيفات */}
      {!isLocalList && !initialType.startsWith('arabic') && initialType !== 'anime' && initialType !== 'kdrama' && initialType !== 'action' && initialType !== 'upcoming' && initialType !== 'family' && initialType !== 'top_rated' && initialType !== 'docs' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {GENRE_CONFIG.map((genre) => (
            <button
              key={genre.id}
              onClick={() => {
                setSelectedGenre(genre.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedGenre === genre.id
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-600/30'
                  : 'bg-[#0f111a] text-gray-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{t.genres[genre.key]}</span>
            </button>
          ))}
        </div>
      )}

      {/* المحتوى */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-72 gap-3">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-orange-500"></div>
          <p className="text-gray-400 text-xs animate-pulse">{t.loading}</p>
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {items.map((item, idx) => (
              <MovieCard
                key={`${item.id}-${idx}-${item.media_type || 'media'}`}
                item={item}
                onClick={onSelectMedia}
                appLang={appLang}
                isFavorite={watchlist.some((w) => w.id === item.id)}
                onToggleFavorite={onToggleFavorite}
                isSafeMode={isSafeMode}
              />
            ))}
          </div>

          {!isLocalList && (
            <div className="flex justify-center pt-8 pb-12">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-gradient-to-r from-orange-600 to-amber-500 hover:opacity-90 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-orange-600/30 flex items-center gap-2 active:scale-95"
              >
                {loadingMore ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                    <span>{t.loadingMore}</span>
                  </>
                ) : (
                  <>
                    <span>{t.loadMore}</span>
                    <span>⬇️</span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-24 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
          <span className="text-6xl inline-block animate-bounce">{icon}</span>
          <p className="text-gray-400 mt-2 text-base">
            {initialType === 'watchlist' 
              ? t.emptyWatchlist 
              : initialType === 'history' 
              ? t.emptyHistory 
              : t.noResults}
          </p>
        </div>
      )}
    </div>
  );
}
