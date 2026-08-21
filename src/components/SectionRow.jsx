import React, { useRef } from 'react';
import MovieCard from './MovieCard';
import { translations } from '../translations';

export default function SectionRow({ 
  id, 
  title, 
  icon, 
  data = [], 
  mediaType, 
  tabTarget, 
  onSelectMedia, 
  onBrowseAll,
  appLang = 'ar',
  watchlist = [],
  onToggleFavorite,
  isSafeMode = true
}) {
  const rowRef = useRef(null);
  const t = translations[appLang] || translations.ar;

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!data || data.length === 0) return null;

  return (
    <section id={`section-${id}`} className="space-y-3.5 group/section relative">
      {/* رأس القسم */}
      <div className="flex justify-between items-center bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-xl px-4 sm:px-5 py-3 rounded-2xl border border-slate-800/80 shadow-md transition-all">
        <div className="flex items-center gap-2.5">
          <span className="text-xl sm:text-2xl p-1.5 rounded-xl bg-slate-800/80 border border-slate-700/50 shadow-inner">
            {icon}
          </span>
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{title}</span>
              <span className="text-[10px] text-gray-400 font-bold bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700/60 hidden sm:inline">
                {data.length} {appLang === 'ar' ? 'عمل' : 'titles'}
              </span>
            </h2>
          </div>
        </div>

        {/* زر التصفح الكامل للقسم */}
        {tabTarget !== 'home' && (
          <button
            onClick={() => onBrowseAll(tabTarget)}
            className="text-amber-400 hover:text-white bg-slate-800/80 hover:bg-gradient-to-r hover:from-red-600 hover:to-amber-600 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow border border-slate-700/60 shrink-0"
          >
            <span>{t.browseSection}</span>
            <span>{t.dir === 'rtl' ? '←' : '→'}</span>
          </button>
        )}
      </div>

      {/* شريط الأفلام القابل للتمرير الأفقي مع أزرار التحكم */}
      <div className="relative group">
        {/* زر التمرير للخلف */}
        <button
          onClick={() => handleScroll(t.dir === 'rtl' ? 'right' : 'left')}
          className={`absolute top-1/2 -translate-y-1/2 ${t.dir === 'rtl' ? '-right-3' : '-left-3'} z-20 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-red-600 text-white backdrop-blur-md border border-slate-700/80 opacity-0 group-hover/section:opacity-100 transition-all flex items-center justify-center shadow-xl hover:scale-110`}
          aria-label="Scroll Back"
        >
          {t.dir === 'rtl' ? '❯' : '❮'}
        </button>

        {/* حاوية الكروت الأفقية */}
        <div 
          ref={rowRef}
          className="flex items-stretch gap-3.5 sm:gap-4 overflow-x-auto pb-3 pt-1 px-1 scrollbar-none scroll-smooth"
        >
          {data.slice(0, 14).map((item, idx) => (
            <div key={`${item.id}-${id}-${idx}`} className="w-[140px] sm:w-[170px] md:w-[190px] shrink-0">
              <MovieCard 
                item={{
                  ...item,
                  media_type: mediaType || item.media_type
                }}
                onClick={onSelectMedia}
                appLang={appLang}
                isFavorite={watchlist.some((w) => w.id === item.id)}
                onToggleFavorite={onToggleFavorite}
                isSafeMode={isSafeMode}
              />
            </div>
          ))}
        </div>

        {/* زر التمرير للأمام */}
        <button
          onClick={() => handleScroll(t.dir === 'rtl' ? 'left' : 'right')}
          className={`absolute top-1/2 -translate-y-1/2 ${t.dir === 'rtl' ? '-left-3' : '-right-3'} z-20 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-red-600 text-white backdrop-blur-md border border-slate-700/80 opacity-0 group-hover/section:opacity-100 transition-all flex items-center justify-center shadow-xl hover:scale-110`}
          aria-label="Scroll Forward"
        >
          {t.dir === 'rtl' ? '❮' : '❯'}
        </button>
      </div>
    </section>
  );
}
