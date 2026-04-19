-- ==============================================================================
-- CORREÇÃO DE SEGURANÇA (RLS) - DASHBOARD LINTER
-- Resolve os alertas de segurança onde RLS estava desativado em tabelas públicas.
-- ==============================================================================

-- 1. Habilitar RLS em todas as tabelas reportadas
ALTER TABLE IF EXISTS public.organization_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.anon_lead_rate_limit ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para ORGANIZATION_DOMAINS
-- Permite leitura para membros da organização
DROP POLICY IF EXISTS "Users can view their organization domains" ON public.organization_domains;
CREATE POLICY "Users can view their organization domains" ON public.organization_domains
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_id = public.organization_domains.organization_id 
            AND user_id = auth.uid()
        )
    );

-- Permite gestão total para owners/admins
DROP POLICY IF EXISTS "Admins can manage organization domains" ON public.organization_domains;
CREATE POLICY "Admins can manage organization domains" ON public.organization_domains
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_id = public.organization_domains.organization_id 
            AND user_id = auth.uid()
            AND role IN ('admin', 'owner')
        )
    );

-- 3. Políticas para AUDIT_LOGS
-- Permite leitura da trilha de auditoria para membros da organização
DROP POLICY IF EXISTS "Users can view their organization audit logs" ON public.audit_logs;
CREATE POLICY "Users can view their organization audit logs" ON public.audit_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_id = public.audit_logs.organization_id 
            AND user_id = auth.uid()
        )
    );

-- 4. Políticas para SYNC_LOGS
-- Permite leitura de logs de sincronização para membros da organização
DROP POLICY IF EXISTS "Users can view their organization sync logs" ON public.sync_logs;
CREATE POLICY "Users can view their organization sync logs" ON public.sync_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_id = public.sync_logs.organization_id 
            AND user_id = auth.uid()
        )
    );

-- 5. Políticas para ANON_LEAD_RATE_LIMIT
-- Esta tabela é técnica. RLS ativado por segurança, acesso restrito apenas ao sistema (service_role).
DROP POLICY IF EXISTS "System only access for rate limit" ON public.anon_lead_rate_limit;
CREATE POLICY "System only access for rate limit" ON public.anon_lead_rate_limit
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);
