import * as React from 'react';
import { Check, Star, Zap, Shield, Crown, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { usePlans } from '../hooks/usePlans';

export const Plans: React.FC = () => {
    const {
        loading,
        trialDaysLeft,
        status,
        navigate,
        handleSubscribe,
        isPro
    } = usePlans();

    return (
        <div className="min-h-screen bg-dark-bg text-white p-8">
            <div className="max-w-6xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para o Dashboard
                </Button>

                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold">
                        Escolha o plano ideal para <span className="text-primary-500">escalar</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Desbloqueie todo o potencial da sua operação com recursos exclusivos e suporte prioritário.
                    </p>

                    {trialDaysLeft !== null && trialDaysLeft > 0 && status === 'trialing' && (
                        <div className="inline-block px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 font-medium text-sm animate-pulse">
                            🔥 Você tem {trialDaysLeft} dias restantes no seu teste grátis
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
                    {/* Free/Trial Plan */}
                    <div className="bg-dark-card/50 backdrop-blur-sm border border-dark-border rounded-3xl p-8 flex flex-col transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:bg-dark-card hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-500/20 group">
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-slate-300 group-hover:text-emerald-400 transition-colors">Starter / Trial</h3>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-bold tracking-tight text-white">Grátis</span>
                                <span className="ml-1 text-xl font-semibold text-slate-500">/ 7 dias</span>
                            </div>
                            <p className="mt-4 text-slate-400 text-sm">Para testar a plataforma e validar seu modelo.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center text-slate-300">
                                <Check className="w-5 h-5 text-emerald-500 mr-3" />
                                <span>Acesso ao Dashboard Básico</span>
                            </li>
                            <li className="flex items-center text-slate-300">
                                <Check className="w-5 h-5 text-emerald-500 mr-3" />
                                <span>Até 100 Leads</span>
                            </li>
                            <li className="flex items-center text-slate-300">
                                <Check className="w-5 h-5 text-emerald-500 mr-3" />
                                <span>Suporte por Email</span>
                            </li>
                        </ul>
                        <Button variant="secondary" disabled={!isPro} className={`w-full rounded-xl py-6 transition-all ${!isPro ? 'cursor-not-allowed opacity-50' : 'hover:bg-slate-800'}`}>
                            {!isPro ? 'Plano Atual' : 'Downgrade'}
                        </Button>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-gradient-to-br from-primary-900/40 to-dark-card border border-primary-500/30 rounded-3xl p-8 flex flex-col relative transition-all duration-500 transform md:scale-105 md:hover:scale-110 hover:-translate-y-2 shadow-xl shadow-primary-500/10 hover:shadow-3xl hover:shadow-primary-500/30 z-10 group">
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
                            <span className="bg-primary-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-primary-500/40 animate-pulse">
                                Recomendado
                            </span>
                        </div>
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-primary-400 flex items-center gap-2 group-hover:text-primary-300 transition-colors">
                                <Crown className="w-6 h-6 fill-current" /> Pro
                            </h3>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-5xl font-bold tracking-tight text-white">R$ 99</span>
                                <span className="ml-1 text-xl font-semibold text-slate-500">/mês</span>
                            </div>
                            <p className="mt-4 text-slate-300 text-sm">Tudo o que você precisa para crescer sem limites.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center text-white">
                                <Zap className="w-5 h-5 text-primary-500 mr-3 group-hover:text-primary-400 group-hover:scale-110 transition-transform" />
                                <span className="font-medium">Leads Ilimitados</span>
                            </li>
                            <li className="flex items-center text-white">
                                <BarChart2 className="w-5 h-5 text-primary-500 mr-3 group-hover:text-primary-400 group-hover:scale-110 transition-transform" />
                                <span className="font-medium">Analytics Avançado & Exportação</span>
                            </li>
                            <li className="flex items-center text-white">
                                <Shield className="w-5 h-5 text-primary-500 mr-3 group-hover:text-primary-400 group-hover:scale-110 transition-transform" />
                                <span>Backup Automático</span>
                            </li>
                            <li className="flex items-center text-white">
                                <Star className="w-5 h-5 text-primary-500 mr-3 group-hover:text-primary-400 group-hover:scale-110 transition-transform" />
                                <span>Suporte Prioritário (WhatsApp)</span>
                            </li>
                        </ul>
                        {isPro ? (
                            <Button variant="secondary" disabled className="w-full py-4 text-lg font-bold cursor-not-allowed rounded-xl bg-primary-900/20 border-primary-500/20 text-primary-300">
                                Plano Atual
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubscribe}
                                isLoading={loading}
                                className="w-full py-6 text-lg font-bold rounded-xl shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:scale-[1.02] transition-all duration-300 bg-primary-600 hover:bg-primary-500"
                            >
                                Assinar Agora
                            </Button>
                        )}
                        <p className="text-center text-xs text-slate-500 mt-4 group-hover:text-slate-400 transition-colors">
                            Cancele a qualquer momento. Satisfação garantida.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Start of helper component needed for the list above
import { BarChart2 } from 'lucide-react';
