import React, { useState } from 'react';
import { translations } from '../translations';

const AVATARS = ['🍿', '🦸‍♂️', '🦸‍♀️', '🥷', '👑', '🚀', '🤖', '🐱', '🎬', '⭐', '🦁', '🐉', '🎮', '💎'];

export default function AuthModal({ isOpen, onClose, onAuthSuccess, appLang = 'ar' }) {
  const t = translations[appLang] || translations.ar;
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('🍿');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password || (mode === 'register' && !name)) {
      setErrorMsg(appLang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('cinema_plus_users') || '[]');

    if (mode === 'register') {
      const existingUser = storedUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (existingUser) {
        setErrorMsg(appLang === 'ar' ? 'هذا البريد الإلكتروني مسجل بالفعل' : 'Email already registered');
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.trim(),
        password,
        avatar: selectedAvatar,
        joinedDate: new Date().toISOString()
      };

      storedUsers.push(newUser);
      localStorage.setItem('cinema_plus_users', JSON.stringify(storedUsers));
      localStorage.setItem('cinema_plus_current_user', JSON.stringify(newUser));

      setSuccessMsg(t.registerSuccess);
      setTimeout(() => {
        onAuthSuccess(newUser);
        onClose();
      }, 700);
    } else {
      // Login
      const user = storedUsers.find(
        u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
      );

      if (!user) {
        setErrorMsg(appLang === 'ar' ? 'بيانات الدخول غير صحيحة، يرجى التأكد' : 'Invalid email or password');
        return;
      }

      localStorage.setItem('cinema_plus_current_user', JSON.stringify(user));
      setSuccessMsg(t.loginSuccess);
      setTimeout(() => {
        onAuthSuccess(user);
        onClose();
      }, 700);
    }
  };

  // تسجيل دخول تجريبي بنقرة واحدة
  const handleQuickDemoLogin = () => {
    const demoUser = {
      id: 'demo_user_1',
      name: appLang === 'ar' ? 'عضو تجريبي VIP' : 'Demo VIP User',
      email: 'demo@cinemaplus.com',
      avatar: '👑',
      joinedDate: new Date().toISOString()
    };
    localStorage.setItem('cinema_plus_current_user', JSON.stringify(demoUser));
    setSuccessMsg(t.loginSuccess);
    setTimeout(() => {
      onAuthSuccess(demoUser);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-[#0f111a] border border-orange-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10">
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors"
        >
          ✕
        </button>

        {/* رأس النافذة */}
        <div className="text-center mb-5">
          <div className="text-4xl mb-2 animate-bounce">{selectedAvatar}</div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-white">
            {mode === 'login' ? t.login : t.register}
          </h2>
          <p className="text-gray-400 text-xs mt-1">{t.appTagline}</p>
        </div>

        {/* التبديل بين تسجيل الدخول وإنشاء حساب */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-orange-500/20 mb-5">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.login}
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'register'
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.register}
          </button>
        </div>

        {/* الرسائل التنبيهية */}
        {errorMsg && (
          <div className="bg-orange-500/10 border border-orange-500/30 text-orange-400 px-4 py-2 rounded-xl text-xs font-bold mb-4 text-center">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold mb-4 text-center">
            {successMsg}
          </div>
        )}

        {/* النموذج */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">{t.name}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أحمد محمد"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">{t.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">{t.password}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-2.5 text-xs text-gray-400 hover:text-white"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* اختيار الصورة الرمزية في وضع التسجيل */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">{t.chooseAvatar}</label>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center shrink-0 transition-all ${
                      selectedAvatar === av
                        ? 'bg-gradient-to-r from-orange-600 to-amber-500 border-2 border-white scale-110 shadow-md'
                        : 'bg-slate-950 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* زر التأكيد */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-400 text-white font-black text-sm shadow-xl shadow-orange-500/30 transition-all active:scale-95 border border-orange-400/30"
          >
            {mode === 'login' ? t.login : t.register}
          </button>
        </form>

        {/* زر الدخول التجريبي السريع */}
        <div className="mt-4 pt-4 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-orange-500/10 text-orange-400 hover:text-white border border-orange-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <span>{t.quickDemo}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
