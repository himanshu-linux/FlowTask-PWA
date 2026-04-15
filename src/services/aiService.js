// Dynamic import of chrono-node — only fetched when user types, not on app startup
let chronoPromise = null;
function getChrono() {
  if (!chronoPromise) {
    chronoPromise = import('chrono-node');
  }
  return chronoPromise;
}

const PRIORITY_KEYWORDS = {
  High: ['urgent', 'asap', 'deadline', 'important', 'must', 'immediately', 'boss', 'client', 'priority', 'critical', 'fix'],
  Low: ['maybe', 'eventually', 'later', 'someday', 'optional', 'read', 'watch', 'whenever', 'fun'],
};

/**
 * AI Intent Parser
 * Parses natural language to extract dates, times, and priority.
 * chrono-node is lazy-loaded to keep initial bundle size small.
 */
export const aiService = {
  /**
   * Predicts priority based on keywords in the text.
   */
  predictPriority: (text) => {
    const lower = text.toLowerCase();
    if (PRIORITY_KEYWORDS.High.some(word => lower.includes(word))) return 'High';
    if (PRIORITY_KEYWORDS.Low.some(word => lower.includes(word))) return 'Low';
    return 'Medium';
  },

  /**
   * Extracts dates and times using chrono-node (lazy-loaded).
   * Returns { cleanedText, dueDate, dueTime }
   */
  parseDateTime: async (text) => {
    const chrono = await getChrono();
    const results = chrono.parse(text);

    if (results.length === 0) {
      return { cleanedText: text, dueDate: null, dueTime: null };
    }

    const firstResult = results[0];
    const date = firstResult.start.date();

    const dueDate = date.toISOString().split('T')[0];
    const dueTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    const cleanedText = text.replace(firstResult.text, '').replace(/\s\s+/g, ' ').trim();

    return {
      cleanedText,
      dueDate,
      dueTime,
      hasTime: firstResult.start.isSpecified('hour')
    };
  },

  /**
   * Full Intent Analysis (async due to lazy-loaded chrono)
   */
  analyze: async (text) => {
    if (!text.trim()) return null;

    const { cleanedText, dueDate, dueTime, hasTime } = await aiService.parseDateTime(text);
    const priority = aiService.predictPriority(text);

    return {
      title: cleanedText,
      priority,
      dueDate,
      dueTime: hasTime ? dueTime : null
    };
  }
};
