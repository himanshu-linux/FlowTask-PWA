import { useMemo } from 'react';
import { useTask } from '../context/TaskContext';
import { getWeeklyCompletionData, getDailyStats } from '../utils/analytics';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { CheckCircle2, Clock, ListTodo, TrendingUp, Calendar } from 'lucide-react';
import { SkeletonStatCard } from './common/SkeletonCards';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
  transition: { duration: 0.3, ease: 'easeInOut' }
};

export default function Dashboard() {
  const { state: { tasks, loading } } = useTask();

  const stats = useMemo(() => getDailyStats(tasks), [tasks]);
  const chartData = useMemo(() => getWeeklyCompletionData(tasks), [tasks]);

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8 pb-10"
    >
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-textMain">Activity Overview</h1>
        <p className="text-textSecondary text-sm">Review your productivity and performance trends.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          <>
            <StatCard 
              title="Total Tasks" 
              value={stats.total} 
              icon={<ListTodo className="w-5 h-5" />} 
              color="text-primary" 
              bg="bg-primary/10"
            />
            <StatCard 
              title="Completed Today" 
              value={stats.completedToday} 
              icon={<Calendar className="w-5 h-5" />} 
              color="text-emerald-500" 
              bg="bg-emerald-500/10"
            />
            <StatCard 
              title="Finished" 
              value={stats.completed} 
              icon={<CheckCircle2 className="w-5 h-5" />} 
              color="text-emerald-600" 
              bg="bg-emerald-500/10"
            />
            <StatCard 
              title="Pending" 
              value={stats.pending} 
              icon={<Clock className="w-5 h-5" />} 
              color="text-amber-500" 
              bg="bg-amber-500/10"
            />
          </>
        )}
      </div>

      {/* Progress & Highlights Row */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Card */}
          <div className="lg:col-span-1 glass-card p-6 flex flex-col justify-between min-h-[250px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-textMain">Global Goal</h3>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-textSecondary mb-6">Total productivity completion rate across all your tasks.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-border" />
                  <motion.circle 
                    cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    className="text-primary"
                    initial={{ strokeDashoffset: 364.4 }}
                    animate={{ strokeDashoffset: 364.4 - (364.4 * stats.percentage) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeDasharray={364.4}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-textMain">{stats.percentage}%</span>
                </div>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-textMuted">Productivity Score</span>
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="lg:col-span-2 glass-card p-6 min-h-[300px]">
            <h3 className="font-bold text-textMain mb-6">Weekly Activity</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(var(--color-primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="rgb(var(--color-primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--color-border))" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgb(var(--color-text-muted))', fontSize: 12 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    allowDecimals={false}
                    tick={{ fill: 'rgb(var(--color-text-muted))', fontSize: 12 }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgb(var(--color-surface))', 
                      border: '1px solid rgb(var(--color-border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                    }}
                    itemStyle={{ color: 'rgb(var(--color-primary))', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="rgb(var(--color-primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ title, value, icon, color, bg }) {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      className="glass-card p-5 flex items-center gap-4 transition-shadow hover:shadow-lg"
    >
      <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-textMuted mb-1">{title}</h4>
        <span className="text-2xl font-bold text-textMain">{value}</span>
      </div>
    </motion.div>
  );
}
