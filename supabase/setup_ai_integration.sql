-- ==============================================================================
-- INTEGRAÇÃO DE IA DE ATENDIMENTO (AGENDAMENTO VIA WEBHOOK)
-- ==============================================================================

-- Habilita extensão para geração de chaves aleatórias
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. TABELA DE TOKENS DE API PARA IA
CREATE TABLE IF NOT EXISTS public.ai_agent_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL DEFAULT 'IA de Atendimento',
    api_key TEXT UNIQUE NOT NULL DEFAULT 'sk_ai_' || encode(gen_random_bytes(24), 'hex'),
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    settings JSONB DEFAULT '{
        "allow_lead_creation": true,
        "default_duration_minutes": 30,
        "confirmation_webhook": null
    }'
);

-- 2. SEGURANÇA (RLS)
ALTER TABLE public.ai_agent_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage AI configs" ON public.ai_agent_configs;
CREATE POLICY "Owners can manage AI configs" ON public.ai_agent_configs
    FOR ALL 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_id = public.ai_agent_configs.organization_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_id = public.ai_agent_configs.organization_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- 3. ÍNDICE PARA BUSCA RÁPIDA DE API KEY
CREATE INDEX IF NOT EXISTS idx_ai_agent_keys ON public.ai_agent_configs(api_key) WHERE is_active = true;

-- 4. LOGS DE AGENDAMENTOS POR IA (Opcional, para auditoria)
CREATE TABLE IF NOT EXISTS public.ai_booking_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES public.ai_agent_configs(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    payload JSONB,
    status TEXT, -- 'success', 'error'
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ai_booking_logs ENABLE ROW LEVEL SECURITY;
-- Donos podem ver seus logs
CREATE POLICY "Owners can view AI logs" ON public.ai_booking_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_id = public.ai_booking_logs.organization_id 
            AND user_id = auth.uid()
        )
    );

COMMENT ON TABLE public.ai_agent_configs IS 'Configurações e chaves de acesso para agentes de IA externos.';
