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
    isInitializedRef.current = false; // RESET no remount do StrictMode
    console.log('[AuthContext] Mounting AuthProvider...');

    const loadUserData = async (userId: string) => {
      try {
        await Promise.all([
          fetchProfile(userId),
          fetchUserOrganization(userId)
        ]);
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        console.error('[AuthContext] Error in background load:', err);
      }
    };

    const processSession = (session: Session | null, source: string) => {
      if (!mounted) return;
      
      isInitializedRef.current = true;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        loadUserData(session.user.id);
      }
    };

    // 1. Tenta pegar a sessão inicial
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      if (error) {
        if ((error as any)?.name === 'AbortError' || error?.message?.includes('AbortError') || error?.message?.includes('signal is aborted')) {
          return; // Silenciar - é do StrictMode
        }
        console.error('Erro na sessão inicial:', error);
        if (mounted) setLoading(false);
        return;
      }
      if (!isInitializedRef.current) {
        processSession(session, 'getSession');
      }
    }).catch((err: any) => {
      if (!mounted) return;
      if (err?.name === 'AbortError' || err?.message?.includes('signal is aborted')) return;
      console.error('Falha crítica ao obter sessão:', err);
      if (mounted) setLoading(false);
    });

    // 2. Escuta mudanças de estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      if (!isInitializedRef.current) {
        processSession(session, 'onAuthStateChange');
      } else {
        // Atualizações pós-inicialização
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false); // SEMPRE liberar loading aqui também
        if (session?.user) {
          loadUserData(session.user.id);
        } else {
          setProfile(null);
          setOrganization(null);
        }
      }
    });

    // 3. Timeout Safety (10s - margem generosa para conexões lentas)
    const timeoutId = setTimeout(() => {
        if (mounted) {
            setLoading(false);
        }
    }, 10000);

    return () => {
        mounted = false;
        isInitializedRef.current = false; // Limpa para o próximo mount
        subscription.unsubscribe();
        clearTimeout(timeoutId);
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