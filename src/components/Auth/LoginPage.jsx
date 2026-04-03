import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'reset-request'
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function switchMode(next) {
    setMode(next);
    setError('');
    setMessage('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage('נשלח אימייל לאישור — בדוק את תיבת הדואר שלך.');
    } else if (mode === 'reset-request') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) setError(error.message);
      else setMessage('קישור לאיפוס נשלח למייל שלך');
    }

    setLoading(false);
  }

  const isResetRequest = mode === 'reset-request';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 w-full max-w-sm p-8 space-y-6">

        {/* Logo / Title */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold text-slate-800">
            {mode === 'login' ? 'התחברות' : mode === 'signup' ? 'יצירת חשבון' : 'איפוס סיסמה'}
          </h1>
          <p className="text-sm text-slate-400">מנהל הפרויקטים האישי שלך</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-600">אימייל</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {!isResetRequest && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-600">סיסמה</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          )}

          {/* Error / Success */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
          {message && (
            <p className="text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition"
          >
            {loading
              ? 'מעבד...'
              : mode === 'login'
              ? 'התחבר'
              : mode === 'signup'
              ? 'הירשם'
              : 'שלח קישור לאיפוס'}
          </button>
        </form>

        {/* Forgot password link — visible only in login mode */}
        {mode === 'login' && (
          <p className="text-center text-sm">
            <button
              onClick={() => switchMode('reset-request')}
              className="text-slate-400 hover:text-indigo-600 transition"
            >
              שכחתי סיסמה
            </button>
          </p>
        )}

        {/* Toggle login / signup */}
        {!isResetRequest && (
          <p className="text-center text-sm text-slate-400">
            {mode === 'login' ? 'אין לך חשבון עדיין?' : 'כבר יש לך חשבון?'}{' '}
            <button
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              className="text-indigo-600 font-medium hover:underline"
            >
              {mode === 'login' ? 'הירשם' : 'התחבר'}
            </button>
          </p>
        )}

        {/* Back to login — visible only in reset-request mode */}
        {isResetRequest && (
          <p className="text-center text-sm text-slate-400">
            <button
              onClick={() => switchMode('login')}
              className="text-indigo-600 font-medium hover:underline"
            >
              חזרה להתחברות
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
