import { useState, useEffect, useCallback } from 'react';
import { useTask } from '../context/TaskContext';
import { PRIORITY_LIST, CATEGORY_LIST, PRIORITIES, CATEGORIES } from '../utils/constants';
import { aiService } from '../services/aiService';
import toast from 'react-hot-toast';
import { Sparkles } from 'lucide-react';

const DEFAULT_FORM = { priority: 'Medium', category: '', dueDate: '', dueTime: '' };

export default function TaskInput() {
  const { addTask } = useTask();
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  // AI Processing Logic (Debounced)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (text.trim().length > 3) {
        const analysis = await aiService.analyze(text);
        if (analysis) {
          setAiSuggestions(analysis);
          setForm(f => ({
            ...f,
            priority: analysis.priority || f.priority,
            dueDate: analysis.dueDate || f.dueDate,
            dueTime: analysis.dueTime || f.dueTime,
          }));
        }
      } else {
        setAiSuggestions(null);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [text]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    // Use AI cleaned title if available, else use raw text
    const finalTitle = aiSuggestions?.title || text.trim();

    try {
      await addTask({
        text: finalTitle,
        completed: false,
        priority: form.priority,
        category: form.category || null,
        dueDate: form.dueDate || null,
        dueTime: form.dueTime || null,
      });
      
      if (aiSuggestions?.dueDate || aiSuggestions?.priority !== 'Medium') {
        toast.success(`AI enhanced: "${finalTitle}"`, { icon: '✨' });
      } else {
        toast.success('Task added');
      }

      setText('');
      setForm(DEFAULT_FORM);
      setShowAdvanced(false);
      setAiSuggestions(null);
    } catch (err) {
      toast.error('Failed to add task');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      {/* Main input row */}
      <div className={`relative flex items-center bg-surface border rounded-2xl transition-all duration-200 overflow-hidden shadow-sm ${
        focused ? 'border-primary ring-2 ring-primary/10' : 'border-border hover:border-borderHover'
      }`}>
        <div className="pl-4 pr-3 flex-shrink-0">
          {aiSuggestions ? (
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          ) : (
            <svg
              className={`w-5 h-5 transition-colors duration-200 ${focused ? 'text-primary' : 'text-textMuted'}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </div>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => { setFocused(true); setShowAdvanced(true); }}
          onBlur={() => setFocused(false)}
          placeholder="Try 'Meeting tomorrow at 5pm'..."
          className="flex-1 bg-transparent py-4 text-textMain placeholder-textMuted text-[15px] font-medium focus:outline-none min-w-0"
        />

        {aiSuggestions && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-primary/5 border-l border-border animate-fade-in">
             <span className="text-[10px] font-bold text-primary uppercase">AI Prediction</span>
          </div>
        )}

        <div className={`pr-2 transition-all duration-200 flex-shrink-0 ${text.trim() ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button
            type="submit"
            className="bg-primary hover:bg-primaryHover text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-150 active:scale-95 shadow-sm whitespace-nowrap"
          >
            Add task
          </button>
        </div>
      </div>

      {/* Advanced options panel */}
      {showAdvanced && (
        <div className="mt-2 bg-surface border border-border rounded-2xl p-4 shadow-sm animate-slide-in">
          {/* Priority row */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider">
                Priority
              </label>
              {aiSuggestions?.priority && (
                <span className="text-[9px] font-bold text-primary italic">AI Suggested</span>
              )}
            </div>
            <div className="flex gap-2">
              {PRIORITY_LIST.map(p => {
                const cfg = PRIORITIES[p];
                const active = form.priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, priority: p }))}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                      active
                        ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-sm`
                        : 'bg-surfaceMuted text-textMuted border-transparent hover:border-border hover:text-textSecondary'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category row */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORY_LIST.map(c => {
                const cfg = CATEGORIES[c];
                const active = form.category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: active ? '' : c }))}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                      active
                        ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-sm`
                        : 'bg-surfaceMuted text-textMuted border-transparent hover:border-border hover:text-textSecondary'
                    }`}
                  >
                    <span>{cfg.icon}</span>
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date & Time row */}
          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider">
                  Due Date
                </label>
                {aiSuggestions?.dueDate && (
                  <span className="text-[9px] font-bold text-primary italic">AI Set</span>
                )}
              </div>
              <input
                type="date"
                value={form.dueDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="w-full bg-surfaceMuted border border-border rounded-xl px-3 py-2 text-[13px] text-textMain focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider">
                  Due Time
                </label>
                {aiSuggestions?.dueTime && (
                  <span className="text-[9px] font-bold text-primary italic">AI Set</span>
                )}
              </div>
              <input
                type="time"
                value={form.dueTime}
                onChange={(e) => setForm(f => ({ ...f, dueTime: e.target.value }))}
                className="w-full bg-surfaceMuted border border-border rounded-xl px-3 py-2 text-[13px] text-textMain focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all text-center"
              />
            </div>
          </div>

          {/* Collapse */}
          <div className="flex justify-end pt-1 border-t border-border">
            <button
              type="button"
              onClick={() => setShowAdvanced(false)}
              className="text-xs text-textMuted hover:text-textSecondary transition-colors"
            >
              Collapse ↑
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
