import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  BookOpen,
  Plus,
  Play,
  Sparkles,
  Search,
  Layers,
  Loader2,
  AlertCircle,
  FolderPlus,
  ArrowRight,
  Clock,
  Trash2,
  BarChart3,
  TrendingUp
} from 'lucide-react';

export default function Dashboard() {
  const [desks, setDesks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Analytics summary state (Thống kê tiến độ học tập)
  const [analyticsSummary, setAnalyticsSummary] = useState({
    totalCards: 0,
    newCards: 0,
    learningCards: 0,
    masteredCards: 0,
  });
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);

  // Modal create desk state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchDesks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get('/api/desk');
      setDesks(response.data.desks || []);
    } catch (err) {
      console.error('Error fetching desks:', err);
      setError(
        err.response?.data?.message || 'Không thể tải danh sách bộ thẻ từ máy chủ.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm gọi API lấy dữ liệu thống kê tổng quan tiến độ học tập
  const fetchAnalytics = async () => {
    try {
      setIsAnalyticsLoading(true);
      const response = await axios.get('/api/analytics');
      if (response.data && response.data.summary) {
        setAnalyticsSummary(response.data.summary);
      }
    } catch (err) {
      console.error('Error fetching analytics summary:', err);
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchDesks();
    fetchAnalytics();
  }, []);

  // Tính tỷ lệ % tiến độ hiển thị trên Progress Bar
  const getPercentage = (count) => {
    const total = analyticsSummary.totalCards || 0;
    if (!total || total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const handleCreateDesk = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setIsCreating(true);
      const response = await axios.post('/api/desk/create', {
        title: newTitle.trim(),
        description: newDescription.trim(),
      });
      const createdDesk = response.data.desk;
      if (createdDesk) {
        setDesks((prev) => [createdDesk, ...prev]);
      } else {
        await fetchDesks();
      }
      setIsModalOpen(false);
      setNewTitle('');
      setNewDescription('');
    } catch (err) {
      console.error('Error creating desk:', err);
      alert(err.response?.data?.message || 'Không thể tạo bộ thẻ mới.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteDesk = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa bộ thẻ này không?')) return;

    try {
      await axios.delete(`/api/desk/delete/${id}`);
      setDesks((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error('Error deleting desk:', err);
      alert('Không thể xóa bộ thẻ.');
    }
  };

  const filteredDesks = desks.filter(
    (desk) =>
      desk.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desk.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Hero Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            SaaS Spaced Repetition Platform
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Kho Bộ Thẻ Từ Vựng
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Chọn một bộ thẻ để bắt đầu ôn tập theo thuật toán Spaced Repetition thông minh.
          </p>
        </div>

        {/* CTA Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Bộ Thẻ Mới</span>
          </button>
        </div>
      </div>

      {/* ==================== KHU VỰC BẢNG ĐIỀU KHIỂN TIẾN ĐỘ HỌC TẬP (ANALYTICS DASHBOARD) ==================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Bảng điều khiển tiến độ học tập
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thống kê trực quan tiến trình ôn tập Spaced Repetition (SRS)
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-sm">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            <span>Tổng số thẻ: <strong className="text-slate-900 dark:text-white">{isAnalyticsLoading ? '...' : analyticsSummary.totalCards}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Thẻ 1 (Thẻ Mới - New): Đếm số thẻ có repetition === 0. Tone màu xám/slate sang trọng */}
          <div className="group relative rounded-3xl p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-700 shadow-sm hover:shadow-xl dark:hover:shadow-slate-900/40 hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Thẻ Mới (New)
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                repetition = 0
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2 mb-4">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {isAnalyticsLoading ? '-' : analyticsSummary.newCards}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {getPercentage(analyticsSummary.newCards)}% tổng số
              </span>
            </div>

            {/* Progress Bar bo tròn đẹp mắt Tailwind v4 */}
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-600 dark:bg-slate-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${getPercentage(analyticsSummary.newCards)}%` }}
              />
            </div>
          </div>

          {/* Thẻ 2 (Đang Ôn Luyện - Learning): Đếm số thẻ có repetition > 0 & interval < 7. Tone màu vàng hổ phách (amber) */}
          <div className="group relative rounded-3xl p-5 sm:p-6 bg-white dark:bg-slate-900 border border-amber-200/70 dark:border-amber-900/40 hover:border-amber-400 dark:hover:border-amber-700 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 dark:hover:shadow-amber-950/30 hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Đang Ôn Luyện (Learning)
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                interval &lt; 7 ngày
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2 mb-4">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {isAnalyticsLoading ? '-' : analyticsSummary.learningCards}
              </span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                {getPercentage(analyticsSummary.learningCards)}% tổng số
              </span>
            </div>

            {/* Progress Bar bo tròn đẹp mắt Tailwind v4 */}
            <div className="h-2.5 w-full bg-amber-100 dark:bg-amber-950/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${getPercentage(analyticsSummary.learningCards)}%` }}
              />
            </div>
          </div>

          {/* Thẻ 3 (Đã Thuộc Lòng - Mastered): Đếm số thẻ interval >= 7. Tone màu xanh lục bảo (emerald) + Sparkles */}
          <div className="group relative rounded-3xl p-5 sm:p-6 bg-white dark:bg-slate-900 border border-emerald-200/70 dark:border-emerald-900/40 hover:border-emerald-400 dark:hover:border-emerald-700 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-950/30 hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <span>Đã Thuộc Lòng (Mastered)</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                interval ≥ 7 ngày
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2 mb-4">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {isAnalyticsLoading ? '-' : analyticsSummary.masteredCards}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {getPercentage(analyticsSummary.masteredCards)}% tổng số
              </span>
            </div>

            {/* Progress Bar bo tròn đẹp mắt Tailwind v4 */}
            <div className="h-2.5 w-full bg-emerald-100 dark:bg-emerald-950/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${getPercentage(analyticsSummary.masteredCards)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* ====================================================================================================== */}

      {/* Search & Statistics Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bộ từ vựng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>Tổng số: <strong className="text-slate-900 dark:text-white">{desks.length}</strong> bộ thẻ</span>
        </div>
      </div>

      {/* State: Loading */}
      {isLoading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Đang tải danh sách bộ thẻ...
          </p>
        </div>
      )}

      {/* State: Error */}
      {error && !isLoading && (
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3 max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{error}</p>
          <button
            onClick={fetchDesks}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
          >
            Thử tải lại
          </button>
        </div>
      )}

      {/* State: Empty */}
      {!isLoading && !error && filteredDesks.length === 0 && (
        <div className="text-center py-16 px-6 rounded-3xl bg-white/50 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-4">
            <FolderPlus className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Chưa có bộ thẻ nào
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
            Hãy bắt đầu bằng cách tạo bộ từ vựng đầu tiên của bạn để luyện tập Spaced Repetition.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Bộ Thẻ Đầu Tiên</span>
          </button>
        </div>
      )}

      {/* Modern Grid of Available Decks */}
      {!isLoading && !error && filteredDesks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDesks.map((desk) => (
            <div
              key={desk._id}
              className="group relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-xl dark:hover:shadow-indigo-950/30 transition-all duration-300"
            >
              {/* Top Row: Icon & Delete action */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDeleteDesk(desk._id, e)}
                      title="Xóa bộ thẻ"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {desk.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 min-h-[40px]">
                  {desk.description || 'Chưa có mô tả cho bộ thẻ từ vựng này.'}
                </p>
              </div>

              {/* Bottom Actions & Inviting CTA button to Start Studying */}
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                <Link
                  to={`/deck/${desk._id}`}
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Quản lý thẻ →
                </Link>

                <Link
                  to={`/study/${desk._id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/35 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Bắt đầu học</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create New Desk */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Tạo Bộ Thẻ Từ Vựng
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDesk} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                  Tên Bộ Thẻ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: IELTS Vocabulary 7.5+"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                  Mô Tả
                </label>
                <textarea
                  rows={3}
                  placeholder="Ghi chú về chủ đề, mục tiêu..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md disabled:opacity-60 transition-colors"
                >
                  {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Tạo ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
