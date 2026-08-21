import React, { useState } from 'react';
import { translations } from '../translations';

export default function MovieCard({ 
  item, 
  onClick, 
  appLang = 'ar', 
  isFavorite = false, 
  onToggleFavorite,
  isSafeMode = true
}) {
  const t = translations[appLang] || translations.ar;
  const [imageLoaded, setImageLoaded] = useState(false);
  const title = item.title || item.name || 'Untitled';
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '—';
  
  const imageUrl = item.poster_path 
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
    : 'https://via.placeholder.com/500x750/0f172a/64748b?text=No+Poster';
  
  // تحديد نوع العمل
  const isTV = item.media_type === 'tv' || (!item.title && !!item.name);
  const mediaTypeText = isTV ? t.tvBadge : t.movieBadge;
  const badgeColor = isTV ? 'bg-indigo-600/90 text-white' : 'bg-orange-600/90 text-white';

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(item);
  };

  const vote = item.vote_average ? Number(item.vote_average).toFixed(1) : 'NEW';

  return (
    <div 
      onClick={() => onClick && onClick(item)}
      className="group relative bg-[#11131c]/90 rounded-2xl overflow-hidden border border-slate-800 hover:border-orange-500/80 shadow-lg hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-2 transition-all duration-300 flex flex-col cursor-pointer select-none"
    >
      {/* حاوية البوستر */}
      <div className="relative aspect-[2/3] overflow-hidden bg-slate-950">
        
        {/* شيمر تحميل خفيف قبل ظهور الصورة */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-900 animate-pulse flex items-center justify-center">
            <span className="text-2xl opacity-20">🍿</span>
          </div>
        )}

        <img 
          src={imageUrl} 
          alt={title} 
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-50 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
        />

        {/* شارات العمل العلوية */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black backdrop-blur-md shadow-md ${badgeColor}`}>
            {mediaTypeText}
          </span>
          <div className="flex items-center gap-1">
            <span className="bg-black/70 backdrop-blur-md text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded text-[9px] font-extrabold w-max">
              HD
            </span>
            {isSafeMode && (
              <span className="bg-orange-950/90 backdrop-blur-md text-orange-300 border border-orange-500/50 px-1.5 py-0.2 rounded text-[9px] font-extrabold flex items-center gap-0.5 shadow" title="أداة حذف وتخطي المشاهد غير اللائقة مفعلة">
                <span>🛡️</span>
              </span>
            )}
          </div>
        </div>

        {/* زر المفضلة التفاعلي السريع ❤️ */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-all shadow-md z-20 ${
            isFavorite 
              ? 'bg-orange-600 text-white scale-110 shadow-orange-600/50' 
              : 'bg-black/60 text-gray-300 hover:text-orange-400 hover:scale-110 hover:bg-black/80'
          }`}
          title={isFavorite ? t.removeFromWatchlist : t.addToWatchlist}
          aria-label="Favorite"
        >
          <span className="text-xs block">{isFavorite ? '❤️' : '🤍'}</span>
        </button>

        {/* شارة التقييم بالنجوم الذهبية */}
        <div className="absolute bottom-2.5 right-2.5 bg-slate-950/90 border border-amber-400/30 px-2 py-0.5 rounded-lg text-[11px] font-black text-amber-300 flex items-center gap-1 backdrop-blur-md shadow-md z-10">
          <span>⭐</span>
          <span>{vote}</span>
        </div>

        {/* طبقة المعلومات المنبثقة عند تمرير الماوس (Hover Overlay) */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 text-white bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/40 z-10">
          
          {/* زر تشغيل متوهج بالمنتصف */}
          <div className="flex flex-col items-center justify-center pt-2 gap-1">
            <span className="w-11 h-11 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-xl shadow-orange-500/50 transform group-hover:scale-110 transition-transform text-lg">
              ▶️
            </span>
            {isSafeMode && (
              <span className="text-[9px] text-orange-300 font-bold bg-orange-950/80 px-2 py-0.5 rounded-full border border-orange-500/40">
                🛡️ المشاهدة النظيفة نشطة
              </span>
            )}
          </div>

          {/* الملخص ومعلومات العمل السريعة */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
              <span>📖</span>
              <span>{t.story}:</span>
            </p>
            <p className="line-clamp-3 text-gray-200 leading-relaxed text-[10px]">
              {item.overview ? item.overview : t.clickForDetails}
            </p>
            
            <div className="pt-2">
              <div className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-1.5 rounded-xl text-center text-xs font-black shadow-lg shadow-orange-500/30">
                {t.watchNow}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* معلومات البطاقة السفلية */}
      <div className="p-3.5 flex-1 flex flex-col justify-between bg-[#11131c] border-t border-slate-800">
        <div>
          <h3 
            className="font-bold text-xs sm:text-sm text-white line-clamp-1 group-hover:text-orange-400 transition-colors" 
            title={title}
          >
            {title}
          </h3>
          
          <div className="flex justify-between items-center text-[11px] text-gray-400 mt-2 pt-2 border-t border-slate-800/80">
            <span className="text-gray-400">{t.releaseYear}</span>
            <span className="text-white font-semibold bg-slate-800/90 px-2 py-0.5 rounded-md border border-slate-700/60">
              {year}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
