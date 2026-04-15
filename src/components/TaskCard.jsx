import { useMemo, useState } from 'react';
import { useTask } from '../context/TaskContext';
import { PRIORITIES, CATEGORIES } from '../utils/constants';
import { 
  Calendar, MoreVertical, Trash2, CheckCircle2, 
  Circle, Clock, Share2, MessageSquare,
  Paperclip, Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function TaskCard({ task, onOpenDetails, onOpenShare }) {
  const { toggleTask, deleteTask, editTask } = useTask();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const priorityCfg = PRIORITIES[task.priority] || PRIORITIES.Medium;
  const categoryCfg = task.category ? CATEGORIES[task.category] : null;

  const isOverdue = useMemo(() => {
    if (!task.dueDate || task.status === 'completed') return false;
    const due = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }, [task.dueDate, task.status]);

  const handleUpdateText = async () => {
    if (editText.trim() === task.text) return setIsEditing(false);
    try {
      await editTask(task.id, { text: editText.trim() });
      setIsEditing(false);
      toast.success('Task updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      await deleteTask(task.id);
      toast.success('Task deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete task');
    }
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    toggleTask(task.id);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    onOpenShare(task);
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onOpenDetails(task)}
      className={`group glass-card p-4 mb-3 transition-all duration-200 select-none border-border/50 cursor-pointer ${
        task.status === 'completed' ? 'opacity-80' : ''
      }`}
    >
      {/* Header: Priority & Actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${priorityCfg.bg} ${priorityCfg.color} ${priorityCfg.border}`}>
            {task.priority}
          </span>
          {task.collaborators?.length > 1 && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-md">
              <Users className="w-3 h-3" />
              <span>{task.collaborators.length}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={handleShare}
            className="p-1 rounded-md text-textMuted hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
            title="Share Task"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }}
            className="p-1 rounded-md text-textMuted hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={handleDelete}
            className="p-1 rounded-md text-textMuted hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body: Text */}
      <div className="mb-3">
        {isEditing ? (
          <input
            autoFocus
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleUpdateText}
            onKeyDown={(e) => e.key === 'Enter' && handleUpdateText()}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-surfaceMuted border border-primary rounded-lg px-2 py-1 text-sm text-textMain focus:outline-none"
          />
        ) : (
          <p className={`text-[14px] leading-relaxed font-medium transition-all ${
            task.status === 'completed' ? 'text-textMuted line-through' : 'text-textMain'
          }`}>
            {task.text}
          </p>
        )}
      </div>

      {/* Footer: Metadata & Collaboration Badges */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border/40">
        {task.date && (
          <div className={`flex items-center gap-1 text-[10px] font-bold ${isOverdue ? 'text-danger' : 'text-textMuted'}`}>
            <Calendar className="w-3 h-3" />
            {new Date(task.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </div>
        )}
        
        {/* Interaction Stats */}
        {(task.commentsCount > 0) && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-textMuted">
            <MessageSquare className="w-3 h-3" />
            {task.commentsCount}
          </div>
        )}
        
        {task.files?.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-textMuted">
            <Paperclip className="w-3 h-3" />
            {task.files.length}
          </div>
        )}

        {categoryCfg && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-textMuted bg-surfaceMuted px-1.5 py-0.5 rounded-md">
            <span>{categoryCfg.icon}</span>
            {task.category}
          </div>
        )}
        
        <button 
          onClick={handleToggle}
          className="ml-auto flex items-center gap-1 hover:scale-125 transition-transform active:scale-95 p-1 rounded-full hover:bg-surfaceMuted"
          title={task.status === 'completed' ? 'Mark as todo' : 'Mark as completed'}
        >
           {task.status === 'completed' ? (
             <CheckCircle2 className="w-4 h-4 text-emerald-500" />
           ) : task.status === 'in-progress' ? (
             <Clock className="w-4 h-4 text-amber-500" />
           ) : (
             <Circle className="w-4 h-4 text-primary/30" />
           )}
        </button>
      </div>
    </motion.div>
  );
}

