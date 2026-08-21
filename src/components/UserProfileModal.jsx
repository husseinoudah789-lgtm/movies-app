import React, { useState } from 'react';
import { translations } from '../translations';

const AVATARS = ['🍿', '🦸‍♂️', '🦸‍♀️', '🥷', '👑', '🚀', '🤖', '🐱', '🎬', '⭐', '🦁', '🐉', '🎮', '💎'];

export default function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onLogout,
  watchlistCount = 0,
  historyCount = 0,
  onClearHistory,
  onClearWatchlist,
  appLang = 'ar'
}) {
  const t = translations[appLang] || translations.ar;
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || '🍿');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !currentUser) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedUser = {
      ...currentUser,
      name: name.trim(),
      avatar: selectedAvatar,
    };

    // Update in localStorage
    const storedUsers = JSON.parse(localStorage.getItem('cinema_plus_users') || '[]');
    const userIndex = storedUsers.findIndex((u) => u.id === currentUser.id);
    if (userIndex !== -1) {
      storedUsers[userIndex] = { ...storedUsers[userIndex], ...updatedUser };
      localStorage.setItem('cinema_plus_users', JSON.stringify(storedUsers));
    }
    localStorage.setItem('cinema_plus_current_user', JSON.stringify(updatedUser));

    if (onUpdateUser) onUpdateUser(updatedUser);

    setSuccessMsg(t.profileUpdated);
    setTimeout(() => {
      setSuccessMsg('');
      setIsEditing(false);
    }, 1200);
  };

  const formattedDate = currentUser.joinedDate 
    ? new Date(currentUser.joinedDate).toLocaleDateString(appLang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '2026';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden">
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors"
        >
          ✕
        </button>

        {/* رأس الملف الشخصي */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-800">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-4xl shadow-xl shadow-red-600/30 ring-4 ring-slate-800">
            {isEditing ? selectedAvatar : currentUser.avatar || '🍿'}
          </div>

          <div className="text-center sm:text-right flex-1">
            <h2 className="text-2xl font-black text-white flex items-center justify-center sm:justify-start gap-2">
              <span>{currentUser.name}</span>
              <span className="bg-red-600/20 text-red-400 text-xs px-2.5 py-0.5 rounded-full border border-red-500/30">VIP</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1 font-mono">{currentUser.email}</p>
            <p className="text-[11px] text-gray-500 mt-1">
              📅 {t.joinedDate}: {formattedDate}
            </p>
          </div>
        </div>

        {/* رسائل التنبيه والنجاح */}
        {successMsg && (
          <div className="my-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold text-center animate-fadeIn">
            {successMsg}
          </div>
        )}

        {!isEditing ? (
          /* وضع العرض العادي */
          <div className="space-y-6 pt-6">
            {/* بطاقات الإحصائيات */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                📊 {t.stats}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-xl bg-red-500/10 text-red-500">❤️</span>
                  <div>
                    <p className="text-xl font-black text-white">{watchlistCount}</p>
                    <p className="text-xs text-gray-400 font-medium">{t.totalFavorites}</p>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-xl bg-amber-500/10 text-amber-500">⏱️</span>
                  <div>
                    <p className="text-xl font-black text-white">{historyCount}</p>
                    <p className="text-xs text-gray-400 font-medium">{t.totalWatched}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* أزرار الإجراءات وإدارة الحساب */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setName(currentUser.name);
                  setSelectedAvatar(currentUser.avatar || '🍿');
                  setIsEditing(true);
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 shadow"
              >
                <span>✏️</span>
                <span>{t.editProfile}</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    if (window.confirm(appLang === 'ar' ? 'هل أنت متأكد من مسح سجل المشاهدات بالكامل؟' : 'Are you sure you want to clear your watch history?')) {
                      onClearHistory && onClearHistory();
                    }
                  }}
                  className="bg-slate-950 hover:bg-slate-800 text-gray-400 hover:text-amber-400 border border-slate-800 py-2 rounded-xl text-[11px] font-bold transition-all"
                >
                  🗑️ {t.clearHistory}
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(appLang === 'ar' ? 'هل أنت متأكد من تفريغ قائمتك المفضلة؟' : 'Are you sure you want to clear your watchlist?')) {
                      onClearWatchlist && onClearWatchlist();
                    }
                  }}
                  className="bg-slate-950 hover:bg-slate-800 text-gray-400 hover:text-red-400 border border-slate-800 py-2 rounded-xl text-[11px] font-bold transition-all"
                >
                  💔 {t.clearWatchlist}
                </button>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all mt-4"
              >
                <span>🚪</span>
                <span>{t.logout}</span>
              </button>
            </div>
          </div>
        ) : (
          /* وضع تعديل الملف الشخصي */
          <form onSubmit={handleSave} className="space-y-4 pt-6 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">{t.name}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">{t.chooseAvatar}</label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 transition-all ${
                      selectedAvatar === av
                        ? 'bg-red-600 scale-110 shadow-lg shadow-red-600/40 border border-white/20'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-red-600 to-amber-600 hover:opacity-95 text-white font-bold py-2.5 rounded-xl shadow-lg transition-all text-xs"
              >
                💾 {t.saveChanges}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl font-bold text-xs transition-all"
              >
                ✕ إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
