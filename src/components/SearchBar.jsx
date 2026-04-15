import { useTask } from '../context/TaskContext';

export default function SearchBar() {
  const { state, dispatch, actions } = useTask();

  return (
    <div className="relative mb-4">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <svg className="w-4 h-4 text-textMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={state.searchQuery}
        onChange={(e) => dispatch(actions.setSearchQuery(e.target.value))}
        placeholder="Search tasks..."
        className="w-full bg-surface border border-border rounded-xl pl-11 pr-10 py-3 text-[14px] text-textMain placeholder-textMuted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 shadow-xs"
      />
      {state.searchQuery && (
        <button
          onClick={() => dispatch(actions.setSearchQuery(''))}
          className="absolute inset-y-0 right-3 flex items-center text-textMuted hover:text-textMain transition-colors"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
