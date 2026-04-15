import { useState, useRef, useEffect, useMemo } from 'react';
import { useTask } from '../context/TaskContext';
import { PRIORITIES, CATEGORIES, formatDueDate } from '../utils/constants';
import toast from 'react-hot-toast';

export default function TaskItem({ task, index, onDragStart, onDragOver, onDrop, onDragEnd, isDragging }) {
  const { toggleTask, editTask, deleteTask } = useTask();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.text);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const [showConfirm, setShowConfirm] = useState(false);

  // Auto-hide confirmation after 3 seconds
  useEffect(() => {
    let timer;
    if (showConfirm) {
      timer = setTimeout(() => setShowConfirm(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [showConfirm]);

  const handleEditSubmit = async () => {
    if (editValue.trim() && editValue !== task.text) {
      try {
        await editTask(task.id, { text: editValue.trim() });
        toast.success('Task updated');
      } catch (err) {
        toast.error('Update failed');
      }
    } else {
      setEditValue(task.text);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (showConfirm) {
      try {
        await deleteTask(task.id);
        toast.success('Task removed');
      } catch (err) {
        toast.error('Deletion failed');
      }
    } else {
      setShowConfirm(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleEditSubmit();
    if (e.key === 'Escape') { setEditValue(task.text); setIsEditing(false); }
  };

  const priorityCfg  = PRIORITIES[task.priority] || PRIORITIES.Medium;
  const categoryCfg  = task.category ? CATEGORIES[task.category] : null;
  const dueDateInfo  = formatDueDate(task.dueDate);

  // Detailed Overdue Logic (Date + Time)
  const isOverdue = useMemo(() => {
    if (!task.dueDate || task.completed) return false;
    const now = new Date();
    const [year, month, day] = task.dueDate.split('-');
    const [hours, minutes] = (task.dueTime || '23:59').split(':');
    const dueDateTime = new Date(year, month - 1, day, hours, minutes);
    return now > dueDateTime;
  }, [task.dueDate, task.dueTime, task.completed]);

  return (
    <li
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e)  => onDragOver(e, index)}
      onDrop={(e)      => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={`task-card group flex items-start gap-3 animate-task-appear transition-all duration-300 select-none ${
        isDragging ? 'opacity-40 scale-[0.98]' : ''
      } ${task.completed ? 'opacity-60' : ''} ${isOverdue ? 'border-danger/20 bg-danger/5 shadow-danger/5' : ''}`}
    >
      {/* Overdue Indicator */}
      {isOverdue && (
        <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center animate-pulse">
           <span className="w-2 h-2 rounded-full bg-danger shadow-sm"></span>
        </div>
      )}

      {/* Drag handle */}
      <div className="mt-1 cursor-grab active:cursor-grabbing text-textMuted opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 100 4 2 2 0 000-4zM7 8a2 2 0 100 4 2 2 0 000-4zM7 14a2 2 0 100 4 2 2 0 000-4zM13 2a2 2 0 100 4 2 2 0 000-4zM13 8a2 2 0 100 4 2 2 0 000-4zM13 14a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
      </div>

      {/* Checkbox */}
      <button
        onClick={() => toggleTask(task.id)}
        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        className={`mt-1 w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          task.completed
            ? 'bg-primary border-primary text-white scale-110'
            : isOverdue 
              ? 'border-danger/40 hover:border-danger bg-danger/5' 
              : 'border-border hover:border-primary bg-background'
        }`}
      >
        {task.completed && (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditSubmit}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-surfaceMuted border-b border-primary text-[15px] font-medium py-0.5 focus:outline-none text-textMain"
            />
          ) : (
            <span
              onClick={() => setIsEditing(true)}
              className={`text-[15px] font-medium transition-all duration-200 truncate cursor-text ${
                task.completed ? 'text-textMuted line-through' : isOverdue ? 'text-danger break-words font-semibold' : 'text-textMain'
              }`}
            >
              {task.text}
            </span>
          )}
        </div>

        {/* Badges/Meta */}
        <div className="flex flex-wrap items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
          {/* Priority */}
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${priorityCfg.bg} ${priorityCfg.color} ${priorityCfg.border}`}>
            <span className={`w-1 h-1 rounded-full ${priorityCfg.dot}`} />
            {task.priority}
          </span>

          {/* Category */}
          {categoryCfg && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${categoryCfg.bg} ${categoryCfg.color} ${categoryCfg.border}`}>
              <span>{categoryCfg.icon}</span>
              {task.category}
            </span>
          )}

          {/* Due Date & Time */}
          {dueDateInfo && (
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide transition-colors ${
              task.completed 
                ? 'bg-surfaceMuted text-textMuted border-transparent' 
                : isOverdue 
                  ? 'bg-danger text-white border-danger shadow-sm animate-pulse' 
                  : 'bg-surfaceMuted text-textSecondary border-border'
            }`}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
              </svg>
              {dueDateInfo.label} {task.dueTime && `@ ${task.dueTime}`}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {!isEditing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
          {!task.completed && (
            <button
              onClick={() => setIsEditing(true)}
              className="icon-btn text-textMuted hover:text-primary hover:bg-primaryLight"
              aria-label="Edit task"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}

          <button
            onClick={handleDelete}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1.5 rounded-xl transition-all duration-200 ${
              showConfirm
                ? 'bg-danger text-white hover:bg-dangerHover animate-pulse'
                : 'text-textMuted hover:text-danger hover:bg-dangerLight'
            }`}
            aria-label={showConfirm ? "Confirm delete" : "Delete task"}
          >
            {showConfirm ? (
              <>Confirm?</>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      )}
    </li>
  );
}
