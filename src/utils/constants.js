// Priority config (color + label)
export const PRIORITIES = {
  Low:    { label: 'Low',    color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', dot: 'bg-emerald-500' },
  Medium: { label: 'Medium', color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-200 dark:border-amber-500/20',   dot: 'bg-amber-500' },
  High:   { label: 'High',   color: 'text-red-600 dark:text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-200 dark:border-red-500/20',     dot: 'bg-red-500' },
};

// Category config (color + icon)
export const CATEGORIES = {
  Work:     { label: 'Work',     color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-200 dark:border-blue-500/20',   icon: '💼' },
  Personal: { label: 'Personal', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-200 dark:border-purple-500/20', icon: '🏠' },
  Study:    { label: 'Study',    color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/20', icon: '📚' },
};

export const PRIORITY_LIST  = ['Low', 'Medium', 'High'];
export const CATEGORY_LIST  = ['Work', 'Personal', 'Study'];
export const STATUS_FILTERS = ['All', 'Active', 'Completed'];

/** Format an ISO date string to a readable label like "Today", "Tomorrow", "Apr 20" */
export function formatDueDate(dateStr) {
  if (!dateStr) return null;
  const due  = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (due.toDateString() === today.toDateString())    return { label: 'Today',    overdue: false, soon: true };
  if (due.toDateString() === tomorrow.toDateString()) return { label: 'Tomorrow', overdue: false, soon: true };
  if (due < today) {
    return {
      label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      overdue: true,
      soon: false,
    };
  }
  return {
    label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    overdue: false,
    soon: false,
  };
}
