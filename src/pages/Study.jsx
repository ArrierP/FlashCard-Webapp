import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Loader2,
  AlertCircle,
  Home,
  Flame
} from 'lucide-react';
import Flashcard from '../components/Flashcard.jsx';

export default function Study() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);

  // Session stats
  const [stats, setStats] = useState({
    remember: 0,
    forgot: 0,
  });

  const fetchTodayCards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`/api/card/today/${id}`);
      setCards(response.data.cards || []);
      setCurrentIndex(0);
      setStats({ remember: 0, forgot: 0 });
    } catch (err) {
      console.error('Error fetching today cards:', err);
      setError(
        err.response?.data?.message || 'Không thể tải danh sách thẻ cần ôn tập hôm nay.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTodayCards();
    }
  }, [id]);

  // Trigger celebration confetti when all cards are completed
  const isCompleted = cards.length > 0 && currentIndex >= cards.length;

  useEffect(() => {
    if (isCompleted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isCompleted]);

  const handleReview = async (cardId, quality) => {
    if (isReviewing) return;
    try {
      setIsReviewing(true);
      // PUT /api/card/review/:id with { quality: "remember" | "forgot" }
      await axios.put(`/api/card/review/${cardId}`, { quality });

      // Update session statistics
      setStats((prev) => ({
        ...prev,
        [quality]: prev[quality] + 1,
      }));

      // Advance to next card
      setCurrentIndex((prevIndex) => prevIndex + 1);
    } catch (err) {
      console.error('Error reviewing card:', err);
      // Even if API request had network blip, advance gracefully or show alert
      setCurrentIndex((prevIndex) => prevIndex + 1);
    } finally {
      setIsReviewing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Đang chuẩn bị bộ thẻ ôn tập SRS cho bạn...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-xl space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Lỗi Tải Thẻ</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Về Dashboard
          </button>
          <button
            onClick={fetchTodayCards}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Case: No due cards today
  if (cards.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-16 p-10 rounded-3xl bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 text-center shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Không có thẻ cần ôn tập hôm nay! 🎉
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Tất cả từ vựng trong bộ thẻ này đều đã được ôn tập đúng lộ trình Spaced Repetition. Hãy quay lại vào ngày mai nhé!
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Quay lại Bộ Thẻ</span>
          </Link>
        </div>
      </div>
    );
  }

  // Success State: All cards completed!
  if (isCompleted) {
    const totalReviewed = cards.length;
    const accuracy =
      totalReviewed > 0
        ? Math.round((stats.remember / totalReviewed) * 100)
        : 100;

    return (
      <div className="max-w-2xl mx-auto my-10 p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-white via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 border border-slate-200/80 dark:border-slate-800 text-center shadow-2xl animate-fade-in space-y-8">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20">
          <Trophy className="w-10 h-10" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Hoàn thành xuất sắc
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Buổi Học SRS Hoàn Tất! 🎉
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Thuật toán Spaced Repetition đã cập nhật chu kỳ ôn tập cho từng thẻ của bạn.
          </p>
        </div>

        {/* Statistics Breakdown */}
        <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
          <div className="text-center">
            <p className="text-xs uppercase font-semibold text-slate-400 dark:text-slate-500 mb-1">
              Đã ôn tập
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalReviewed}
            </p>
          </div>
          <div className="text-center border-x border-slate-200 dark:border-slate-800">
            <p className="text-xs uppercase font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
              Đã nhớ
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {stats.remember}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase font-semibold text-rose-500 dark:text-rose-400 mb-1">
              Cần ôn lại
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-500 dark:text-rose-400">
              {stats.forgot}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={fetchTodayCards}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Kiểm tra lại thẻ mới</span>
          </button>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Về Trang Chủ</span>
          </Link>
        </div>
      </div>
    );
  }

  // Active SRS Study Session View
  const currentCard = cards[currentIndex];
  const progressPercentage = Math.round((currentIndex / cards.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header & Clean Progress Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát buổi học</span>
          </button>

          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>
              Thẻ <strong className="text-indigo-600 dark:text-indigo-400">{currentIndex + 1}</strong> / {cards.length}
            </span>
          </div>
        </div>

        {/* Clean Progress Bar at Top */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 3D Flip Flashcard */}
      <Flashcard
        card={currentCard}
        onReview={handleReview}
        isReviewing={isReviewing}
      />
    </div>
  );
}
