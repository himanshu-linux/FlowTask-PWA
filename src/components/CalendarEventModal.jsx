import { useState } from 'react';
import { CATEGORIES, PRIORITIES } from '../utils/constants';
import toast from 'react-hot-toast';

export default function CalendarEventModal({ task, onClose, onToggle, onDelete, onEdit }) {
  const [editingDate, setEditingDate] = useState(false);
  const [newDate, setNewDate] = useState(task.dueDate || '');
  const [loading, setLoading] = useState(false);

  const catCfg = CATEGORIES[task.category] || { icon: '📌', label: task.category };
  const priCfg = PRIORITIES[task.priority] || { label: task.priority };

  const priorityColor = {
    High:   { bg: 'rgba(239,68,68,0.12)',   color: '#f87171',  border: 'rgba(239,68,68,0.3)' },
    Medium: { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24',  border: 'rgba(251,191,36,0.3)' },
    Low:    { bg: 'rgba(16,185,129,0.12)',  color: '#34d399',  border: 'rgba(16,185,129,0.3)' },
  }[task.priority] || { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)' };

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onToggle(task.id);
      toast.success(task.completed ? 'Task reopened!' : 'Task completed! 🎉');
    } catch { toast.error('Failed to update task'); }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    setLoading(true);
    try {
      await onDelete(task.id);
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete'); }
    setLoading(false);
  };

  const handleDateSave = async () => {
    if (!newDate) return;
    setLoading(true);
    try {
      await onEdit(task.id, { dueDate: newDate });
      toast.success('Due date updated!');
      setEditingDate(false);
    } catch { toast.error('Failed to update date'); }
    setLoading(false);
  };

  const formattedDate = task.dueDate
    ? (() => {
        const [y, m, d] = task.dueDate.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
        });
      })()
    : 'No due date set';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000, cursor: 'pointer',
        }}
      />

      {/* Modal card */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
        border: '1px solid rgba(99,102,241,0.35)',
        borderRadius: 22, padding: '28px 24px',
        width: 'min(92vw, 440px)',
        zIndex: 1001,
        boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 40px rgba(99,102,241,0.08)',
        animation: 'modal-pop 0.22s cubic-bezier(0.16,1,0.3,1) forwards',
      }}>

        {/* Category badge + close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 20, padding: '4px 12px',
            fontSize: 11, fontWeight: 700, color: '#818cf8', letterSpacing: '0.06em',
          }}>
            {catCfg.icon} {task.category || 'Task'}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(51,65,85,0.6)',
              borderRadius: 10, width: 32, height: 32, color: '#64748b',
              cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >✕</button>
        </div>

        {/* Task title */}
        <h2 style={{
          fontSize: 20, fontWeight: 800, color: '#f1f5f9',
          lineHeight: 1.35, marginBottom: 18,
          wordBreak: 'break-word',
        }}>
          {task.text}
        </h2>

        {/* Status + priority badges */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <span style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: task.completed ? 'rgba(16,185,129,0.12)' : 'rgba(251,191,36,0.12)',
            color: task.completed ? '#34d399' : '#fbbf24',
            border: `1px solid ${task.completed ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`,
          }}>
            {task.completed ? '✅ Completed' : '⏳ Active'}
          </span>
          <span style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: priorityColor.bg, color: priorityColor.color,
            border: `1px solid ${priorityColor.border}`,
          }}>
            {task.priority || 'No'} Priority
          </span>
          {task.status && task.status !== 'todo' && (
            <span style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: 'rgba(6,182,212,0.12)', color: '#22d3ee',
              border: '1px solid rgba(6,182,212,0.25)',
            }}>
              {task.status === 'inprogress' ? '🔄 In Progress' : task.status}
            </span>
          )}
        </div>

        {/* Due date section */}
        <div style={{
          background: 'rgba(30,41,59,0.6)', borderRadius: 12,
          border: '1px solid rgba(51,65,85,0.5)', padding: '14px 16px', marginBottom: 20,
        }}>
          <p style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            📅 Due Date
          </p>

          {editingDate ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                style={{
                  flex: 1, minWidth: 140,
                  background: 'rgba(15,23,42,0.8)',
                  border: '1px solid rgba(99,102,241,0.5)',
                  borderRadius: 8, padding: '8px 12px',
                  color: '#f1f5f9', fontSize: 13, outline: 'none',
                  colorScheme: 'dark',
                }}
              />
              <button
                onClick={handleDateSave}
                disabled={loading}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  color: '#fff', fontSize: 12, fontWeight: 700,
                  opacity: loading ? 0.6 : 1,
                }}
              >Save</button>
              <button
                onClick={() => setEditingDate(false)}
                style={{
                  padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                  background: 'transparent', color: '#64748b',
                  border: '1px solid rgba(51,65,85,0.5)', fontSize: 12,
                }}
              >Cancel</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: task.dueDate ? '#a5b4fc' : '#475569', fontWeight: 600 }}>
                {formattedDate}
              </span>
              <button
                onClick={() => setEditingDate(true)}
                style={{
                  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: 8, padding: '5px 10px', color: '#818cf8',
                  cursor: 'pointer', fontSize: 11, fontWeight: 700,
                }}
              >Edit ✏️</button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleToggle}
            disabled={loading}
            style={{
              flex: 1, padding: '11px 16px', borderRadius: 12, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: task.completed
                ? 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.08))'
                : 'linear-gradient(135deg, #065f46, #059669)',
              color: task.completed ? '#fbbf24' : '#fff',
              fontSize: 13, fontWeight: 700,
              border: task.completed ? '1px solid rgba(251,191,36,0.3)' : 'none',
              transition: 'all 0.2s', opacity: loading ? 0.6 : 1,
            }}
          >
            {task.completed ? '↩️ Reopen Task' : '✅ Mark Complete'}
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            style={{
              padding: '11px 14px', borderRadius: 12,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 16, transition: 'all 0.2s', opacity: loading ? 0.6 : 1,
            }}
          >🗑️</button>
        </div>
      </div>

      <style>{`
        @keyframes modal-pop {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}
