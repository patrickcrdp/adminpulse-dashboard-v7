import React from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    Filter,
    MoreVertical,
    Send,
    Paperclip,
    Smile,
    Phone,
    Video,
    CheckCheck,
    Check,
    User as UserIcon,
    MessageSquare,
    Instagram,
    Facebook,
    MoreHorizontal,
    Clock,
    CheckCircle2,
    AlertCircle,
    Zap
} from 'lucide-react';
import { useUnifiedInbox } from '../../hooks/useUnifiedInbox';

export const UnifiedInbox: React.FC = () => {
    const {
        conversations,
        selectedConvoId,
        setSelectedConvoId,
        messages,
        newMessage,
        setNewMessage,
        loading,
        activeTab,
        setActiveTab,
        stats,
        fetchMessages,
        handleSendMessage,
        handleClaimConvo,
        handleResolveConvo,
        selectedConvo
    } = useUnifiedInbox();
    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-700">
            {/* Indicadores Superiores */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[2rem] flex items-center gap-4 shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Aguardando</p>
                        <p className="text-2xl font-bold text-white">{stats.waiting}</p>
                    </div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[2rem] flex items-center gap-4 shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Em Atendimento</p>
                        <p className="text-2xl font-bold text-white">{stats.active}</p>
                    </div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[2rem] flex items-center gap-4 shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Finalizados Hoje</p>
                        <p className="text-2xl font-bold text-white">{stats.closedToday}</p>
                    </div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[2rem] flex items-center gap-4 shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Tempo de Resposta</p>
                        <p className="text-2xl font-bold text-white">-- min</p>
                    </div>
                </div>
            </div>

            <div className="flex h-[calc(100vh-250px)] bg-dark-bg/50 rounded-3xl overflow-hidden border border-white/5 shadow-2xl backdrop-blur-sm">
                {/* Sidebar de Conversas */}
                <div className="w-[350px] flex flex-col border-r border-white/5 bg-[#0d1325]/50">
                    <div className="p-6 space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <MessageSquare className="text-primary-400" size={24} />
                            Atendimentos
                        </h2>

                        <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                            {[
                                { id: 'new', label: 'Entrada' },
                                { id: 'in_progress', label: 'Abertos' },
                                { id: 'closed', label: 'Realizados' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === tab.id
                                        ? 'bg-primary-500 text-white shadow-lg'
                                        : 'text-slate-500 hover:text-white'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar conversa..."
                                className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-40 gap-3 opacity-50">
                                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Carregando...</span>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="p-8 text-center space-y-4">
                                <div className="w-16 h-16 bg-primary-500/10 border border-primary-500/20 rounded-2xl flex items-center justify-center mx-auto text-primary-400">
                                    <MessageSquare size={28} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold text-white">Caixa de Entrada Vazia</h3>
                                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium px-2">
                                        Ainda não temos mensagens. Coloque a URL Supabase na página de integrações (painel Meta).
                                    </p>
                                </div>
                                <Link 
                                    to="/inbox/integrations"
                                    className="inline-flex items-center justify-center w-[80%] mx-auto py-2.5 px-4 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/30 rounded-xl text-xs font-bold text-primary-400 transition-all gap-2 group"
                                >
                                    <Zap size={14} className="group-hover:scale-110 transition-transform" />
                                    Ir para Integrações
                                </Link>
                            </div>
                        ) : (
                            conversations.map(convo => (
                                <div
                                    key={convo.id}
                                    onClick={() => {
                                        setSelectedConvoId(convo.id);
                                        fetchMessages(convo.id);
                                    }}
                                    className={`group p-4 flex gap-4 cursor-pointer transition-all border-l-4 ${selectedConvoId === convo.id
                                        ? 'bg-primary-500/10 border-primary-500'
                                        : 'border-transparent hover:bg-white/[0.02]'
                                        }`}
                                >
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center overflow-hidden border border-white/10 group-hover:scale-105 transition-transform">
                                            {convo.customer_avatar ? (
                                                <img src={convo.customer_avatar} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="text-slate-500" size={20} />
                                            )}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 p-1 rounded-lg border-2 border-[#0d1325] ${convo.provider === 'whatsapp' ? 'bg-emerald-500' :
                                            convo.provider === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600' : 'bg-blue-600'
                                            }`}>
                                            {convo.provider === 'whatsapp' && <MessageSquare size={8} className="text-white" />}
                                            {convo.provider === 'instagram' && <Instagram size={8} className="text-white" />}
                                            {convo.provider === 'facebook' && <Facebook size={8} className="text-white" />}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-sm font-bold text-white truncate group-hover:text-primary-400 transition-colors">
                                                {convo.customer_name || 'Prospect Anônimo'}
                                            </h3>
                                            <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                                                {new Date(convo.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate leading-relaxed">
                                            {convo.last_message || 'Iniciou uma conversa'}
                                        </p>
                                    </div>
                                    {convo.unread_count > 0 && (
                                        <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-primary-500/20">
                                            {convo.unread_count}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Janela de Chat */}
                <div className="flex-1 flex flex-col bg-slate-900/20 backdrop-blur-xl relative">
                    {selectedConvo ? (
                        <>
                            {/* Header do Chat */}
                            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-white/10 overflow-hidden">
                                        {selectedConvo.customer_avatar ? (
                                            <img src={selectedConvo.customer_avatar} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary-500/10 text-primary-400">
                                                <UserIcon size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white leading-none mb-1">{selectedConvo.customer_name}</h3>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm animate-pulse"></div>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Online via {selectedConvo.provider}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedConvo.status === 'new' && (
                                        <button
                                            onClick={handleClaimConvo}
                                            className="px-4 py-2 bg-primary-500 text-white text-xs font-bold rounded-xl hover:bg-primary-600 transition-all flex items-center gap-2"
                                        >
                                            <UserIcon size={14} />
                                            Assumir Atendimento
                                        </button>
                                    )}
                                    {selectedConvo.status === 'in_progress' && (
                                        <button
                                            onClick={handleResolveConvo}
                                            className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-xl hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2"
                                        >
                                            <CheckCheck size={14} />
                                            Finalizar Atendimento
                                        </button>
                                    )}
                                    <button className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                        <Phone size={18} />
                                    </button>
                                    <button className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                        <Video size={18} />
                                    </button>
                                    <div className="w-px h-6 bg-white/5 mx-2"></div>
                                    <button className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Mensagens */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-95">
                                {messages.map((msg, idx) => {
                                    const isSentByMe = !msg.is_from_customer;
                                    return (
                                        <div key={msg.id || idx} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                            <div className={`max-w-[70%] group relative ${isSentByMe ? 'order-1' : 'order-2'}`}>
                                                <div className={`p-4 rounded-3xl shadow-xl transition-all hover:shadow-2xl ${isSentByMe
                                                    ? 'bg-primary-600 text-white rounded-tr-sm'
                                                    : 'bg-white/10 text-slate-200 backdrop-blur-md border border-white/10 rounded-tl-sm'
                                                    }`}>
                                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                                    <div className={`flex items-center gap-1.5 mt-2 ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                                                        <span className="text-[9px] opacity-60 font-bold uppercase tracking-tighter">
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {isSentByMe && (
                                                            <CheckCheck size={12} className="text-white/60" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Input do Chat */}
                            <div className="p-6 bg-white/[0.02] border-t border-white/5">
                                <form onSubmit={handleSendMessage} className="flex items-end gap-4">
                                    <div className="flex-1 bg-white/5 border border-white/5 rounded-3xl relative focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all p-2">
                                        <div className="px-2 pb-2 flex items-center gap-1">
                                            <button type="button" className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all">
                                                <Paperclip size={18} />
                                            </button>
                                            <button type="button" className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all">
                                                <Smile size={18} />
                                            </button>
                                        </div>
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage(e);
                                                }
                                            }}
                                            placeholder="Escreva sua mensagem profissional..."
                                            rows={1}
                                            className="w-full bg-transparent border-none focus:ring-0 text-sm text-white px-4 py-2 resize-none custom-scrollbar min-h-[44px] max-h-[120px]"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="w-14 h-14 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:grayscale text-white rounded-3xl shadow-xl shadow-primary-500/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
                                    >
                                        <Send size={24} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-24 h-24 bg-primary-500/10 rounded-[2.5rem] flex items-center justify-center text-primary-400 mb-8 animate-pulse shadow-2xl shadow-primary-500/20 border border-primary-500/20">
                                <MessageSquare size={48} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Selecione um Atendimento</h3>
                            <p className="text-slate-500 text-sm max-w-sm leading-relaxed uppercase tracking-widest font-black opacity-70">
                                Escolha uma conversa à esquerda para iniciar o suporte multicanal unificado.
                            </p>
                            <div className="grid grid-cols-3 gap-6 mt-12 opacity-30">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                                        <MessageSquare size={24} />
                                    </div>
                                    <span className="text-[10px] font-bold">WhatsApp</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
                                        <Instagram size={24} />
                                    </div>
                                    <span className="text-[10px] font-bold">Instagram</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                                        <Facebook size={24} />
                                    </div>
                                    <span className="text-[10px] font-bold">Facebook</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
