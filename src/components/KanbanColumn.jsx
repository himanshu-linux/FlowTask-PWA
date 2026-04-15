import { useState, useRef, useEffect } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { useTask } from '../context/TaskContext';
import { Plus, MoreHorizontal, X, Check, Sparkles } from 'lucide-react';
import { aiService } from '../services/aiService';
import { SkeletonCard } from './common/SkeletonCards';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function KanbanColumn({ id, title, tasks, color, isLoading, onOpenDetails, onOpenShare }) {
  const { addTask } = useTask();
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleQuickAdd = async () => {
    if (!newValue.trim()) {
      setIsAdding(false);
      return;
    }

    try {
      await addTask({
        text: aiAnalysis?.title || newValue.trim(),
        status: id,
        completed: id === 'completed',
        priority: aiAnalysis?.priority || 'Medium',
        date: aiAnalysis?.date || null,
        time: aiAnalysis?.time || null,
      });
      setNewValue('');
      setAiAnalysis(null);
      setIsAdding(false);
    } catch {
      toast.error('Failed to add task');
    }
  };

  const onInputChange = (val) => {
    setNewValue(val);
    const analysis = aiService.analyze(val);
    setAiAnalysis(analysis.hasAI ? analysis : null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleQuickAdd();
    if (e.key === 'Escape') {
      setIsAdding(false);
      setNewValue('');
      setAiAnalysis(null);
    }
  };

  return (
    <div className="kanban-column group">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          <h3 className="font-bold text-sm text-textMain uppercase tracking-wider">{title}</h3>
          <span className="bg-surface border border-border text-[10px] font-bold text-textMuted px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button className="text-textMuted hover:text-textMain transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Task List (Droppable Zone) */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[150px] transition-all duration-200 rounded-xl ${
              snapshot.isDraggingOver ? 'bg-primary/5 ring-2 ring-primary/10' : ''
            }`}
          >
            {isLoading ? (
              <div className="space-y-3">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : (
              <AnimatePresence mode="popLayout" initial={false}>
                {tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(p, s) => (
                      <div
                        ref={p.innerRef}
                        {...p.draggableProps}
                        {...p.dragHandleProps}
                        className={s.isDragging ? 'dragging' : ''}
                      >
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <TaskCard 
                            task={task} 
                            index={index} 
                            onOpenDetails={onOpenDetails}
                            onOpenShare={onOpenShare}
                          />
                        </motion.div>
                      </div>
                    )}
                  </Draggable>
                ))}
              </AnimatePresence>
            )}
            {provided.placeholder}
            
            {!isLoading && tasks.length === 0 && !snapshot.isDraggingOver && !isAdding && (
              <div className="h-24 border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-textMuted gap-2">
                <div className="w-8 h-8 rounded-full bg-surfaceMuted flex items-center justify-center">
                  <Plus className="w-4 h-4 text-textMuted" />
                </div>
                <span className="text-[11px] font-medium tracking-wide">No tasks here</span>
              </div>
            )}
          </div>
        )}
      </Droppable>

      {/* Column Footer */}
      <div className="mt-4">
        {isAdding ? (
          <div className="animate-slide-in">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={newValue}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What needs to be done?"
                className="w-full bg-surface border border-primary rounded-xl px-3 py-2 text-sm text-textMain focus:outline-none shadow-lg mb-2 pr-10"
              />
              {aiAnalysis && (
                <Sparkles className="absolute right-3 top-2.5 w-4 h-4 text-primary animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleQuickAdd}
                className="bg-primary text-white p-1.5 rounded-lg hover:bg-primaryHover transition-all shadow-sm"
              >
                <Check className="w-4 h-4" />
              </button>
              <button 
                onClick={() => { setIsAdding(false); setNewValue(''); setAiAnalysis(null); }}
                className="text-textMuted hover:text-textMain p-1.5 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-textMuted ml-auto">Press Enter to save</span>
            </div>
          </div>
        ) : (
          !isLoading && (
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 text-xs font-bold text-textSecondary hover:text-primary transition-colors py-2 px-1 w-full"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          )
        )}
      </div>
    </div>
  );
}
