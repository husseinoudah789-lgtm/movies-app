import React, { useState, useEffect } from 'react';
import { fetchMediaDetails } from '../services/api';

const AVAILABLE_LANGUAGES = [
  { code: 'ar', subCode: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'en-US', subCode: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'fr-FR', subCode: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es-ES', subCode: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'tr-TR', subCode: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'de-DE', subCode: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

export default function MediaModal({ media, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeServer, setActiveServer] = useState('vidlink');
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [selectedLang, setSelectedLang] = useState('ar');

  const isTV = media.media_type === 'tv' || (!media.title && !!media.name);
  const mediaType = isTV ? 'tv' : 'movie';

  const currentLangObj = AVAILABLE_LANGUAGES.find((l) => l.code === selectedLang) || AVAILABLE_LANGUAGES[0];

  // جلب تفاصيل العمل الفني
  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      const data = await fetchMediaDetails(mediaType, media.id, selectedLang);
      setDetails(data);
      setLoading(false);
    };

    loadDetails();
  }, [media.id, mediaType, selectedLang]);

  // إغلاق عند الضغط على زر ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // إيجاد الإعلان الترويجي
  const trailer = details?.videos?.results?.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube'
  ) || details?.videos?.results?.[0];

  // رابط الفيديو مع تمرير كود لغة الترجمة المختارة للمشغل
  const getVideoSrc = () => {
    const id = media.id;
    const sub = currentLangObj.subCode;

    if (activeServer === 'trailer') {
      return trailer ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1` : '';
    }
    // سيرفر 1 (VidLink) - يدعم تمرير كود لغة الترجمة مباشرة في الرابط
    if (activeServer === 'vidlink') {
      return isTV
        ? `https://vidlink.pro/tv/${id}/${selectedSeason}/${selectedEpisode}?sub=${sub}&sub_lang=${sub}&primaryColor=e11d48&secondaryColor=0f172a&iconColor=ffffff&title=true&poster=true`
        : `https://vidlink.pro/movie/${id}?sub=${sub}&sub_lang=${sub}&primaryColor=e11d48&secondaryColor=0f172a&iconColor=ffffff&title=true&poster=true`;
    }
    // سيرفر 2 (MultiEmbed)
    if (activeServer === 'multiembed') {
      return isTV
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${selectedSeason}&e=${selectedEpisode}&sub_lang=${sub}`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&sub_lang=${sub}`;
    }
    // سيرفر 3 (VidSrc)
    if (activeServer === 'vidsrc') {
      return isTV 
        ? `https://vidsrc.xyz/embed/tv/${id}/${selectedSeason}/${selectedEpisode}?ds_lang=${sub}`
        : `https://vidsrc.xyz/embed/movie/${id}?ds_lang=${sub}`;
    }
    // سيرفر 4 (AutoEmbed)
    if (activeServer === 'autoembed') {
      return isTV
        ? `https://player.autoembed.cc/embed/tv/${id}/${selectedSeason}/${selectedEpisode}?sub_lang=${sub}`
        : `https://player.autoembed.cc/embed/movie/${id}?sub_lang=${sub}`;
    }
    return '';
  };

  const title = details?.title || details?.name || media.title || media.name;
  const releaseDate = details?.release_date || details?.first_air_date || media.release_date || media.first_air_date;
  const posterUrl = details?.poster_path 
    ? `https://image.tmdb.org/t/p/w500${details.poster_path}` 
    : media.poster_path 
    ? `https://image.tmdb.org/t/p/w500${media.poster_path}` 
    : '';

  const currentSeasonData = details?.seasons?.find((s) => s.season_number === selectedSeason);
  const totalEpisodesInSeason = currentSeasonData?.episode_count || 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      {/* خلفية الإغلاق عند النقر بالخارج */}
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* نافذة العرض الرئيسية */}
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl z-10 my-auto">
        
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 bg-slate-800/90 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-md transition-all shadow-lg text-lg"
          title="إغلاق"
        >
          ✕
        </button>

        {/* مشغل الفيديو */}
        <div className="relative aspect-video w-full bg-black">
          {getVideoSrc() ? (
            <iframe
              key={`${activeServer}-${selectedSeason}-${selectedEpisode}-${selectedLang}`}
              src={getVideoSrc()}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <span>لا يوجد مشغل متوفر حالياً.</span>
            </div>
          )}
        </div>

        {/* شريط اختيار لغة الترجمة والمعلومات الفورية */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 sm:px-6 py-3 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-400">
            <span className="text-lg">💬</span>
            <span>اختر لغة الترجمة في المشغل وتفاصيل العمل:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
            {AVAILABLE_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedLang === lang.code
                    ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-amber-500/25 font-black scale-105 border-transparent'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* إشعار الترجمة المفعلة */}
        <div className="bg-slate-950/90 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-gray-300">
              لغة الترجمة المفعلة في المشغل: <strong className="text-amber-400">{currentLangObj.label} {currentLangObj.flag}</strong>
            </span>
          </div>
          <span className="hidden sm:inline text-[11px] text-gray-500">
            يمكنك أيضاً تعديل الخط والحجم من زر [CC] داخل المشغل ⚙️
          </span>
        </div>

        {/* أزرار السيرفرات واختيار الحلقات */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 space-y-4">
          
          {/* اختيار السيرفر */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-300 font-bold">
              <span>📡 سيرفرات المشاهدة:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveServer('vidlink')}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeServer === 'vidlink'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}
              >
                <span>⚡ سيرفر 1 (ترجمة تلقائية VIP)</span>
              </button>
              <button
                onClick={() => setActiveServer('multiembed')}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeServer === 'multiembed'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}
              >
                <span>💬 سيرفر 2</span>
              </button>
              <button
                onClick={() => setActiveServer('vidsrc')}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeServer === 'vidsrc'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}
              >
                <span>🚀 سيرفر 3</span>
              </button>
              <button
                onClick={() => setActiveServer('autoembed')}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeServer === 'autoembed'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}
              >
                <span>🌐 سيرفر 4</span>
              </button>
              {trailer && (
                <button
                  onClick={() => setActiveServer('trailer')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1 ${
                    activeServer === 'trailer'
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                      : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                  }`}
                >
                  <span>▶️</span>
                  <span>الإعلان الرسمي</span>
                </button>
              )}
            </div>
          </div>

          {/* اختيار الموسم والحلقة إن كان مسلسلاً */}
          {isTV && details?.seasons && (
            <div className="pt-3 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs text-gray-400 font-bold whitespace-nowrap">المواسم:</span>
                {details.seasons
                  .filter((s) => s.season_number > 0)
                  .map((season) => (
                    <button
                      key={season.id}
                      onClick={() => {
                        setSelectedSeason(season.season_number);
                        setSelectedEpisode(1);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        selectedSeason === season.season_number
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                      }`}
                    >
                      الموسم {season.season_number}
                    </button>
                  ))}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs text-gray-400 font-bold whitespace-nowrap">الحلقات:</span>
                {Array.from({ length: Math.min(totalEpisodesInSeason, 40) }, (_, i) => i + 1).map((ep) => (
                  <button
                    key={ep}
                    onClick={() => setSelectedEpisode(ep)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center shrink-0 ${
                      selectedEpisode === ep
                        ? 'bg-red-600 text-white shadow-md scale-105'
                        : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                    }`}
                  >
                    {ep}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* تفاصيل العمل */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
            <p className="text-gray-400 text-xs animate-pulse">جاري تحديث اللغة والمعلومات...</p>
          </div>
        ) : (
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              
              {/* البوستر */}
              {posterUrl && (
                <div className="w-32 sm:w-40 shrink-0 mx-auto md:mx-0">
                  <img
                    src={posterUrl}
                    alt={title}
                    className="w-full rounded-2xl shadow-xl border border-slate-700/80 aspect-[2/3] object-cover"
                  />
                </div>
              )}

              {/* النصوص والمعلومات */}
              <div className="flex-1 space-y-4 text-center md:text-right">
                <div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${isTV ? 'bg-indigo-600 text-white' : 'bg-red-600 text-white'}`}>
                      {isTV ? '📺 مسلسل' : '🎬 فيلم'}
                    </span>
                    {details?.genres?.map((g) => (
                      <span key={g.id} className="bg-slate-800 text-gray-300 px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-700">
                        {g.name}
                      </span>
                    ))}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-white">{title}</h1>
                  {details?.original_title && details.original_title !== title && (
                    <p className="text-sm text-gray-400 font-mono mt-0.5">{details.original_title}</p>
                  )}
                </div>

                {/* إحصائيات سريعة */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm text-gray-300 font-semibold">
                  <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                    ⭐ {details?.vote_average?.toFixed(1) || 'N/A'} ({details?.vote_count || 0} تقييم)
                  </span>
                  <span className="bg-slate-800 px-2.5 py-1 rounded-lg">
                    📅 {releaseDate ? new Date(releaseDate).getFullYear() : 'غير معروف'}
                  </span>
                  {details?.runtime ? (
                    <span className="bg-slate-800 px-2.5 py-1 rounded-lg">
                      ⏱️ {details.runtime} دقيقة
                    </span>
                  ) : null}
                  {isTV && details?.number_of_seasons ? (
                    <span className="bg-slate-800 px-2.5 py-1 rounded-lg">
                      📂 {details.number_of_seasons} مواسم ({details.number_of_episodes} حلقة)
                    </span>
                  ) : null}
                </div>

                {/* قصة العمل باللغة المختارة */}
                <div>
                  <h3 className="text-sm font-bold text-gray-300 mb-1.5 flex items-center justify-center md:justify-start gap-1.5">
                    <span>📖</span>
                    <span>قصة العمل ({currentLangObj.label}):</span>
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {details?.overview ? details.overview : 'لا يتوفر ملخص بهذه اللغة حالياً.'}
                  </p>
                </div>

                {/* طاقم التمثيل */}
                {details?.credits?.cast?.length > 0 && (
                  <div className="pt-2">
                    <h3 className="text-sm font-bold text-gray-300 mb-2">🎭 أبرز الممثلين:</h3>
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none justify-center md:justify-start">
                      {details.credits.cast.slice(0, 7).map((actor) => (
                        <div key={actor.id} className="text-center shrink-0 w-16">
                          <img
                            src={
                              actor.profile_path
                                ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                                : 'https://via.placeholder.com/185x185/1e293b/94a3b8?text=مجهول'
                            }
                            alt={actor.name}
                            className="w-12 h-12 rounded-full object-cover mx-auto mb-1 border border-slate-700"
                          />
                          <p className="text-[10px] text-white font-bold truncate">{actor.name}</p>
                          <p className="text-[9px] text-gray-400 truncate">{actor.character}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
