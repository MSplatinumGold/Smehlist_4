import React, { useState, useEffect } from 'react';
import { PromptItem, PromptTag, PromptType } from '../types/game.ts';
import { X, Plus, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PromptManagerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterTag, setFilterTag] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');

  // New prompt form state
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState<PromptType>('STANDARD');
  const [newTag, setNewTag] = useState<PromptTag>('STANDARD');
  const [submitting, setSubmitting] = useState(false);

  // AI Gen state
  const [aiTag, setAiTag] = useState<PromptTag>('STANDARD');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/prompts');
      if (res.ok) {
        const data = await res.json();
        setPrompts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPrompts();
    }
  }, [isOpen]);

  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newText.trim(), type: newType, tag: newTag }),
      });
      if (res.ok) {
        setNewText('');
        fetchPrompts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateAi = async () => {
    try {
      setAiGenerating(true);
      setAiSuccessMsg('');
      const res = await fetch('/api/prompts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: aiTag, count: 3 }),
      });
      const data = await res.json();
      if (res.ok && data.prompts) {
        setAiSuccessMsg(`Добавлено ${data.prompts.length} новых вопросов от ИИ!`);
        fetchPrompts();
      } else {
        alert(data.error || 'Не удалось сгенерировать вопросы');
      }
    } catch {
      alert('Ошибка при вызове ИИ генератора');
    } finally {
      setAiGenerating(false);
    }
  };

  if (!isOpen) return null;

  const filtered = prompts.filter((p) => {
    if (filterTag !== 'ALL' && p.tag !== filterTag) return false;
    if (filterType !== 'ALL' && p.type !== filterType) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#151932] border border-indigo-500/30 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-indigo-500/20">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              База вопросов и заданий MEHLIST
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                {prompts.length} карточек
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Включает прикреплённый список вопросов, расширенный банк и генерацию новых
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick AI & Add Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Manual Form */}
            <form onSubmit={handleCreatePrompt} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-yellow-400" /> Своя карточка
              </span>
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Текст вопроса или завязка шутки..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
              <div className="flex items-center gap-2">
                <select
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value as PromptTag)}
                  className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-300"
                >
                  <option value="STANDARD">STANDARD (Обычный)</option>
                  <option value="18+">18+ (Для взрослых)</option>
                  <option value="FAMILY">FAMILY (Семейный)</option>
                </select>

                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as PromptType)}
                  className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-300"
                >
                  <option value="STANDARD">Обычный (1 панчлайн)</option>
                  <option value="THRIP">THRIP («3 вещи»)</option>
                </select>

                <button
                  type="submit"
                  disabled={submitting || !newText.trim()}
                  className="ml-auto px-4 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? '...' : 'Добавить'}
                </button>
              </div>
            </form>

            {/* AI Generator */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/20 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> ИИ Генератор новых вопросов
              </span>
              <p className="text-xs text-slate-300">
                Использует Gemini для генерации остроумных карточек в формате MEHLIST.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <select
                  value={aiTag}
                  onChange={(e) => setAiTag(e.target.value as PromptTag)}
                  className="bg-slate-900 border border-indigo-500/40 text-xs rounded-lg px-2.5 py-1.5 text-indigo-200"
                >
                  <option value="STANDARD">Тег: STANDARD</option>
                  <option value="18+">Тег: 18+</option>
                  <option value="FAMILY">Тег: FAMILY</option>
                </select>

                <button
                  type="button"
                  onClick={handleGenerateAi}
                  disabled={aiGenerating}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  {aiGenerating ? 'Генерация...' : 'Создать 3 вопроса'}
                </button>
              </div>
              {aiSuccessMsg && (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {aiSuccessMsg}
                </p>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Тег:</span>
              {(['ALL', 'STANDARD', '18+', 'FAMILY'] as const).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    filterTag === tag
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Тип:</span>
              {(['ALL', 'STANDARD', 'THRIP'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    filterType === t
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Cards Grid */}
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">Загрузка базы...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between gap-2 hover:border-slate-700 transition-colors"
                >
                  <p className="text-sm font-medium text-slate-200 leading-snug">
                    <span className="text-slate-600 font-mono text-xs mr-2">
                      #{idx + 1}
                    </span>
                    {item.text}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/50">
                    <span
                      className={`font-bold ${
                        item.tag === '18+'
                          ? 'text-rose-400'
                          : item.tag === 'FAMILY'
                          ? 'text-emerald-400'
                          : 'text-sky-400'
                      }`}
                    >
                      {item.tag}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400 font-mono">
                      {item.type === 'THRIP' ? '«3 вещи» (THRIP)' : 'STANDARD'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-indigo-500/20 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Показано: {filtered.length} из {prompts.length} заданий</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
