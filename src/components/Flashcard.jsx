import React, { useState, useEffect } from 'react';
import { Volume2, RotateCw, Sparkles, CheckCircle2, XCircle, BookOpen } from 'lucide-react';

export default function Flashcard({ card, onReview, isReviewing }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Automatically reset card back to the front side whenever the card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [card?._id]);

  // Keyboard navigation support for faster SRS review
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if typing in input/textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped && !isReviewing) {
        if (e.key === '1' || e.key === 'ArrowLeft') {
          e.preventDefault();
          handleReviewAction('forgot');
        } else if (e.key === '2' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleReviewAction('remember');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, isReviewing, card]);

  if (!card) return null;

  const playPronunciation = (e) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(card.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleReviewAction = (quality, e) => {
    if (e) e.stopPropagation();
    if (isReviewing) return;

    // Trigger callback to hit PUT review API, advance card, and reset flip state
    setIsFlipped(false);
    onReview(card._id, quality);
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-6">
      {/* 3D Perspective Container */}
      <div
        className="perspective-1000 w-full h-[440px] sm:h-[460px] cursor-pointer group"
        onClick={handleCardClick}
      >
        <div
          className={`relative w-full h-full duration-700 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : 'rotate-y-0'
          }`}
        >
          {/* ================== FRONT SIDE ================== */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl p-8 sm:p-10 flex flex-col justify-between border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-white via-slate-50 to-slate-100/80 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 shadow-xl dark:shadow-2xl dark:shadow-indigo-950/20 hover:shadow-2xl transition-shadow">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              {card.cardType === 'idiom' ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500/15 to-purple-500/15 text-amber-600 dark:text-amber-400 border border-amber-300/50 dark:border-amber-700/50 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>Thành Ngữ • {card.type || 'phrase'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Từ Vựng • {card.type || 'noun'}</span>
                </span>
              )}

              <button
                onClick={playPronunciation}
                title="Nghe phát âm"
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-300 transition-colors shadow-sm"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Center Content - Main Word */}
            <div className="text-center my-auto px-4">
              <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3 selection:bg-indigo-500 selection:text-white">
                {card.word}
              </h2>
              {card.phonetic && (
                <p className="text-lg sm:text-xl font-medium text-slate-500 dark:text-slate-400">
                  {card.phonetic}
                </p>
              )}
            </div>

            {/* Bottom Flip Indicator */}
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800/60">
              <RotateCw className="w-4 h-4 animate-spin-slow group-hover:rotate-180 transition-transform duration-500" />
              <span>Nhấn vào thẻ hoặc phím <kbd className="px-1.5 py-0.5 text-xs rounded bg-slate-200 dark:bg-slate-800 font-mono">Space</kbd> để lật xem nghĩa</span>
            </div>
          </div>

          {/* ================== BACK SIDE ================== */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl p-8 sm:p-10 flex flex-col justify-between border border-indigo-200/60 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 shadow-xl dark:shadow-2xl">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                <Sparkles className="w-3.5 h-3.5" />
                Mặt Sau • Giải Nghĩa {card.cardType === 'idiom' && 'Thành Ngữ'}
              </span>

              <button
                onClick={playPronunciation}
                title="Nghe phát âm"
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Back Content - Meaning, Context & Example */}
            <div className="my-auto space-y-4 text-left overflow-y-auto pr-1 py-2">
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {card.word}
                  </h3>
                  {card.phonetic && (
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {card.phonetic}
                    </span>
                  )}
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20">
                  <p className="text-xl sm:text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                    {card.meaning}
                  </p>
                </div>
              </div>

              {card.context && (
                <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/50 border border-amber-300/80 dark:border-amber-800/80 space-y-1.5 shadow-sm animate-fade-in">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Ngữ cảnh & Nguồn gốc sử dụng</span>
                  </p>
                  <p className="text-sm sm:text-base font-medium text-amber-900 dark:text-amber-100 leading-relaxed">
                    {card.context}
                  </p>
                </div>
              )}

              {card.example && (
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                    Ví dụ (Example)
                  </p>
                  <p className="text-base sm:text-lg italic font-medium text-slate-800 dark:text-slate-200">
                    "{card.example}"
                  </p>
                  {card.exampleMeaning && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      — {card.exampleMeaning}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="pt-2 text-center text-xs text-slate-400 dark:text-slate-500">
              Chọn mức độ ghi nhớ của bạn ở bên dưới để tiếp tục
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: ONLY visible AFTER the card is flipped to the back side */}
      {isFlipped && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
          {/* Forgot Button -> sends 'forgot' */}
          <button
            type="button"
            disabled={isReviewing}
            onClick={(e) => handleReviewAction('forgot', e)}
            className="w-full sm:w-1/2 group relative flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-bold text-base bg-rose-500 hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
          >
            <XCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span>Quên rồi ❌</span>
            <span className="hidden sm:inline-block ml-auto text-xs font-mono opacity-75 bg-rose-700/40 px-2 py-0.5 rounded">
              Phím 1 / ←
            </span>
          </button>

          {/* Remember Button -> sends 'remember' */}
          <button
            type="button"
            disabled={isReviewing}
            onClick={(e) => handleReviewAction('remember', e)}
            className="w-full sm:w-1/2 group relative flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-bold text-base bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span>Đã nhớ ✨</span>
            <span className="hidden sm:inline-block ml-auto text-xs font-mono opacity-75 bg-emerald-700/40 px-2 py-0.5 rounded">
              Phím 2 / →
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
