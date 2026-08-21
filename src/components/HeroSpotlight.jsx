import React, { useState, useEffect } from 'react';
import { translations } from '../translations';

export default function HeroSpotlight({ 
  items = [], 
  onSelectMedia, 
  appLang = 'ar',
  watchlist = [],
  onToggleFavorite 
}) {
  const t = translations[appLang] || translations.ar;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const featuredItems = items.filter(item => item.backdrop_path || item.poster_path).slice(0, 6);

  useEffect(() => {
    if (featuredItems.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [featuredItems.length, isPaused]);

  if (!featuredItems.length) return null;

  const currentItem = featuredItems[currentIndex] || featuredItems[0];
  const isTV = currentItem.media_type === 'tv' || (!currentItem.title && !!currentItem.name);
  const title = currentItem.title || currentItem.name;
  const releaseDate = currentItem.release_date || currentItem.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '2026';
  const isFavorite = watchlist.some((w) => w.id === currentItem.id);

  const backdropUrl = currentItem.backdrop_path
    ? `https://image.tmdb.org/t/p/original${currentItem.backdrop_path}`
    : currentItem.poster_path
    ? `https://image.tmdb.org/t/p/original${currentItem.poster_path}`
    : '';

  return (
    <div 
      className="relative w-full rounded-3xl overflow-hidden mb-12 shadow-2xl border border-slate-800/80 bg-slate-950 group select-none min-h-[480px] sm:min-h-[540px] flex items-end"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* صورة الخلفية السينمائية مع تأثير التكبير التدريجي */}
      {backdropUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            key={currentItem.id}
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover object-center animate-fadeIn transform transition-transform duration-1000 scale-100 group-hover:scale-105 filter brightness-[0.75]"
          />
          {/* التدرجات اللونية الفاخرة للظلال والدمج */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
          <div className={`absolute inset-0 ${t.dir === 'rtl' ? 'bg-gradient-to-l from-transparent via-slate-950/70 to-slate-950' : 'bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent'}`}></div>
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-slate-950/80 to-transparent"></div>
        </div>
      )}

      {/* المحتوى والنصوص الرئيسية للبطل */}
      <div className="relative z-10 p-6 sm:p-10 md:p-14 max-w-3xl space-y-4">
        {/* الشارات العلوية */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-black">
          <span className="bg-gradient-to-r from-red-600 to-amber-500 text-white px-3 py-1 rounded-xl shadow-lg shadow-red-600/40 uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
            <span>🔥</span>
            <span>{t.sections.trending}</span>
          </span>

          <span className="bg-slate-900/90 text-amber-400 px-3 py-1 rounded-xl border border-amber-400/30 backdrop-blur-md flex items-center gap-1">
            ⭐ {currentItem.vote_average ? currentItem.vote_average.toFixed(1) : '9.0'}
          </span>

          <span className="bg-slate-900/90 text-gray-200 px-3 py-1 rounded-xl border border-slate-700/60 backdrop-blur-md">
            📅 {year}
          </span>

          <span className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-xl font-bold backdrop-blur-md">
            4K Ultra HD
          </span>

          <span className={`px-2.5 py-1 rounded-xl text-white font-bold backdrop-blur-md ${isTV ? 'bg-indigo-600/80' : 'bg-red-600/80'}`}>
            {isTV ? t.tvBadge : t.movieBadge}
          </span>
        </div>

        {/* عنوان العمل بحجم سينمائي ضخم */}
        <h1 
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-2xl line-clamp-2"
        >
          {title}
        </h1>

        {/* ملخص القصة */}
        <p className="text-gray-300 text-xs sm:text-sm md:text-base line-clamp-3 max-w-2xl leading-relaxed drop-shadow">
          {currentItem.overview || t.clickForDetails}
        </p>

        {/* أزرار الإجراءات التفاعلية */}
        <div className="flex flex-wrap items-center gap-3 pt-3">
          {/* زر المشاهدة الرئيسي مع توهج نبضي */}
          <button
            onClick={() => onSelectMedia(currentItem)}
            className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:opacity-95 text-white font-black px-6 sm:px-8 py-3.5 rounded-2xl shadow-xl shadow-red-600/40 flex items-center gap-2.5 text-sm sm:text-base transition-all transform hover:scale-105 active:scale-95 glow-btn"
          >
            <span className="text-lg">▶️</span>
            <span>{t.watchNow}</span>
          </button>

          {/* زر إضافة/إزالة من المفضلة */}
          <button
            onClick={() => onToggleFavorite(currentItem)}
            className={`px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 backdrop-blur-md border shadow-lg ${
              isFavorite
                ? 'bg-red-600/90 border-red-500 text-white shadow-red-600/30'
                : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-700/80 text-gray-200 hover:text-white'
            }`}
          >
            <span className="text-base">{isFavorite ? '❤️' : '🤍'}</span>
            <span>{isFavorite ? t.removeFromWatchlist : t.addToWatchlist}</span>
          </button>

          {/* زر التفاصيل */}
          <button
            onClick={() => onSelectMedia(currentItem)}
            className="px-4 py-3.5 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 rounded-2xl text-xs sm:text-sm font-bold text-gray-300 hover:text-white backdrop-blur-md transition-all hidden sm:flex items-center gap-2"
          >
            <span>ℹ️</span>
            <span>تفاصيل العمل</span>
          </button>
        </div>
      </div>

      {/* شريط المصغرات الجانبي/السفلي للتبديل السريع بين الأعمال المميزة */}
      <div className={`absolute z-20 bottom-6 ${t.dir === 'rtl' ? 'left-6' : 'right-6'} hidden md:flex items-center gap-2.5 bg-slate-950/80 backdrop-blur-md p-2 rounded-2xl border border-slate-800/80 shadow-2xl`}>
        {featuredItems.map((item, idx) => {
          const isActive = idx === currentIndex;
          const thumbUrl = item.poster_path 
            ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
            : '';
          return (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-12 h-16 rounded-xl overflow-hidden transition-all duration-300 shrink-0 ${
                isActive 
                  ? 'ring-2 ring-red-500 scale-110 shadow-lg shadow-red-600/50' 
                  : 'opacity-50 hover:opacity-100'
              }`}
            >
              {thumbUrl && (
                <img 
                  src={thumbUrl} 
                  alt={item.title || item.name} 
                  className="w-full h-full object-cover" 
                />
              )}
              {isActive && (
                <div className="absolute inset-0 bg-red-600/20"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* أسهم التنقل اليدوي */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length)}
        className={`absolute top-1/2 -translate-y-1/2 ${t.dir === 'rtl' ? 'right-3' : 'left-3'} z-20 w-10 h-10 rounded-full bg-slate-950/70 hover:bg-red-600 text-white backdrop-blur-md border border-slate-700/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-xl`}
        aria-label="Previous"
      >
        {t.dir === 'rtl' ? '❯' : '❮'}
      </button>

      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredItems.length)}
        className={`absolute top-1/2 -translate-y-1/2 ${t.dir === 'rtl' ? 'left-3' : 'right-3'} z-20 w-10 h-10 rounded-full bg-slate-950/70 hover:bg-red-600 text-white backdrop-blur-md border border-slate-700/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-xl`}
        aria-label="Next"
      >
        {t.dir === 'rtl' ? '❮' : '❯'}
      </button>
    </div>
  );
}
