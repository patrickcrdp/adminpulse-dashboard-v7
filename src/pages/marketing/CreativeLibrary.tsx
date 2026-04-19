import * as React from 'react';
import {
    Image as ImageIcon,
    Plus,
    Search,
    Filter,
    TrendingUp,
    Eye,
    MoreHorizontal,
    Play,
    Star
} from 'lucide-react';
import { useCreativeLibrary } from '../../hooks/useCreativeLibrary';

export const CreativeLibrary: React.FC = () => {
    const { loading, creatives } = useCreativeLibrary();

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <ImageIcon className="text-primary-500" size={32} />
                        Biblioteca de Criativos
                    </h1>
                    <p className="text-slate-400 mt-2">Gestão de artes, vídeos e análise de performance visual</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all font-bold shadow-xl shadow-primary-500/20 active:scale-95">
                    <Plus size={20} />
                    Subir Novo Criativo
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-dark-card border border-dark-border p-4 rounded-2xl shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar criativo por nome ou tag..."
                        className="w-full bg-dark-bg border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all">
                        <Filter size={16} />
                        Todos os Formatos
                    </button>
                    <button className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all">
                        Mais Recentes
                    </button>
                </div>
            </div>

            {/* Creative Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {creatives.length > 0 ? creatives.map((item) => (
                    <div key={item.id} className="group bg-dark-card border border-dark-border rounded-[2rem] overflow-hidden shadow-2xl hover:border-primary-500/30 transition-all duration-500 flex flex-col">
                        <div className="aspect-[4/5] relative overflow-hidden bg-slate-900">
                            <img
                                src={item.media_url}
                                alt={item.name}
                                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                            />

                            {/* Overlay Badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[9px] font-black uppercase text-white border border-white/10 tracking-widest">
                                    {item.status === 'active' ? 'Ativo' : 'Pausado'}
                                </span>
                            </div>

                            {/* Performance Hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
                                            <TrendingUp size={14} />
                                        </div>
                                        <span className="text-xs font-bold text-white">Score {item.performance_score}</span>
                                    </div>
                                    <button className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center hover:scale-110 transition-transform">
                                        {item.media_type === 'video' ? <Play size={14} fill="currentColor" /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start gap-4">
                                <h3 className="text-sm font-bold text-white leading-tight flex-1">{item.name}</h3>
                                <button className="text-slate-600 hover:text-white transition-colors">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )) : !loading && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                        <p className="text-slate-500">Nenhum criativo encontrado.</p>
                    </div>
                )}

                {/* Empty State / Add Card always visible at end */}
                <div className="border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center p-10 group hover:border-primary-500/20 hover:bg-primary-500/5 transition-all cursor-pointer min-h-[300px]">
                    <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-slate-700 mb-4 group-hover:scale-110 group-hover:text-primary-400 transition-all">
                        <Plus size={32} />
                    </div>
                    <p className="text-sm font-bold text-slate-500 group-hover:text-white transition-colors">Novo Criativo</p>
                </div>
            </div>
        </div>
    );
};
