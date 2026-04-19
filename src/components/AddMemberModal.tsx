import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose }) => {
    const { organization } = useAuth();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'member'>('member');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!organization) return;

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // A criação direta de usuários via client-side sem Service Role não é permitida,
            // por isso invocamos a nossa Edge Function 'invite-member'.

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Sessão não encontrada.");

            const { data, error } = await supabase.functions.invoke('invite-member', {
                body: {
                    email: email,
                    organization_id: organization.id,
                    role: role
                },
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            });

            if (error) {
                // Erros de rede HTTP 500
                throw new Error(error.message || 'Erro de conexão com o Supabase.');
            }

            if (data?.error) {
                const errorMessage = typeof data.error === 'object'
                    ? JSON.stringify(data.error, null, 2)
                    : data.error;
                throw new Error(errorMessage);
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setEmail('');
            }, 2000);

        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao adicionar o atendente.');
        } finally {
            setLoading(false);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
                className="bg-[#0d1325] border border-white/10 w-full max-w-md rounded-xl shadow-2xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
            >
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                            <UserPlus className="w-5 h-5 text-purple-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Adicionar Atendente</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors p-1"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed">
                        Convide um novo membro para a organização <span className="text-purple-400 font-bold">{organization?.name || 'sua organização'}</span>.
                    </p>

                    <div className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                                E-mail do Atendente
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-600" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-[#0a0f1d] border border-white/10 text-white text-sm rounded-xl focus:ring-1 focus:ring-purple-500 focus:border-purple-500 block w-full pl-12 p-3.5 transition-all outline-none"
                                    placeholder="exemplo@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                                Nível de Acesso
                            </label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
                                className="bg-[#0a0f1d] border border-white/10 text-white text-sm rounded-xl focus:ring-1 focus:ring-purple-500 focus:border-purple-500 block w-full p-3.5 transition-all outline-none appearance-none"
                            >
                                <option value="member">Membro (Padrão)</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>

                        {error && (
                            <div className="flex items-start gap-3 text-rose-400 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="text-emerald-400 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 text-sm text-center font-bold">
                                Convite enviado com sucesso!
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex gap-3 pt-6 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-3 flex-1 rounded-xl text-sm font-bold text-slate-400 bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="px-4 py-3 flex-1 rounded-xl text-sm font-bold text-white bg-purple-500 hover:bg-purple-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Enviar Convite
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};
