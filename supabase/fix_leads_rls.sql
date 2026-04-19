-- ==============================================================================
-- CORREÇÃO DE SEGURANÇA (RLS) - TABELA LEADS
-- Garante que um atendente só possa interagir com os leads de sua própria organização.
-- ==============================================================================

-- 1. Habilitar RLS explícito
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas antigas se existirem (para evitar múltiplos conflitos)
DROP POLICY IF EXISTS "Users can view their organization leads" ON public.leads;
DROP POLICY IF EXISTS "Users can insert their organization leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their organization leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their organization leads" ON public.leads;
DROP POLICY IF EXISTS "Enable read access for organization members" ON public.leads;
DROP POLICY IF EXISTS "Enable insert access for organization members" ON public.leads;
DROP POLICY IF EXISTS "Enable update access for organization members" ON public.leads;

-- 3. Políticas Baseadas em organization_members

-- SELECT: Permite visualizar se o usuário for membro da organização
CREATE POLICY "Users can view their organization leads" ON public.leads
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_id = public.leads.organization_id 
            AND user_id = auth.uid()
        )
    );

-- INSERT: Permite criar leads apenas para organizações às quais o usuário pertence
CREATE POLICY "Users can insert their organization leads" ON public.leads
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_id = public.leads.organization_id 
            AND user_id = auth.uid()
        )
    );

-- UPDATE: Permite atualizar caso o usuário seja da organização
CREATE POLICY "Users can update their organization leads" ON public.leads
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_id = public.leads.organization_id 
            AND user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_id = public.leads.organization_id 
            AND user_id = auth.uid()
        )
    );

-- DELETE: Permite excluir leads da própria organização
CREATE POLICY "Users can delete their organization leads" ON public.leads
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_id = public.leads.organization_id 
            AND user_id = auth.uid()
        )
    );

-- Nota: Como o sistema automatiza cadastros via webhook-ai-scheduler (sem autenticação do front-end),
-- garanta que Edge Functions que inserem dados externos usem a Service Role (SUPABASE_SERVICE_ROLE_KEY)
-- para bypass no RLS.
