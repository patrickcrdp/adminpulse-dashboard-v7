import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, AlertTriangle, Check, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useSignup } from '../hooks/useSignup';

export const Signup: React.FC = () => {
    const {
        formData,
        errors,
        loading,
        generalError,
        showPassword, setShowPassword,
        passwordStrength,
        successModalOpen,
        navigate,
        handleChange,
        handleSignup,
        getStrengthColor,
        getStrengthText
    } = useSignup();

    if (successModalOpen) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-dark-card border border-dark-border rounded-xl p-8 text-center animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Verifique seu email!</h2>
                    <p className="text-slate-400 mb-6">
                        Enviamos um link de confirmação para <span className="text-white font-medium">{formData.email}</span>.
                    </p>
                    <div className="space-y-3">
                        <Button onClick={() => navigate('/login')} className="w-full">
                            Voltar para Login
                        </Button>
                        <button className="text-sm text-slate-500 hover:text-white transition-colors">
                            Não recebeu? Reenviar email
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 mb-4">
                        <ShieldCheck className="w-6 h-6 text-primary-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Crie sua conta</h1>
                    <p className="text-slate-400 mt-2 text-sm">Comece a gerenciar seus leads em segundos.</p>
                </div>

                <div className="bg-dark-card border border-dark-border rounded-xl shadow-xl overflow-hidden">
                    <div className="p-6 sm:p-8">
                        {generalError && (
                            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-200">{generalError}</p>
                            </div>
                        )}

                        <form onSubmit={handleSignup} className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Nome Completo</label>
                                <input
                                    name="fullName"
                                    type="text"
                                    placeholder="Ex: Ana Silva"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 bg-dark-bg border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder:text-slate-600 ${errors.fullName ? 'border-red-500/50 focus:border-red-500' : 'border-dark-border focus:border-primary-500'}`}
                                />
                                {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email Profissional</label>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="voce@empresa.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 bg-dark-bg border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder:text-slate-600 ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-dark-border focus:border-primary-500'}`}
                                />
                                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Senha</label>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Mínimo 8 caracteres"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 bg-dark-bg border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder:text-slate-600 pr-10 ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-dark-border focus:border-primary-500'}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {/* Strength Meter */}
                                {formData.password && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="flex-1 h-1 bg-dark-bg rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                                                style={{ width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%' }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-400 font-medium">{getStrengthText()}</span>
                                    </div>
                                )}
                                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Confirmar Senha</label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Digite a senha novamente"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 bg-dark-bg border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder:text-slate-600 ${errors.confirmPassword ? 'border-red-500/50 focus:border-red-500' : 'border-dark-border focus:border-primary-500'}`}
                                />
                                {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>}
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start gap-3 pt-2">
                                <div className="relative flex items-center">
                                    <input
                                        id="terms"
                                        name="termsAccepted"
                                        type="checkbox"
                                        checked={formData.termsAccepted}
                                        onChange={handleChange}
                                        className="h-4 w-4 bg-dark-bg border-dark-border rounded text-primary-500 focus:ring-offset-0 focus:ring-2 focus:ring-primary-500 cursor-pointer appearance-none checked:bg-primary-500 checked:border-primary-500"
                                    />
                                    {formData.termsAccepted && <Check size={12} className="absolute inset-0 m-auto text-black pointer-events-none" />}
                                </div>
                                <label htmlFor="terms" className="text-xs text-slate-400 cursor-pointer select-none">
                                    Concordo com os <a href="#" className="text-primary-400 hover:text-primary-300 hover:underline">Termos de Uso</a> e <a href="#" className="text-primary-400 hover:text-primary-300 hover:underline">Política de Privacidade</a>.
                                </label>
                            </div>
                            {errors.termsAccepted && <p className="text-xs text-red-400 ml-7">{errors.termsAccepted}</p>}



                            <Button
                                type="button" // Changed to button to prevent default form submission if not handled
                                onClick={(e: any) => handleSignup(e)}
                                isLoading={loading}
                                className="w-full py-3 mt-4"
                                disabled={loading}
                            >
                                Criar Conta
                            </Button>
                        </form>
                    </div>
                    <div className="bg-dark-bg/50 px-8 py-4 border-t border-dark-border text-center">
                        <p className="text-sm text-slate-400">
                            Já tem uma conta?{' '}
                            <Link to="/login" className="text-primary-400 font-medium hover:text-primary-300 hover:underline">
                                Fazer Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
