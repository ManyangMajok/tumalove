import { useState, useMemo } from 'react';
import { supabase } from '../../../supabaseClient';
import { useRealtimeQuery } from '../../../hooks/useRealtimeQuery';
import { Link } from 'react-router-dom';
import { ADMIN_ROOT } from '../config';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  Award,
  ArrowLeft,
  Activity, // <--- ADDED: Fixed the missing icon error
  
} from 'lucide-react';

// --- HELPER: Group Data by Date ---
const processChartData = (transactions: any[], days = 30) => {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    const dayTotal = transactions
      .filter(t => t.created_at.startsWith(dateStr) && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: dayTotal,
    });
  }
  return data;
};

// --- SKELETON COMPONENT ---
const AnalyticsSkeleton = () => (
  <div className="animate-pulse space-y-8">
    <div className="flex gap-4 mb-8">
       <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
       <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl"></div>)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
       <div className="lg:col-span-2 h-[400px] bg-slate-100 rounded-2xl"></div>
       <div className="h-[400px] bg-slate-100 rounded-2xl"></div>
    </div>
  </div>
);

export default function Analytics() {
  const [timeRange, setTimeRange] = useState(30);

  // 1. Fetch Transactions
  const { data: transactions = [], isLoading } = useRealtimeQuery(
    ['analytics_transactions'],
    'transactions',
    async () => {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: true });
      return data || [];
    }
  );

  // 2. Fetch Top Creators
  const { data: topCreators = [] } = useRealtimeQuery(
    ['analytics_creators'],
    'profiles',
    async () => {
      const { data } = await supabase.from('profiles').select('id, full_name, username, avatar_url');
      return data || [];
    }
  );

  const chartData = useMemo(() => processChartData(transactions, timeRange), [transactions, timeRange]);
  
  const totalRevenue = transactions.reduce((sum, t) => sum + (t.status === 'COMPLETED' ? t.amount : 0), 0);
  const avgOrderValue = transactions.length > 0 ? totalRevenue / transactions.length : 0;
  
  const creatorLeaderboard = useMemo(() => {
    const leaderboard: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.status === 'COMPLETED' && t.creator_id) {
        leaderboard[t.creator_id] = (leaderboard[t.creator_id] || 0) + t.amount;
      }
    });
    
    return Object.entries(leaderboard)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, amount]) => {
        const profile = topCreators.find(p => p.id === id);
        return { ...profile, amount };
      });
  }, [transactions, topCreators]);

  if (isLoading) return <AnalyticsSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER + NAVIGATION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link 
            to={`${ADMIN_ROOT}/dashboard`}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Growth Velocity</h1>
            <p className="text-slate-500 text-sm">Revenue trends & performance metrics.</p>
          </div>
        </div>

        {/* Time Filter */}
        <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                timeRange === days 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Last {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Volume */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <ArrowUpRight size={12} /> Live
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Volume</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            KES {totalRevenue.toLocaleString()}
          </h3>
        </div>

        {/* Avg Transaction */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Avg. Transaction</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            KES {Math.round(avgOrderValue).toLocaleString()}
          </h3>
        </div>

        {/* Total Count */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Activity className="w-6 h-6 text-purple-600" /> {/* <--- FIXED: Icon Used */}
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Transactions</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            {transactions.length.toLocaleString()}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MAIN CHART */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[400px]">
          <h3 className="font-bold text-slate-900 mb-6">Revenue Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94A3B8', fontSize: 12}} 
                  dy={10}
                  minTickGap={30} // Prevents overlap on mobile
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94A3B8', fontSize: 12}} 
                  tickFormatter={(val) => `K${val/1000}k`}
                  width={40}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOP PERFORMERS LIST */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Top Creators
          </h3>
          <div className="space-y-6">
            {creatorLeaderboard.map((creator, index) => (
              <div key={index} className="flex items-center gap-4 group">
                <div className="relative">
                  {creator.avatar_url ? (
                    <img 
                        src={creator.avatar_url} 
                        alt={creator.full_name} 
                        className="w-10 h-10 rounded-full object-cover border border-slate-100 group-hover:border-emerald-200 transition-colors"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                        {creator.full_name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">
                    #{index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{creator.full_name || 'Unknown'}</p>
                  <p className="text-xs text-slate-500 truncate">@{creator.username || 'user'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">KES {creator.amount?.toLocaleString()}</p>
                </div>
              </div>
            ))}
            
            {creatorLeaderboard.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                No data available yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}