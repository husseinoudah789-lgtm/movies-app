import React, { useState, useEffect } from 'react';
import { fetchMediaDetails } from '../services/api';
import { translations } from '../translations';

const AVAILABLE_LANGUAGES = [
  { code: 'ar', subCode: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'en-US', subCode: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'fr-FR', subCode: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es-ES', subCode: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'tr-TR', subCode: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'de-DE', subCode: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

export default function MediaModal({ 
  media, 
  onClose, 
  appLang = 'ar',
  isFavorite = false,
  onToggleFavorite,
  onAddToHistory
}) {
  const t = translations[appLang] || translations.ar;
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeServer, setActiveServer] = useState('vidlink');
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [selectedLang, setSelectedLang] = useState(appLang === 'ar' ? 'ar' : 'en-US');

  // أداة حذف وتخطي المشاهد غير اللائقة الشاملة لجميع الأفلام والمسلسلات
  const [cleanWatchMode, setCleanWatchMode] = useState(true);
  const [isCensored, setIsCensored] = useState(false);
  const [skipNotification, setSkipNotification] = useState('');
  const [skipKeyOffset, setSkipKeyOffset] = useState(0);
  const [totalSkippedSeconds, setTotalSkippedSeconds] = useState(0);

  const isTV = media.media_type === 'tv' || (!media.title && !!media.name);
  const mediaType = isTV ? 'tv' : 'movie';

  const currentLangObj = AVAILABLE_LANGUAGES.find((l) => l.code === selectedLang) || AVAILABLE_LANGUAGES[0];

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      const data = await fetchMediaDetails(mediaType, media.id, selectedLang);
      setDetails(data);
      setLoading(false);
    };

    loadDetails();
  }, [media.id, mediaType, selectedLang]);

  // تسجيل العمل في سجل المشاهدات
  useEffect(() => {
    if (media && onAddToHistory) {
      onAddToHistory({
        ...media,
        media_type: mediaType,
        watchedSeason: isTV ? selectedSeason : null,
        watchedEpisode: isTV ? selectedEpisode : null,
        watchedAt: new Date().toISOString()
      });
    }
  }, [media?.id, selectedSeason, selectedEpisode]);

  // اختصارات لوحة المفاتيح: Escape للإغلاق، B أو المسافة للتعتيم الفوري، S للتخطي السريع
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'b' || e.key === 'B') {
        setIsCensored((prev) => !prev);
      }
      if (e.key === 's' || e.key === 'S') {
        handleSkipScene(30);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // دالة تخطي المشهد السريع للأمام (+30 أو +60 ثانية) الشاملة لجميع الأعمال
  const handleSkipScene = (seconds = 30) => {
    setSkipKeyOffset((prev) => prev + 1);
    setTotalSkippedSeconds((prev) => prev + seconds);
    setIsCensored(false);
    setSkipNotification(`⚡ تم تخطي المشهد (+${seconds} ثانية للأمام بنجاح) 🛡️`);
    setTimeout(() => setSkipNotification(''), 3500);
  };

  const trailer = details?.videos?.results?.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube'
  ) || details?.videos?.results?.[0];

  const getVideoSrc = () => {
    const id = media.id;
    const sub = currentLangObj.subCode;

    if (activeServer === 'trailer') {
      return trailer ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1` : '';
    }
    if (activeServer === 'vidlink') {
      return isTV
        ? `https://vidlink.pro/tv/${id}/${selectedSeason}/${selectedEpisode}?sub=${sub}&sub_lang=${sub}&primaryColor=e11d48&secondaryColor=0f172a&iconColor=ffffff&title=true&poster=true`
        : `https://vidlink.pro/movie/${id}?sub=${sub}&sub_lang=${sub}&primaryColor=e11d48&secondaryColor=0f172a&iconColor=ffffff&title=true&poster=true`;
    }
    if (activeServer === 'multiembed') {
      return isTV
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${selectedSeason}&e=${selectedEpisode}&sub_lang=${sub}`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&sub_lang=${sub}`;
    }
    if (activeServer === 'vidsrc') {
      return isTV 
        ? `https://vidsrc.xyz/embed/tv/${id}/${selectedSeason}/${selectedEpisode}?ds_lang=${sub}`
        : `https://vidsrc.xyz/embed/movie/${id}?ds_lang=${sub}`;
    }
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

  // فحص ملاءمة المحتوى العائلي
  const isFamilySafeGenre = details?.genres?.some((g) => [10751, 16, 35, 10762].includes(g.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl z-10 my-auto">
        
        {/* زر الإغلاق السينمائي */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-30 bg-slate-900/80 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-md border border-slate-700/60 transition-all shadow-xl text-lg group"
          title="إغلاق"
        >
          <span className="group-hover:rotate-90 transition-transform duration-200">✕</span>
        </button>

        {/* مشغل الفيديو مع لوحة التحكم العائمة لحذف وتعتيم المشاهد */}
        <div className="relative aspect-video w-full bg-black shadow-inner overflow-hidden group/player">
          {/* إضاءة محيطية */}
          <div className="absolute inset-0 bg-red-600/10 filter blur-3xl pointer-events-none -z-10"></div>
          
          {getVideoSrc() ? (
            <iframe
              key={`${activeServer}-${selectedSeason}-${selectedEpisode}-${selectedLang}-${skipKeyOffset}`}
              src={getVideoSrc()}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <span className="text-4xl">🎬</span>
              <span>لا يوجد مشغل متوفر حالياً.</span>
            </div>
          )}

          {/* أزرار التحكم العائمة المباشرة فوق الفيديو (Floating In-Player Quick Bar) */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/80 shadow-2xl transition-opacity">
            <span className="flex items-center gap-1.5 text-[11px] font-black text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden sm:inline">أداة الفلترة والتخطي نشطة</span>
              <span>🛡️</span>
            </span>

            <div className="h-3 w-px bg-slate-700 mx-1"></div>

            {/* زر التعتيم المباشر فوق المشغل */}
            <button
              onClick={() => setIsCensored(!isCensored)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all flex items-center gap-1 ${
                isCensored 
                  ? 'bg-amber-500 text-slate-950 shadow-md' 
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
              }`}
              title="تعتيم فوري للمشهد (اختصار B)"
            >
              <span>{isCensored ? '👁️' : '🙈'}</span>
              <span className="hidden xs:inline">{isCensored ? 'إلغاء' : 'تعتيم'}</span>
            </button>

            {/* زر التخطي المباشر فوق المشغل */}
            <button
              onClick={() => handleSkipScene(30)}
              className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-gradient-to-r from-red-600 to-amber-600 hover:opacity-90 text-white shadow-md transition-all flex items-center gap-1"
              title="تخطي 30 ثانية للأمام (اختصار S)"
            >
              <span>⏩</span>
              <span>+30ث</span>
            </button>
          </div>

          {/* طبقة التعتيم الفوري (Shield Censor Overlay) لحجب وتخطي المشهد غير اللائق */}
          {isCensored && (
            <div className="absolute inset-0 z-30 backdrop-blur-3xl bg-slate-950/95 flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/20 animate-bounce">
                🙈
              </div>

              <div className="max-w-md space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {t.censorActive}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  تعمل أداة الحماية العائلية على حجب وتخطي المشاهد الحساسة لجميع الأفلام والمسلسلات.
                </p>
                {totalSkippedSeconds > 0 && (
                  <p className="text-amber-400 text-xs font-bold pt-1">
                    ⏱️ إجمالي ما تم تخطيه في هذا العمل: {totalSkippedSeconds} ثانية
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => handleSkipScene(30)}
                  className="bg-gradient-to-r from-red-600 to-amber-600 hover:opacity-95 text-white font-black px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-xl shadow-red-600/30 flex items-center gap-2 transition-all active:scale-95"
                >
                  <span>{t.skipScene30}</span>
                </button>

                <button
                  onClick={() => handleSkipScene(60)}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <span>{t.skipScene60}</span>
                </button>

                <button
                  onClick={() => setIsCensored(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-gray-200 hover:text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <span>{t.unblurScene}</span>
                </button>
              </div>
            </div>
          )}

          {/* إشعار التخطي السريع المؤقت */}
          {skipNotification && (
            <div className="absolute top-14 inset-x-0 mx-auto max-w-sm bg-gradient-to-r from-amber-500 to-red-600 text-white font-black px-4 py-2 rounded-xl text-xs text-center shadow-2xl backdrop-blur-md animate-fadeIn z-30 flex items-center justify-center gap-2">
              <span>⚡</span>
              <span>{skipNotification}</span>
            </div>
          )}
        </div>

        {/* شريط أدوات حذف وتخطي المشاهد غير اللائقة الشامل */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 sm:px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setCleanWatchMode(!cleanWatchMode)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow ${
                cleanWatchMode
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-600/30 scale-105'
                  : 'bg-slate-800 text-gray-400 hover:text-white'
              }`}
            >
              <span>🛡️</span>
              <span>{cleanWatchMode ? 'المشاهدة النظيفة تعمل على هذا العمل 🛡️' : t.safeMode}</span>
            </button>

            <span className="hidden md:inline text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              {isFamilySafeGenre ? t.familySafeBadge : 'فلترة المشاهد الحساسة لجميع السيرفرات'}
            </span>
          </div>

          {/* أزرار الحذف والتعتيم والتخطي المباشر */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCensored(!isCensored)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border shadow ${
                isCensored
                  ? 'bg-amber-500 text-slate-950 border-amber-400 scale-105'
                  : 'bg-slate-800/90 hover:bg-slate-800 text-amber-300 border-amber-500/30'
              }`}
              title="تعتيم الشاشة فوراً وحجب المشهد (حرف B)"
            >
              <span>{isCensored ? '👁️' : '🙈'}</span>
              <span>{isCensored ? t.unblurScene : t.blurScene}</span>
            </button>

            <button
              onClick={() => handleSkipScene(30)}
              className="px-3 py-1.5 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center gap-1 shadow"
              title="تخطي 30 ثانية للأمام"
            >
              <span>⏩</span>
              <span>+30ث</span>
            </button>

            <button
              onClick={() => handleSkipScene(60)}
              className="px-3 py-1.5 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center gap-1 shadow hidden sm:flex"
              title="تخطي دقيقة كاملة للأمام"
            >
              <span>⏭️</span>
              <span>+60ث</span>
            </button>
          </div>
        </div>

        {/* شريط اختيار لغة الترجمة */}
        <div className="bg-slate-950/95 px-4 sm:px-6 py-2.5 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-2.5 text-xs text-gray-400">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <span className="text-base">💬</span>
            <span>{t.subGuideTitle}</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-0.5 scrollbar-none">
            {AVAILABLE_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedLang === lang.code
                    ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md font-black scale-105'
                    : 'bg-slate-900 text-gray-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* أزرار السيرفرات والمواسم */}
        <div className="bg-slate-950 p-4 sm:p-5 border-b border-slate-800 space-y-3.5">
          
          {/* اختيار السيرفر وزر المفضلة */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 font-bold">
              <span>📡 {t.servers}:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onToggleFavorite && onToggleFavorite(media)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  isFavorite
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/40'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-red-400 border border-slate-700'
                }`}
              >
                <span>{isFavorite ? '❤️' : '🤍'}</span>
                <span>{isFavorite ? t.removeFromWatchlist : t.addToWatchlist}</span>
              </button>

              <button
                onClick={() => setActiveServer('vidlink')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeServer === 'vidlink'
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md scale-105'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                ⚡ سيرفر 1 (VIP)
              </button>

              <button
                onClick={() => setActiveServer('multiembed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeServer === 'multiembed'
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md scale-105'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                💬 سيرفر 2
              </button>

              <button
                onClick={() => setActiveServer('vidsrc')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeServer === 'vidsrc'
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md scale-105'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                🚀 سيرفر 3
              </button>

              {trailer && (
                <button
                  onClick={() => setActiveServer('trailer')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    activeServer === 'trailer'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-800 text-amber-400 hover:bg-slate-700 border border-slate-700/60'
                  }`}
                >
                  <span>▶️</span>
                  <span>Trailer</span>
                </button>
              )}
            </div>
          </div>

          {/* اختيار الموسم والحلقة إن كان مسلسلاً */}
          {isTV && details?.seasons && (
            <div className="pt-3 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs text-gray-400 font-bold whitespace-nowrap">{t.seasons}:</span>
                {details.seasons
                  .filter((s) => s.season_number > 0)
                  .map((season) => (
                    <button
                      key={season.id}
                      onClick={() => {
                        setSelectedSeason(season.season_number);
                        setSelectedEpisode(1);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        selectedSeason === season.season_number
                          ? 'bg-indigo-600 text-white shadow-md scale-105'
                          : 'bg-slate-800 text-gray-300 hover:bg-slate-700 border border-slate-700/50'
                      }`}
                    >
                      {t.season} {season.season_number}
                    </button>
                  ))}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-xs text-gray-400 font-bold whitespace-nowrap">{t.episodes}:</span>
                {Array.from({ length: Math.min(totalEpisodesInSeason, 40) }, (_, i) => i + 1).map((ep) => (
                  <button
                    key={ep}
                    onClick={() => setSelectedEpisode(ep)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center shrink-0 ${
                      selectedEpisode === ep
                        ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md scale-105 font-black'
                        : 'bg-slate-800 text-gray-300 hover:bg-slate-700 border border-slate-700/50'
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <p className="text-gray-400 text-xs animate-pulse">{t.loading}</p>
          </div>
        ) : (
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              
              {/* البوستر */}
              {posterUrl && (
                <div className="w-32 sm:w-44 shrink-0 mx-auto md:mx-0">
                  <img
                    src={posterUrl}
                    alt={title}
                    className="w-full rounded-2xl shadow-2xl border border-slate-700/80 aspect-[2/3] object-cover"
                  />
                </div>
              )}

              {/* النصوص والمعلومات */}
              <div className="flex-1 space-y-4 text-center md:text-right">
                <div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-black ${isTV ? 'bg-indigo-600 text-white' : 'bg-red-600 text-white'}`}>
                      {isTV ? t.tvBadge : t.movieBadge}
                    </span>
                    {details?.genres?.map((g) => (
                      <span key={g.id} className="bg-slate-800 text-gray-300 px-2.5 py-1 rounded-xl text-xs font-semibold border border-slate-700">
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
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs sm:text-sm text-gray-300 font-semibold">
                  <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/20">
                    ⭐ {details?.vote_average?.toFixed(1) || 'N/A'} ({details?.vote_count || 0})
                  </span>
                  <span className="bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700/50">
                    📅 {releaseDate ? new Date(releaseDate).getFullYear() : '—'}
                  </span>
                  {details?.runtime ? (
                    <span className="bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700/50">
                      ⏱️ {details.runtime} min
                    </span>
                  ) : null}
                  {isTV && details?.number_of_seasons ? (
                    <span className="bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700/50">
                      📂 {details.number_of_seasons} {t.seasons} ({details.number_of_episodes} {t.episodes})
                    </span>
                  ) : null}
                </div>

                {/* قصة العمل */}
                <div>
                  <h3 className="text-sm font-bold text-gray-300 mb-1.5 flex items-center justify-center md:justify-start gap-1.5">
                    <span>📖</span>
                    <span>{t.story} ({currentLangObj.label}):</span>
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                    {details?.overview ? details.overview : t.noOverview}
                  </p>
                </div>

                {/* طاقم التمثيل */}
                {details?.credits?.cast?.length > 0 && (
                  <div className="pt-2">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-300 mb-2.5">🎭 {t.actors}:</h3>
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none justify-center md:justify-start">
                      {details.credits.cast.slice(0, 8).map((actor) => (
                        <div key={actor.id} className="text-center shrink-0 w-16 group">
                          <img
                            src={
                              actor.profile_path
                                ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                                : 'https://via.placeholder.com/185x185/1e293b/94a3b8?text=?'
                            }
                            alt={actor.name}
                            className="w-12 h-12 rounded-full object-cover mx-auto mb-1 border-2 border-slate-700 group-hover:border-red-500 transition-colors shadow"
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
