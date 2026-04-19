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
    } catch (error) {
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
    } catch (error) {
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

      // 3. Monta o objeto sintético para engatar na tela sem precisar baixar do banco imediatamente
      return { data: { id: newOrgId, name: orgName } };
  };

  useEffect(() => {
    let mounted = true;
    console.log('[AuthContext] Mounting AuthProvider...');

    const loadUserData = async (userId: string) => {
      console.log('[AuthContext] Executing loadUserData for:', userId);
      try {
        const fetchPromise = Promise.all([
          fetchProfile(userId),
          fetchUserOrganization(userId)
        ]);

        // Timeout robusto de 4 segundos exclusivo para as requisições do DB
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout: As consultas ao banco do Supabase excederam 4 segundos.")), 4000)
        );

        await Promise.race([fetchPromise, timeoutPromise]);
        console.log('[AuthContext] loadUserData complete. Setting loading=false.');
      } catch (err) {
        console.error('[AuthContext] Error in loadUserData:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const processSession = (session: Session | null, source: string) => {
      if (!mounted) return;
      console.log(`[AuthContext] Processing session from ${source}. User:`, session?.user?.id);
      
      isInitializedRef.current = true;
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        console.log('[AuthContext] No user found. Setting loading=false.');
        setLoading(false);
      }
    };

    // 1. Tenta pegar a sessão inicial
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('[AuthContext] getSession resolved. Error?', error);
      if (error) {
        console.error('Erro na sessão inicial:', error);
        if (mounted) setLoading(false);
        return;
      }
      // Se onAuthStateChange já inicializou, não fazemos nada aqui
      if (!isInitializedRef.current) {
        processSession(session, 'getSession');
      }
    }).catch((err) => {
      console.error('Falha crítica ao obter sessão:', err);
      if (mounted) setLoading(false);
    });

    // 2. Escuta mudanças de estado (isso frequentemente resolve ANTES do getSession no OAuth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthContext] onAuthStateChange event:', event, 'User:', session?.user?.id);
      if (!mounted) return;
      
      if (!isInitializedRef.current) {
        // Inicializa através do listener se ele responder mais rápido que o getSession
        processSession(session, 'onAuthStateChange');
      } else {
        // Atualizações normais pós-inicialização
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          loadUserData(session.user.id);
        } else {
          setProfile(null);
          setOrganization(null);
          setLoading(false);
        }
      }
    });

    // 3. Timeout Safety robusto complementar (desbloqueia se o Supabase morrer sumariamente)
    const timeoutId = setTimeout(() => {
        if (mounted) {
            setLoading(prev => {
                if (prev) {
                    console.warn('[System] Timeout global disparado! Tela destravada de forma forçada.');
                }
                return false; // Sempre limpa o loading após 6s
            });
        }
    }, 6000);

    return () => {
        mounted = false;
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