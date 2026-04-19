import React from 'react';
import {
    MessageSquare,
    Instagram,
    Facebook,
    ShieldCheck,
    Zap,
    Globe,
    AlertCircle,
    CheckCircle2,
    Loader2,
    ExternalLink,
    Bot,
    Settings
} from 'lucide-react';

import { useInboxIntegrations } from '../../hooks/useInboxIntegrations';

export const InboxIntegrations: React.FC = () => {
    const {
        loading,
        integrations,
        success,
        error,
        isModalOpen,
        setIsModalOpen,
        selectedProvider,
        formData,
        setFormData,
        handleConnectMeta,
        handleSaveIntegration
    } = useInboxIntegrations();

    const providers = [
        {
            id: 'whatsapp',
            name: 'WhatsApp Business',
            description: 'Envie e receba mensagens oficiais através da Cloud API da Meta.',
            icon: <MessageSquare className="text-emerald-400" size={32} />,
            color: 'emerald',
            status: integrations.find(i => i.provider === 'whatsapp') ? 'connected' : 'disconnected'
        },
        {
            id: 'instagram',
            name: 'Instagram Direct',
            description: 'Responda DMs e comentários diretamente do seu painel AdminPulse.',
            icon: <Instagram className="text-pink-500" size={32} />,
            color: 'pink',
            status: integrations.find(i => i.provider === 'instagram') ? 'connected' : 'disconnected'
        },
        {
            id: 'facebook',
            name: 'Messenger',
            description: 'Centralize o atendimento da sua Fanpage oficial do Facebook.',
            icon: <Facebook className="text-blue-600" size={32} />,
            color: 'blue',
            status: integrations.find(i => i.provider === 'facebook') ? 'connected' : 'disconnected'
        }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col gap-3">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Canais de Atendimento</h1>
                <p className="text-slate-400 text-lg">Conecte suas redes sociais e centralize toda sua comunicação em um só lugar.</p>
                <div className="h-1 w-20 bg-primary-500 rounded-full mt-2"></div>
            </div>

            {(success || error) && (
                <div className={`p-5 rounded-2xl flex items-center gap-4 border shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300 ${success ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                    }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${success ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                        {success ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    </div>
                    <span className="text-base font-semibold">{success || error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {providers.map((p) => (
                    <div key={p.id} className="group bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-8 flex flex-col items-center text-center hover:border-primary-500/30 transition-all duration-500 shadow-2xl relative overflow-hidden">
                        {p.status === 'connected' && (
                            <div className="absolute top-6 right-6">
                                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                    Online
                                </div>
                            </div>
                        )}

                        <div className={`w-20 h-20 rounded-3xl bg-${p.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                            {p.icon}
                        </div>

                        <h3 className="text-xl font-bold text-white mb-3">{p.name}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1">
                            {p.description}
                        </p>

                        <button
                            onClick={() => p.status === 'disconnected' && handleConnectMeta(p)}
                            disabled={loading || p.status === 'connected'}
                            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 active:scale-95 ${p.status === 'connected'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                                : 'bg-white/5 text-white hover:bg-white/10 hover:shadow-xl'
                                }`}
                        >
                            {loading && selectedProvider?.id === p.id ? <Loader2 className="animate-spin" size={20} /> : p.status === 'connected' ? 'Configurado' : 'Conectar Agora'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Dashboard / Webhook Info */}
            <div className="bg-gradient-to-br from-primary-500/5 to-indigo-500/5 border border-white/[0.05] rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400 border border-primary-500/20">
                                <Zap size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Status do Webhook Unificado</h2>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            Para receber mensagens em tempo real, você deve configurar o endpoint abaixo no seu painel de desenvolvedor da Meta. Todas as mensagens (Whats, Insta, FB) virão por este canal seguro.
                        </p>

                        <div className="space-y-4">
                            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-3 shadow-inner">
                                <div className="flex justify-between items-center text-[10px] text-slate-500 font-black tracking-widest uppercase">
                                    <span>Webhook URL</span>
                                    <span className="text-emerald-500">Pronto para Receber</span>
                                </div>
                                <div className="font-mono text-sm text-primary-300 break-all select-all flex items-center gap-3">
                                    <Globe size={14} className="opacity-50" />
                                    {`https://qcbihcjgscjxeqvlbpdz.supabase.co/functions/v1/meta-webhook`}
                                </div>
                            </div>

                            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-3 shadow-inner">
                                <div className="text-[10px] text-slate-500 font-black tracking-widest uppercase">Verify Token (Segurança)</div>
                                <div className="font-mono text-sm text-white/50 tracking-wider">
                                    adminpulse_secure_token_v1
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-3xl space-y-4 hover:shadow-2xl transition-all">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                                <ShieldCheck size={20} />
                            </div>
                            <h4 className="font-bold text-white text-sm">Criptografia Ponta-a-Ponta</h4>
                            <p className="text-xs text-slate-500 leading-relaxed uppercase tracking-widest font-black opacity-60">Sua privacidade Meta é preservada em nossos servidores.</p>
                        </div>
                        <div className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-3xl space-y-4 hover:shadow-2xl transition-all">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <ExternalLink size={20} />
                            </div>
                            <h4 className="font-bold text-white text-sm">Documentação Meta</h4>
                            <p className="text-xs text-slate-500 leading-relaxed uppercase tracking-widest font-black opacity-60">Siga o passo a passo para liberar permissões no App.</p>
                        </div>
                        <div className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-3xl space-y-4 hover:shadow-2xl transition-all">
                            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400">
                                <Bot size={20} />
                            </div>
                            <h4 className="font-bold text-white text-sm">Automação IA</h4>
                            <p className="text-xs text-slate-500 leading-relaxed uppercase tracking-widest font-black opacity-60">Configure chatbots para responder enquanto você dorme.</p>
                        </div>
                        <div className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-3xl space-y-4 hover:shadow-2xl transition-all">
                            <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-400">
                                <Settings size={20} />
                            </div>
                            <h4 className="font-bold text-white text-sm">Gestão de Equipe</h4>
                            <p className="text-xs text-slate-500 leading-relaxed uppercase tracking-widest font-black opacity-60">Atribua conversas para atendentes específicos.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Configuração Manual */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 relative shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center gap-4 mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400">
                                {selectedProvider?.icon}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Configurar {selectedProvider?.name}</h3>
                                <p className="text-slate-500 text-sm">Insira as credenciais geradas no seu Meta for Developers.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-4">Phone Number ID</label>
                                <input
                                    type="text"
                                    placeholder="Ex: 587892517743258"
                                    value={formData.provider_id}
                                    onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-4">Access Token Permanente</label>
                                <textarea
                                    placeholder="Insira o System User Access Token"
                                    rows={4}
                                    value={formData.access_token}
                                    onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-mono text-xs"
                                />
                            </div>

                            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-3">
                                <AlertCircle className="text-amber-500 shrink-0" size={18} />
                                <p className="text-[10px] text-amber-200/50 leading-relaxed font-medium">
                                    Certifique-se de que o seu Webhook no painel da Meta já esteja apontando para o endereço fornecido no painel de controle abaixo.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 rounded-2xl font-bold text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveIntegration}
                                    disabled={loading || !formData.provider_id || !formData.access_token}
                                    className="flex-2 py-4 px-10 rounded-2xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Salvar Conexão'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
