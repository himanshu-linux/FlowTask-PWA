import { useState, useEffect } from 'react';

const STEPS = [
  {
    id: 'type',
    label: 'Creating a task with AI input...',
    caption: 'Type naturally — FlowTask understands dates & priority',
  },
  {
    id: 'kanban',
    label: 'Kanban board — drag tasks between columns',
    caption: 'Real-time sync across all collaborators instantly',
  },
  {
    id: 'dashboard',
    label: 'Analytics dashboard — track your productivity',
    caption: 'Weekly trends, completion rates & velocity KPIs',
  },
];

const STEP_DURATION = 4200; // ms per step

function TypingScreen() {
  const [text, setText] = useState('');
  const full = 'Review PRs for auth module tomorrow at 9am 🔥';
  useEffect(() => {
    let i = 0;
    setText('');
    const interval = setInterval(() => {
      i++;
      setText(full.slice(0, i));
      if (i >= full.length) clearInterval(interval);
    }, 55);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: '#0f172a', height: '100%', padding: 20, fontFamily: 'Inter,sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#6366f1,#06b6d4)' }} />
        <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: 13 }}>FlowTask</span>
      </div>
      {/* Input box */}
      <div style={{ background: '#1e293b', border: '2px solid #6366f1', borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
        <div style={{ color: '#e2e8f0', fontSize: 13, minHeight: 20 }}>
          {text}
          <span style={{ borderRight: '2px solid #6366f1', animation: 'blink 1s infinite', marginLeft: 1 }}>&nbsp;</span>
        </div>
      </div>
      {/* AI suggestion chip */}
      {text.length > 20 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: '📅 Tomorrow 9am', color: '#3b82f6' },
            { label: '🔴 High Priority', color: '#ef4444' },
            { label: '💼 Work', color: '#8b5cf6' },
          ].map(chip => (
            <div key={chip.label} style={{ background: chip.color + '22', border: `1px solid ${chip.color}55`, color: chip.color, borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 600 }}>
              {chip.label}
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0 } }`}</style>
    </div>
  );
}

function KanbanScreen() {
  const [activeCard, setActiveCard] = useState(null);
  const [cols, setCols] = useState([
    { id: 'todo', label: 'TO DO', dot: '#60a5fa', cards: ['Review PRs for auth module', 'Update API docs', 'Write unit tests'] },
    { id: 'wip', label: 'IN PROGRESS', dot: '#fbbf24', cards: ['Dashboard charts', 'Firebase rules'] },
    { id: 'done', label: 'COMPLETED', dot: '#34d399', cards: ['Landing page', 'CI/CD pipeline'] },
  ]);
  // Animate a card moving from todo to wip
  useEffect(() => {
    const t1 = setTimeout(() => setActiveCard('Review PRs for auth module'), 800);
    const t2 = setTimeout(() => {
      setCols(prev => {
        const next = prev.map(c => ({ ...c, cards: [...c.cards] }));
        next[0].cards = next[0].cards.filter(c => c !== 'Review PRs for auth module');
        next[1].cards = ['Review PRs for auth module', ...next[1].cards];
        return next;
      });
      setActiveCard(null);
    }, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{ background: '#0f172a', height: '100%', padding: 16, fontFamily: 'Inter,sans-serif' }}>
      <div style={{ display: 'flex', gap: 8, height: '100%' }}>
        {cols.map(col => (
          <div key={col.id} style={{ flex: 1, background: '#1e293b', borderRadius: 12, padding: 10, border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: col.dot }} />
              <span style={{ color: '#94a3b8', fontSize: 8, fontWeight: 700, letterSpacing: 1 }}>{col.label}</span>
              <span style={{ background: '#334155', color: '#64748b', borderRadius: 4, padding: '1px 5px', fontSize: 8, marginLeft: 'auto' }}>{col.cards.length}</span>
            </div>
            {col.cards.map((card) => (
              <div key={card} style={{
                background: activeCard === card ? '#312e81' : '#0f172a',
                border: `1px solid ${activeCard === card ? '#6366f1' : '#1e293b'}`,
                borderRadius: 8,
                padding: '7px 9px',
                marginBottom: 5,
                fontSize: 9,
                color: '#e2e8f0',
                transform: activeCard === card ? 'scale(1.03)' : 'scale(1)',
                transition: 'all 0.4s ease',
                boxShadow: activeCard === card ? '0 0 15px rgba(99,102,241,0.4)' : 'none',
              }}>{card}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardScreen() {
  const [progress, setProgress] = useState(0);
  const bars = [65, 40, 80, 55, 90, 70, 45];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  useEffect(() => {
    const t = setTimeout(() => setProgress(1), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ background: '#0f172a', height: '100%', padding: 16, fontFamily: 'Inter,sans-serif' }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[['24', 'Tasks', '#6366f1'], ['18', 'Done', '#34d399'], ['4', 'Active', '#fbbf24'], ['75%', 'Rate', '#06b6d4']].map(([val, label, color]) => (
          <div key={label} style={{ background: '#1e293b', borderRadius: 8, padding: '8px 10px', border: '1px solid #334155' }}>
            <div style={{ color, fontWeight: 800, fontSize: 16 }}>{val}</div>
            <div style={{ color: '#64748b', fontSize: 8, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
      {/* Bar chart */}
      <div style={{ background: '#1e293b', borderRadius: 10, padding: '10px 12px', border: '1px solid #334155' }}>
        <div style={{ color: '#94a3b8', fontSize: 9, marginBottom: 8 }}>Weekly Completion</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 64 }}>
          {bars.map((h, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{
                width: '100%',
                height: `${h * progress}%`,
                background: `linear-gradient(180deg,#6366f1,#06b6d4)`,
                borderRadius: '3px 3px 0 0',
                minHeight: 2,
                transition: `height ${0.4 + i * 0.1}s ease`,
              }} />
              <div style={{ color: '#475569', fontSize: 7 }}>{days[i]}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Area chart hint */}
      <div style={{ background: '#1e293b', borderRadius: 10, padding: '10px 12px', border: '1px solid #334155', marginTop: 8 }}>
        <div style={{ color: '#94a3b8', fontSize: 9, marginBottom: 8 }}>Velocity Trend</div>
        <svg width="100%" height="40" viewBox="0 0 200 40" preserveAspectRatio="none">
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <path d="M0,35 C20,30 40,20 60,22 C80,24 100,10 120,12 C140,14 160,5 180,8 L200,6 L200,40 L0,40Z" fill="url(#grad)" style={{ opacity: progress }} />
          <path d="M0,35 C20,30 40,20 60,22 C80,24 100,10 120,12 C140,14 160,5 180,8 L200,6" fill="none" stroke="#6366f1" strokeWidth="1.5" style={{ opacity: progress }} />
        </svg>
      </div>
    </div>
  );
}

const SCREENS = [TypingScreen, KanbanScreen, DashboardScreen];

export default function AnimatedDemo() {
  const [step, setStep] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setStep(s => (s + 1) % STEPS.length);
        setFade(true);
      }, 350);
    }, STEP_DURATION);
    return () => clearInterval(interval);
  }, []);

  const Screen = SCREENS[step];

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Browser chrome + screen */}
      <div style={{
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.1)',
      }}>
        {/* Browser bar */}
        <div style={{ background: '#162032', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #1e293b' }}>
          {['#ef4444', '#fbbf24', '#22c55e'].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
          <div style={{ flex: 1, background: '#0f172a', borderRadius: 6, padding: '3px 12px', marginLeft: 8, color: '#475569', fontSize: 10 }}>
            flowtask.app
          </div>
        </div>
        {/* App screen */}
        <div style={{ height: 280, transition: 'opacity 0.35s ease', opacity: fade ? 1 : 0 }}>
          <Screen key={step} />
        </div>
      </div>

      {/* Step indicators */}
      <div className="demo-steps-row" style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 28 }}>
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => { setFade(false); setTimeout(() => { setStep(i); setFade(true); }, 350); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', padding: '0 4px' }}
          >
            <div style={{
              width: i === step ? 32 : 8,
              height: 4,
              borderRadius: 999,
              background: i === step ? 'linear-gradient(90deg,#6366f1,#06b6d4)' : '#334155',
              transition: 'all 0.4s ease',
              marginBottom: 8,
            }} />
            <div className="demo-step-text" style={{ color: i === step ? '#a5b4fc' : '#475569', fontSize: 11, fontWeight: i === step ? 600 : 400, transition: 'color 0.3s' }}>
              {s.label}
            </div>
          </button>
        ))}
      </div>

      {/* Caption */}
      <p style={{ textAlign: 'center', color: '#475569', fontSize: 13, marginTop: 12, transition: 'opacity 0.35s', opacity: fade ? 1 : 0 }}>
        {STEPS[step].caption}
      </p>
    </div>
  );
}
