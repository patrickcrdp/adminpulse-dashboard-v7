import React from 'react';

// === GLOBAIS ===
// Isso executa IMEDIATAMENTE quando o JavaScript carrega em tela, 
// centésimos de segundo antes do SupabaseClient inicializar e apagar o Hash da URL.
const initialHashAtLoad = typeof window !== 'undefined' ? window.location.hash : '';

export const getInitialHash = () => initialHashAtLoad;

// Helper to handle Supabase Hash fragments before React Router or AuthContext consumes them.
// CRITICAL: This MUST intercept ALL access_token types (Google OAuth, signup, recovery, invite)
// because the HashRouter will try to interpret '#access_token=...' as a route, which crashes React.
export const AppHashHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isReady, setIsReady] = React.useState(false);

    React.useEffect(() => {
        const hash = initialHashAtLoad;

        // Intercepta QUALQUER URL que contenha access_token (Google, Signup, Recovery, Invite)
        if (hash.includes('access_token')) {
            const isRecovery = hash.includes('type=recovery');

            // Aguarda o Supabase consumir o token da URL antes de redirecionar
            const checkHash = setInterval(() => {
                if (!window.location.hash.includes('access_token')) {
                    clearInterval(checkHash);

                    if (isRecovery) {
                        // Recovery: vai para a página de troca de senha
                        window.location.hash = '/reset-password';
                    } else {
                        // OAuth (Google), Signup, Invite: vai para o Dashboard
                        window.location.hash = '/';
                    }
                    setTimeout(() => setIsReady(true), 150);
                }
            }, 50);

            // Timeout de segurança (3 segundos no máximo de bloqueio)
            setTimeout(() => {
                clearInterval(checkHash);
                if (!isReady) {
                    // Força a limpeza do hash e libera a aplicação
                    if (!window.location.hash.includes('/')) {
                        window.location.hash = '/';
                    }
                    setIsReady(true);
                }
            }, 3000);
        } else {
            // Fluxo normal, nada a interceptar
            setIsReady(true);
        }
    }, []);

    return (
        <div className="min-h-screen bg-dark-bg relative">
            {!isReady && (
                <div className="fixed inset-0 z-[9999] bg-dark-bg flex items-center justify-center text-white">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 text-sm">Processando login seguro...</p>
                    </div>
                </div>
            )}
            {children}
        </div>
    );
};
