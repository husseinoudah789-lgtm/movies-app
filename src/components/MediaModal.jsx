import React, { useState, useEffect } from 'react';
import { fetchMediaDetails } from '../services/api';
import { translations } from '../translations';

const AVAILABLE_LANGUAGES = [
  { code: 'ar', subCode: 'ar', label: 'العربية', flag: '🇸🇦', isDefault: true },
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
  const [selectedLang, setSelectedLang] = useState('ar'); // العربية تلقائياً لجميع الأعمال
  const [showSubGuide, setShowSubGuide] = useState(false);

  // أداة حذف وتخطي المشاهد غير اللائقة الشاملة
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
      const data = await fetchMediaDetails(mediaType, media.id, selectedLang === 'ar' ? 'ar' : selectedLang);
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

  // اختصارات لوحة المفاتيح
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

  // دالة تخطي المشهد السريع
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

  // روابط السيرفرات مع تعزيز دعم الترجمة العربية التلقائية لجميع الأفلام والمسلسلات
  const getVideoSrc = () => {
    const id = media.id;
    const sub = currentLangObj.subCode;

    if (activeServer === 'trailer') {
      return trailer ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1` : '';
    }
    // سيرفر 1 VIP: دعم شامل للترجمة العربية المدمجة
    if (activeServer === 'vidlink') {
      return isTV
        ? `https://vidlink.pro/tv/${id}/${selectedSeason}/${selectedEpisode}?sub=${sub}&sub_lang=${sub}&sub.${sub}=true&sub_default=true&primaryColor=ea580c&secondaryColor=0f111a&iconColor=ffffff&title=true&poster=true`
        : `https://vidlink.pro/movie/${id}?sub=${sub}&sub_lang=${sub}&sub.${sub}=true&sub_default=true&primaryColor=ea580c&secondaryColor=0f111a&iconColor=ffffff&title=true&poster=true`;
    }
    // سيرفر 2 MultiEmbed: دعم متعدد للترجمات مع التفضيل التلقائي
    if (activeServer === 'multiembed') {
      return isTV
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${selectedSeason}&e=${selectedEpisode}&sub_lang=${sub}&subtitle_lang=${sub}&sub=${sub}&preferred_sub=${sub}`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&sub_lang=${sub}&subtitle_lang=${sub}&sub=${sub}&preferred_sub=${sub}`;
    }
    // سيرفر 3 VidSrc: دعم الترجمة المباشرة
    if (activeServer === 'vidsrc') {
      return isTV 
        ? `https://vidsrc.xyz/embed/tv/${id}/${selectedSeason}/${selectedEpisode}?ds_lang=${sub}&sub_lang=${sub}&sub=1`
        : `https://vidsrc.xyz/embed/movie/${id}?ds_lang=${sub}&sub_lang=${sub}&sub=1`;
    }
    // سيرفر 4 AutoEmbed: مشغل بديل مدعوم بالترجمة
    if (activeServer === 'autoembed') {
      return isTV
        ? `https://player.autoembed.cc/embed/tv/${id}/${selectedSeason}/${selectedEpisode}?sub_lang=${sub}&server=1`
        : `https://player.autoembed.cc/embed/movie/${id}?sub_lang=${sub}&server=1`;
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

  const isFamilySafeGenre = details?.genres?.some((g) => [10751, 16, 35, 10762].includes(g.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-5xl bg-[#0f111a] border border-orange-500/30 rounded-3xl overflow-hidden shadow-2xl z-10 my-auto">
        
        {/* زر الإغلاق السينمائي */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-30 bg-slate-900/80 hover:bg-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-md border border-slate-700/60 transition-all shadow-xl text-lg group"
          title="إغلاق"
        >
          <span className="group-hover:rotate-90 transition-transform duration-200">✕</span>
        </button>

        {/* مشغل الفيديو مع لوحة التحكم والترجمة */}
        <div className="relative aspect-video w-full bg-black shadow-inner overflow-hidden group/player">
          {/* إضاءة محيطية برتقالية */}
          <div className="absolute inset-0 bg-orange-600/15 filter blur-3xl pointer-events-none -z-10"></div>
          
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

          {/* أزرار التحكم العائمة المباشرة فوق الفيديو */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-orange-500/30 shadow-2xl">
            <span className="flex items-center gap-1.5 text-[11px] font-black text-orange-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden sm:inline">الترجمة التلقائية نشطة 💬</span>
              <span>🇸🇦</span>
            </span>

            <div className="h-3 w-px bg-slate-700 mx-1"></div>

            <button
              onClick={() => setIsCensored(!isCensored)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all flex items-center gap-1 ${
                isCensored 
                  ? 'bg-amber-400 text-slate-950 shadow-md' 
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
              }`}
              title="تعتيم فوري للمشهد (اختصار B)"
            >
              <span>{isCensored ? '👁️' : '🙈'}</span>
              <span className="hidden xs:inline">{isCensored ? 'إلغاء' : 'تعتيم'}</span>
            </button>

            <button
              onClick={() => handleSkipScene(30)}
              className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white shadow-md transition-all flex items-center gap-1"
              title="تخطي 30 ثانية للأمام (اختصار S)"
            >
              <span>⏩</span>
              <span>+30ث</span>
            </button>
          </div>

          {/* طبقة التعتيم الفوري لحذف المشاهد غير اللائقة */}
          {isCensored && (
            <div className="absolute inset-0 z-30 backdrop-blur-3xl bg-slate-950/95 flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-3xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-3xl shadow-xl shadow-orange-500/20 animate-bounce">
                🙈
              </div>

              <div className="max-w-md space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {t.censorActive}
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm">
                  تعمل أداة الحماية العائلية على حجب وتخطي المشاهد الحساسة لجميع الأفلام والمسلسلات.
                </p>
                {totalSkippedSeconds > 0 && (
                  <p className="text-amber-300 text-xs font-bold pt-1">
                    ⏱️ إجمالي ما تم تخطيه في هذا العمل: {totalSkippedSeconds} ثانية
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => handleSkipScene(30)}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white font-black px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-xl shadow-orange-500/30 flex items-center gap-2 transition-all active:scale-95"
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
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <span>{t.unblurScene}</span>
                </button>
              </div>
            </div>
          )}

          {/* إشعار التخطي السريع */}
          {skipNotification && (
            <div className="absolute top-14 inset-x-0 mx-auto max-w-sm bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black px-4 py-2 rounded-xl text-xs text-center shadow-2xl backdrop-blur-md animate-fadeIn z-30 flex items-center justify-center gap-2">
              <span>⚡</span>
              <span>{skipNotification}</span>
            </div>
          )}
        </div>

        {/* شريط اختيار لغة الترجمة الشامل لجميع الأفلام والمسلسلات */}
        <div className="bg-gradient-to-r from-[#090a0f] via-[#121420] to-[#090a0f] px-4 sm:px-6 py-3 border-b border-orange-500/30 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-300">
            <span className="text-lg">💬</span>
            <span>الترجمة الاحترافية لجميع اللغات:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-0.5 scrollbar-none">
            {AVAILABLE_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLang(lang.code);
                  setSkipNotification(`💬 تم تفعيل الترجمة: ${lang.label} ${lang.flag}`);
                  setTimeout(() => setSkipNotification(''), 3000);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedLang === lang.code
                    ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/30 font-black scale-105 border border-orange-300/40'
                    : 'bg-slate-900 text-gray-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}

            {/* زر دليل تفعيل الترجمة */}
            <button
              onClick={() => setShowSubGuide(!showSubGuide)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-orange-400 hover:bg-orange-500/20 border border-orange-500/30 shrink-0 transition-all flex items-center gap-1"
              title="طريقة تشغيل الترجمة"
            >
              <span>ℹ️</span>
              <span className="hidden sm:inline">دليل الترجمة</span>
            </button>
          </div>
        </div>

        {/* إشعار وتفاصيل الترجمة المفعلة */}
        <div className="bg-slate-950/90 px-4 sm:px-6 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs text-gray-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-gray-200">
              الترجمة المفعلة حالياً: <strong className="text-amber-300">{currentLangObj.label} {currentLangObj.flag}</strong> (متاحة لجميع السيرفرات)
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span>⚙️ لتغيير الخط أو الحجم: اضغط على أيقونة <strong>CC</strong> داخل المشغل</span>
          </div>
        </div>

        {/* نافذة دليل الترجمة السريع في حال الحاجة */}
        {showSubGuide && (
          <div className="bg-orange-950/40 border-b border-orange-500/40 p-4 text-xs text-gray-200 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between font-black text-orange-400">
              <span className="flex items-center gap-1.5">
                <span>💡</span>
                <span>كيفية الاستفادة القصوى من الترجمة على جميع الأفلام والمسلسلات:</span>
              </span>
              <button onClick={() => setShowSubGuide(false)} className="text-gray-400 hover:text-white text-sm">✕</button>
            </div>
            <ul className="list-disc list-inside space-y-1 text-gray-300 leading-relaxed pr-2">
              <li><strong>الترجمة العربية 🇸🇦:</strong> مدمجة ومفعلة بشكل تلقائي على سيرفر 1 VIP وسيرفر 2 وسيرفر 3.</li>
              <li><strong>تخصيص الترجمة:</strong> يمكنك الضغط على زر <strong>[CC]</strong> أو رمز الترس ⚙️ في زاوية المشغل لاختيار حجم الخط ولونه وخلفيته.</li>
              <li><strong>تبديل السيرفر:</strong> في حال كان الفيلم حديثاً جداً، جرب التبديل بين <strong>سيرفر 1 VIP</strong> و <strong>سيرفر 2</strong> لاختيار أفضل ملف ترجمة احترافي.</li>
            </ul>
          </div>
        )}

        {/* أزرار السيرفرات والمواسم وأداة الحماية */}
        <div className="bg-[#0f111a] p-4 sm:p-5 border-b border-slate-800 space-y-3.5">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-200 font-bold">
              <span>📡 سيرفرات البث والترجمة:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onToggleFavorite && onToggleFavorite(media)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  isFavorite
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/40'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-orange-400 border border-slate-700'
                }`}
              >
                <span>{isFavorite ? '❤️' : '🤍'}</span>
                <span>{isFavorite ? t.removeFromWatchlist : t.addToWatchlist}</span>
              </button>

              <button
                onClick={() => setActiveServer('vidlink')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeServer === 'vidlink'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md scale-105 font-black border border-orange-300/30'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                ⚡ سيرفر 1 (VIP ترجمة عربية)
              </button>

              <button
                onClick={() => setActiveServer('multiembed')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeServer === 'multiembed'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md scale-105 font-black border border-orange-300/30'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                💬 سيرفر 2 (متعدد الترجمات)
              </button>

              <button
                onClick={() => setActiveServer('vidsrc')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeServer === 'vidsrc'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md scale-105 font-black border border-orange-300/30'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                🚀 سيرفر 3 (سريع مع ترجمة)
              </button>

              {trailer && (
                <button
                  onClick={() => setActiveServer('trailer')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    activeServer === 'trailer'
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-slate-700/60'
                  }`}
                >
                  <span>▶️</span>
                  <span>Trailer</span>
                </button>
              )}
            </div>
          </div>

          {/* أداة حذف المشاهد السريعة */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCleanWatchMode(!cleanWatchMode)}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow ${
                  cleanWatchMode
                    ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-orange-600/30'
                    : 'bg-slate-800 text-gray-400 hover:text-white'
                }`}
              >
                <span>🛡️</span>
                <span>{cleanWatchMode ? 'المشاهدة النظيفة نشطة لجميع المشاهد 🛡️' : 'تفعيل الفلترة'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsCensored(!isCensored)}
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 border ${
                  isCensored
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/30'
                }`}
              >
                <span>{isCensored ? '👁️' : '🙈'}</span>
                <span>{isCensored ? 'إلغاء التعتيم' : 'تعتيم المشهد'}</span>
              </button>
              <button
                onClick={() => handleSkipScene(30)}
                className="px-2.5 py-1 rounded-xl text-xs font-black bg-slate-800 hover:bg-orange-600 text-white border border-slate-700 transition-all flex items-center gap-1"
              >
                <span>⏩</span>
                <span>تخطي (+30ث)</span>
              </button>
            </div>
          </div>

          {/* اختيار الموسم والحلقة إن كان مسلسلاً */}
          {isTV && details?.seasons && (
            <div className="pt-3 border-t border-slate-800 space-y-3">
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
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md scale-105 font-black'
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
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md scale-105 font-black'
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            <p className="text-gray-400 text-xs animate-pulse">{t.loading}</p>
          </div>
        ) : (
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              
              {posterUrl && (
                <div className="w-32 sm:w-44 shrink-0 mx-auto md:mx-0">
                  <img
                    src={posterUrl}
                    alt={title}
                    className="w-full rounded-2xl shadow-2xl border border-orange-500/30 aspect-[2/3] object-cover"
                  />
                </div>
              )}

              <div className="flex-1 space-y-4 text-center md:text-right">
                <div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-black ${isTV ? 'bg-indigo-600 text-white' : 'bg-orange-600 text-white'}`}>
                      {isTV ? t.tvBadge : t.movieBadge}
                    </span>
                    <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-xl text-xs font-black">
                      💬 مترجم بالكامل
                    </span>
                    {details?.genres?.map((g) => (
                      <span key={g.id} className="bg-slate-800 text-gray-200 px-2.5 py-1 rounded-xl text-xs font-semibold border border-slate-700">
                        {g.name}
                      </span>
                    ))}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-white">{title}</h1>
                  {details?.original_title && details.original_title !== title && (
                    <p className="text-sm text-gray-400 font-mono mt-0.5">{details.original_title}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs sm:text-sm text-gray-200 font-semibold">
                  <span className="flex items-center gap-1 text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/20">
                    ⭐ {details?.vote_average?.toFixed(1) || 'N/A'} ({details?.vote_count || 0})
                  </span>
                  <span className="bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700/50 text-white">
                    📅 {releaseDate ? new Date(releaseDate).getFullYear() : '—'}
                  </span>
                  {details?.runtime ? (
                    <span className="bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700/50 text-white">
                      ⏱️ {details.runtime} min
                    </span>
                  ) : null}
                  {isTV && details?.number_of_seasons ? (
                    <span className="bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700/50 text-white">
                      📂 {details.number_of_seasons} {t.seasons} ({details.number_of_episodes} {t.episodes})
                    </span>
                  ) : null}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-200 mb-1.5 flex items-center justify-center md:justify-start gap-1.5">
                    <span>📖</span>
                    <span>{t.story} ({currentLangObj.label}):</span>
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                    {details?.overview ? details.overview : t.noOverview}
                  </p>
                </div>

                {details?.credits?.cast?.length > 0 && (
                  <div className="pt-2">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-200 mb-2.5">🎭 {t.actors}:</h3>
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
                            className="w-12 h-12 rounded-full object-cover mx-auto mb-1 border-2 border-slate-700 group-hover:border-orange-500 transition-colors shadow"
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
