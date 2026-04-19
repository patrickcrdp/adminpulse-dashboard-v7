import * as React from 'react';
import {
    Megaphone,
    TrendingUp,
    Target,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    BarChart3,
    ExternalLink,
    Plus
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { useTrafficData } from '../../hooks/useTrafficData';

export const TrafficAds: React.FC = () => {
    const {
        loading,
        timeRange,
        setTimeRange,
        stats,
        chartData,
        platforms
    } = useTrafficData();

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Megaphone className="text-primary-500" size={32} />
                        Tráfego Pago & ROI
                    </h1>
                    <p className="text-slate-400 mt-2">Visão consolidada de Meta, Google e TikTok Ads</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-dark-card p-1 rounded-xl border border-dark-border">
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
                </div>
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-dark-card border border-dark-border rounded-2xl p-6 relative overflow-hidden group hover:border-primary-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <DollarSign size={48} className="text-primary-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Investimento Total</p>
                    <p className="text-2xl font-bold text-white">R$ {stats.spend.toLocaleString('pt-BR')}</p>
                    <div className="mt-4 flex items-center gap-1 text-emerald-400 text-xs font-bold">
                        <ArrowUpRight size={14} />
                        <span>+8% vs mês ant.</span>
                    </div>
                </div>

                <div className="bg-dark-card border border-dark-border rounded-2xl p-6 relative overflow-hidden group hover:border-primary-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp size={48} className="text-primary-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">ROAS (Retorno Ads)</p>
                    <p className="text-2xl font-bold text-white">{(stats.roi / 100).toFixed(1)}x</p>
                    <div className="mt-4 flex items-center gap-1 text-emerald-400 text-xs font-bold">
                        <ArrowUpRight size={14} />
                        <span>Saúde Financeira: OK</span>
                    </div>
                </div>

                <div className="bg-dark-card border border-dark-border rounded-2xl p-6 relative overflow-hidden group hover:border-primary-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <Target size={48} className="text-primary-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">CPL (Custo por Lead)</p>
                    <p className="text-2xl font-bold text-white">R$ {stats.cpl.toFixed(2)}</p>
                    <div className="mt-4 flex items-center gap-1 text-rose-400 text-xs font-bold">
                        <ArrowDownRight size={14} />
                        <span>Dentro da meta (R$ 50)</span>
                    </div>
                </div>

                <div className="bg-dark-card border border-dark-border rounded-2xl p-6 relative overflow-hidden group hover:border-primary-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <Zap size={48} className="text-primary-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Conversões</p>
                    <p className="text-2xl font-bold text-white">{stats.leads}</p>
                    <div className="mt-4 flex items-center gap-1 text-emerald-400 text-xs font-bold">
                        <ArrowUpRight size={14} />
                        <span>Recorde este mês!</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Spend Chart */}
                <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-white">Investimento Diário</h2>
                            <p className="text-sm text-slate-500">Distribuição do orçamento pela semana</p>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                />
                                <Area type="monotone" dataKey="spend" stroke="#6366f1" strokeWidth={3} fill="url(#colorSpend)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Conversion by Platform */}
                <div className="bg-dark-card border border-dark-border rounded-3xl p-8 shadow-sm">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-white">Share por Plataforma</h2>
                        <p className="text-sm text-slate-500">Onde seus leads nascem</p>
                    </div>
                    <div className="space-y-6">
                        {platforms.length > 0 ? platforms.map((plat, idx) => (
                            <div key={idx} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-300">{plat.name}</span>
                                    <span className="text-white font-bold">{plat.value}%</span>
                                </div>
                                <div className="h-2 w-full bg-dark-bg rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${plat.value}%`, backgroundColor: plat.color }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold">
                                    <span>R$ {plat.spend.toLocaleString()} investidos</span>
                                    <span>{plat.leads} Leads</span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-slate-500 border border-dashed border-white/5 rounded-2xl">
                                <p className="text-xs">Aguardando dados de integração...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Active Campaigns Table */}
            <div className="bg-dark-card border border-dark-border rounded-3xl overflow-hidden shadow-sm">
                <div className="p-8 border-b border-dark-border flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">Campanhas Ativas</h2>
                        <p className="text-sm text-slate-500">Últimos 30 dias de performance</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm font-medium">
                        <ExternalLink size={16} />
                        Abrir Ads Manager
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/20 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Nome da Campanha</th>
                                <th className="px-8 py-4">Gasto</th>
                                <th className="px-8 py-4">Leads</th>
                                <th className="px-8 py-4">CPL</th>
                                <th className="px-8 py-4">ROAS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {[
                                { status: 'Ativa', name: 'Black Friday | Gancho 01 | Direct', spend: 4500.20, leads: 180, cpl: 25.00, roas: 5.2 },
                                { status: 'Ativa', name: 'Remarketing | Visited Page | LTV', spend: 1200.00, leads: 42, cpl: 28.57, roas: 8.4 },
                                { status: 'Pausada', name: 'Lookalike | 1% Compradores | Branding', spend: 6800.50, leads: 198, cpl: 34.34, roas: 3.1 },
                            ].map((cmp, i) => (
                                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-5">
                                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${cmp.status === 'Ativa' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                                            {cmp.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-white group-hover:text-primary-400 transition-colors">{cmp.name}</td>
                                    <td className="px-8 py-5 text-sm text-slate-400">R$ {cmp.spend.toLocaleString()}</td>
                                    <td className="px-8 py-5 text-sm font-bold text-white">{cmp.leads}</td>
                                    <td className="px-8 py-5 text-sm font-bold text-emerald-400">R$ {cmp.cpl.toFixed(2)}</td>
                                    <td className="px-8 py-5 text-sm font-black text-primary-400">{cmp.roas}x</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
