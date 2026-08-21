import React from 'react';
import { translations } from '../translations';

export default function MovieCard({ 
  item, 
  onClick, 
  appLang = 'ar', 
  isFavorite = false, 
  onToggleFavorite 
}) {
  const t = translations[appLang] || translations.ar;
  const title = item.title || item.name || 'Untitled';
  const releaseDate = item.release_date || item.first_air_date;
  const imageUrl = item.poster_path 
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
    : 'https://via.placeholder.com/500x750/1e293b/f8fafc?text=No+Poster';
  
  // تحديد نوع العمل
  const isTV = item.media_type === 'tv' || (!item.title && !!item.name);
  const mediaTypeText = isTV ? t.tvBadge : t.movieBadge;
  const badgeColor = isTV ? 'bg-indigo-600/90 text-white' : 'bg-red-600/90 text-white';

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(item);
  };

  return (
    <div 
      onClick={() => onClick && onClick(item)}
      className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-red-600/25 hover:-translate-y-2 transition-all duration-300 flex flex-col group cursor-pointer relative"
    >
      
      {/* بوستر الفيلم/المسلسل */}
      <div className="relative aspect-[2/3] overflow-hidden bg-slate-800">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-50"
          loading="lazy"
        />
        
        {/* ملخص القصة وزر المشاهدة عند التمرير بالماوس */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/40">
          
          <div className="flex justify-center pt-2">
            <span className="bg-red-600 hover:bg-red-500 text-white p-3 rounded-full shadow-lg transform group-hover:scale-110 transition-transform">
              ▶️
            </span>
          </div>

          <div>
            <p className="text-xs font-bold text-amber-400 mb-1">📖 {t.story}:</p>
            <p className="line-clamp-4 text-gray-200 leading-relaxed text-[11px]">
              {item.overview ? item.overview : t.clickForDetails}
            </p>
            <div className="mt-3 text-center bg-red-600/90 text-white py-1.5 rounded-lg text-xs font-bold shadow">
              {t.watchNow}
            </div>
          </div>
        </div>

        {/* زر المفضلة السريع ❤️ */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 p-1.5 rounded-xl backdrop-blur-md transition-all shadow-md z-10 ${
            isFavorite 
              ? 'bg-red-600 text-white scale-110 shadow-red-600/50' 
              : 'bg-black/60 text-gray-300 hover:text-red-400 hover:scale-110'
          }`}
          title={isFavorite ? t.removeFromWatchlist : t.addToWatchlist}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>

        {/* التقييم */}
        <div className="absolute bottom-2 right-2 bg-slate-950/80 px-2 py-0.5 rounded-lg text-xs font-black text-amber-400 flex items-center gap-1 backdrop-blur-md border border-slate-700/50">
          ⭐ {item.vote_average ? item.vote_average.toFixed(1) : 'NEW'}
        </div>
        
        {/* شارة نوع العمل (فيلم أو مسلسل) */}
        <div className={`absolute top-2 left-2 ${badgeColor} px-2 py-0.5 rounded-lg text-xs font-bold backdrop-blur-md shadow-md`}>
          {mediaTypeText}
        </div>
      </div>

      {/* معلومات البطاقة السفلية */}
      <div className="p-3.5 flex-1 flex flex-col justify-between bg-slate-900/60">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-white line-clamp-1 group-hover:text-red-400 transition-colors" title={title}>
            {title}
          </h3>
          <div className="flex justify-between items-center text-xs text-gray-400 mt-2 pt-2 border-t border-slate-800">
            <span>{t.releaseYear}</span>
            <span className="text-gray-200 font-semibold bg-slate-800 px-2 py-0.5 rounded">
              {releaseDate ? new Date(releaseDate).getFullYear() : '—'}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
