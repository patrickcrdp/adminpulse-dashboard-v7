import React from 'react';

// === GLOBAIS ===
// Isso executa IMEDIATAMENTE quando o JavaScript carrega em tela, 
// centésimos de segundo antes do SupabaseClient inicializar e apagar o Hash da URL.
const initialHashAtLoad = typeof window !== 'undefined' ? window.location.hash : '';

export const getInitialHash = () => initialHashAtLoad;

// Helper to handle Supabase Hash fragments before React Router or AuthContext consumes them
export const AppHashHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isReady, setIsReady] = React.useState(false);

    React.useEffect(() => {
        const hash = initialHashAtLoad;
        console.log('[SupabaseHashHandler] Fragmento detectado:', hash ? 'Sim' : 'Não');

        // Se a URL contiver o token (OAuth, Signup, Recovery ou Invite)
        if (hash.includes('access_token')) {
            console.log('[SupabaseHashHandler] 🛡️ Interceptando token de autenticação...');
            const checkHash = setInterval(() => {
                // Espera o Supabase consumir o token globalmente
                if (!window.location.hash.includes('access_token')) {
                    clearInterval(checkHash);
                    console.log('[SupabaseHashHandler] ✅ Token consumido. Limpando URL...');

                    // Se for recuperação de senha, vai para a página de troca
                    if (hash.includes('type=recovery')) {
                        window.location.hash = '/reset-password';
                    } else {
                        // Fluxo normal (Login/Signup/Google): vai para a Home
                        window.location.hash = '/';
                    }
                    
                    setTimeout(() => setIsReady(true), 200);
                }
            }, 60);

            // Timeout de segurança
            setTimeout(() => {
                clearInterval(checkHash);
                if (!isReady) setIsReady(true);
            }, 4000);
        } else {
            setIsReady(true);
        }
    }, [isReady]);

    if (!isReady) {
        return <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white">Processando login seguro...</div>;
    }

    return <>{children}</>;
};
