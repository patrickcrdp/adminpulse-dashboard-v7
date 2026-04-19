import React from 'react';
import { User, Building2, Camera, Save, Loader2, CheckCircle2, AlertCircle, Phone, Bot, Copy, ExternalLink, Zap, LayoutList, Plus, GripVertical, Trash2, Edit2, Target, Megaphone, DollarSign, BarChart } from 'lucide-react';
import { useSettingsData } from '../hooks/useSettingsData';
import { TeamSettings } from '../components/settings/TeamSettings';

export const Settings: React.FC = () => {
    const {
        user, loading, success, error, fullName, setFullName, avatarUrl,
        orgName, setOrgName, orgPhone, setOrgPhone, logoUrl,
        aiConfig, copySuccess, stages, newStageName, setNewStageName,
        marketingConfig, setMarketingConfig, integrations, handleUpdateMarketing,
        handleConnectAds, handleAddStage, handleDeleteStage, handleCreateAIKey,
        copyToClipboard, handleUpdateProfile, handleUpdateOrganization, handleFileUpload
    } = useSettingsData();

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col gap-3">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Ajustes do Sistema</h1>
                <p className="text-slate-400 text-lg">Personalize sua experiência corporativa e perfil pessoal.</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Profile Card */}
                <div className="group bg-white/[0.02] border border-white/[0.05] rounded-[2rem] overflow-hidden shadow-2xl hover:border-primary-500/30 transition-all duration-500 backdrop-blur-sm">
                    <div className="p-8 border-b border-white/[0.05] bg-white/[0.01] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400 border border-primary-500/20 group-hover:scale-110 transition-transform duration-500">
                            <User size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Perfil Pessoal</h2>
                    </div>
                    <div className="p-10 space-y-10">
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-slate-900 border-2 border-white/[0.05] overflow-hidden flex items-center justify-center shadow-inner group-hover:border-primary-500/50 transition-all duration-500">
                                    <span className="w-full h-full flex items-center justify-center">
                                        {avatarUrl
                                            ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                                            : <span className="text-5xl font-black text-slate-700 uppercase">{user?.email?.charAt(0)}</span>
                                        }
                                    </span>
                                </div>
                                <label className="absolute -bottom-2 -right-2 p-3 bg-primary-500 text-white rounded-2xl shadow-[0_10px_20px_rgba(99,102,241,0.4)] cursor-pointer hover:bg-primary-600 hover:scale-110 transition-all duration-300 active:scale-95">
                                    <Camera size={20} />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar')} />
                                </label>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-white">Foto de Perfil</p>
                                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest leading-relaxed">
                                    Máx 2MB • JPG, PNG ou WebP<br />
                                    Sugerido: 512x512px
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">E-mail Corporativo</label>
                                <input
                                    type="text"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl px-5 py-4 text-slate-500 cursor-not-allowed text-sm font-medium"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Nome Completo</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/[0.05] rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-medium placeholder:text-slate-700"
                                    placeholder="Seu nome completo"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-3 group shadow-[0_15px_30px_rgba(99,102,241,0.3)] hover:shadow-[0_20px_40px_rgba(99,102,241,0.4)] active:scale-95"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                                Salvar Perfil
                            </button>
                        </form>
                    </div>
                </div>

                {/* Organization Card */}
                <div className="group bg-white/[0.02] border border-white/[0.05] rounded-[2rem] overflow-hidden shadow-2xl hover:border-amber-500/30 transition-all duration-500 backdrop-blur-sm">
                    <div className="p-8 border-b border-white/[0.05] bg-white/[0.01] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform duration-500">
                            <Building2 size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Dados da Empresa</h2>
                    </div>
                    <div className="p-10 space-y-10">
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-slate-900 border-2 border-white/[0.05] overflow-hidden flex items-center justify-center shadow-inner group-hover:border-amber-500/50 transition-all duration-500 p-4">
                                    <span className="w-full h-full flex items-center justify-center">
                                        {logoUrl
                                            ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain transition-transform duration-700 hover:scale-110" />
                                            : <span className="flex items-center justify-center"><Building2 className="w-16 h-16 text-slate-700" /></span>
                                        }
                                    </span>
                                </div>
                                <label className="absolute -bottom-2 -right-2 p-3 bg-amber-500 text-white rounded-2xl shadow-[0_10px_20px_rgba(245,158,11,0.4)] cursor-pointer hover:bg-amber-600 hover:scale-110 transition-all duration-300 active:scale-95">
                                    <Camera size={20} />
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                                </label>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-white">Identidade Visual</p>
                                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest leading-relaxed">
                                    Máx 2MB • PNG ou SVG (Sugerido)<br />
                                    Logotipos Horizontais/Retangulares
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateOrganization} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Nome da Organização</label>
                                <input
                                    type="text"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/[0.05] rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm font-medium placeholder:text-slate-700"
                                    placeholder="Nome da sua empresa"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Telefone Comercial</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                                    <input
                                        type="tel"
                                        value={orgPhone}
                                        onChange={(e) => setOrgPhone(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-white/[0.05] rounded-2xl pl-12 pr-5 py-4 text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm font-medium placeholder:text-slate-700"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-3 group shadow-[0_15px_30px_rgba(245,158,11,0.3)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.4)] active:scale-95"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                                Salvar Empresa
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Marketing & Goals Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="group bg-white/[0.02] border border-white/[0.05] rounded-[2rem] overflow-hidden shadow-2xl hover:border-primary-500/30 transition-all duration-500 backdrop-blur-sm">
                    <div className="p-8 border-b border-white/[0.05] bg-white/[0.01] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400 border border-primary-500/20 group-hover:scale-110 transition-transform duration-500">
                            <Target size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Segmento e Metas</h2>
                    </div>
                    <form onSubmit={handleUpdateMarketing} className="p-10 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3 col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Segmento de Atuação</label>
                                <select
                                    value={marketingConfig.industry}
                                    onChange={(e) => setMarketingConfig({ ...marketingConfig, industry: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-white/[0.05] rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-medium"
                                >
                                    <option value="">Selecione um segmento</option>
                                    <option value="imobiliario">Imobiliário</option>
                                    <option value="estetica">Estética & Saúde</option>
                                    <option value="advocacia">Advocacia</option>
                                    <option value="infoproducts">Infoprodutos</option>
                                    <option value="ecommerce">E-commerce</option>
                                    <option value="services">Prestação de Serviços</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Ticket Médio (R$)</label>
                                <input
                                    type="number"
                                    value={marketingConfig.average_ticket || ''}
                                    onChange={(e) => setMarketingConfig({ ...marketingConfig, average_ticket: Number(e.target.value) })}
                                    className="w-full bg-slate-900/50 border border-white/[0.05] rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-medium"
                                    placeholder="Ex: 500"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Meta de Faturamento</label>
                                <input
                                    type="number"
                                    value={marketingConfig.monthly_revenue_goal || ''}
                                    onChange={(e) => setMarketingConfig({ ...marketingConfig, monthly_revenue_goal: Number(e.target.value) })}
                                    className="w-full bg-slate-900/50 border border-white/[0.05] rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-medium"
                                    placeholder="Ex: 50000"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Orçamento Mensal Ads</label>
                                <input
                                    type="number"
                                    value={marketingConfig.monthly_budget_goal || ''}
                                    onChange={(e) => setMarketingConfig({ ...marketingConfig, monthly_budget_goal: Number(e.target.value) })}
                                    className="w-full bg-slate-900/50 border border-white/[0.05] rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-medium"
                                    placeholder="Ex: 3000"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">CAC Desejado (R$)</label>
                                <input
                                    type="number"
                                    value={marketingConfig.target_cac || ''}
                                    onChange={(e) => setMarketingConfig({ ...marketingConfig, target_cac: Number(e.target.value) })}
                                    className="w-full bg-slate-900/50 border border-white/[0.05] rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm font-medium"
                                    placeholder="Ex: 50"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-3 group shadow-[0_15px_30px_rgba(99,102,241,0.3)] hover:shadow-[0_20px_40px_rgba(99,102,241,0.4)] active:scale-95"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                            Salvar Configurações de Marketing
                        </button>
                    </form>
                </div>

                <div className="group bg-white/[0.02] border border-white/[0.05] rounded-[2rem] overflow-hidden shadow-2xl hover:border-emerald-500/30 transition-all duration-500 backdrop-blur-sm">
                    <div className="p-8 border-b border-white/[0.05] bg-white/[0.01] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                            <Megaphone size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Conexões de Anúncios</h2>
                    </div>
                    <div className="p-10 space-y-6">
                        <p className="text-sm text-slate-400">Conecte suas contas para que o AdminPulse possa calcular seu ROI e ROI em tempo real.</p>

                        <div className="space-y-4">
                            {[
                                { id: 'meta', name: 'Meta Ads (Facebook/Insta)', color: 'bg-blue-600' },
                                { id: 'google', name: 'Google Ads', color: 'bg-white text-dark-bg' },
                                { id: 'tiktok', name: 'TikTok for Business', color: 'bg-black' }
                            ].map(provider => {
                                const isConnected = integrations.find(i => i.provider === provider.id);
                                return (
                                    <div key={provider.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg ${provider.color} flex items-center justify-center font-bold text-xs`}>
                                                {provider.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-white">{provider.name}</span>
                                        </div>
                                        <button
                                            disabled={loading}
                                            onClick={() => !isConnected && handleConnectAds(provider.id)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${isConnected
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                : 'bg-white/5 text-white hover:bg-white/10 active:scale-95'
                                                }`}
                                        >
                                            {loading ? <Loader2 size={14} className="animate-spin" /> : isConnected ? 'Conectado' : 'Conectar'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-6 bg-primary-500/5 border border-primary-500/10 rounded-2xl">
                            <h4 className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <AlertCircle size={14} /> Importante
                            </h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                A sincronização acontece a cada 6 horas. Seus dados de investimento serão cruzados com as vendas fechadas no CRM para gerar o ROI real.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Integration Section */}
            <div className="group bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/[0.05] rounded-[2rem] overflow-hidden shadow-2xl hover:border-indigo-500/30 transition-all duration-500 backdrop-blur-sm">
                <div className="p-8 border-b border-white/[0.05] bg-white/[0.01] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                            <Bot size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">IA de Atendimento</h2>
                            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Integração Externa & Webhooks</p>
                        </div>
                    </div>
                    {!aiConfig && (
                        <button
                            onClick={handleCreateAIKey}
                            disabled={loading}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                        >
                            Ativar IA na Agenda
                        </button>
                    )}
                </div>

                <div className="p-10">
                    {aiConfig ? (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Credenciais de Autenticação</label>
                                        <button
                                            onClick={() => copyToClipboard(aiConfig.api_key)}
                                            className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                                        >
                                            {copySuccess ? 'Copiado!' : <><Copy size={12} /> Copiar Chave</>}
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-3">
                                            <div className="flex justify-between items-center text-[10px] text-slate-500">
                                                <span>ENDPOINT (POST)</span>
                                                <span className="text-emerald-500 font-bold">LIVE</span>
                                            </div>
                                            <div className="font-mono text-xs text-indigo-300 break-all select-all">
                                                {`https://qcbihcjgscjxeqvlbpdz.supabase.co/functions/v1/webhook-ai-scheduler`}
                                            </div>
                                        </div>

                                        <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-3">
                                            <div className="text-[10px] text-slate-500 uppercase tracking-widest">Header Obrigatório</div>
                                            <div className="flex items-center gap-3 font-mono text-xs">
                                                <span className="text-purple-400 font-bold">api_key:</span>
                                                <span className="text-slate-400 break-all">{aiConfig.api_key}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Esquema do Body (JSON)</label>
                                    <div className="bg-slate-900 border border-white/[0.05] rounded-3xl p-6 font-mono text-[11px] leading-relaxed overflow-x-auto text-slate-300 custom-scrollbar max-h-[250px]">
                                        <p className="text-indigo-400">// Parâmetros de Agendamento</p>
                                        <span className="text-purple-400">"appointment_title"</span>: <span className="text-emerald-400">"Reunião de Vendas"</span>,<br />
                                        <span className="text-purple-400">"start_at"</span>: <span className="text-emerald-400">"2024-03-25T14:00:00Z"</span>,<br />
                                        <span className="text-purple-400">"description"</span>: <span className="text-slate-500">"Opcional"</span>,<br /><br />

                                        <p className="text-indigo-400">// Informações de Contato (WhatsApp/E-mail)</p>
                                        <span className="text-purple-400">"customer_name"</span>: <span className="text-emerald-400">"Nome do Cliente"</span>,<br />
                                        <span className="text-purple-400">"customer_email"</span>: <span className="text-emerald-400">"cliente@email.com"</span>,<br />
                                        <span className="text-purple-400">"customer_whatsapp"</span>: <span className="text-emerald-400">"5511999999999"</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-white/[0.05] pt-10 space-y-8">
                                <h3 className="text-sm font-bold text-white flex items-center gap-3">
                                    <ExternalLink size={18} className="text-indigo-400" />
                                    Documentação Técnica de Integração
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-5 bg-white/[0.02] border border-white/[0.03] rounded-2xl space-y-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs">1</div>
                                        <p className="text-xs font-bold text-slate-200">Autenticação</p>
                                        <p className="text-[11px] text-slate-500 leading-relaxed">
                                            Sua API Key deve ser enviada via Header HTTP com o nome <code className="text-indigo-400">api_key</code>. Nunca exponha esta chave em códigos front-end públicos.
                                        </p>
                                    </div>

                                    <div className="p-5 bg-white/[0.02] border border-white/[0.03] rounded-2xl space-y-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-xs">2</div>
                                        <p className="text-xs font-bold text-slate-200">Fluxo de Leads</p>
                                        <p className="text-[11px] text-slate-500 leading-relaxed">
                                            Se o cliente não existir, o sistema criará um novo Lead automaticamente baseado no <code className="text-emerald-400">customer_email</code> ou <code className="text-emerald-400">customer_whatsapp</code>.
                                        </p>
                                    </div>

                                    <div className="p-5 bg-white/[0.02] border border-white/[0.03] rounded-2xl space-y-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-xs">3</div>
                                        <p className="text-xs font-bold text-slate-200">Automação de Contato</p>
                                        <p className="text-[11px] text-slate-500 leading-relaxed">
                                            Os dados de contato são persistidos no Lead, permitindo que automações externas (n8n/Zapier) disparem mensagens instantâneas após o agendamento.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-black/20 rounded-2xl p-6 border border-white/[0.05]">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Exemplo cURL (Terminal)</span>
                                        <Zap size={14} className="text-amber-400" />
                                    </div>
                                    <pre className="text-[11px] font-mono text-slate-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                        {`curl -X POST https://qcbihcjgscjgscjxeqvlbpdz.supabase.co/functions/v1/webhook-ai-scheduler \\
  -H "api_key: ${aiConfig.api_key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "appointment_title": "Agendamento via IA de Atendimento",
    "start_at": "${new Date().toISOString()}",
    "customer_name": "João Silva",
    "customer_whatsapp": "5511988887777"
  }'`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center py-6 space-y-4">
                            <Bot size={48} className="text-slate-700 animate-pulse" />
                            <div>
                                <h3 className="text-white font-bold">Integre sua Agenda com IA</h3>
                                <p className="text-slate-500 text-sm mt-1 max-w-sm">
                                    Ative esta função para permitir que assistentes virtuais atendam seus clientes e agendem reuniões automaticamente.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Pipeline Management Section */}
            <div className="group bg-white/[0.02] border border-white/[0.05] rounded-[2rem] overflow-hidden shadow-2xl hover:border-emerald-500/30 transition-all duration-500 backdrop-blur-sm">
                <div className="p-8 border-b border-white/[0.05] bg-white/[0.01] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                            <LayoutList size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Funil de Vendas (Pipeline)</h2>
                            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Gerencie as colunas do seu Dashboard</p>
                        </div>
                    </div>
                </div>

                <div className="p-10 space-y-8">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={newStageName}
                            onChange={(e) => setNewStageName(e.target.value)}
                            placeholder="Nome da nova coluna (ex: Pós-Venda)"
                            className="flex-1 bg-slate-900/50 border border-white/[0.05] rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                        />
                        <button
                            onClick={handleAddStage}
                            disabled={loading || !newStageName.trim()}
                            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-8 rounded-2xl font-bold transition-all flex items-center gap-2"
                        >
                            <Plus size={20} /> Adicionar
                        </button>
                    </div>

                    <div className="space-y-3">
                        {stages.map((stage) => (
                            <div
                                key={stage.id}
                                className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:bg-white/[0.04] transition-colors group/item"
                            >
                                <div className="flex items-center gap-4">
                                    <GripVertical size={18} className="text-slate-600 cursor-grab active:cursor-grabbing" />
                                    <div className={`w-3 h-3 rounded-full ${stage.color.replace('border-', 'bg-').split('/')[0]}`} />
                                    <span className="text-sm font-medium text-slate-200">{stage.name}</span>
                                    {stage.is_system && (
                                        <span className="text-[9px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">Sistema</span>
                                    )}
                                </div>
                                {!stage.is_system && (
                                    <button
                                        onClick={() => handleDeleteStage(stage.id, stage.is_system)}
                                        className="p-2 text-slate-600 hover:text-rose-400 transition-colors opacity-0 group-hover/item:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <TeamSettings />
        </div>
    );
};
