import { useTask } from '../context/TaskContext';
import { STATUS_FILTERS, PRIORITY_LIST, CATEGORY_LIST, PRIORITIES, CATEGORIES } from '../utils/constants';
import toast from 'react-hot-toast';

export default function FilterBar() {
  const { state, dispatch, completedCount, activeCount, clearCompleted, actions: taskActions } = useTask();
  const totalCount = activeCount + completedCount;

  if (totalCount === 0) return null;

  const handleClearCompleted = async () => {
    if (window.confirm(`Are you sure you want to clear all ${completedCount} completed tasks?`)) {
      try {
        await clearCompleted();
        toast.success('Cleared completed tasks');
      } catch (err) {
        toast.error('Failed to clear tasks');
      }
    }
  };

  return (
    <div className="mb-5 space-y-3 animate-fade-in">
      {/* Row 1: Status + Clear completed */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-surfaceMuted p-1 rounded-xl border border-border">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => dispatch(taskActions.setStatusFilter(f))}
              className={`filter-btn ${state.statusFilter === f ? 'filter-btn-active' : 'filter-btn-inactive'}`}
            >
              {f}
              {f === 'Active' && activeCount > 0 && (
                <span className={`ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  state.statusFilter === 'Active' ? 'bg-white/25 text-white' : 'bg-border/80 text-textSecondary'
                }`}>{activeCount}</span>
              )}
            </button>
          ))}
        </div>

        {completedCount > 0 && (
          <button
            onClick={handleClearCompleted}
            className="text-xs font-medium text-textMuted hover:text-danger transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear completed ({completedCount})
          </button>
        )}
      </div>

      {/* Row 2: Priority + Category filters */}
      <div className="flex items-center gap-2" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: 4 }}>
        {/* Priority */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-textMuted uppercase tracking-wide">Priority</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => dispatch(taskActions.setPriorityFilter('All'))}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                state.priorityFilter === 'All'
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-surface text-textSecondary border-border hover:border-borderHover'
              }`}
            >All</button>
            {PRIORITY_LIST.map(p => {
              const cfg = PRIORITIES[p];
              const active = state.priorityFilter === p;
              return (
                <button
                  key={p}
                  onClick={() => dispatch(taskActions.setPriorityFilter(p))}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    active ? `${cfg.bg} ${cfg.color} ${cfg.border}` : 'bg-surface text-textSecondary border-border hover:border-borderHover'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Category */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-textMuted uppercase tracking-wide">Tag</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => dispatch(taskActions.setCategoryFilter('All'))}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                state.categoryFilter === 'All'
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-surface text-textSecondary border-border hover:border-borderHover'
              }`}
            >All</button>
            {CATEGORY_LIST.map(c => {
              const cfg = CATEGORIES[c];
              const active = state.categoryFilter === c;
              return (
                <button
                  key={c}
                  onClick={() => dispatch(taskActions.setCategoryFilter(c))}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    active ? `${cfg.bg} ${cfg.color} ${cfg.border}` : 'bg-surface text-textSecondary border-border hover:border-borderHover'
                  }`}
                >
                  <span>{cfg.icon}</span>
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
