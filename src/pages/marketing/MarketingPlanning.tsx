import * as React from 'react';
import {
    PenTool,
    Target,
    Users,
    Layers,
    ArrowRight,
    Lightbulb,
    MessageCircle,
    Rocket,
    CheckCircle2,
    Calendar as CalendarIcon,
    Megaphone
} from 'lucide-react';

export const MarketingPlanning: React.FC = () => {
    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <PenTool className="text-primary-500" size={32} />
                        Planejamento Estratégico
                    </h1>
                    <p className="text-slate-400 mt-2">Defina sua persona, funil e metas de comunicação</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Persona Canvas */}
                <div className="bg-dark-card border border-dark-border rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all"></div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400 border border-primary-500/20">
                            <Users size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Persona Ideal</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-2xl space-y-3">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Dores & Problemas</h3>
                            <ul className="space-y-2">
                                <li className="text-sm text-slate-300 flex items-start gap-2">
                                    <div className="mt-1.5 w-1 h-1 rounded-full bg-primary-500 flex-shrink-0" />
                                    Dificuldade em escalar vendas previsíveis.
                                </li>
                                <li className="text-sm text-slate-300 flex items-start gap-2">
                                    <div className="mt-1.5 w-1 h-1 rounded-full bg-primary-500 flex-shrink-0" />
                                    Falta de tempo para gerir leads manualmente.
                                </li>
                            </ul>
                        </div>

                        <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-2xl space-y-3">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Desejos & Sonhos</h3>
                            <ul className="space-y-2">
                                <li className="text-sm text-slate-300 flex items-start gap-2">
                                    <div className="mt-1.5 w-1 h-1 rounded-full bg-primary-500 flex-shrink-0" />
                                    Ter um sistema que vende no automático.
                                </li>
                                <li className="text-sm text-slate-300 flex items-start gap-2">
                                    <div className="mt-1.5 w-1 h-1 rounded-full bg-primary-500 flex-shrink-0" />
                                    Focar apenas no fechamento (High Ticket).
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Funnel Builder */}
                <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-[2.5rem] p-10 space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                                <Layers size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-white">Funil de Aquisição</h2>
                        </div>
                        <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                            Estratégia Validada
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                        {/* Connecting Arrows (Visible on Desktop) */}
                        <div className="hidden md:block absolute top-[40%] left-[30%] -translate-x-1/2 text-slate-800">
                            <ArrowRight size={20} />
                        </div>
                        <div className="hidden md:block absolute top-[40%] left-[64%] -translate-x-1/2 text-slate-800">
                            <ArrowRight size={20} />
                        </div>

                        {/* Top of Funnel */}
                        <div className="space-y-4 group">
                            <div className="h-40 bg-slate-900 border border-white/[0.05] rounded-3xl p-6 flex flex-col justify-between group-hover:border-primary-500/30 transition-all">
                                <div className="p-2 bg-primary-500/10 rounded-xl w-fit text-primary-400">
                                    <Megaphone size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">Topo (Atração)</h4>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1">Anúncios & Vídeos</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 text-center px-4">Awareness e educação sobre o problema.</p>
                        </div>

                        {/* Middle of Funnel */}
                        <div className="space-y-4 group">
                            <div className="h-40 bg-slate-900 border border-white/[0.05] rounded-3xl p-6 flex flex-col justify-between group-hover:border-amber-500/30 transition-all">
                                <div className="p-2 bg-amber-500/10 rounded-xl w-fit text-amber-500">
                                    <MessageCircle size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">Meio (Engajamento)</h4>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1">VSL & WhatsApp IA</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 text-center px-4">Qualificação e quebra de objeções.</p>
                        </div>

                        {/* Bottom of Funnel */}
                        <div className="space-y-4 group">
                            <div className="h-40 bg-slate-900 border border-white/[0.05] rounded-3xl p-6 flex flex-col justify-between group-hover:border-emerald-500/30 transition-all">
                                <div className="p-2 bg-emerald-500/10 rounded-xl w-fit text-emerald-500">
                                    <Rocket size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">Fundo (Venda)</h4>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1">Fechamento Direto</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 text-center px-4">Foco em ROI e oferta irresistível.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Campaign Calendar Placeholder */}
            <div className="bg-dark-card border border-dark-border rounded-[2.5rem] p-10 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                            <CalendarIcon size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Calendário de Campanhas</h2>
                            <p className="text-sm text-slate-500 mt-1">Próximos lançamentos e promoções</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { date: 'Set 25', title: 'Lançamento Coleção Outono', icon: <Target className="text-primary-400" /> },
                        { date: 'Out 12', title: 'Campanha Dia das Crianças', icon: <Lightbulb className="text-amber-400" /> },
                        { date: 'Nov 24', title: 'Aquecimento Black Friday', icon: <Rocket className="text-purple-400" /> },
                    ].map((event, i) => (
                        <div key={i} className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-3xl group hover:border-white/20 transition-all">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{event.date}</span>
                            <div className="mt-4 flex items-center gap-3">
                                {event.icon}
                                <h4 className="text-sm font-bold text-white leading-tight">{event.title}</h4>
                            </div>
                        </div>
                    ))}
                    <div className="p-6 bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer">
                        <span className="text-xs font-bold text-slate-500">+ Novo Evento</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
