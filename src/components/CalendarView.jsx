import { useState, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useTask } from '../context/TaskContext';
import CalendarEventModal from './CalendarEventModal';
import toast from 'react-hot-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

// ── date-fns localizer ────────────────────────────────────────────────────────
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const DnDCalendar = withDragAndDrop(Calendar);

// ── Category / status color map ───────────────────────────────────────────────
const EVENT_COLORS = {
  Work:      { bg: '#1e3a8a', border: '#3b82f6', glow: 'rgba(59,130,246,0.4)' },
  Personal:  { bg: '#4a1d96', border: '#a855f7', glow: 'rgba(168,85,247,0.4)' },
  Study:     { bg: '#7c2d12', border: '#f97316', glow: 'rgba(249,115,22,0.4)' },
  completed: { bg: '#064e3b', border: '#10b981', glow: 'rgba(16,185,129,0.3)' },
  default:   { bg: '#1e293b', border: '#6366f1', glow: 'rgba(99,102,241,0.3)' },
};

function getColors(task) {
  if (task.completed) return EVENT_COLORS.completed;
  return EVENT_COLORS[task.category] || EVENT_COLORS.default;
}

// Safe local-date parser (avoids UTC timezone shift in +5:30)
function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  if (typeof dateStr === 'number') return new Date(dateStr);
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3) return new Date(parts[0], parts[1] - 1, parts[2]);
  return new Date(dateStr);
}

// ── Custom Event Pill ─────────────────────────────────────────────────────────
function CustomEvent({ event }) {
  const task = event.resource;
  const isHigh = task.priority === 'High' && !task.completed;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', overflow: 'hidden' }}>
      {isHigh && (
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
      )}
      <span style={{
        fontSize: 11, fontWeight: 600, lineHeight: 1.2,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {event.title}
      </span>
    </div>
  );
}

// ── Custom Toolbar ────────────────────────────────────────────────────────────
function CustomToolbar({ label, view, onView, onNavigate }) {
  const btnBase = {
    background: 'rgba(30,41,59,0.8)',
    border: '1px solid rgba(51,65,85,0.6)',
    borderRadius: 9, color: '#94a3b8', cursor: 'pointer',
    fontSize: 18, width: 34, height: 34,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 18, gap: 12, flexWrap: 'wrap',
    }}>
      {/* Left: navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={() => onNavigate('PREV')} style={btnBase}>‹</button>
        <button
          onClick={() => onNavigate('TODAY')}
          style={{
            ...btnBase, width: 'auto', padding: '0 14px', fontSize: 12, fontWeight: 700,
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.35)',
            color: '#a5b4fc',
          }}
        >Today</button>
        <button onClick={() => onNavigate('NEXT')} style={btnBase}>›</button>
        <span style={{
          fontSize: 17, fontWeight: 800, color: '#f1f5f9',
          marginLeft: 6, letterSpacing: '-0.3px',
        }}>{label}</span>
      </div>

      {/* Right: view toggle */}
      <div style={{
        display: 'flex', gap: 3, padding: 4, borderRadius: 11,
        background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(51,65,85,0.5)',
      }}>
        {['month', 'week'].map(v => (
          <button
            key={v}
            onClick={() => onView(v)}
            style={{
              padding: '6px 18px', borderRadius: 8,
              fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
              background: view === v
                ? 'linear-gradient(135deg, #6366f1, #06b6d4)'
                : 'transparent',
              color: view === v ? '#fff' : '#64748b',
              transition: 'all 0.25s ease',
            }}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Filter config ─────────────────────────────────────────────────────────────
const FILTERS = [
  { key: 'All',       label: 'All Events', color: '#6366f1', icon: '📋' },
  { key: 'Work',      label: 'Work',       color: '#3b82f6', icon: '💼' },
  { key: 'Personal',  label: 'Personal',   color: '#a855f7', icon: '🏠' },
  { key: 'Study',     label: 'Study',      color: '#f97316', icon: '📚' },
  { key: 'Completed', label: 'Completed',  color: '#10b981', icon: '✅' },
];

// ── Main Calendar View ────────────────────────────────────────────────────────
export default function CalendarView() {
  const { state, editTask, toggleTask, deleteTask } = useTask();
  const [view, setView]           = useState(Views.MONTH);
  const [date, setDate]           = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter]       = useState('All');

  // Convert tasks with dueDates → RBC events
  const events = useMemo(() => {
    return state.tasks
      .filter(t => t.dueDate)
      .filter(t => {
        if (filter === 'All')       return true;
        if (filter === 'Completed') return t.completed;
        return t.category === filter && !t.completed;
      })
      .map(t => {
        const d = parseLocalDate(t.dueDate);
        return { id: t.id, title: t.text, start: d, end: d, allDay: true, resource: t };
      });
  }, [state.tasks, filter]);

  // Unscheduled tasks (no dueDate, not completed) for sidebar
  const unscheduled = useMemo(() =>
    state.tasks.filter(t => !t.dueDate && !t.completed),
    [state.tasks]
  );

  // Stats
  const stats = useMemo(() => {
    const all = state.tasks.filter(t => t.dueDate);
    return {
      total: all.length,
      done:  all.filter(t => t.completed).length,
      high:  all.filter(t => t.priority === 'High' && !t.completed).length,
      unscheduled: unscheduled.length,
    };
  }, [state.tasks, unscheduled]);

  // Drag-and-drop handler
  const handleEventDrop = useCallback(async ({ event, start }) => {
    try {
      const dateStr = [
        start.getFullYear(),
        String(start.getMonth() + 1).padStart(2, '0'),
        String(start.getDate()).padStart(2, '0'),
      ].join('-');
      await editTask(event.id, { dueDate: dateStr });
      toast.success('✅ Task rescheduled!');
    } catch {
      toast.error('Failed to reschedule task');
    }
  }, [editTask]);

  // Click event → open modal
  const handleSelectEvent = useCallback((event) => {
    setSelectedTask(event.resource);
  }, []);

  // Event pill styles
  const eventStyleGetter = useCallback((event) => {
    const task = event.resource;
    const colors = getColors(task);
    const isHigh = task.priority === 'High' && !task.completed;
    return {
      style: {
        backgroundColor: colors.bg,
        borderLeft: `3px solid ${colors.border}`,
        borderRadius: 6,
        color: '#f1f5f9',
        padding: '2px 6px',
        fontSize: 11,
        fontWeight: 600,
        outline: isHigh ? '1px solid rgba(239,68,68,0.6)' : 'none',
        boxShadow: `0 2px 8px rgba(0,0,0,0.35)`,
        cursor: 'pointer',
        transition: 'transform 0.15s ease',
      },
    };
  }, []);

  return (
    <div style={{ paddingBottom: 40 }}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontSize: 30, fontWeight: 900, color: '#f1f5f9', marginBottom: 4,
          background: 'linear-gradient(135deg, #a5b4fc, #06b6d4)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Calendar
        </h1>
        <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>
          Visualize, schedule, and drag tasks to any date.
        </p>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12, marginBottom: 22,
      }} className="cal-stats-grid">
        {[
          { label: 'Scheduled', value: stats.total,       color: '#6366f1', icon: '📅' },
          { label: 'Done',      value: stats.done,        color: '#10b981', icon: '✅' },
          { label: 'High Prio', value: stats.high,        color: '#ef4444', icon: '🔥' },
          { label: 'Pending',   value: stats.unscheduled, color: '#f97316', icon: '📋' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(15,23,42,0.6)',
            border: `1px solid ${s.color}30`,
            borderRadius: 14, padding: '14px 16px',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center',
      }}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 16px', borderRadius: 22,
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: `1px solid ${filter === f.key ? f.color : 'rgba(51,65,85,0.5)'}`,
              background: filter === f.key ? `${f.color}1A` : 'rgba(15,23,42,0.5)',
              color: filter === f.key ? f.color : '#64748b',
              transition: 'all 0.2s ease',
              boxShadow: filter === f.key ? `0 0 12px ${f.color}30` : 'none',
            }}
          >
            <span>{f.icon}</span> {f.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#334155', fontWeight: 600 }}>
          {events.length} event{events.length !== 1 ? 's' : ''} shown
        </span>
      </div>

      {/* ── Calendar + Sidebar grid ───────────────────────────────────────── */}
      <div className="cal-layout-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 230px',
        gap: 16, alignItems: 'start',
      }}>

        {/* Calendar */}
        <div style={{
          background: 'rgba(15,23,42,0.5)', borderRadius: 20,
          border: '1px solid rgba(51,65,85,0.5)', padding: '20px 16px',
          backdropFilter: 'blur(10px)',
        }}>
        {/* Calendar wrapped in DndProvider (required by withDragAndDrop) */}
        <DndProvider backend={HTML5Backend}>
          <DnDCalendar
            localizer={localizer}
            events={events}
            view={view}
            date={date}
            onView={setView}
            onNavigate={setDate}
            onEventDrop={handleEventDrop}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            components={{ toolbar: CustomToolbar, event: CustomEvent }}
            draggableAccessor={() => true}
            resizable={false}
            style={{ height: view === Views.MONTH ? 580 : 660 }}
            popup
            popupOffset={{ x: 0, y: 8 }}
          />
        </DndProvider>
        </div>

        {/* Sidebar — unscheduled tasks */}
        <div className="cal-sidebar" style={{
          background: 'rgba(15,23,42,0.5)', borderRadius: 18,
          border: '1px solid rgba(51,65,85,0.5)', padding: 16,
          backdropFilter: 'blur(10px)',
        }}>
          <p style={{
            fontSize: 10, fontWeight: 800, color: '#475569',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14,
          }}>
            📋 Unscheduled ({unscheduled.length})
          </p>

          {unscheduled.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
              <p style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>All tasks have due dates!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {unscheduled.slice(0, 12).map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTask(t)}
                  style={{
                    textAlign: 'left', padding: '9px 11px', borderRadius: 10,
                    background: 'rgba(30,41,59,0.7)',
                    border: '1px solid rgba(51,65,85,0.4)',
                    cursor: 'pointer', transition: 'all 0.2s ease', width: '100%',
                  }}
                >
                  <p style={{
                    fontSize: 12, color: '#cbd5e1', fontWeight: 600,
                    margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>{t.text}</p>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 9, color: '#475569', fontWeight: 600 }}>{t.category}</span>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#334155' }} />
                    <span style={{
                      fontSize: 9, fontWeight: 700,
                      color: t.priority === 'High' ? '#f87171' : t.priority === 'Medium' ? '#fbbf24' : '#34d399',
                    }}>{t.priority}</span>
                  </div>
                </button>
              ))}
              {unscheduled.length > 12 && (
                <p style={{ fontSize: 11, color: '#334155', textAlign: 'center', marginTop: 4 }}>
                  +{unscheduled.length - 12} more…
                </p>
              )}
            </div>
          )}

          {/* Color legend */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(51,65,85,0.4)' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Legend
            </p>
            {[
              { label: 'Work',      color: '#3b82f6' },
              { label: 'Personal',  color: '#a855f7' },
              { label: 'Study',     color: '#f97316' },
              { label: 'Completed', color: '#10b981' },
              { label: 'High Prio', color: '#ef4444', dot: true },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                {item.dot ? (
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                ) : (
                  <span style={{ width: 14, height: 8, borderRadius: 3, background: item.color + '55', borderLeft: `3px solid ${item.color}`, flexShrink: 0 }} />
                )}
                <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event detail modal */}
      {selectedTask && (
        <CalendarEventModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onToggle={async (id) => { await toggleTask(id); setSelectedTask(null); }}
          onDelete={async (id) => { await deleteTask(id); setSelectedTask(null); }}
          onEdit={async (id, data) => { await editTask(id, data); }}
        />
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .cal-layout-grid { grid-template-columns: 1fr !important; }
          .cal-sidebar { display: none !important; }
          .cal-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .cal-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
