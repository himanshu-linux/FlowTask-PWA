import { useRef, useState } from 'react';
import { useTask } from '../context/TaskContext';
import { actions } from '../utils/actionTypes';
import TaskItem from './TaskItem';

export default function TaskList() {
  const { filteredTasks, state, dispatch, reorderTasks } = useTask();
  const dragIndexRef = useRef(null);
  const [draggingIndex, setDraggingIndex] = useState(null);

  // ── Drag handlers ────────────────────────────────────────────────────────
  const handleDragStart = (e, index) => {
    dragIndexRef.current = index;
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const from = dragIndexRef.current;
    if (from === null || from === index) return;

    // Reorder within the *full* task list based on filtered positions
    const fullTasks = [...state.tasks];
    const fromId = filteredTasks[from]?.id;
    const toId   = filteredTasks[index]?.id;
    if (!fromId || !toId) return;

    const fromIdx = fullTasks.findIndex(t => t.id === fromId);
    const toIdx   = fullTasks.findIndex(t => t.id === toId);

    const updated = [...fullTasks];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);

    // Sync order to Firestore
    reorderTasks(updated);
    dragIndexRef.current = index;
    setDraggingIndex(index);
  };

  const handleDrop = (e) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDraggingIndex(null);
  };

  // ── Empty states ─────────────────────────────────────────────────────────
  if (filteredTasks.length === 0) {
    const { statusFilter, priorityFilter, categoryFilter, searchQuery } = state;
    let icon, title, sub;

    if (searchQuery) {
      icon = '🔍'; title = 'No results found';
      sub = `No tasks match "${searchQuery}". Try a different search.`;
    } else if (statusFilter === 'Completed') {
      icon = '🎯'; title = 'No completed tasks';
      sub = "Complete some tasks and they'll appear here.";
    } else if (statusFilter === 'Active') {
      icon = '🎉'; title = 'All done!';
      sub = 'You have no active tasks. Great work!';
    } else if (priorityFilter !== 'All' || categoryFilter !== 'All') {
      icon = '🔎'; title = 'No tasks match your filters';
      sub = 'Try adjusting your priority or category filters.';
    } else {
      icon = '✦'; title = 'No tasks yet';
      sub = 'Add your first task above to get started.';
    }

    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-task-appear">
        <div className="relative w-48 h-48 mb-6">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl" />
          <img
            src="/src/assets/empty_state.png"
            alt="No tasks"
            className="relative w-full h-full object-contain drop-shadow-xl"
          />
        </div>
        <h3 className="text-lg font-bold text-textMain mb-2">{title}</h3>
        <p className="text-sm text-textSecondary max-w-xs">{sub}</p>
        
        {!searchQuery && statusFilter === 'All' && priorityFilter === 'All' && categoryFilter === 'All' && (
           <div className="mt-8 flex flex-col items-center">
             <div className="w-1 h-12 bg-gradient-to-b from-primary/30 to-transparent rounded-full" />
             <p className="mt-2 text-xs font-semibold text-primary uppercase tracking-widest">Add your first task above</p>
           </div>
        )}
      </div>
    );
  }

  return (
    <ul className="space-y-2.5">
      {filteredTasks.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          index={index}
          isDragging={draggingIndex === index}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
        />
      ))}
    </ul>
  );
}
