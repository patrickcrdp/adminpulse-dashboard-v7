import * as React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend,
    ComposedChart
} from 'recharts';
import {
    BarChart3,
    TrendingUp,
    Users,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Filter,
    Calendar,
    Zap,
    Clock,
    Briefcase
} from 'lucide-react';
import { useReportsData } from '../hooks/useReportsData';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

export const Reports: React.FC = () => {
    const {
        loading,
        timeRange,
        setTimeRange,
        conversionData,
        qualityData,
        sourcePerformance,
        activityTrends,
        globalStats
    } = useReportsData();

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <BarChart3 className="text-primary-500" size={32} />
                        Relatórios e Insights
                    </h1>
                    <p className="text-slate-400 mt-2">Analise o desempenho comercial e a eficiência dos seus canais</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-dark-card p-1 rounded-xl border border-dark-border shadow-inner">
                        <button
                            onClick={() => setTimeRange('7d')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${timeRange === '7d' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-dark-bg'}`}
                        >
                            7 dias
                        </button>
                        <button
                            onClick={() => setTimeRange('30d')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${timeRange === '30d' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-dark-bg'}`}
                        >
                            30 dias
                        </button>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white transition-all">
                        <Download size={18} />
                        <span className="text-sm font-medium">Exportar PDF</span>
                    </button>
                </div>
            </div>

            {/* Global Impact Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-dark-card border border-dark-border rounded-2xl p-6 relative overflow-hidden group hover:border-primary-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp size={48} className="text-primary-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">ROI Estimado (Vendas)</p>
                    <p className="text-2xl font-bold text-white">R$ {globalStats.totalROI.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <div className="mt-4 flex items-center gap-1 text-emerald-400 text-xs font-bold">
                        <ArrowUpRight size={14} />
                        <span>+12% vs período anterior</span>
                    </div>
                </div>

                <div className="bg-dark-card border border-dark-border rounded-2xl p-6 relative overflow-hidden group hover:border-primary-400/30 transition-all">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <Target size={48} className="text-primary-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Taxa de Conversão Final</p>
                    <p className="text-2xl font-bold text-white">{globalStats.conversionRef}%</p>
                    <div className="mt-4 flex items-center gap-1 text-emerald-400 text-xs font-bold">
                        <ArrowUpRight size={14} />
                        <span>Saúde excelente do funil</span>
                    </div>
                </div>

                <div className="bg-dark-card border border-dark-border rounded-2xl p-6 relative overflow-hidden group hover:border-primary-400/30 transition-all">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <Zap size={48} className="text-primary-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Custo Médio por Lead</p>
                    <p className="text-2xl font-bold text-white">R$ {globalStats.avgCost.toFixed(2)}</p>
                    <div className="mt-4 flex items-center gap-1 text-emerald-400 text-xs font-bold">
                        <ArrowDownRight size={14} />
                        <span>Redução de 5% no custo</span>
                    </div>
                </div>

                <div className="bg-dark-card border border-dark-border rounded-2xl p-6 relative overflow-hidden group hover:border-primary-400/30 transition-all">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <Users size={48} className="text-primary-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Taxa de Qualificação</p>
                    <p className="text-2xl font-bold text-white">42.5%</p>
                    <div className="mt-4 flex items-center gap-1 text-slate-500 text-xs font-bold">
                        <span>Dentro da meta esperada</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Conversion Funnel */}
                <div className="bg-dark-card border border-dark-border rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-white">Funil de Vendas Global</h2>
                            <p className="text-sm text-slate-500">Volume e qualidade em cada etapa</p>
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={conversionData} layout="vertical" margin={{ left: 40, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                />
                                <Bar
                                    dataKey="value"
                                    radius={[0, 8, 8, 0]}
                                    barSize={40}
                                >
                                    {conversionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Source Efficiency Table/Chart */}
                <div className="bg-dark-card border border-dark-border rounded-3xl p-8 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-white">Eficiência por Origem</h2>
                            <p className="text-sm text-slate-500">Taxas de fechamento por canal</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {sourcePerformance.map((source, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-300">{source.name}</span>
                                    <span className="text-primary-400 font-bold">{source.rate}% Conversão</span>
                                </div>
                                <div className="h-2 w-full bg-dark-bg rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-1000"
                                        style={{ width: `${source.rate}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                                    <span>{source.leads} Leads totais</span>
                                    <span>{source.converted} Vendas</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Productivity Activity Chart */}
                <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-3xl p-8 shadow-sm">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-white">Mix de Atividades</h2>
                        <p className="text-sm text-slate-500">Distribuição do esforço comercial do time</p>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityTrends}>
                                <CartesianGrid strokeDasharray="5 5" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                />
                                <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quality Score Donut */}
                <div className="bg-dark-card border border-dark-border rounded-3xl p-8 shadow-sm flex flex-col">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white">Quality Score</h2>
                        <p className="text-sm text-slate-500">Temperaturas dos leads ativos</p>
                    </div>
                    <div className="flex-1 min-h-[220px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={qualityData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {qualityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <span className="text-3xl font-bold text-white tracking-tight">82%</span>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Score Médio</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 mt-4">
                        {qualityData.map((d, i) => (
                            <div key={i} className="flex items-center justify-between text-xs px-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-slate-400">{d.name}</span>
                                </div>
                                <span className="text-white font-bold">{d.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
