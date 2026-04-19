-- ==============================================================================
-- SISTEMA DE PIPELINE DINÂMICO
-- Permite que usuários gerenciem suas próprias colunas de vendas.
-- ==============================================================================

-- 1. TABELA DE ESTÁGIOS DA PIPELINE
CREATE TABLE IF NOT EXISTS public.pipeline_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT 'border-blue-500/50',
    order_index INTEGER DEFAULT 0,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ADICIONAR COLUNA DE ESTÁGIO NA TABELA DE LEADS (SE NÃO EXISTIR)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'pipeline_stage_id') THEN
        ALTER TABLE public.leads ADD COLUMN pipeline_stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. SEGURANÇA (RLS)
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage stages" ON public.pipeline_stages;
CREATE POLICY "Owners can manage stages" ON public.pipeline_stages
    FOR ALL 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_id = public.pipeline_stages.organization_id 
            AND user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.organization_members 
            WHERE organization_id = public.pipeline_stages.organization_id 
            AND user_id = auth.uid()
        )
    );

-- 4. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_org ON public.pipeline_stages(organization_id, order_index);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage ON public.leads(pipeline_stage_id);

-- 5. FUNÇÃO PARA CRIAR ESTÁGIOS PADRÃO PARA NOVAS ORGANIZAÇÕES
CREATE OR REPLACE FUNCTION public.create_default_pipeline_stages()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.pipeline_stages (organization_id, name, color, order_index, is_system)
    VALUES 
        (NEW.id, 'Novos Leads', 'border-blue-500/50', 0, true),
        (NEW.id, 'Em Contato', 'border-amber-500/50', 1, true),
        (NEW.id, 'Qualificado', 'border-emerald-500/50', 2, true),
        (NEW.id, 'Convertido', 'border-purple-500/50', 3, true);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para novas organizações
DROP TRIGGER IF EXISTS trg_create_default_stages ON public.organizations;
CREATE TRIGGER trg_create_default_stages
    AFTER INSERT ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.create_default_pipeline_stages();

-- 6. MIGRAR DADOS EXISTENTES (BACKFILL)
-- Este bloco cria estágios para organizações existentes e vincula os leads pelo 'status' antigo.
DO $$
DECLARE
    org_record RECORD;
    new_stage_id UUID;
BEGIN
    FOR org_record IN SELECT id FROM public.organizations LOOP
        -- Verifica se já tem estágios
        IF NOT EXISTS (SELECT 1 FROM public.pipeline_stages WHERE organization_id = org_record.id) THEN
            -- Cria estágios base
            INSERT INTO public.pipeline_stages (organization_id, name, color, order_index, is_system)
            VALUES (org_record.id, 'Novos Leads', 'border-blue-500/50', 0, true) RETURNING id INTO new_stage_id;
            UPDATE public.leads SET pipeline_stage_id = new_stage_id WHERE organization_id = org_record.id AND (status::text = 'new' OR status IS NULL);

            INSERT INTO public.pipeline_stages (organization_id, name, color, order_index, is_system)
            VALUES (org_record.id, 'Em Contato', 'border-amber-500/50', 1, true) RETURNING id INTO new_stage_id;
            UPDATE public.leads SET pipeline_stage_id = new_stage_id WHERE organization_id = org_record.id AND (status::text = 'contacted' OR status::text = 'responded');

            INSERT INTO public.pipeline_stages (organization_id, name, color, order_index, is_system)
            VALUES (org_record.id, 'Qualificado', 'border-emerald-500/50', 2, true) RETURNING id INTO new_stage_id;
            UPDATE public.leads SET pipeline_stage_id = new_stage_id WHERE organization_id = org_record.id AND status::text = 'qualified';

            INSERT INTO public.pipeline_stages (organization_id, name, color, order_index, is_system)
            VALUES (org_record.id, 'Convertido', 'border-purple-500/50', 3, true) RETURNING id INTO new_stage_id;
            UPDATE public.leads SET pipeline_stage_id = new_stage_id WHERE organization_id = org_record.id AND (status::text = 'converted' OR status::text = 'closed');
        END IF;
    END LOOP;
END;
$$;
