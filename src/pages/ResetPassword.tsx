import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertTriangle, Eye, EyeOff, CheckCircle, KeyRound, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Zod Schema for Strong Password
const resetSchema = z.object({
    password: z.string()
        .min(8, 'A senha deve ter no mínimo 8 caracteres')
        .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
        .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
        .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um caractere especial (!@#$%, etc.)'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

type ResetFormInputs = z.infer<typeof resetSchema>;

export const ResetPassword: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResetFormInputs>({
        resolver: zodResolver(resetSchema),
        mode: 'onChange' // Validate on change for immediate feedback
    });

    const watchedPassword = watch('password');

    // Calculate password strength
    useEffect(() => {
        if (!watchedPassword) {
            setPasswordStrength('weak');
            return;
        }

        let score = 0;
        if (watchedPassword.length >= 8) score++;
        if (/[A-Z]/.test(watchedPassword)) score++;
        if (/[a-z]/.test(watchedPassword)) score++;
        if (/[0-9]/.test(watchedPassword)) score++;
        if (/[^A-Za-z0-9]/.test(watchedPassword)) score++;

        if (score < 3) setPasswordStrength('weak');
        else if (score < 5) setPasswordStrength('medium');
        else setPasswordStrength('strong');

    }, [watchedPassword]);

    const getStrengthColor = () => {
        if (!watchedPassword) return 'bg-slate-700';
        if (passwordStrength === 'weak') return 'bg-red-500';
        if (passwordStrength === 'medium') return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    const getStrengthText = () => {
        if (!watchedPassword) return '';
        if (passwordStrength === 'weak') return 'Fraca';
        if (passwordStrength === 'medium') return 'Média';
        return 'Forte';
    };

    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            // Optional: Handle invalid session if needed, but usually redundant for recovery flow
        };
        checkSession();
    }, []);

    const onSubmit = async (data: ResetFormInputs) => {
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: data.password,
            });

            if (error) throw error;
            setSuccess(true);

            // Optional: Redirect after a few seconds
            setTimeout(() => {
                navigate('/'); // Redirect to Dashboard
            }, 2000); // Faster redirect

        } catch (err: any) {
            setError(err.message || 'Falha ao redefinir senha.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-dark-card border border-dark-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
                    <div className="p-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center border border-emerald-500/20 mb-4 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Senha Salva!</h2>
                        <p className="text-slate-400 text-sm mb-6">Sua credencial foi atualizada com sucesso. Entrando no painel...</p>
                        <Button onClick={() => navigate('/')} className="w-full">
                            Ir para o Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-dark-card border border-dark-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-primary-900/30 rounded-full flex items-center justify-center border border-primary-500/20 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                            <ShieldCheck className="w-8 h-8 text-primary-500" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-center text-white mb-2">Definir Senha Segura</h2>
                    <p className="text-center text-slate-400 text-sm mb-8">Defina sua credencial de acesso obedecendo os requisitos abaixo.</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start animate-in slide-in-from-top-2">
                            <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-200">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nova Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password')}
                                    className={`w-full pl-10 pr-10 py-2.5 bg-dark-bg border rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-slate-600
                    ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-dark-border'}`}
                                    placeholder="Mínimo 8 caracteres"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Strength Meter UI */}
                            {watchedPassword && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 h-1 bg-dark-bg rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                                            style={{ width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%' }}
                                        />
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{getStrengthText()}</span>
                                </div>
                            )}

                            {errors.password && (
                                <p className="text-red-400 text-xs mt-1 ml-1">{errors.password.message}</p>
                            )}

                            <div className="mt-2 text-xs text-slate-500 space-y-1">
                                <p className={/[A-Z]/.test(watchedPassword || '') ? "text-emerald-500" : ""}>• Letra maiúscula</p>
                                <p className={/[0-9]/.test(watchedPassword || '') ? "text-emerald-500" : ""}>• Número</p>
                                <p className={/[^A-Za-z0-9]/.test(watchedPassword || '') ? "text-emerald-500" : ""}>• Caractere especial</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirmar Nova Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    {...register('confirmPassword')}
                                    className={`w-full pl-10 pr-10 py-2.5 bg-dark-bg border rounded-lg text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-slate-600
                    ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-dark-border'}`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-400 text-xs mt-1 ml-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-3 font-semibold shadow-lg shadow-primary-500/20"
                            isLoading={loading}
                        >
                            Salvar Senha
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};
