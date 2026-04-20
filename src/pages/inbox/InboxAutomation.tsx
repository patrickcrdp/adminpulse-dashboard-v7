import React, { useState, useEffect } from 'react';
import {
    Bot,
    Wand2,
    MessageSquare,
    Save,
    Play,
    StopCircle,
    BrainCircuit,
    Zap,
    Network,
    HelpCircle,
    Loader2,
    CheckCircle2,
    Eye,
    EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { InboxFacade } from '../../services/inboxFacade';

export const InboxAutomation: React.FC = () => {
    const { organization } = useAuth();
    
    const [botActive, setBotActive] = useState(false);
    const [provider, setProvider] = useState('openai');
    const [apiKey, setApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [whatsappActive, setWhatsappActive] = useState(true);
    const [allowCalendar, setAllowCalendar] = useState(true);
    const [prompt, setPrompt] = useState('Você é a assistente virtual da nossa empresa. Seja educada, concisa e tente sempre qualificar o lead solicitando nome e motivo do contato antes de transferir para um atendente humano.');
    
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            if (!organization?.id) return;
            try {
                const data = await InboxFacade.fetchAiSettings(organization.id);
                if (data) {
                    setProvider(data.provider || 'openai');
                    setApiKey(data.api_key || '');
                    setPrompt(data.system_prompt || prompt);
                    setAllowCalendar(data.allow_calendar_access ?? true);
                    setBotActive(!!data.api_key && data.api_key.length > 5);
                }
            } catch (err) {
                console.error("Falha ao carregar AI Settings", err);
            }
        };
        loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organization?.id]);

    const handleSave = async () => {
        if (!organization?.id) return;
        setSaving(true);
        setSuccess(false);
        try {
            await InboxFacade.saveAiSettings({
                organization_id: organization.id,
                provider,
                api_key: apiKey,
                system_prompt: prompt,
                allow_calendar_access: allowCalendar
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            
            // Auto-ativa o painel caso haja uma chave válida agora
            if (apiKey.length > 5) setBotActive(true);
            else setBotActive(false);

        } catch (err) {
            console.error("Falha ao salvar AI Settings", err);
            alert("Erro ao salvar configurações da IA.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-400">
                        <Bot size={28} />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Cérebro da Inteligência Artificial</h1>
                </div>
                <p className="text-slate-400 text-lg">
                    Configure os robôs híbridos que vão atender e qualificar seus leads 24h por dia no WhatsApp e Instagram.
                </p>
                <div className="h-1 w-20 bg-primary-500 rounded-full mt-2"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna Esquerda - Status do Bot */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Zap className={botActive ? "text-amber-400" : "text-slate-500"} size={24} /> 
                                Motor Central
                            </h3>
                            <div className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 ${botActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${botActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></div>
                                {botActive ? 'Operando' : 'Desligado'}
                            </div>
                        </div>

                        <p className="text-sm text-slate-400 leading-relaxed mb-6">
                            Quando o motor está ativo, a IA tentará responder a todos os tickets na aba <strong>"Entrada"</strong> até que a intenção seja resolvida ou até que um humano assuma o atendimento (transferindo para a aba Abertos).
                        </p>

                        <button 
                            onClick={() => setBotActive(!botActive)}
                            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${botActive ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 shadow-lg' : 'bg-primary-500 text-white shadow-xl shadow-primary-500/20 hover:scale-105'}`}
                        >
                            {botActive ? <StopCircle size={20} /> : <Play size={20} />}
                            {botActive ? 'Pausar Atendimento IA' : 'Ligar Piloto Automático'}
                        </button>
                    </div>

                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                         <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Network className="text-indigo-400" size={24} /> 
                            Canais com IA
                        </h3>
                        <div className="space-y-3 mt-4">
                            <div 
                                onClick={() => setWhatsappActive(!whatsappActive)}
                                className={`flex items-center justify-between p-4 bg-black/40 border cursor-pointer transition-all rounded-xl ${whatsappActive ? 'border-primary-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-white/5 opacity-70'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <MessageSquare size={18} className={whatsappActive ? "text-emerald-400" : "text-slate-500"} />
                                    <span className={`text-sm font-bold ${whatsappActive ? 'text-white' : 'text-slate-400'}`}>WhatsApp Oficial</span>
                                </div>
                                <div className={`w-10 h-6 rounded-full relative transition-all ${whatsappActive ? 'bg-primary-500' : 'bg-slate-700'}`}>
                                   <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${whatsappActive ? 'right-1' : 'left-1'}`}></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl opacity-50">
                                <div className="flex items-center gap-3">
                                    <MessageSquare size={18} className="text-slate-500" />
                                    <span className="text-sm font-bold text-slate-500">Instagram Direto</span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase">Em Breve</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-8 space-y-4 shadow-2xl">
                         <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                            <BrainCircuit className="text-indigo-400" size={24} /> 
                            Habilidades da IA
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">Conceda acessos seguros aos módulos do AdminPulse para a IA usar como ferramentas (Function Calling).</p>
                        
                        
                        <div 
                            onClick={() => setAllowCalendar(!allowCalendar)}
                            className={`flex items-start gap-4 p-4 bg-black/40 border ${allowCalendar ? 'border-indigo-500/50 hover:bg-indigo-500/10' : 'border-white/5 hover:bg-white/5'} rounded-xl transition-all cursor-pointer group`}
                        >
                            <div className="mt-1">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${allowCalendar ? 'border-indigo-500 bg-indigo-500/20' : 'border-slate-600 bg-black'}`}>
                                    {allowCalendar && <div className="w-2.5 h-2.5 bg-indigo-400 rounded-sm"></div>}
                                </div>
                            </div>
                            <div>
                                <p className={`text-sm font-bold transition-colors ${allowCalendar ? 'text-indigo-300' : 'text-slate-500'}`}>Acesso Total à Agenda</p>
                                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">Permite visualização de buracos na agenda e criação de eventos/lembretes para clientes em tempo real.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coluna Direita - Engenharia de Prompt */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-8 shadow-2xl">
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                                        <Wand2 className="text-purple-400" size={28} /> 
                                        Engenharia da Personalidade
                                        <div className="relative group ml-1 flex items-center justify-center">
                                            <HelpCircle className="text-slate-500 cursor-help hover:text-white transition-colors" size={20} />
                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 origin-bottom scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 pointer-events-none w-80 p-4 bg-slate-800 text-xs text-slate-300 rounded-2xl shadow-2xl z-50 border border-slate-700 font-normal leading-relaxed text-center">
                                                Uma enorme caixa de texto (System Prompt) onde você ou o dono da clínica diz à IA como ela deve se portar, os preços dos serviços, e a meta que ela precisa atingir (ex: "Sempre tente agendar uma consulta antes de repassar pro humano").
                                                <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-slate-700"></div>
                                                <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-slate-800 mt-[-1px]"></div>
                                            </div>
                                        </div>
                                    </h3>
                                    <p className="text-sm text-slate-400">Instrua o LLM (Large Language Model) sobre como ele deve tratar seus clientes.</p>
                                </div>
                                <select 
                                    value={provider}
                                    onChange={(e) => setProvider(e.target.value)}
                                    className="bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-white outline-none focus:border-primary-500 cursor-pointer"
                                >
                                    <option value="openai">🎯 GPT-4o Mini (OpenAI)</option>
                                    <option value="gemini">✨ Gemini 1.5 Pro (Google)</option>
                                    <option value="claude">🔮 Claude 3.5 (Anthropic)</option>
                                </select>
                            </div>

                            <div className="relative">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 absolute -top-2 left-2 bg-[#0a0f1d] px-2 z-10">
                                    Chave da API (Sua própria {provider === 'openai' ? 'OpenAI Key' : provider === 'gemini' ? 'Makersuite Key' : 'Anthropic Key'})
                                </label>
                                <input 
                                    type={showApiKey ? "text" : "password"}
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pr-12 text-sm text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all mb-6 font-mono"
                                    placeholder={provider === 'openai' ? 'sk-...' : 'Cole sua chave secreta aqui...'}
                                />
                                <button 
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="relative">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4 absolute -top-2 left-2 bg-[#0a0f1d] px-2 z-10">Instrução de Sistema (System Prompt)</label>
                                <textarea 
                                    className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 text-sm text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none custom-scrollbar leading-loose"
                                    rows={10}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="p-5 bg-purple-500/5 border border-purple-500/20 rounded-2xl flex gap-3">
                                <BrainCircuit className="text-purple-400 shrink-0" size={20} />
                                <div className="space-y-1">
                                    <p className="text-[11px] text-purple-200/70 font-bold uppercase tracking-widest">Dica de Engenharia</p>
                                    <p className="text-xs text-purple-200/50 leading-relaxed max-w-2xl">
                                        Para criar um Agente Implacável, informe explicitamente os preços, horários de funcionamento e o nome de pelo menos 1 funcionário (ex: "se despeça dizendo que o Dr. Marcos o aguarda.").
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-white/5 gap-4">
                                {success && (
                                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold animate-in fade-in zoom-in pr-4">
                                        <CheckCircle2 size={18} />
                                        Cérebro atualizado!
                                    </div>
                                )}
                                <button 
                                    onClick={handleSave}
                                    disabled={saving || !apiKey}
                                    className="py-4 px-10 rounded-2xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-white font-bold text-sm shadow-xl shadow-primary-500/20 transition-all flex items-center gap-2"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Salvar Cérebro Digital
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
