import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthFacade } from '../services/authFacade';

export const useSignup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        termsAccepted: false
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
    const [successModalOpen, setSuccessModalOpen] = useState(false);

    // Validation Logic
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validateName = (name: string) => name.length >= 3 && !/\d/.test(name);
    
    const calculatePasswordStrength = (password: string) => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score < 3) return 'weak';
        if (score < 5) return 'medium';
        return 'strong';
    };

    useEffect(() => {
        setPasswordStrength(calculatePasswordStrength(formData.password));
    }, [formData.password]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!validateName(formData.fullName)) newErrors.fullName = "Nome deve ter min. 3 letras e sem números";
        if (!validateEmail(formData.email)) newErrors.email = "Email inválido";
        if (formData.password.length < 8) newErrors.password = "Senha deve ter no mínimo 8 caracteres";
        if (!/[A-Z]/.test(formData.password)) newErrors.password = "Senha deve ter uma letra maiúscula";
        if (!/[0-9]/.test(formData.password)) newErrors.password = "Senha deve ter um número";
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "As senhas não coincidem";
        if (!formData.termsAccepted) newErrors.termsAccepted = "Você deve aceitar os termos";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError(null);

        if (!validateForm()) return;

        setLoading(true);
        try {
            const email = formData.email.trim();
            const password = formData.password;
            const fullName = formData.fullName.trim();

            const data = await AuthFacade.signUp(email, password, { full_name: fullName });

            if (data?.user) {
                setSuccessModalOpen(true);
            }
        } catch (err: any) {
            if (err.message?.includes("already registered")) {
                setErrors(prev => ({ ...prev, email: "Este email já está em uso" }));
            } else {
                setGeneralError(err.message || "Erro ao conectar. Tente novamente");
            }
        } finally {
            setLoading(false);
        }
    };

    const getStrengthColor = () => {
        if (!formData.password) return 'bg-slate-700';
        if (passwordStrength === 'weak') return 'bg-red-500';
        if (passwordStrength === 'medium') return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    const getStrengthText = () => {
        if (!formData.password) return '';
        if (passwordStrength === 'weak') return 'Fraca';
        if (passwordStrength === 'medium') return 'Média';
        return 'Forte';
    };

    return {
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
    };
};
