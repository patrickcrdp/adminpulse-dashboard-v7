import * as React from 'react';
import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { LeadModal } from '../components/crm/LeadModal';
import { Lead } from '../types';
import { DashboardFacade } from '../services/dashboardFacade';
import { useDashboardData } from '../hooks/useDashboardData';
import {
  Users,
  TrendingUp,
  Target,
  BrainCircuit,
  Briefcase,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Phone,
  MessageSquare,
  Clock,
  PieChart as PieChartIcon,
  Calendar,
  Megaphone,
  DollarSign,
  BarChart as BarChartIcon
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { KPI } from '../components/dashboard/KPI';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    stats,
    chartData,
    pipelineData,
    sourceData,
    recentActivities,
    upcomingAppointments,
    insights,
    loading,
    timeRange,
    setTimeRange,
    currentInsightIndex,
    fetchDashboardData
  } = useDashboardData();

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Bem-vindo ao seu centro de comando</p>
        </div>
        <div className="flex items-center gap-3">
          <div id="date-filter" className="flex items-center gap-2 bg-dark-card p-1 rounded-lg border border-dark-border">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${timeRange === '7d' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:bg-dark-bg'}`}
            >
              7 dias
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${timeRange === '30d' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:bg-dark-bg'}`}
            >
              30 dias
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${timeRange === 'all' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:bg-dark-bg'}`}
            >
              Tudo
            </button>
          </div>
          <button
            onClick={() => navigate('/calendar')}
            className="flex items-center gap-2 bg-primary-600/10 text-primary-400 hover:bg-primary-600/20 px-4 py-2 rounded-lg border border-primary-500/20 transition-all shadow-lg shadow-primary-500/5 group"
          >
            <Calendar size={18} className="group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-sm">Calendário</span>
          </button>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div id="ai-insights" className="bg-gradient-to-r from-primary-900/30 via-dark-card to-dark-card border border-primary-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-primary-500/10 rounded-xl">
            <BrainCircuit className="text-primary-400" size={20} />
          </div>
          {insights.length > 0 && (
            <p className="text-sm text-slate-300">
              <span className="font-semibold text-primary-300 mr-2">Coach IA:</span>
              {insights[currentInsightIndex].message}
            </p>
          )}
        </div>
        {insights.length > 0 && (
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
            ${insights[currentInsightIndex].type === 'positive' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              insights[currentInsightIndex].type === 'warning' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                'bg-slate-500/10 text-slate-400 border border-slate-500/20'
            }`}>
            {insights[currentInsightIndex].metric}
          </span>
        )}
      </div>

      {/* Main KPIs Row */}
      <div id="kpi-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI
          title="Total de Leads"
          value={stats.totalLeads}
          subtext={`${stats.newLeads} aguardando`}
          icon={<Users size={20} />}
          trend={`${Math.abs(stats.trends?.totalLeads || 0).toFixed(0)}%`}
          trendUp={(stats.trends?.totalLeads || 0) >= 0}
          onClick={() => navigate('/leads')}
        />
        <KPI
          title="Taxa de Conversão"
          value={`${stats.conversionRate.toFixed(1)}%`}
          subtext="Lead / Visitante"
          icon={<Target size={20} />}
          trend={`${Math.abs(stats.trends?.conversionRate || 0).toFixed(1)}%`}
          trendUp={(stats.trends?.conversionRate || 0) >= 0}
        />
        <KPI
          title="Leads Qualificados"
          value={stats.qualifiedLeads}
          subtext="Alta intenção"
          icon={<Briefcase size={20} />}
          trend={`${Math.abs(stats.trends?.qualifiedLeads || 0).toFixed(0)}%`}
          trendUp={(stats.trends?.qualifiedLeads || 0) >= 0}
        />
        <KPI
          title="Tempo de Resposta"
          value={stats.avgResponseTime || '--'}
          subtext="Média primeiro contato"
          icon={<Clock size={20} />}
          trend="Real"
          trendUp={true}
        />
      </div>

      {/* Middle Grid: Volume Chart & Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trend Chart */}
        <div id="chart-volume" className="lg:col-span-2 bg-dark-card border border-dark-border rounded-2xl p-6 shadow-sm min-w-0">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center">
                <TrendingUp className="mr-2 text-primary-500" size={20} />
                Volume de Aquisição
              </h2>
              <p className="text-xs text-slate-500">Histórico de entrada de leads</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tickLine={false} axisLine={false} fontSize={10} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" name="Leads" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Appointments Widget (Prioritized) */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-sm min-w-0 flex flex-col h-full">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center">
                <Calendar className="mr-2 text-primary-500" size={20} />
                Agendamentos
              </h2>
              <p className="text-xs text-slate-500">Próximos compromissos</p>
            </div>
            <button onClick={() => navigate('/calendar')} className="p-2 hover:bg-primary-600/10 rounded-lg text-primary-400 transition-colors">
              <ArrowUpRight size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {upcomingAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 py-10 bg-dark-bg/20 rounded-2xl border border-dashed border-dark-border">
                <Calendar size={24} className="mb-2 opacity-20" />
                <p className="text-sm">Tudo limpo por enquanto!</p>
              </div>
            ) : (
              upcomingAppointments.map((act) => (
                <div
                  key={act.id}
                  onClick={async () => {
                    if (!act.leads) return;
                    const fullLead = await DashboardFacade.fetchLeadById(act.lead_id);
                    if (fullLead) { setSelectedLead(fullLead); setIsLeadModalOpen(true); }
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-primary-600/5 border border-primary-500/10 hover:bg-primary-600/10 transition-all cursor-pointer group hover:scale-[1.02]"
                >
                  <div className={`p-2.5 rounded-xl ${act.activity_type === 'call' ? 'bg-blue-500/20 text-blue-400' :
                    act.activity_type === 'meeting' ? 'bg-purple-500/20 text-purple-400' :
                      act.activity_type === 'whatsapp' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-slate-500/20 text-slate-400'
                    }`}>
                    {act.activity_type === 'call' ? <Phone size={14} /> :
                      act.activity_type === 'meeting' ? <Users size={14} /> :
                        act.activity_type === 'whatsapp' ? <MessageSquare size={14} /> :
                          <FileText size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{act.leads?.name || 'Lead'}</p>
                    <p className="text-[10px] text-slate-400">{new Date(act.created_at).toLocaleDateString()} • <span className="capitalize">{act.activity_type}</span></p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pipeline Distribution */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-sm min-w-0">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Briefcase className="mr-2 text-primary-500" size={20} />
              Pipeline
            </h2>
            <p className="text-xs text-slate-500">Distribuição por etapa</p>
          </div>
          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pipelineData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-2xl font-bold text-white tracking-tight">{stats.totalLeads}</span>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Leads</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pipelineData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[10px] text-slate-400 truncate">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Sources */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-sm min-w-0">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <PieChartIcon className="mr-2 text-primary-500" size={20} />
              Canais
            </h2>
            <p className="text-xs text-slate-500">Top fontes de tráfego</p>
          </div>
          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-xl font-bold text-white">{sourceData.length > 0 ? 'Top' : '0'}</span>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Fontes</p>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {sourceData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-[10px]">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-slate-400 truncate">{d.name}</span>
                <span className="text-white font-bold ml-2">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div id="recent-activity" className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-sm min-w-0 flex flex-col h-full">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Clock className="mr-2 text-primary-500" size={20} />
              Atividades
            </h2>
            <p className="text-xs text-slate-500">Últimas interações</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px] pr-2 custom-scrollbar">
            {recentActivities.length === 0 ? (
              <div className="text-center text-slate-500 py-10">
                <p className="text-sm italic">Nenhuma atividade recente</p>
              </div>
            ) : (
              recentActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={async () => {
                    if (!act.leads) return;
                    const fullLead = await DashboardFacade.fetchLeadById(act.lead_id);
                    if (fullLead) { setSelectedLead(fullLead); setIsLeadModalOpen(true); }
                  }}
                  className="flex gap-3 p-3 rounded-2xl bg-dark-bg/30 border border-dark-border/50 hover:bg-dark-bg/50 transition-colors cursor-pointer group"
                >
                  <div className={`p-2 rounded-lg h-fit
                    ${act.activity_type === 'call' ? 'bg-blue-500/10 text-blue-400' :
                      act.activity_type === 'meeting' ? 'bg-purple-500/10 text-purple-400' :
                        act.activity_type === 'whatsapp' ? 'bg-emerald-500/10 text-emerald-400' :
                          'bg-slate-500/10 text-slate-400'
                    }`}>
                    {act.activity_type === 'call' ? <Phone size={14} /> :
                      act.activity_type === 'meeting' ? <Users size={14} /> :
                        act.activity_type === 'whatsapp' ? <MessageSquare size={14} /> :
                          <FileText size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate group-hover:text-primary-400 transition-colors">
                      {act.leads?.name || 'Lead'}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {new Date(act.created_at).toLocaleDateString()} • <span className="capitalize">{act.activity_type}</span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Secondary KPIs Row (Minor stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-card/40 border border-dark-border rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Custo Médio Lead</p>
            <p className="text-lg font-bold text-white">R$ {stats.costPerLead.toFixed(2)}</p>
          </div>
          <div className="p-2 bg-slate-500/10 rounded-xl">
            <TrendingUp size={16} className="text-slate-400" />
          </div>
        </div>
        <div className="bg-dark-card/40 border border-dark-border rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Ciclo de Vendas</p>
            <p className="text-lg font-bold text-white">{stats.avgSalesCycle}</p>
          </div>
          <div className="p-2 bg-slate-500/10 rounded-xl">
            <Clock size={16} className="text-slate-400" />
          </div>
        </div>
        <div className="bg-dark-card/40 border border-dark-border rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Leads Estagnados</p>
            <p className="text-lg font-bold text-rose-400">{stats.stalledLeads}</p>
          </div>
          <div className="p-2 bg-rose-500/10 rounded-xl">
            <Clock size={16} className="text-rose-400" />
          </div>
        </div>
        <div className="bg-dark-card/40 border border-dark-border rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Taxa de Contato</p>
            <p className="text-lg font-bold text-emerald-400">{(stats.contactRate || 0).toFixed(1)}%</p>
          </div>
          <div className="p-2 bg-emerald-500/10 rounded-xl">
            <Phone size={16} className="text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Marketing & ROI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-8">
        <div className="bg-gradient-to-br from-primary-900/40 to-dark-card border border-primary-500/20 rounded-2xl p-5 shadow-lg group hover:border-primary-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary-500/10 rounded-lg text-primary-400">
              <Megaphone size={18} />
            </div>
            <span className="text-[10px] font-black text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">Ads</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Investimento Est.</p>
          <p className="text-2xl font-bold text-white">R$ {(stats.totalLeads * 12.5).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-900/40 to-dark-card border border-emerald-500/20 rounded-2xl p-5 shadow-lg group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <BarChartIcon size={18} />
            </div>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">Vendas</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ROI Real (CRM)</p>
          <p className="text-2xl font-bold text-white">R$ {(stats.convertedLeads * 1500).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-900/40 to-dark-card border border-indigo-500/20 rounded-2xl p-5 shadow-lg group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <TrendingUp size={18} />
            </div>
            <span className="text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">Scale</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ROAS Estimado</p>
          <p className="text-2xl font-bold text-white">{stats.totalLeads > 0 ? ((stats.convertedLeads * 1500) / (stats.totalLeads * 12.5)).toFixed(1) : '0'}x</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/40 to-dark-card border border-purple-500/20 rounded-2xl p-5 shadow-lg group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Target size={18} />
            </div>
            <button
              onClick={() => navigate('/marketing/traffic')}
              className="text-[10px] font-black text-purple-400 hover:text-white underline uppercase tracking-tighter transition-colors"
            >
              Ver Detalhes
            </button>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">CAC do Período</p>
          <p className="text-2xl font-bold text-white">R$ {stats.totalLeads > 0 ? ((stats.totalLeads * 12.5) / (stats.convertedLeads || 1)).toFixed(2) : '0,00'}</p>
        </div>
      </div>

      {/* Lead Modal */}
      {isLeadModalOpen && selectedLead && (
        <LeadModal
          lead={selectedLead}
          initialTab="activity"
          onClose={() => {
            setIsLeadModalOpen(false);
            setSelectedLead(null);
          }}
          onUpdate={() => {
            fetchDashboardData(); // Refresh data on update
          }}
          onDelete={() => {
            fetchDashboardData(); // Refresh data on delete
            setIsLeadModalOpen(false);
            setSelectedLead(null);
          }}
        />
      )}
    </div>
  );
};