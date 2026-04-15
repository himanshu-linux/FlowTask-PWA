import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import TaskInput from './TaskInput';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';

// Defer KanbanBoard + @hello-pangea/dnd until after first paint
const KanbanBoard = lazy(() => import('./KanbanBoard'));

const pageVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
  transition: { duration: 0.3, ease: 'easeInOut' }
};

function BoardFallback() {
  return (
    <div className="mt-8 grid gap-5" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))' }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-surfaceMuted/50 border border-border/50 rounded-2xl p-4 min-h-[350px] animate-pulse" />
      ))}
    </div>
  );
}

export default function TaskListView() {
  return (
    <motion.div {...pageVariants} className="w-full">
      <div className="max-w-2xl mx-auto">
        <Header />
        <TaskInput />
        <SearchBar />
        <FilterBar />
      </div>
      {/* KanbanBoard + DnD lazy-loaded after above content paints */}
      <Suspense fallback={<BoardFallback />}>
        <KanbanBoard />
      </Suspense>
      <footer className="mt-16 text-center text-xs text-textMuted">
        <p>FlowTask — Visualize your productivity.</p>
      </footer>
    </motion.div>
  );
}
