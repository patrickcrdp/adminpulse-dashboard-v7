import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export const AuthEventHandler: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                navigate('/reset-password', { replace: true });
            }

            if (event === 'SIGNED_OUT') {
                sessionStorage.removeItem('auto_sync_attempted');
            }

            // Verificação passiva da integração Google Calendar
            // NÃO faz redirect automático - o usuário clica manualmente em "Conectar Agenda"
            if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
                const identities = session.user.identities || [];
                const isGoogleUser =
                    session.user.app_metadata.provider === 'google' ||
                    identities.some(id => id.provider === 'google');

                console.debug('[AuthEventHandler] Event:', event, 'Provider:', session.user.app_metadata.provider);

                if (isGoogleUser) {
                    try {
                        console.log('[AuthEventHandler] Usuário Google detectado. Verificando integração...');
                        
                        // Verifica na organização (modelo Enterprise)
                        const { data: orgMember } = await supabase
                            .from('organization_members')
                            .select('organization_id')
                            .eq('user_id', session.user.id)
                            .maybeSingle();

                        if (orgMember?.organization_id) {
                            const { data: integration } = await supabase
                                .from('calendar_integrations')
                                .select('id')
                                .eq('organization_id', orgMember.organization_id)
                                .eq('is_active', true)
                                .maybeSingle();

                            if (integration) {
                                console.log('[AuthEventHandler] ✅ Calendário da empresa já conectado.');
                            } else {
                                console.log('[AuthEventHandler] ⚠️ Calendário não conectado. Use o botão "Conectar Agenda".');
                            }
                        } else {
                            console.warn('[AuthEventHandler] Usuário sem organização vinculada.');
                        }
                    } catch (err: any) {
                        if (err?.name === 'AbortError') return;
                        console.error('[AuthEventHandler] Erro ao verificar integração:', err);
                    }
                }
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [navigate]);

    return null;
};
