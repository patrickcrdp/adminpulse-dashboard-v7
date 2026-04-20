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
    Settings,
    Copy,
    X
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

    const [copiedText, setCopiedText] = React.useState<string | null>(null);
    const [activeInfoModal, setActiveInfoModal] = React.useState<'crypto'|'docs'|'ai'|'team' | null>(null);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000);
    };

    const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL || 'https://[SEU-PROJETO].supabase.co'}/functions/v1/whatsapp-webhook`;
    const verifyToken = "adminpulse_secure_token_v1";

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
                            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-3 shadow-inner relative group">
                                <div className="flex justify-between items-center text-[10px] text-slate-500 font-black tracking-widest uppercase mb-1">
                                    <span>Webhook URL Oficial</span>
                                    <span className="text-emerald-500">Copie e Cole na Meta</span>
                                </div>
                                <div className="font-mono text-[13px] text-primary-300 break-all select-all flex items-center justify-between gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Globe size={14} className="opacity-50" />
                                        {webhookUrl}
                                    </div>
                                    <button 
                                        onClick={() => handleCopy(webhookUrl)}
                                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all shrink-0"
                                        title="Copiar URL"
                                    >
                                        {copiedText === webhookUrl ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                                    Este é o seu túnel criptografado. Todas as clínicas enviarão mensagens para este mesmo hub, e nosso sistema fará o roteamento interno automático de quem é quem pelo número da WABA.
                                </p>
                            </div>

                            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-inner relative group">
                                <div className="flex justify-between items-center text-[10px] text-slate-500 font-black tracking-widest uppercase mb-3">
                                    <span>Verify Token (Segurança)</span>
                                </div>
                                <div className="font-mono text-sm text-emerald-400 tracking-wider flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                                    {verifyToken}
                                    <button 
                                        onClick={() => handleCopy(verifyToken)}
                                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all shrink-0"
                                        title="Copiar Token"
                                    >
                                        {copiedText === verifyToken ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div 
                            onClick={() => setActiveInfoModal('crypto')}
                            className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-3xl space-y-4 hover:shadow-2xl hover:bg-white/[0.04] transition-all cursor-pointer group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={20} />
                            </div>
                            <h4 className="font-bold text-white text-sm">Criptografia Ponta-a-Ponta</h4>
                            <p className="text-xs text-slate-500 leading-relaxed uppercase tracking-widest font-black opacity-60">Sua privacidade Meta é preservada em nossos servidores.</p>
                        </div>
                        <div 
                            onClick={() => setActiveInfoModal('docs')}
                            className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-3xl space-y-4 hover:shadow-2xl hover:bg-white/[0.04] transition-all cursor-pointer group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                <ExternalLink size={20} />
                            </div>
                            <h4 className="font-bold text-white text-sm">Documentação Meta</h4>
                            <p className="text-xs text-slate-500 leading-relaxed uppercase tracking-widest font-black opacity-60">Siga o passo a passo para liberar permissões no App.</p>
                        </div>
                        <div 
                            onClick={() => setActiveInfoModal('ai')}
                            className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-3xl space-y-4 hover:shadow-2xl hover:bg-white/[0.04] transition-all cursor-pointer group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform">
                                <Bot size={20} />
                            </div>
                            <h4 className="font-bold text-white text-sm">Automação IA</h4>
                            <p className="text-xs text-slate-500 leading-relaxed uppercase tracking-widest font-black opacity-60">Configure chatbots para responder enquanto você dorme.</p>
                        </div>
                        <div 
                            onClick={() => setActiveInfoModal('team')}
                            className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-3xl space-y-4 hover:shadow-2xl hover:bg-white/[0.04] transition-all cursor-pointer group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
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
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-4">Account ID (Phone ID, Page ID ou IGSID)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: 587892517743258"
                                    value={formData.phone_number_id}
                                    onChange={(e) => setFormData({ ...formData, phone_number_id: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-4">Business Account ID (WABA ou BM ID)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: 123456789098765"
                                    value={formData.waba_id}
                                    onChange={(e) => setFormData({ ...formData, waba_id: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-4">Access Token Permanente</label>
                                <textarea
                                    placeholder="Insira o System User Access Token gerado na Meta"
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
                                    disabled={loading || !formData.phone_number_id || !formData.waba_id || !formData.access_token}
                                    className="flex-2 py-4 px-10 rounded-2xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Salvar Conexão'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modais Educativos Multi-Card */}
            {activeInfoModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setActiveInfoModal(null)}></div>
                    <div className="bg-[#0f172a] border border-white/10 w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-[2.5rem] p-10 relative shadow-2xl animate-in zoom-in-95 duration-300 custom-scrollbar">
                        <button 
                            onClick={() => setActiveInfoModal(null)}
                            className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
                        >
                            <X size={20} />
                        </button>

                        {/* Modal de Documentação */}
                        {activeInfoModal === 'docs' && (
                            <>
                                <div className="mb-10 text-center">
                                    <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6">
                                        <Globe size={32} />
                                    </div>
                                    <h3 className="text-3xl font-extrabold text-white tracking-tight mb-2">Guia Omnichannel Meta</h3>
                                    <p className="text-slate-400">Como pegar suas chaves oficiais do negócio e ligar ao AdminPulse.</p>
                                </div>
                                <div className="space-y-10">
                                    {/* Modulo 1 */}
                                    <section className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8">
                                        <h4 className="text-xl font-bold text-emerald-400 flex items-center gap-3 mb-6">
                                            <MessageSquare size={24} />
                                            1. Acessando Chaves do WhatsApp Business
                                        </h4>
                                        <ol className="list-decimal pl-5 space-y-4 text-sm text-slate-300 leading-relaxed">
                                            <li>Acesse o <a href="https://developers.facebook.com/" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline font-semibold">Meta for Developers</a> e clique em "Meus Aplicativos" para Criar um Aplicativo Empresarial.</li>
                                            <li>Desça a lista de produtos, encontre o <strong>WhatsApp</strong> e clique em Configurar.</li>
                                            <li>No menu esquerdo, vá em <strong>WhatsApp {'>'} Configuração</strong>. Cole sua <em>Webhook URL Oficial</em> e o <em>Verify Token</em> gerados na página do AdminPulse. Confirme.</li>
                                            <li>Vá em <strong>WhatsApp {'>'} Configuração da API</strong> para encontrar os seus IDs nativos: <em>Phone Number ID</em> e o <em>WABA ID</em> da Conta.</li>
                                            <li>Para gerar o Token de Acesso Permanente: Vá ao <strong>Gerenciador de Negócios (Business Settings)</strong>. Crie um "Usuário do Sistema" com permissão administrativa, atribua seu novo app a ele e mande "Gerar Novo Token". <strong>Atenção:</strong> Escolha a opção de tempo Indeterminado e marque `whatsapp_business_messaging`.</li>
                                            <li className="text-white font-medium bg-black/30 p-4 rounded-xl mt-4">Vá no Modal do WhatsApp aqui no AdminPulse, cole o Phone ID, o WABA ID e jogue o Token Gigante. Salvar!</li>
                                        </ol>
                                    </section>

                                    {/* Modulo 2 */}
                                    <section className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8">
                                        <h4 className="text-xl font-bold text-pink-400 flex items-center gap-3 mb-6">
                                            <Instagram size={24} />
                                            2. Acessando Chaves do Instagram Direct
                                        </h4>
                                        <ol className="list-decimal pl-5 space-y-4 text-sm text-slate-300 leading-relaxed">
                                            <li>No seu Meta for Developers, adicione o produto <strong>Messenger</strong>. (O Instagram Direct é gerenciado pelo próprio hub do Messenger).</li>
                                            <li>Vá em <strong>Messenger {'>'} Configurações do Instagram</strong>.</li>
                                            <li>Clique em "Adicionar Páginas" e identifique a Página do Facebook que está devidamente conectada à sua Conta Profissional do Instagram.</li>
                                            <li>Aperte o botão <strong>"Gerar Token"</strong> que aparece na linha da sua página conectada. Este código gigante é o Access Token do Instagram.</li>
                                            <li>Copie o seu <strong>IGSID (Instagram Account ID)</strong> que está visível ao lado da foto do seu Perfil lá mesmo.</li>
                                            <li>Role para baixo até "Webhooks", cole as chaves do AdminPulse e lembre-se de clicar em <em>"Adicionar Assinaturas"</em> marcando a caixa `messages`.</li>
                                            <li className="text-white font-medium bg-black/30 p-4 rounded-xl mt-4">Vá no Modal do Instagram aqui no AdminPulse, cole o seu IGSID no campo (Account ID) e cole o Token. Salvar!</li>
                                        </ol>
                                    </section>

                                    {/* Modulo 3 */}
                                    <section className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8">
                                        <h4 className="text-xl font-bold text-blue-400 flex items-center gap-3 mb-6">
                                            <Facebook size={24} />
                                            3. Acessando Chaves do Facebook Messenger
                                        </h4>
                                        <ol className="list-decimal pl-5 space-y-4 text-sm text-slate-300 leading-relaxed">
                                            <li>No Meta for Developers, vá em <strong>Messenger {'>'} Configurações do Facebook</strong>.</li>
                                            <li>Adicione a sua Página e clique em "Gerar Token". (Funciona de forma idêntica ao passo de cima, mas dedicado ao Facebook).</li>
                                            <li>O ID a ser usado será o seu <strong>Page ID</strong> (Encontrado no menu "Sobre" da sua Fanpage no próprio site do FB).</li>
                                            <li>Lá embaixo em Webhooks da Página (Seção Webhooks do Messenger, diferente da do Insta), ative a URL do AdminPulse com as devidas permissões (`messages`).</li>
                                            <li className="text-white font-medium bg-black/30 p-4 rounded-xl mt-4">Vá no Modal do Messenger aqui no AdminPulse, cole a chave da Fanpage (Page ID) no primeiro campo, e seu Token no último. Salvar!</li>
                                        </ol>
                                    </section>
                                </div>
                            </>
                        )}

                        {/* Modal de Criptografia */}
                        {activeInfoModal === 'crypto' && (
                            <div className="space-y-6">
                                <div className="mb-6 text-center">
                                    <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 mb-6">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <h3 className="text-3xl font-extrabold text-white tracking-tight mb-2">Criptografia Ponta-a-Ponta</h3>
                                    <p className="text-slate-400">Segurança de dados padrão bancário para seus pacientes.</p>
                                </div>
                                <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 space-y-4 text-sm text-slate-300 leading-relaxed">
                                    <p>O AdminPulse utiliza túneis HTTP Securos via TLS 1.3 para se comunicar diretamente com os servidores da Meta no Vale do Silício.</p>
                                    <p>Suas mensagens não ficam trafegando pela web expostas. Uma vez recebidas através das nossas Edge Functions, elas são empacotadas com chaves AES de Nível Enterprise e arquivadas no Banco de Dados em Clusters Protegidos pelas políticas da AWS.</p>
                                    <p>No AdminPulse, Privacidade do Paciente e Proteção do Médico é uma via de mão única: rígida, isolada e imutável pelo Row Level Security (RLS) PostgreSQL.</p>
                                </div>
                            </div>
                        )}

                        {/* Modal de IA Automacao */}
                        {activeInfoModal === 'ai' && (
                            <div className="space-y-6">
                                <div className="mb-6 text-center">
                                    <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400 mb-6">
                                        <Bot size={32} />
                                    </div>
                                    <h3 className="text-3xl font-extrabold text-white tracking-tight mb-2">Automação IA Omnichannel</h3>
                                    <p className="text-slate-400">Chatbots generativos prontos para agendar para você enquanto você dorme.</p>
                                </div>
                                <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 space-y-4 text-sm text-slate-300 leading-relaxed">
                                    <p>Enquanto a concorrência trabalha com "respostas fixas" ou botões, nós inserimos GPT-4 em cada ramificação de conversa das suas redes sociais.</p>
                                    <p>Não importa se o paciente mandou mensagem no Instagram, Messenger ou WhatsApp, ele falará com a IA que nós conectamos a sua clínica na aba de "Automação OpenAI" (InboxAutomation).</p>
                                    <p>Os robôs possuem contexto sobre a agenda médica real e o tarifário que a clínica embutiu, podendo triar dúvidas triviais, reduzindo o tráfego da recepção física em até 70%.</p>
                                </div>
                            </div>
                        )}

                        {/* Modal de Gestao de Equipe */}
                        {activeInfoModal === 'team' && (
                            <div className="space-y-6">
                                <div className="mb-6 text-center">
                                    <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-500/10 flex items-center justify-center text-slate-400 mb-6">
                                        <Settings size={32} />
                                    </div>
                                    <h3 className="text-3xl font-extrabold text-white tracking-tight mb-2">Gestão de Equipe e Triagem</h3>
                                    <p className="text-slate-400">Múltiplos atendentes. Somente um número de telefone/Insta.</p>
                                </div>
                                <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 space-y-4 text-sm text-slate-300 leading-relaxed">
                                    <p>Na aba Inbox Central, você tem um funil tridimensional (Nova Entrada, Em Atendimento, Finalizados).</p>
                                    <p>Se a Clínica tiver 5 secretárias e 3 canais de atendimento conectados (Whats, Face, Insta), nenhuma secretária "atropelará" a outra. Uma vez que o Ticket sai da Triagem (Aberto) e entra para Conversa (Em Atendimento), a secretária X toma a propriedade de estar resolvendo o problema do "João da Silva".</p>
                                    <p>Sua equipe coordena o caos Omni de forma invisível para o cliente.</p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};
