import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AnimatedDemo from './AnimatedDemo';

/* ── Inline SVG/CSS app mockup components ─────────────────────────── */
function KanbanMockup() {
  const cols = [
    { label: 'TO DO', dot: '#60a5fa', tasks: ['Design system audit', 'Update API docs', 'Write unit tests'] },
    { label: 'IN PROGRESS', dot: '#fbbf24', tasks: ['Auth module refactor', 'Dashboard charts'] },
    { label: 'COMPLETED', dot: '#34d399', tasks: ['Landing page', 'CI/CD pipeline', 'DB schema'] },
  ];
  return (
    <div style={{ background: '#0f172a', borderRadius: 16, padding: '20px 16px', width: '100%', maxWidth: 700, margin: '0 auto', fontFamily: 'Inter,sans-serif' }}>
      {/* Navbar strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#6366f1,#06b6d4)', borderRadius: 7 }} />
          <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: 14 }}>FlowTask</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['Tasks', 'Dashboard'].map(t => (
            <div key={t} style={{ background: t === 'Tasks' ? '#6366f1' : 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '4px 12px', borderRadius: 8, fontSize: 11 }}>{t}</div>
          ))}
        </div>
      </div>
      {/* Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {cols.map(col => (
          <div key={col.label} style={{ background: '#1e293b', borderRadius: 12, padding: 12, border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: col.dot }} />
              <span style={{ color: '#94a3b8', fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>{col.label}</span>
              <span style={{ background: '#334155', color: '#64748b', borderRadius: 4, padding: '1px 6px', fontSize: 9, marginLeft: 'auto' }}>{col.tasks.length}</span>
            </div>
            {col.tasks.map((t, i) => (
              <div key={i} style={{ background: '#0f172a', borderRadius: 8, padding: '8px 10px', marginBottom: 6, border: '1px solid #1e293b' }}>
                <div style={{ color: '#e2e8f0', fontSize: 10, marginBottom: 5 }}>{t}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <div style={{ width: 14, height: 14, background: '#1e293b', borderRadius: '50%' }} />
                  <div style={{ height: 5, width: 40, background: '#1e293b', borderRadius: 3, marginTop: 5 }} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardMockup() {
  const bars = [65, 40, 80, 55, 90, 70, 45];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div style={{ background: '#0f172a', borderRadius: 16, padding: 20, width: '100%', maxWidth: 700, margin: '0 auto', fontFamily: 'Inter,sans-serif' }}>
      <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Analytics Dashboard</div>
      {/* Stat cards */}
      <div className="landing-dash-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[['24', 'Total Tasks', '#6366f1'], ['18', 'Completed', '#34d399'], ['4', 'In Progress', '#fbbf24'], ['92%', 'Perf. Score', '#06b6d4']].map(([val, label, color]) => (
          <div key={label} style={{ background: '#1e293b', borderRadius: 10, padding: '10px 12px', border: '1px solid #334155' }}>
            <div style={{ color, fontWeight: 800, fontSize: 18 }}>{val}</div>
            <div style={{ color: '#64748b', fontSize: 9, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
      {/* Bar chart */}
      <div style={{ background: '#1e293b', borderRadius: 10, padding: '12px 16px', border: '1px solid #334155' }}>
        <div style={{ color: '#94a3b8', fontSize: 10, marginBottom: 10 }}>Weekly Completion</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 60 }}>
          {bars.map((h, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: '100%', height: `${h}%`, background: 'linear-gradient(180deg,#6366f1,#06b6d4)', borderRadius: '3px 3px 0 0', minHeight: 4 }} />
              <div style={{ color: '#475569', fontSize: 8 }}>{days[i]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Feature Card ─────────────────────────────────────────────────── */
const FEATURES = [
  { icon: '⚡', title: 'Real-Time Sync', desc: 'Live multi-user collaboration powered by Firestore listeners. Changes reflect instantly across all connected sessions.' },
  { icon: '🤖', title: 'AI-Powered Input', desc: 'Natural language parsing with chrono-node auto-detects dates, times, and priority levels as you type.' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Recharts-powered weekly completion trends, daily velocity KPIs, and productivity insights at a glance.' },
  { icon: '🔒', title: 'Secure by Design', desc: 'Firestore security rules enforce role-based access. Only authenticated collaborators can read or modify tasks.' },
  { icon: '📱', title: 'Progressive Web App', desc: 'Installable on any device with offline support via a Workbox service worker and intelligent asset caching.' },
  { icon: '🚀', title: 'Blazing Performance', desc: '92% reduction in render-blocking JS — 330KB → 27KB critical path via React.lazy() and Vite code-splitting.' },
];

const TECH = ['React 19', 'Firebase', 'Tailwind CSS', 'Vite', 'Framer Motion', 'Recharts', 'PWA', 'Firestore', 'Drag & Drop'];

/* ── Main Landing Component ──────────────────────────────────────── */
export default function Landing() {
  const heroRef = useRef(null);

  // Must be called before any navigation to /login or /signup
  // so that those pages know the user came from within the app
  function setNavFlag() {
    sessionStorage.setItem('_ft_nav', '1');
  }

  // Parallax blob animation
  useEffect(() => {
    const blobs = document.querySelectorAll('.landing-blob');
    let raf;
    let t = 0;
    const animate = () => {
      t += 0.004;
      blobs.forEach((b, i) => {
        const x = Math.sin(t + i) * 18;
        const y = Math.cos(t * 0.7 + i) * 14;
        b.style.transform = `translate(${x}px, ${y}px)`;
      });
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="min-h-screen bg-[#060b14] text-white overflow-x-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @media (max-width: 640px) {
          .landing-hero-section {
            padding: 56px 20px 40px !important;
          }
          .landing-hero-btns {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .landing-hero-btns a {
            text-align: center !important;
            justify-content: center !important;
          }
          .landing-stats-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            justify-items: center !important;
            gap: 20px !important;
          }
          .landing-feature-grid {
            grid-template-columns: 1fr !important;
          }
          .landing-analytics-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          .landing-dash-stats {
            grid-template-columns: 1fr 1fr !important;
          }
          .landing-cta-box {
            padding: 36px 20px !important;
            border-radius: 16px !important;
          }
          .landing-cta-btns {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .landing-cta-btns a {
            text-align: center !important;
            justify-content: center !important;
          }
          .landing-features-section {
            padding: 64px 20px !important;
          }
          .landing-analytics-section {
            padding: 0 20px 64px !important;
          }
          .landing-demo-section {
            padding: 0 20px 64px !important;
          }
        }
      `}</style>

      {/* ── Ambient blobs ────────────────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div className="landing-blob" style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', top: -100, left: -100 }} />
        <div className="landing-blob" style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)', top: 200, right: -80 }} />
        <div className="landing-blob" style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)', bottom: 100, left: '40%' }} />
      </div>

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(6,11,20,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(51,65,85,0.4)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/favicon.svg" alt="FlowTask" style={{ width: 32, height: 32 }} />
            <span style={{ fontWeight: 800, fontSize: 18, background: 'linear-gradient(135deg,#a5b4fc,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FlowTask</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link to="/login" onClick={setNavFlag} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '8px 16px', borderRadius: 8, transition: 'color 0.2s' }}
              onMouseOver={e => e.target.style.color = '#f8fafc'}
              onMouseOut={e => e.target.style.color = '#94a3b8'}>
              Sign In
            </Link>
            <Link to="/signup" onClick={setNavFlag} style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '8px 20px', borderRadius: 10, boxShadow: '0 0 20px rgba(99,102,241,0.35)' }}>
              Get Started →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="landing-hero-section" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '96px 24px 64px' }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 999, padding: '6px 16px', marginBottom: 32 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 8px #34d399' }} />
          <span style={{ color: '#a5b4fc', fontSize: 13, fontWeight: 500 }}>Full-Stack · Firebase · PWA · React 19</span>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.03em' }}>
          <span style={{ color: '#f8fafc' }}>The Kanban Board</span>
          <br />
          <span style={{ background: 'linear-gradient(135deg,#a5b4fc 0%,#06b6d4 50%,#34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            That Flows With You
          </span>
        </h1>

        <p style={{ color: '#94a3b8', fontSize: 'clamp(1rem,2vw,1.2rem)', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Real-time collaborative task management with AI-powered input parsing, drag-and-drop Kanban boards, live analytics, and enterprise-grade security.
        </p>

        {/* CTAs */}
        <div className="landing-hero-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/signup" onClick={setNavFlag} style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)', color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 700, padding: '14px 32px', borderRadius: 12, boxShadow: '0 0 30px rgba(99,102,241,0.4)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Start for Free →
          </Link>
          <Link to="/login" onClick={setNavFlag} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', textDecoration: 'none', fontSize: 15, fontWeight: 600, padding: '14px 32px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Sign In
          </Link>
        </div>

        {/* Hero mockup */}
        <div style={{ marginTop: 64, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: -20, background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)', maxWidth: 750, margin: '0 auto' }}>
            {/* Browser chrome */}
            <div style={{ background: '#162032', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #1e293b' }}>
              {['#ef4444','#fbbf24','#22c55e'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              <div style={{ flex: 1, background: '#0f172a', borderRadius: 6, padding: '4px 12px', marginLeft: 8, color: '#475569', fontSize: 11 }}>flowtask.app</div>
            </div>
            <KanbanMockup />
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(51,65,85,0.4)', borderBottom: '1px solid rgba(51,65,85,0.4)', background: 'rgba(255,255,255,0.02)', padding: '28px 24px' }}>
        <div className="landing-stats-grid" style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 24, textAlign: 'center' }}>
          {[['92%', 'Less Render-Blocking JS'], ['27KB', 'Critical-Path Bundle'], ['Real-Time', 'Firestore Sync'], ['PWA', 'Offline-Ready'], ['AI', 'Smart Input Parsing']].map(([val, label]) => (
            <div key={label}>
              <div style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg,#a5b4fc,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{val}</div>
              <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="landing-features-section" style={{ position: 'relative', zIndex: 1, padding: '96px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ color: '#6366f1', fontSize: 13, fontWeight: 600, letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>Capabilities</p>
          <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.03em' }}>Everything You Need to Ship</h2>
          <p style={{ color: '#64748b', marginTop: 16, fontSize: 16, maxWidth: 500, margin: '16px auto 0' }}>Built with production-grade patterns, not just tutorial code.</p>
        </div>
        <div className="landing-feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(51,65,85,0.6)', borderRadius: 16, padding: '28px 24px', backdropFilter: 'blur(8px)', transition: 'border-color 0.2s, box-shadow 0.2s', cursor: 'default' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(99,102,241,0.1)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(51,65,85,0.6)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ color: '#f8fafc', fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Analytics screenshot ─────────────────────────────────────── */}
      <section className="landing-analytics-section" style={{ position: 'relative', zIndex: 1, padding: '0 24px 96px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="landing-analytics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
          <div>
            <p style={{ color: '#06b6d4', fontSize: 13, fontWeight: 600, letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>Analytics</p>
            <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.5rem)', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2, marginBottom: 20 }}>Measure What<br />Matters Most</h2>
            <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>The built-in analytics dashboard tracks weekly task completion, velocity trends, and productivity KPIs — all powered by Recharts with real Firestore data.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Weekly completion bar & area charts', 'Daily task velocity tracking', 'Completion rate % at a glance', 'Live data from Firestore listeners'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(52,211,153,0.15)', border: '1px solid #34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#34d399', fontSize: 10 }}>✓</span>
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: 14 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ border: '1px solid rgba(6,182,212,0.2)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ background: '#162032', padding: '10px 14px', display: 'flex', gap: 6, borderBottom: '1px solid #1e293b' }}>
              {['#ef4444','#fbbf24','#22c55e'].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
            </div>
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ── Animated Demo Section ──────────────────────────────────── */}
      <section className="landing-demo-section" style={{ position: 'relative', zIndex: 1, padding: '0 24px 96px', maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: '#a855f7', fontSize: 13, fontWeight: 600, letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>Live Demo</p>
        <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.5rem)', fontWeight: 800, color: '#f8fafc', marginBottom: 16 }}>See It In Action</h2>
        <p style={{ color: '#64748b', fontSize: 15, marginBottom: 48 }}>Watch FlowTask's AI input, drag-and-drop Kanban board, and live analytics — right here.</p>
        <AnimatedDemo />
      </section>

      {/* ── Tech Stack ───────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 96px', textAlign: 'center' }}>
        <p style={{ color: '#475569', fontSize: 13, marginBottom: 20 }}>Built with production-ready technologies</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 700, margin: '0 auto' }}>
          {TECH.map(t => (
            <div key={t} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999, padding: '7px 18px', color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>{t}</div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 96px', textAlign: 'center' }}>
        <div className="landing-cta-box" style={{ maxWidth: 600, margin: '0 auto', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 24, padding: '56px 40px', boxShadow: '0 0 80px rgba(99,102,241,0.08)' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.5rem)', fontWeight: 800, color: '#f8fafc', marginBottom: 16 }}>Ready to Get Organized?</h2>
          <p style={{ color: '#64748b', fontSize: 15, marginBottom: 32 }}>Create an account and start managing tasks collaboratively in seconds.</p>
          <div className="landing-cta-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" onClick={setNavFlag} style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)', color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 700, padding: '14px 32px', borderRadius: 12, boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>
              Create Free Account →
            </Link>
            <Link to="/login" onClick={setNavFlag} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', textDecoration: 'none', fontSize: 15, fontWeight: 600, padding: '14px 32px', borderRadius: 12 }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(51,65,85,0.3)', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          <img src="/favicon.svg" alt="FlowTask" style={{ width: 20, height: 20 }} />
          <span style={{ color: '#475569', fontSize: 14, fontWeight: 600 }}>FlowTask</span>
        </div>
        <p style={{ color: '#334155', fontSize: 13 }}>A full-stack collaborative productivity suite · Built with React 19 &amp; Firebase</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 16 }}>
          <Link to="/login" style={{ color: '#475569', textDecoration: 'none', fontSize: 13 }}>Sign In</Link>
          <Link to="/signup" style={{ color: '#475569', textDecoration: 'none', fontSize: 13 }}>Get Started</Link>
        </div>
      </footer>
    </div>
  );
}
