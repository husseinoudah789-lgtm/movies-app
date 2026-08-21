import React, { useState, useEffect } from 'react';
import { fetchMediaDetails } from '../services/api';
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

  // حالة عرض لقطة/مشهد الفيديو المباشر في الخلفية
  const [trailerKey, setTrailerKey] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);

  const featuredItems = items.filter(item => item.backdrop_path || item.poster_path).slice(0, 6);

  // التبديل التلقائي بين الأعمال
  useEffect(() => {
    if (featuredItems.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredItems.length);
    }, 8500);
    return () => clearInterval(interval);
  }, [featuredItems.length, isPaused]);

  const currentItem = featuredItems[currentIndex] || featuredItems[0];
  const isTV = currentItem?.media_type === 'tv' || (!currentItem?.title && !!currentItem?.name);
  const mediaType = isTV ? 'tv' : 'movie';
  const title = currentItem?.title || currentItem?.name;
  const releaseDate = currentItem?.release_date || currentItem?.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '2026';
  const isFavorite = currentItem && watchlist.some((w) => w.id === currentItem.id);

  // جلب مشهد/لقطة الفيديو الترويجي عند تغيير العمل الحالي
  useEffect(() => {
    if (!currentItem) return;
    let isMounted = true;
    setShowVideo(false);
    setTrailerKey(null);
    setVideoLoading(true);

    const loadTrailer = async () => {
      try {
        const data = await fetchMediaDetails(mediaType, currentItem.id, 'en-US');
        if (!isMounted) return;
        
        const video = data?.videos?.results?.find(
          (v) => (v.type === 'Trailer' || v.type === 'Teaser' || v.type === 'Clip') && v.site === 'YouTube'
        ) || data?.videos?.results?.[0];

        if (video?.key) {
          setTrailerKey(video.key);
          // بدء تشغيل لقطة الفيديو بعد ثانية من ظهور البوستر بأسلوب نتفلكس
          setTimeout(() => {
            if (isMounted) setShowVideo(true);
          }, 1200);
        }
      } catch (err) {
        console.error('Error fetching trailer for hero:', err);
      } finally {
        if (isMounted) setVideoLoading(false);
      }
    };

    loadTrailer();
    return () => {
      isMounted = false;
    };
  }, [currentItem?.id, mediaType]);

  if (!featuredItems.length || !currentItem) return null;

  const backdropUrl = currentItem.backdrop_path
    ? `https://image.tmdb.org/t/p/original${currentItem.backdrop_path}`
    : currentItem.poster_path
    ? `https://image.tmdb.org/t/p/original${currentItem.poster_path}`
    : '';

  return (
    <div 
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-10 shadow-2xl border border-orange-500/30 bg-[#0c0d14] group select-none min-h-[420px] sm:min-h-[500px] md:min-h-[560px] flex items-end"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. خلفية الفيديو التفاعلي أو الصورة السينمائية */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        
        {/* صورة البوستر كخلفية أساسية وتحتية */}
        {backdropUrl && (
          <img
            key={`img-${currentItem.id}`}
            src={backdropUrl}
            alt={title}
            className={`w-full h-full object-cover object-center animate-fadeIn transform transition-all duration-1000 ${
              showVideo ? 'opacity-0 scale-105' : 'opacity-100 scale-100 group-hover:scale-105 filter brightness-[0.8]'
            }`}
          />
        )}

        {/* مشغل لقطة الفيديو في الخلفية (Live Scene Video Background) */}
        {trailerKey && showVideo && (
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden animate-fadeIn">
            <iframe
              key={`yt-${trailerKey}-${isMuted}`}
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailerKey}&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1&enablejsapi=1&playsinline=1`}
              title="Live Scene Preview"
              className="w-[140%] h-[140%] absolute -top-[20%] -left-[20%] object-cover pointer-events-none filter brightness-[0.85]"
              allow="autoplay; encrypted-media; gyroscope"
            ></iframe>
          </div>
        )}

        {/* تدرجات الإضاءة والظلال السينمائية للدمج والتناسق مع النصوص */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/60 to-transparent pointer-events-none"></div>
        <div className={`absolute inset-0 ${t.dir === 'rtl' ? 'bg-gradient-to-l from-transparent via-[#090a0f]/80 to-[#090a0f]' : 'bg-gradient-to-r from-[#090a0f] via-[#090a0f]/80 to-transparent'} pointer-events-none`}></div>
        <div className="absolute top-0 inset-x-0 h-28 sm:h-32 bg-gradient-to-b from-[#090a0f]/85 to-transparent pointer-events-none"></div>
      </div>

      {/* 2. أزرار التحكم في لقطة الفيديو في الزاوية العلوية */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-1.5 sm:gap-2">
        {/* شارة لقطة فيديو مباشرة */}
        {showVideo && (
          <span className="bg-slate-950/85 backdrop-blur-md text-orange-400 border border-orange-500/40 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black flex items-center gap-1.5 shadow-xl animate-pulse">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span>لقطة فيديو 🎬</span>
          </span>
        )}

        {/* زر تشغيل / كتم صوت لقطة الفيديو */}
        {trailerKey && showVideo && (
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-slate-950/85 hover:bg-orange-600 text-white backdrop-blur-md border border-orange-500/40 text-[10px] sm:text-xs font-bold transition-all shadow-xl flex items-center gap-1 active:scale-95"
            title={isMuted ? 'تشغيل صوت اللقطة' : 'كتم الصوت'}
          >
            <span>{isMuted ? '🔇' : '🔊'}</span>
            <span className="hidden md:inline">{isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}</span>
          </button>
        )}

        {/* زر التبديل بين وضع الفيديو والصورة */}
        {trailerKey && (
          <button
            onClick={() => setShowVideo(!showVideo)}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-slate-950/85 hover:bg-slate-800 text-gray-200 hover:text-white backdrop-blur-md border border-slate-700/80 text-[10px] sm:text-xs font-bold transition-all shadow-xl flex items-center gap-1 active:scale-95"
            title={showVideo ? 'إيقاف لقطة الفيديو والعودة للبوستر' : 'تشغيل لقطة الفيديو الآن'}
          >
            <span>{showVideo ? '🖼️' : '🎥'}</span>
            <span className="hidden md:inline">{showVideo ? 'الصورة' : 'مشاهدة اللقطة'}</span>
          </button>
        )}
      </div>

      {/* 3. المحتوى والنصوص الرئيسية */}
      <div className="relative z-10 p-4 sm:p-8 md:p-14 max-w-3xl space-y-3 sm:space-y-4">
        {/* الشارات العلوية */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-xs font-black">
          <span className="bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 font-black px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl shadow-md uppercase tracking-wider flex items-center gap-1">
            <span>🔥</span>
            <span>{t.sections.trending}</span>
          </span>

          <span className="bg-slate-900/90 text-amber-300 px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl border border-amber-400/30 backdrop-blur-md flex items-center gap-1 font-extrabold">
            ⭐ {currentItem.vote_average ? currentItem.vote_average.toFixed(1) : '9.0'}
          </span>

          <span className="bg-slate-900/90 text-white px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl border border-slate-700/60 backdrop-blur-md">
            📅 {year}
          </span>

          <span className="bg-orange-500/20 text-orange-300 border border-orange-400/40 px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl font-bold backdrop-blur-md">
            4K HD
          </span>

          <span className={`px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-white font-bold backdrop-blur-md ${isTV ? 'bg-indigo-600/80' : 'bg-orange-600/80'}`}>
            {isTV ? t.tvBadge : t.movieBadge}
          </span>
        </div>

        {/* عنوان العمل بحجم سينمائي ضخم */}
        <h1 
          className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-2xl line-clamp-2"
        >
          {title}
        </h1>

        {/* ملخص القصة */}
        <p className="text-gray-200 text-xs sm:text-sm md:text-base line-clamp-2 sm:line-clamp-3 max-w-2xl leading-relaxed drop-shadow">
          {currentItem.overview || t.clickForDetails}
        </p>

        {/* أزرار الإجراءات التفاعلية */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
          {/* زر المشاهدة الرئيسي */}
          <button
            onClick={() => onSelectMedia(currentItem)}
            className="flex-1 sm:flex-none justify-center bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:opacity-95 text-white font-black px-5 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-xl shadow-orange-500/40 flex items-center gap-2 text-xs sm:text-base transition-all transform hover:scale-105 active:scale-95 glow-btn border border-orange-300/40"
          >
            <span className="text-base sm:text-lg">▶️</span>
            <span>{t.watchNow}</span>
          </button>

          {/* زر إضافة/إزالة من المفضلة */}
          <button
            onClick={() => onToggleFavorite(currentItem)}
            className={`px-3.5 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 backdrop-blur-md border shadow-lg ${
              isFavorite
                ? 'bg-orange-600/90 border-orange-400 text-white shadow-orange-600/40'
                : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-700/80 text-gray-200 hover:text-white'
            }`}
          >
            <span className="text-sm sm:text-base">{isFavorite ? '❤️' : '🤍'}</span>
            <span className="hidden sm:inline">{isFavorite ? t.removeFromWatchlist : t.addToWatchlist}</span>
          </button>

          {/* زر تفاصيل العمل ومقاطع إضافية */}
          <button
            onClick={() => onSelectMedia(currentItem)}
            className="px-3.5 sm:px-4 py-3 sm:py-3.5 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-gray-200 hover:text-white backdrop-blur-md transition-all flex items-center gap-1.5"
          >
            <span>ℹ️</span>
            <span className="hidden xs:inline">التفاصيل</span>
          </button>
        </div>
      </div>

      {/* 4. شريط المصغرات الجانبي للتنقل */}
      <div className={`absolute z-20 bottom-6 ${t.dir === 'rtl' ? 'left-6' : 'right-6'} hidden md:flex items-center gap-2.5 bg-slate-950/80 backdrop-blur-md p-2 rounded-2xl border border-orange-500/30 shadow-2xl`}>
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
                  ? 'ring-2 ring-orange-500 scale-110 shadow-lg shadow-orange-500/50' 
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
                <div className="absolute inset-0 bg-orange-500/20"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* 5. أسهم التنقل اليدوي للشاشات الأكبر */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length)}
        className={`absolute top-1/2 -translate-y-1/2 ${t.dir === 'rtl' ? 'right-2 sm:right-3' : 'left-2 sm:left-3'} z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950/70 hover:bg-orange-600 text-white backdrop-blur-md border border-slate-700/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-xl`}
        aria-label="Previous"
      >
        {t.dir === 'rtl' ? '❯' : '❮'}
      </button>

      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredItems.length)}
        className={`absolute top-1/2 -translate-y-1/2 ${t.dir === 'rtl' ? 'left-2 sm:left-3' : 'right-2 sm:right-3'} z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950/70 hover:bg-orange-600 text-white backdrop-blur-md border border-slate-700/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-xl`}
        aria-label="Next"
      >
        {t.dir === 'rtl' ? '❮' : '❯'}
      </button>
    </div>
  );
}
