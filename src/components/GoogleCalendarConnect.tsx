import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Loader2, LogOut, AlertTriangle } from 'lucide-react';
import { supabase } from '../supabaseClient';

export const GoogleCalendarConnect: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.warn('[GoogleCalendar] Usuário não autenticado');
                return;
            }

            // Busca se QUALQUER pessoa da organização conectou a agenda
            const { data: orgMember, error: orgError } = await supabase
                .from('organization_members')
                .select('organization_id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (orgError) {
                console.error('[GoogleCalendar] Erro ao buscar organização:', orgError);
                return;
            }

            if (orgMember?.organization_id) {
                const { data, error: calError } = await supabase
                    .from('calendar_integrations')
                    .select('id, user_id')
                    .eq('organization_id', orgMember.organization_id)
                    .eq('is_active', true)
                    .maybeSingle();

                if (calError) {
                    console.error('[GoogleCalendar] Erro ao verificar integração:', calError);
                    return;
                }

                if (data) {
                    console.log('[GoogleCalendar] ✅ Agenda da empresa conectada');
                    setConnected(true);
                } else {
                    console.log('[GoogleCalendar] ⚠️ Nenhuma integração ativa encontrada');
                }
            } else {
                console.warn('[GoogleCalendar] Usuário sem organização vinculada');
            }
        } catch (err) {
            console.error('[GoogleCalendar] Erro inesperado:', err);
        }
    };

    const handleConnect = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            const accessToken = session?.access_token;
            
            if (!accessToken || sessionError) {
                setError('Sessão expirada. Faça login novamente.');
                alert('Sua sessão expirou. Por favor, faça login novamente.');
                setLoading(false);
                return;
            }

            console.log('[GoogleCalendar] Token válido obtido, chamando Edge Function...');

            const fetchUrl = `https://qcbihcjgscjxeqvlbpdz.supabase.co/functions/v1/google-calendar-auth/connect?origin=${encodeURIComponent(window.location.origin)}`;
            const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjYmloY2pnc2NqeGVxdmxicGR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMTE4NDEsImV4cCI6MjA4NDc4Nzg0MX0.Qo-LZPEFUQyPhkYBZx03dJBD1nq5MhEmUkLLtJRnCp0';
            
            console.log('[GoogleCalendar] Chamando Edge Function:', fetchUrl);

            const response = await fetch(fetchUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'apikey': anonKey,
                },
            });

            console.log('[GoogleCalendar] Status da resposta:', response.status);

            if (!response.ok) {
                const text = await response.text();
                console.error('[GoogleCalendar] Erro na resposta:', text);
                setError(`Erro ${response.status}: ${text}`);
                alert(`Erro ao conectar: ${text}`);
                setLoading(false);
                return;
            }

            const result = await response.json();
            console.log('[GoogleCalendar] Resposta:', result);

            if (result.url) {
                console.log('[GoogleCalendar] Redirecionando para Google OAuth...');
                window.location.href = result.url;
            } else if (result.error) {
                setError(result.error);
                alert('Erro na configuração do Google: ' + result.error);
            } else {
                setError('Resposta inesperada do servidor');
                alert('Resposta inesperada do servidor. Verifique os logs.');
            }
        } catch (err: any) {
            console.error('[GoogleCalendar] Erro de rede:', err);
            setError(err.message || 'Erro de conexão');
            alert('Falha na comunicação com o servidor: ' + (err.message || 'Erro desconhecido'));
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('ATENÇÃO: Desconectar a agenda da empresa afetará todos os atendentes (a sincronização dos eventos vai parar). Deseja continuar?')) return;

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Busca a organização atual do usuário para desconectar a agenda da empresa
            const { data: orgMember } = await supabase
                .from('organization_members')
                .select('organization_id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (orgMember?.organization_id) {
                await supabase
                    .from('calendar_integrations')
                    .delete()
                    .eq('organization_id', orgMember.organization_id)
                    .eq('provider', 'google');
            }

            setConnected(false);
        } catch (err) {
            console.error('[GoogleCalendar] Erro ao desconectar:', err);
        } finally {
            setLoading(false);
        }
    };

    if (connected) {
        return (
            <div className="flex items-center gap-2 group cursor-default">
                <div className="flex items-center gap-1.5 text-emerald-400/80 text-[10px] font-black uppercase tracking-widest bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/10 backdrop-blur-sm" title="Google Calendar Sincronizado para toda a Empresa">
                    <CheckCircle className="w-3 h-3" />
                    <span className="opacity-80 group-hover:opacity-100 transition-opacity">Agenda Conectada</span>
                </div>
                <button
                    onClick={handleDisconnect}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all ml-1"
                    title="Desconectar Agenda"
                >
                    <LogOut className="w-3 h-3" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleConnect}
                disabled={loading}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Calendar className="w-3 h-3" />}
                {loading ? 'Conectando...' : 'Conectar Agenda'}
            </button>
            {error && (
                <div className="flex items-center gap-1 text-amber-400 text-[9px]" title={error}>
                    <AlertTriangle className="w-3 h-3" />
                </div>
            )}
        </div>
    );
};
