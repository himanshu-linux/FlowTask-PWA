import { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { useTask } from '../context/TaskContext';
import KanbanColumn from './KanbanColumn';
import { SkeletonCard } from './common/SkeletonCards';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ShareModal from './ShareModal';
import TaskDetailModal from './TaskDetailModal';

export default function KanbanBoard() {
  const { filteredTasks, moveTask, state: { loading } } = useTask();
  const [shareTask, setShareTask] = useState(null);
  const [detailsTask, setDetailsTask] = useState(null);

  // Column definitions
  const COLUMNS = [
    { id: 'todo', title: 'To Do', color: 'bg-primary' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-amber-500' },
    { id: 'completed', title: 'Completed', color: 'bg-emerald-500' },
  ];

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    try {
      await moveTask(draggableId, destination.droppableId, destination.index);
    } catch (err) {
      toast.error('Failed to move task');
    }
  };

  // Group tasks by status
  const tasksByStatus = {
    'todo': filteredTasks.filter(t => (t.status === 'todo' || (!t.status && !t.completed))),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    'completed': filteredTasks.filter(t => (t.status === 'completed' || t.completed)),
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "circOut" }}
      className="mt-8"
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              color={col.color}
              tasks={tasksByStatus[col.id].sort((a, b) => (a.order || 0) - (b.order || 0))}
              isLoading={loading}
              onOpenDetails={setDetailsTask}
              onOpenShare={setShareTask}
            />
          ))}
        </div>
      </DragDropContext>

      {/* Collaboration Modals */}
      <ShareModal 
        isOpen={!!shareTask} 
        onClose={() => setShareTask(null)} 
        taskId={shareTask?.id}
        taskText={shareTask?.text}
      />
      
      <TaskDetailModal
        isOpen={!!detailsTask}
        onClose={() => setDetailsTask(null)}
        task={detailsTask}
      />
    </motion.div>
  );
}
