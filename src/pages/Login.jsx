import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Zap,
  Mail,
  Lock,
  User,
  Loader2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function Login() {
  const { login, register, isAuthenticated, error } = useAuth();
  const navigate = useNavigate();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        if (!username.trim() || !email.trim() || !password) {
          setLocalError('Vui lòng điền đầy đủ thông tin đăng ký.');
          setIsLoading(false);
          return;
        }
        const result = await register(email, username, password);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setLocalError(result.message);
        }
      } else {
        if (!email.trim() || !password) {
          setLocalError('Vui lòng nhập email và mật khẩu.');
          setIsLoading(false);
          return;
        }
        const result = await login(email, password);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setLocalError(result.message);
        }
      }
    } catch (err) {
      setLocalError('Đã xảy ra lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 mx-auto">
            <Zap className="w-8 h-8 fill-current" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {isRegisterMode ? 'Tạo Tài Khoản Mới' : 'Chào Mừng Trở Lại'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isRegisterMode
              ? 'Bắt đầu hành trình ghi nhớ từ vựng vĩnh viễn với Spaced Repetition'
              : 'Đăng nhập để tiếp tục lộ trình ôn tập khoa học hôm nay'}
          </p>
        </div>

        {/* Card Form */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-6">
          {/* Mode Toggle Tabs */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-950">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setLocalError(null);
              }}
              className={`py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                !isRegisterMode
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setLocalError(null);
              }}
              className={`py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                isRegisterMode
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Đăng ký
            </button>
          </div>

          {/* Error Alert */}
          {(localError || error) && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-sm text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{localError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                  Tên Người Dùng
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Tên của bạn"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                Mật Khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isRegisterMode ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập Ngay'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
