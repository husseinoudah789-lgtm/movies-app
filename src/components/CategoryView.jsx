import React, { useState, useEffect } from 'react';
import MovieCard from './MovieCard';
import { translations } from '../translations';
import { 
  fetchPopularMovies, 
  fetchPopularTVShows, 
  fetchByGenre, 
  fetchFamilyContent, 
  fetchTopRated 
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

export default function CategoryView({ initialType = 'all', title, icon, onSelectMedia, appLang = 'ar' }) {
  const t = translations[appLang] || translations.ar;
  const [mediaFilter, setMediaFilter] = useState(
    initialType === 'movies' ? 'movie' : initialType === 'tv' ? 'tv' : 'all'
  );
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (initialType === 'movies') setMediaFilter('movie');
    else if (initialType === 'tv') setMediaFilter('tv');
    else setMediaFilter('all');
    setSelectedGenre('all');
  }, [initialType]);

  const loadData = async (pageNumber = 1, isAppend = false) => {
    if (pageNumber === 1) setLoading(true);
    else setLoadingMore(true);

    const genreObj = GENRE_CONFIG.find((g) => g.id === selectedGenre);
    let combinedResults = [];

    try {
      if (initialType === 'family') {
        if (mediaFilter === 'all') {
          const [mRes, tRes] = await Promise.all([
            fetchFamilyContent('movie', pageNumber, appLang),
            fetchFamilyContent('tv', pageNumber, appLang),
          ]);
          const mList = (mRes.results || []).map(item => ({ ...item, media_type: 'movie' }));
          const tList = (tRes.results || []).map(item => ({ ...item, media_type: 'tv' }));
          combinedResults = interleave(mList, tList);
        } else {
          const res = await fetchFamilyContent(mediaFilter, pageNumber, appLang);
          combinedResults = (res.results || []).map(item => ({ ...item, media_type: mediaFilter }));
        }
      } else if (initialType === 'top_rated') {
        if (mediaFilter === 'all') {
          const [mRes, tRes] = await Promise.all([
            fetchTopRated('movie', pageNumber, appLang),
            fetchTopRated('tv', pageNumber, appLang),
          ]);
          const mList = (mRes.results || []).map(item => ({ ...item, media_type: 'movie' }));
          const tList = (tRes.results || []).map(item => ({ ...item, media_type: 'tv' }));
          combinedResults = interleave(mList, tList);
        } else {
          const res = await fetchTopRated(mediaFilter, pageNumber, appLang);
          combinedResults = (res.results || []).map(item => ({ ...item, media_type: mediaFilter }));
        }
      } else {
        if (selectedGenre === 'all') {
          if (mediaFilter === 'all') {
            const [mRes, tRes] = await Promise.all([
              fetchPopularMovies(pageNumber, appLang),
              fetchPopularTVShows(pageNumber, appLang),
            ]);
            const mList = (mRes.results || []).map(item => ({ ...item, media_type: 'movie' }));
            const tList = (tRes.results || []).map(item => ({ ...item, media_type: 'tv' }));
            combinedResults = interleave(mList, tList);
          } else if (mediaFilter === 'movie') {
            const res = await fetchPopularMovies(pageNumber, appLang);
            combinedResults = (res.results || []).map(item => ({ ...item, media_type: 'movie' }));
          } else {
            const res = await fetchPopularTVShows(pageNumber, appLang);
            combinedResults = (res.results || []).map(item => ({ ...item, media_type: 'tv' }));
          }
        } else {
          if (mediaFilter === 'all') {
            const [mRes, tRes] = await Promise.all([
              genreObj.movieGenre ? fetchByGenre('movie', genreObj.movieGenre, pageNumber, appLang) : { results: [] },
              genreObj.tvGenre ? fetchByGenre('tv', genreObj.tvGenre, pageNumber, appLang) : { results: [] },
            ]);
            const mList = (mRes.results || []).map(item => ({ ...item, media_type: 'movie' }));
            const tList = (tRes.results || []).map(item => ({ ...item, media_type: 'tv' }));
            combinedResults = interleave(mList, tList);
          } else if (mediaFilter === 'movie') {
            if (genreObj.movieGenre) {
              const res = await fetchByGenre('movie', genreObj.movieGenre, pageNumber, appLang);
              combinedResults = (res.results || []).map(item => ({ ...item, media_type: 'movie' }));
            }
          } else {
            if (genreObj.tvGenre) {
              const res = await fetchByGenre('tv', genreObj.tvGenre, pageNumber, appLang);
              combinedResults = (res.results || []).map(item => ({ ...item, media_type: 'tv' }));
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }

    if (isAppend) {
      setItems(prev => [...prev, ...combinedResults]);
    } else {
      setItems(combinedResults);
    }

    setLoading(false);
    setLoadingMore(false);
  };

  const interleave = (arr1, arr2) => {
    const result = [];
    const maxLen = Math.max(arr1.length, arr2.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < arr1.length) result.push(arr1[i]);
      if (i < arr2.length) result.push(arr2[i]);
    }
    return result;
  };

  useEffect(() => {
    setPage(1);
    loadData(1, false);
  }, [initialType, mediaFilter, selectedGenre, appLang]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadData(nextPage, true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <span>{icon}</span>
            <span>{title}</span>
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {t.exploreBest} {mediaFilter === 'movie' ? t.movies : mediaFilter === 'tv' ? t.tv : `${t.movies} & ${t.tv}`}
          </p>
        </div>

        {/* أزرار التبديل */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto shadow-inner">
          <button
            onClick={() => setMediaFilter('all')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              mediaFilter === 'all'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.allMedia}
          </button>
          <button
            onClick={() => setMediaFilter('movie')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              mediaFilter === 'movie'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.moviesOnly}
          </button>
          <button
            onClick={() => setMediaFilter('tv')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              mediaFilter === 'tv'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.tvOnly}
          </button>
        </div>
      </div>

      {/* تصنيفات الأنواع */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {GENRE_CONFIG.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGenre(g.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              selectedGenre === g.id
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105'
                : 'bg-slate-900/80 text-gray-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            {t.genres[g.key] || g.id}
          </button>
        ))}
      </div>

      {/* المحتوى */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-72 gap-3">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-red-500"></div>
          <p className="text-gray-400 text-xs animate-pulse">{t.loading}</p>
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {items.map((item, idx) => (
              <MovieCard
                key={`${item.id}-${idx}-${item.media_type}`}
                item={item}
                onClick={onSelectMedia}
                appLang={appLang}
              />
            ))}
          </div>

          <div className="flex justify-center pt-8 pb-12">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="bg-gradient-to-r from-red-600 to-amber-600 hover:opacity-90 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-red-600/30 flex items-center gap-2"
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
        </>
      ) : (
        <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800">
          <span className="text-5xl">🎬</span>
          <p className="text-gray-400 mt-3 text-lg">{t.noResults}</p>
        </div>
      )}
    </div>
  );
}
