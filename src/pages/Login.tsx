import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, AlertTriangle, Eye, EyeOff, CheckCircle, BarChart2, TrendingUp, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useLogin } from '../hooks/useLogin';

// Testimonials Data
// Testimonials Data
const testimonials = [
  {
    name: "Ricardo M.",
    role: "Diretor Comercial",
    quote: "Aumentamos nossa conversão em 40% no primeiro mês.",
    image: "/assets/testimonials/ricardo-m.jpg"
  },
  {
    name: "Julia S.",
    role: "Gerente de Marketing",
    quote: "A clareza dos dados transformou nossas campanhas.",
    image: "/assets/testimonials/julia-s.jpg"
  },
  {
    name: "Carlos E.",
    role: "CEO",
    quote: "Simplesmente o melhor dashboard que já usamos.",
    image: "/assets/testimonials/carlos-e.jpg"
  },
  {
    name: "Fernanda L.",
    role: "Head de Vendas",
    quote: "Otimizou o tempo da minha equipe em 50%.",
    image: "/assets/testimonials/fernanda-l.jpg"
  },
  {
    name: "Marcelo T.",
    role: "Analista de Dados",
    quote: "A integração com outras ferramentas é perfeita.",
    image: "/assets/testimonials/marcelo-t.jpg"
  },
  {
    name: "Ana P.",
    role: "Coordenadora de CS",
    quote: "Conseguimos reduzir o churn drasticamente.",
    image: "/assets/testimonials/ana-p.jpg"
  },
  {
    name: "Roberto G.",
    role: "Fundador",
    quote: "Vale cada centavo. O ROI foi imediato.",
    image: "/assets/testimonials/roberto-g.jpg"
  },
  {
    name: "Patricia B.",
    role: "Diretora de Operações",
    quote: "Visualização impecável e muito intuitiva.",
    image: "/assets/testimonials/patricia-b.jpg"
  },
  {
    name: "Lucas D.",
    role: "Tech Lead",
    quote: "Performance excelente e muito seguro.",
    image: "/assets/testimonials/lucas-d.jpg"
  },
  {
    name: "Sofia R.",
    role: "VP de Crescimento",
    quote: "Escalamos nossa operação com total controle.",
    image: "/assets/testimonials/sofia-r.jpg"
  }
];

export const Login: React.FC = () => {
  const {
    loading,
    authError,
    showPassword, setShowPassword,
    rememberMe, setRememberMe,
    isResetting, setIsResetting,
    resetEmail, setResetEmail,
    resetSuccess,
    resetError,
    countdown,
    register,
    handleSubmit,
    errors,
    onSubmit,
    handlePasswordReset,
    handleSocialLogin
  } = useLogin();

  // Testimonial State
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Rotate Testimonials
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, []);

  const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4" />
      <path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853" />
      <path d="M5.50253 14.3003C5.00236 12.8199 5.00236 11.1799 5.50253 9.69951V6.60861H1.51649C-0.18551 10.0056 -0.18551 13.9945 1.51649 17.3915L5.50253 14.3003Z" fill="#FBBC05" />
      <path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61049L5.50264 9.70138C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335" />
    </svg>
  );

  const LinkedInIcon = () => (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.447 20.452H16.892V14.88C16.892 13.553 16.864 11.848 15.043 11.848C13.197 11.848 12.914 13.288 12.914 14.782V20.452H9.359V9.006H12.771V10.566H12.819C13.294 9.666 14.457 8.716 16.185 8.716C19.782 8.716 20.447 11.083 20.447 14.167V20.452ZM5.337 7.433C4.197 7.433 3.274 6.509 3.274 5.37C3.274 4.231 4.197 3.307 5.337 3.307C6.477 3.307 7.4 4.231 7.4 5.37C7.4 6.509 6.477 7.433 5.337 7.433ZM3.562 20.452H7.125V9.006H3.562V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.201 24 24 23.227 24 22.271V1.729C24 0.774 23.201 0 22.222 0H22.225Z" />
    </svg>
  );

  return (
    <div className="min-h-screen flex bg-[#0f172a] overflow-hidden relative">
      {/* Background Decorative Elements (Global) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-glow pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] animate-float-slow pointer-events-none"></div>

      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md space-y-8 animate-entrance glass-morphism p-8 rounded-2xl shadow-2xl relative">

          {/* Header Mobile Only */}
          <div className="text-center lg:text-left">
            <div className="inline-flex lg:hidden w-12 h-12 bg-primary-900/30 rounded-xl items-center justify-center border border-primary-500/20 mb-4 animate-float">
              <ShieldCheck className="w-6 h-6 text-primary-500" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Bem-vindo de volta</h1>
            <p className="text-slate-400 mt-2 text-sm">Entre com suas credenciais para acessar sua conta.</p>
          </div>

          {!isResetting ? (
            /* Login Form */
            <div className="space-y-6">
              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSocialLogin('google')}
                  className="flex items-center justify-center px-4 py-2.5 bg-white text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-all transform hover:-translate-y-0.5 hover:shadow-lg duration-200 border border-slate-200"
                >
                  <GoogleIcon />
                  Google
                </button>
                <button
                  onClick={() => handleSocialLogin('linkedin')}
                  className="flex items-center justify-center px-4 py-2.5 bg-[#0077b5] text-white font-medium rounded-lg hover:bg-[#006097] transition-all transform hover:-translate-y-0.5 hover:shadow-lg duration-200"
                >
                  <LinkedInIcon />
                  LinkedIn
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-700"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0f172a] px-2 text-slate-500">Ou continue com email</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {authError && (
                  <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start gap-2 text-red-200 text-sm animate-entrance">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {authError}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none group-focus-within:text-primary-400 transition-colors" />
                      <input
                        type="email"
                        {...register('email')}
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border rounded-lg text-white outline-none transition-all placeholder:text-slate-600
                                        ${errors.email ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'}`}
                        placeholder="admin@company.com"
                      />
                    </div>
                    {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none group-focus-within:text-primary-400 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        className={`w-full pl-10 pr-10 py-2.5 bg-slate-800/50 border rounded-lg text-white outline-none transition-all placeholder:text-slate-600
                                        ${errors.password ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'}`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{errors.password.message}</p>}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 bg-slate-800 border-slate-600 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                        Lembrar de mim
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsResetting(true)}
                      className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-3 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transform hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-r from-primary-600 to-primary-500 border-none"
                  isLoading={loading}
                >
                  Entrar
                </Button>
              </form>

              <div className="text-center mt-6">
                <p className="text-sm text-slate-400">
                  Não tem uma conta?{' '}
                  <Link to="/signup" className="text-primary-400 font-medium hover:text-primary-300 transition-colors underline-offset-4 hover:underline">
                    Comece grátis
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            /* Reset Password Request Form */
            <div className="space-y-6 animate-entrance">
              <div className="text-center lg:text-left mb-6">
                <button
                  onClick={() => setIsResetting(false)}
                  className="mb-4 text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-colors group"
                >
                  <span className="group-hover:-translate-x-1 transition-transform">←</span> Voltar para login
                </button>
                <h2 className="text-2xl font-bold text-white">Recuperar Senha</h2>
                <p className="text-slate-400 text-sm mt-1">Enviaremos um link para você redefinir sua senha.</p>
              </div>

              {resetSuccess ? (
                <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-6 text-center animate-entrance">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center animate-pulse-glow">
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                  </div>
                  <h3 className="text-emerald-400 font-semibold text-lg mb-2">Email Enviado!</h3>
                  <p className="text-slate-300 text-sm mb-6">
                    Verifique sua caixa de entrada (e spam) para encontrar o link de redefinição.
                  </p>
                  <Button onClick={() => setIsResetting(false)} variant="secondary" className="w-full">
                    Voltar para Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  {resetError && (
                    <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center gap-2 text-red-200 text-sm animate-entrance">
                      <AlertTriangle size={16} />
                      {resetError}
                    </div>
                  )}

                  {countdown > 0 && (
                    <div className="p-3 bg-amber-900/20 border border-amber-900/50 rounded-lg flex items-center gap-2 text-amber-200 text-sm">
                      <AlertTriangle size={16} />
                      Muitas tentativas. Aguarde {countdown}s...
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Cadastrado</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none group-focus-within:text-emerald-400 transition-colors" />
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-600 focus:border-emerald-500"
                        placeholder="seu@email.com"
                        disabled={countdown > 0}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 border-none shadow-lg shadow-emerald-500/20" isLoading={loading} disabled={countdown > 0}>
                    {countdown > 0 ? `Aguarde ${countdown}s` : 'Enviar Link de Recuperação'}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="absolute bottom-6 text-center text-xs text-slate-600 z-10">
          &copy; {new Date().getFullYear()} AdminPulse. Todos os direitos reservados.
        </div>
      </div>

      {/* Right Column - Visual / Testimonial (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#0f172a] to-[#1e293b] relative overflow-hidden items-center justify-center p-12 border-l border-white/5">

        {/* Animated Background Blobs */}
        <div className="absolute top-[20%] right-[10%] w-96 h-96 bg-primary-600/20 rounded-full blur-[80px] animate-float-slow"></div>
        <div className="absolute bottom-[20%] left-[10%] w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px] animate-float-delayed"></div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

        <div className="relative z-10 max-w-lg">
          <div className="mb-12 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary-300 mb-4 backdrop-blur-sm animate-entrance">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Nova Versão 3.0 Disponível
            </div>

            <h2 className="text-5xl font-bold text-white leading-tight tracking-tight animate-entrance" style={{ animationDelay: '0.1s' }}>
              Transforme Leads em <br />
              <span className="text-gradient">Vendas Reais</span>
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed animate-entrance" style={{ animationDelay: '0.2s' }}>
              Acompanhe KPIs, gerencie pipelines e otimize a performance do seu time com o dashboard mais intuitivo e poderoso do mercado.
            </p>
          </div>

          {/* Cards Visualization Mockup */}
          <div className="grid grid-cols-2 gap-6 relative">
            {/* Floating Elements behind cards */}
            <div className="absolute -top-10 -left-10 w-20 h-20 bg-blue-500/30 rounded-full blur-xl animate-pulse-glow"></div>

            <div className="glass-morphism p-5 rounded-2xl shadow-2xl transform translate-y-4 animate-float hover:scale-105 transition-transform duration-500 cursor-default border-t border-white/10 bg-gradient-to-b from-white/5 to-transparent">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-emerald-500/20 rounded-xl shadow-inner shadow-emerald-500/10">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="h-2.5 w-20 bg-white/20 rounded-full mb-1.5"></div>
                  <div className="h-1.5 w-12 bg-white/10 rounded-full"></div>
                </div>
              </div>
              <div className="h-16 w-full bg-emerald-500/5 rounded-lg overflow-hidden relative border border-emerald-500/10">
                <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-emerald-500/20 to-transparent"></div>
                {/* Mock chart line */}
                <svg className="absolute bottom-0 left-0 w-full h-full p-1" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path d="M0 35 Q 20 30, 40 25 T 100 10" fill="none" stroke="#34d399" strokeWidth="2" />
                </svg>
              </div>
            </div>

            <div className="glass-morphism p-5 rounded-2xl shadow-2xl transform -translate-y-4 animate-float-delayed hover:scale-105 transition-transform duration-500 cursor-default border-t border-white/10 bg-gradient-to-b from-white/5 to-transparent" style={{ animationDelay: '2s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-primary-500/20 rounded-xl shadow-inner shadow-primary-500/10">
                  <Users className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <div className="h-2.5 w-20 bg-white/20 rounded-full mb-1.5"></div>
                  <div className="h-1.5 w-12 bg-white/10 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-primary-500/50 rounded-full"></div>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-primary-500/30 rounded-full"></div>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-primary-500/20 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Carousel */}
          <div className="mt-16 pt-8 border-t border-white/5 text-center lg:text-left animate-entrance" style={{ animationDelay: '0.4s' }}>
            <div
              key={currentTestimonial} // Force re-render for animation
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-default border border-transparent hover:border-white/5 animate-entrance"
            >
              <div className="relative w-12 h-12 rounded-full ring-2 ring-primary-500/30 p-0.5 flex-shrink-0">
                <img
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-white italic">"{testimonials[currentTestimonial].quote}"</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-primary-400 font-bold">{testimonials[currentTestimonial].name}</p>
                  <span className="text-slate-600">•</span>
                  <p className="text-xs text-slate-500">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};