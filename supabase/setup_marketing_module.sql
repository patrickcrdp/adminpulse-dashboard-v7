-- ==============================================================================
-- SCHEMA MÓDULO DE MARKETING & TRÁFEGO
-- Tabelas para armazenar integrações, metas, estatísticas de Ads e criativos.
-- ==============================================================================

-- 1. Tabela de Integrações de Marketing (Tokens e Credenciais)
CREATE TABLE IF NOT EXISTS public.marketing_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- 'meta', 'google', 'tiktok'
    account_id TEXT, -- ID da conta de anúncios no provedor
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(organization_id, provider)
);

-- 2. Tabela de Metas de Marketing e Configurações de ROI
CREATE TABLE IF NOT EXISTS public.marketing_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
    industry TEXT,
    monthly_budget_goal DECIMAL(12,2) DEFAULT 0,
    monthly_revenue_goal DECIMAL(12,2) DEFAULT 0,
    average_ticket DECIMAL(12,2) DEFAULT 0,
    target_cac DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Histórico de Performance de Anúncios (Sincronizado via Edge Functions)
CREATE TABLE IF NOT EXISTS public.marketing_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    date DATE NOT NULL,
    spend DECIMAL(12,2) DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    revenue_generated DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(organization_id, provider, date)
);

-- 4. Biblioteca de Criativos
CREATE TABLE IF NOT EXISTS public.marketing_creatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    thumbnail_url TEXT,
    media_url TEXT NOT NULL,
    media_type TEXT, -- 'image', 'video'
    performance_score DECIMAL(5,2) DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS em tudo
ALTER TABLE public.marketing_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_creatives ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (Multi-tenancy)
DO $$ 
BEGIN
    -- Integrações
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their organization marketing integrations') THEN
        CREATE POLICY "Users can view their organization marketing integrations" ON public.marketing_integrations
            FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = public.marketing_integrations.organization_id AND user_id = auth.uid()));
    END IF;

    -- Configurações
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their organization marketing config') THEN
        CREATE POLICY "Users can view their organization marketing config" ON public.marketing_config
            FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = public.marketing_config.organization_id AND user_id = auth.uid()));
    END IF;

    -- Estatísticas
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their organization marketing stats') THEN
        CREATE POLICY "Users can view their organization marketing stats" ON public.marketing_stats
            FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = public.marketing_stats.organization_id AND user_id = auth.uid()));
    END IF;

    -- Criativos
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their organization marketing creatives') THEN
        CREATE POLICY "Users can view their organization marketing creatives" ON public.marketing_creatives
            FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = public.marketing_creatives.organization_id AND user_id = auth.uid()));
    END IF;
END $$;
