-- ==============================================================================
-- FIX DEFINITIVO: RLS PARA APPOINTMENTS E CALENDAR_INTEGRATIONS
-- Cola este script INTEIRO no SQL Editor do Supabase e clica em Run.
-- Ele é idempotente (pode rodar quantas vezes quiser sem erro).
-- ==============================================================================

-- ============================================================
-- PARTE 1: TABELA APPOINTMENTS (Agendamentos)
-- ============================================================

-- 1.1 Ativa RLS
ALTER TABLE IF EXISTS public.appointments ENABLE ROW LEVEL SECURITY;

-- 1.2 Remove políticas antigas para não dar conflito
DROP POLICY IF EXISTS "Users can view org appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can insert org appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update org appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete org appointments" ON public.appointments;

-- 1.3 SELECT: Membros da organização podem ver agendamentos da empresa
CREATE POLICY "Users can view org appointments" ON public.appointments
    FOR SELECT TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    );

-- 1.4 INSERT: Membros da organização podem criar agendamentos
CREATE POLICY "Users can insert org appointments" ON public.appointments
    FOR INSERT TO authenticated
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    );

-- 1.5 UPDATE: Membros da organização podem atualizar agendamentos
CREATE POLICY "Users can update org appointments" ON public.appointments
    FOR UPDATE TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    );

-- 1.6 DELETE: Membros da organização podem deletar agendamentos
CREATE POLICY "Users can delete org appointments" ON public.appointments
    FOR DELETE TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    );


-- ============================================================
-- PARTE 2: TABELA CALENDAR_INTEGRATIONS (Google Agenda)
-- ============================================================

-- 2.1 Ativa RLS
ALTER TABLE IF EXISTS public.calendar_integrations ENABLE ROW LEVEL SECURITY;

-- 2.2 Remove políticas antigas
DROP POLICY IF EXISTS "Membros podem ver a integração da empresa" ON public.calendar_integrations;
DROP POLICY IF EXISTS "Admin pode gerenciar integração" ON public.calendar_integrations;

-- 2.3 SELECT: Qualquer membro pode ver se a agenda está conectada
CREATE POLICY "Membros podem ver a integração da empresa" ON public.calendar_integrations
    FOR SELECT TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    );

-- 2.4 INSERT/UPDATE/DELETE: Apenas admins/owners podem gerenciar a conexão
CREATE POLICY "Admin pode gerenciar integração" ON public.calendar_integrations
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_id = public.calendar_integrations.organization_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );


-- ============================================================
-- PARTE 3: TABELA PROFILES (Perfil do usuário)
-- ============================================================

-- 3.1 Garante que a tabela de perfis existe
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT,
    onboarding_completed BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.2 Cria perfis que esttenham faltando para usuários existentes
INSERT INTO public.profiles (id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 3.3 Colunas extras para sincronização avançada
ALTER TABLE public.calendar_integrations
ADD COLUMN IF NOT EXISTS next_sync_token TEXT,
ADD COLUMN IF NOT EXISTS watch_resource_id TEXT,
ADD COLUMN IF NOT EXISTS watch_expiration TIMESTAMPTZ;


-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================
SELECT 
    'appointments' as tabela, 
    (SELECT count(*) FROM pg_policies WHERE tablename = 'appointments') as politicas_ativas
UNION ALL
SELECT 
    'calendar_integrations', 
    (SELECT count(*) FROM pg_policies WHERE tablename = 'calendar_integrations')
UNION ALL
SELECT 
    'profiles', 
    (SELECT count(*) FROM pg_policies WHERE tablename = 'profiles');
