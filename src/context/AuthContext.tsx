import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { Organization, UserProfile } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  organization: Organization | null;
  userRole: 'admin' | 'member' | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  refreshOrganization: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'member' | null>(null);
  const [loading, setLoading] = useState(true);
  const isHealingRef = useRef(false);
  const isInitializedRef = useRef(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        setProfile(data as UserProfile);
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') return;
      console.error('Error fetching profile:', error);
    }
  };

    const fetchUserOrganization = async (userId: string) => {
    try {
      const { data: memberData } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', userId)
        .maybeSingle();

      if (memberData) {
        setUserRole(memberData.role as 'admin' | 'member');
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', memberData.organization_id)
          .single();

        setOrganization(orgData as Organization);
      } else {
        // Guard: impede execução duplicada do Self-Healing
        if (isHealingRef.current) {
          console.log('[Self-Healing] Já em execução, ignorando chamada duplicada.');
          return;
        }
        isHealingRef.current = true;
        console.warn('Usuário órfão detectado. Criando organização padrão (Self-Healing)...');
        const { data: newOrg, error: orgError } = await processAutoHealing(userId);
        isHealingRef.current = false;
        if (newOrg) {
           setOrganization(newOrg as Organization);
           setUserRole('admin');
        } else {
           console.error('Falha no Self-Healing:', orgError);
        }
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') return;
      console.error('Error fetching organization:', error);
    }
  };

  const processAutoHealing = async (userId: string) => {
      // Gera o ID localmente para evitar que o Supabase bloqueie a visualização do ID (Devido à política de RLS de select)
      const newOrgId = crypto.randomUUID();
      const orgName = 'Meu Workspace';
      // Gera um slug único baseado no timestamp para evitar violação de NOT NULL
      const orgSlug = `workspace-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // 1. Cria a Empresa injetando o ID, nome e slug (obrigatório na tabela)
      const { error: orgError } = await supabase
         .from('organizations')
         .insert([{ id: newOrgId, name: orgName, slug: orgSlug }]);
         
      if (orgError) {
         console.error("Autohealing Org Error:", orgError);
         return { error: orgError };
      }

      // 2. Vincula o usuário como Admin (Agora que ele for membro, ele passa a ter permissão de ler o tenant!)
      const { error: memberError } = await supabase
         .from('organization_members')
         .insert([{ organization_id: newOrgId, user_id: userId, role: 'admin' }]);
         
      if (memberError) {
         console.error("Autohealing Member Error:", memberError);
         return { error: memberError };
      }

      // 2.5 Cria estágios padrões de Pipeline para evitar bug da tela vazia/azul na Pipeline
      try {
        await supabase.from('pipeline_stages').insert([
            { organization_id: newOrgId, name: 'Novo Lead', color: 'border-blue-500/50', order_index: 0, is_system: true },
            { organization_id: newOrgId, name: 'Em Contato', color: 'border-amber-500/50', order_index: 1, is_system: false },
            { organization_id: newOrgId, name: 'Qualificado', color: 'border-emerald-500/50', order_index: 2, is_system: true },
            { organization_id: newOrgId, name: 'Proposta Enviada', color: 'border-purple-500/50', order_index: 3, is_system: false }
        ]);
      } catch (stageErr) {
        console.error("Autohealing Stages Error:", stageErr);
      }

      // 3. Monta o objeto sintético para engatar na tela sem precisar baixar do banco imediatamente
      return { data: { id: newOrgId, name: orgName } };
  };

  useEffect(() => {
    let mounted = true;
    let authTimeout: NodeJS.Timeout;

    console.log('[AuthContext] Inicializando Provedor de Autenticação...');

    const loadUserData = async (userId: string) => {
      if (!mounted) return;
      try {
        await Promise.all([
          fetchProfile(userId),
          fetchUserOrganization(userId)
        ]);
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        console.error('[AuthContext] Erro ao carregar dados complementares:', err);
      }
    };

    // Função de limpeza de estado
    const clearState = () => {
      setSession(null);
      setUser(null);
      setProfile(null);
      setOrganization(null);
      setUserRole(null);
    };

    // 1. Escuta mudanças de estado (Esta é a fonte mais confiável de eventos)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      console.log(`[AuthContext] Evento Supabase: ${event} | User: ${session?.user?.id || 'nenhum'}`);

      // Marca como inicializado assim que recebermos qualquer evento ou sessão (mesmo nula)
      isInitializedRef.current = true;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadUserData(session.user.id);
      } else {
        clearState();
      }

      // IMPORTANTE: Só liberamos o loading após termos tentado carregar os dados
      setLoading(false);
    });

    // 2. Backup: Tenta pegar a sessão inicial via getSession caso o listener demore
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted || isInitializedRef.current) return;
      
      if (error) {
        if (error.name !== 'AbortError') console.error('[AuthContext] Erro getSession:', error);
        setLoading(false);
        return;
      }

      if (session) {
        console.log('[AuthContext] Sessão recuperada via getSession');
        setSession(session);
        setUser(session.user);
        loadUserData(session.user.id).finally(() => {
          if (mounted) {
             isInitializedRef.current = true;
             setLoading(false);
          }
        });
      } else {
         // Se não há sessão no getSession, não liberamos o loading ainda. 
         // Esperamos o onAuthStateChange disparar o INITIAL_SESSION ou o timeout.
         console.log('[AuthContext] getSession retornou vazio, aguardando INITIAL_SESSION...');
      }
    }).catch(err => {
      if (err?.name !== 'AbortError') console.error('[AuthContext] Falha catch getSession:', err);
      if (mounted && !isInitializedRef.current) setLoading(false);
    });

    // 3. Trava de Segurança Final (Se tudo falhar em 8s, libera a aplicação)
    authTimeout = setTimeout(() => {
      if (mounted) {
        setLoading(prev => {
          if (prev) console.warn('[AuthContext] Timeout de segurança atingido. Liberando tela.');
          return false;
        });
      }
    }, 8000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(authTimeout);
    };
  }, []);

  const refreshProfile = () => user ? fetchProfile(user.id) : Promise.resolve();
  const refreshOrganization = () => user ? fetchUserOrganization(user.id) : Promise.resolve();

  const signOut = async () => {
    try {
        await supabase.auth.signOut({ scope: 'local' });
        
        // Limpeza agressiva do Cache local para garantir a destruição da sessão corrompida
        for (let key in localStorage) {
            if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
                localStorage.removeItem(key);
            }
        }
    } catch (e) {
        console.warn("Forçando saída local devido a erro na API:", e);
    } finally {
        setSession(null);
        setUser(null);
        setProfile(null);
        setOrganization(null);
        setUserRole(null);
        window.location.href = '/login';
    }
  };

  const value = {
    session,
    user,
    profile,
    organization,
    userRole,
    loading,
    refreshProfile,
    refreshOrganization,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};