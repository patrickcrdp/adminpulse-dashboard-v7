import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthFacade } from '../services/authFacade';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

export type LoginFormInputs = z.infer<typeof loginSchema>;

export const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // Password Recovery State
    const [isResetting, setIsResetting] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const [resetError, setResetError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as any)?.from?.pathname || '/';
    
    const { user } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate(from, { replace: true });
        }
    }, [user, navigate, from]);

    // Countdown timer effect
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormInputs>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormInputs) => {
        setLoading(true);
        setAuthError(null);

        try {
            await AuthFacade.login(data.email, data.password);
            navigate(from, { replace: true });
        } catch (err: any) {
            setAuthError(err.message || 'Falha ao entrar. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetEmail) {
            setResetError('Por favor, digite seu email.');
            return;
        }

        setLoading(true);
        setResetError(null);
        setResetSuccess(false);

        try {
            await AuthFacade.resetPassword(resetEmail, window.location.origin);
            setResetSuccess(true);
        } catch (err: any) {
            if (err.message?.includes('rate limit')) {
                setCountdown(60);
                setResetError(null);
            } else {
                setResetError(err.message || 'Erro ao enviar email de recuperação.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'linkedin') => {
        try {
            await AuthFacade.loginWithOAuth(provider, window.location.origin);
        } catch (error: any) {
            setAuthError(`Erro ao iniciar login com ${provider}: ${error.message}`);
        }
    };

    return {
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
    };
};
