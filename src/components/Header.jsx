import { useTask } from '../context/TaskContext';

export default function Header() {
  const { activeCount, completedCount } = useTask();
  const totalCount = activeCount + completedCount;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <header className="mb-10 pt-10">
      <div className="mb-6">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-textMain tracking-tight leading-tight">
          Get things{' '}
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            done.
          </span>
        </h2>
        <p className="text-textSecondary mt-3 text-base font-normal max-w-md">
          Organize your tasks, stay focused, and make progress every day.
        </p>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="flex items-center gap-4 bg-surface border border-border rounded-2xl px-5 py-4 shadow-xs animate-fade-in">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-medium text-textSecondary mb-2">
              <span>Your progress for today</span>
              <span className="text-primary font-semibold">{progress}%</span>
            </div>
            <div className="h-2 bg-surfaceMuted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="h-10 w-px bg-border mx-2" />
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-textMain leading-none">{activeCount}</span>
            <span className="text-[10px] font-bold text-textMuted uppercase tracking-tighter mt-1">
              {activeCount === 1 ? 'task' : 'tasks'} left
            </span>
          </div>
          <div className="flex flex-col items-center ml-2">
            <span className="text-xl font-bold text-success leading-none">{completedCount}</span>
            <span className="text-[10px] font-bold text-textMuted uppercase tracking-tighter mt-1">
              done
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
