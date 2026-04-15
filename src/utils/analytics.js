/**
 * Analytics Utilities
 * Helpers to process task data for charts and stats.
 */

/**
 * Groups tasks by completion date for the last 7 days.
 * returns array formatted for Recharts: [{ date: 'Apr 10', count: 5 }, ...]
 */
export function getWeeklyCompletionData(tasks) {
  const data = [];
  const now = new Date();
  
  // Initialize last 7 days with 0
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    data.push({ 
      date: dateStr, 
      count: 0,
      fullDate: d.toDateString() // Helper for comparison
    });
  }

  // Count matches
  tasks.forEach(task => {
    if (task.completed && task.completedAt) {
      const compDate = new Date(task.completedAt).toDateString();
      const dayData = data.find(d => d.fullDate === compDate);
      if (dayData) dayData.count++;
    }
  });

  return data;
}

/**
 * Calculates current day stats
 */
export function getDailyStats(tasks) {
  const today = new Date().toDateString();
  const completedToday = tasks.filter(t => 
    t.completed && t.completedAt && new Date(t.completedAt).toDateString() === today
  ).length;

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completedToday, total, completed, pending, percentage };
}
