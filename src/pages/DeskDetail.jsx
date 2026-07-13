import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Plus,
  Play,
  Volume2,
  Trash2,
  Loader2,
  AlertCircle,
  BookOpen,
  Sparkles
} from 'lucide-react';

export default function DeskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal create card
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [word, setWord] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [type, setType] = useState('noun');
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');
  const [exampleMeaning, setExampleMeaning] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Trạng thái cho tính năng Điền nhanh bằng AI (AI Auto-fill)
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Hàm gọi API /api/card/ai-generate tự động điền các trường còn lại trên Modal
  const handleAiAutoFill = async () => {
    setAiError(null);
    if (!word.trim()) {
      setAiError('Vui lòng nhập Từ Vựng trước khi dùng tính năng điền nhanh bằng AI ✨');
      return;
    }

    try {
      setIsAiLoading(true);
      const response = await axios.post('/api/card/ai-generate', {
        word: word.trim(),
        deskId: id,
      });

      const data = response.data.card || response.data;
      if (data) {
        if (data.phonetic) setPhonetic(data.phonetic);
        if (data.type) setType(data.type);
        if (data.meaning) setMeaning(data.meaning);
        if (data.example) setExample(data.example);
        if (data.exampleMeaning) setExampleMeaning(data.exampleMeaning);
      }
    } catch (err) {
      console.error('Error auto-filling with AI:', err);
      setAiError(
        err.response?.data?.message || 'Không thể tạo dữ liệu bằng AI. Vui lòng thử lại.'
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const fetchCards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`/api/card/desk/${id}`);
      // Handle both { card: [...] } or { cards: [...] }
      const cardList = response.data.card || response.data.cards || [];
      setCards(Array.isArray(cardList) ? cardList : []);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError('Không thể tải danh sách thẻ từ từ bộ thẻ này.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCards();
  }, [id]);

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!word.trim() || !meaning.trim()) return;

    try {
      setIsCreating(true);
      const response = await axios.post(`/api/card/create/${id}`, {
        word: word.trim(),
        phonetic: phonetic.trim() || '/.../',
        type: type.trim() || 'noun',
        meaning: meaning.trim(),
        example: example.trim() || 'No example provided',
        exampleMeaning: exampleMeaning.trim() || 'Chưa có bản dịch ví dụ',
      });
      const newCard = response.data.card;
      if (newCard) {
        setCards((prev) => [newCard, ...prev]);
      } else {
        await fetchCards();
      }
      setIsModalOpen(false);
      // Reset fields
      setWord('');
      setPhonetic('');
      setType('noun');
      setMeaning('');
      setExample('');
      setExampleMeaning('');
    } catch (err) {
      console.error('Error creating card:', err);
      alert(err.response?.data?.message || 'Không thể tạo thẻ từ vựng mới.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa từ này khỏi bộ thẻ?')) return;
    try {
      await axios.delete(`/api/card/delete/${cardId}`);
      setCards((prev) => prev.filter((c) => c._id !== cardId));
    } catch (err) {
      console.error('Error deleting card:', err);
      alert('Không thể xóa thẻ.');
    }
  };

  const playPronunciation = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách bộ thẻ</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <span>Quản Lý Thẻ Từ Vựng</span>
            <span className="text-sm font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {cards.length} từ
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm từ vựng mới</span>
          </button>

          <Link
            to={`/study/${id}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Học SRS Ngay</span>
          </Link>
        </div>
      </div>

      {/* State: Loading */}
      {isLoading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Đang tải danh sách thẻ từ vựng...
          </p>
        </div>
      )}

      {/* State: Empty */}
      {!isLoading && cards.length === 0 && (
        <div className="text-center py-16 px-6 rounded-3xl bg-white/50 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800">
          <BookOpen className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Bộ thẻ này hiện chưa có từ vựng
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
            Thêm từ vựng đầu tiên của bạn vào bộ thẻ để sẵn sàng ôn luyện với Spaced Repetition.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Thẻ Đầu Tiên</span>
          </button>
        </div>
      )}

      {/* List of Vocabulary Cards */}
      {!isLoading && cards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => (
            <div
              key={card._id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    {card.type || 'noun'}
                  </span>
                  <button
                    onClick={() => playPronunciation(card.word)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {card.word}
                  </h3>
                  {card.phonetic && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {card.phonetic}
                    </p>
                  )}
                </div>

                <p className="text-base font-semibold text-indigo-600 dark:text-indigo-400">
                  {card.meaning}
                </p>

                {card.example && (
                  <p className="text-xs italic text-slate-500 dark:text-slate-400 border-l-2 border-indigo-400/40 pl-2">
                    "{card.example}"
                  </p>
                )}
              </div>

              <button
                onClick={() => handleDeleteCard(card._id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Xóa từ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Card */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Thêm Từ Vựng Mới
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCard} className="space-y-4">
              {/* Thông báo lỗi nhẹ nhàng bằng màu Rose nếu chưa nhập từ vựng hoặc lỗi API AI */}
              {aiError && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Ô nhập Từ Vựng (Word) tích hợp nút Điền nhanh bằng AI ✨ */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                      Từ Vựng (Word) *
                    </label>
                    <span className="text-[11px] font-medium text-indigo-500 dark:text-indigo-400">
                      Gõ từ tiếng Anh rồi bấm nút AI bên phải 👉
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Exquisite"
                      value={word}
                      onChange={(e) => {
                        setWord(e.target.value);
                        if (aiError) setAiError(null);
                      }}
                      disabled={isAiLoading}
                      className="w-full pl-4 pr-44 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={handleAiAutoFill}
                      disabled={isAiLoading || isCreating}
                      title="Tự động điền đầy đủ phiên âm, loại từ, nghĩa và ví dụ bằng AI"
                      className="absolute right-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
                    >
                      {isAiLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>AI đang tạo...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          <span>Điền nhanh bằng AI ✨</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Phiên Âm */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                    Phiên Âm (Phonetic)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /ɪkˈskwɪz.ɪt/"
                    value={phonetic}
                    onChange={(e) => setPhonetic(e.target.value)}
                    disabled={isAiLoading}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  />
                </div>

                {/* Loại Từ */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                    Loại Từ (Type) *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    disabled={isAiLoading}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    <option value="noun">Danh từ (Noun)</option>
                    <option value="verb">Động từ (Verb)</option>
                    <option value="adj">Tính từ (Adjective)</option>
                    <option value="adv">Trạng từ (Adverb)</option>
                    <option value="phrase">Cụm từ (Phrase)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                  Nghĩa Tiếng Việt *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tuyệt đẹp, tinh tế"
                  value={meaning}
                  onChange={(e) => setMeaning(e.target.value)}
                  disabled={isAiLoading}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                  Câu Ví Dụ (Example)
                </label>
                <input
                  type="text"
                  placeholder="e.g. She wore an exquisite dress."
                  value={example}
                  onChange={(e) => setExample(e.target.value)}
                  disabled={isAiLoading}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                  Nghĩa Câu Ví Dụ
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cô ấy mặc một chiếc váy tuyệt đẹp."
                  value={exampleMeaning}
                  onChange={(e) => setExampleMeaning(e.target.value)}
                  disabled={isAiLoading}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
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
                  <span>Lưu Thẻ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
