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
        // Usa o hash global original, e não o atual (que o Supabase já pode ter apagado)
        const hash = initialHashAtLoad;

        // Se a URL contiver o token e for do tipo invite ou recovery...
        if (hash.includes('access_token') && (hash.includes('type=recovery') || hash.includes('type=invite'))) {
            // WE MUST WAIT FOR SUPABASE TO CONSUME THE TOKEN FIRST!
            // If we change the hash immediately, Supabase's createClient will never see it 
            // and the user won't actually be logged in. 
            const checkHash = setInterval(() => {
                if (!window.location.hash.includes('access_token')) {
                    clearInterval(checkHash);

                    // Now that Supabase has consumed the token and logged the user in,
                    // we can safely redirect to the Reset Password page.
                    window.location.hash = '/reset-password';
                    setTimeout(() => setIsReady(true), 100);
                }
            }, 50);

            // Timeout safety (2 seconds maximum block)
            setTimeout(() => {
                clearInterval(checkHash);
                setIsReady(true);
            }, 2000);
        } else {
            // Normal flow, nothing to intercept
            setIsReady(true);
        }
    }, []);

    if (!isReady) {
        return <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white">Processando login seguro...</div>;
    }

    return <>{children}</>;
};
