-- ==============================================================================
-- AUTOMATIZAÇÃO DE PIPELINE PARA NOVOS LEADS
-- Garante que todo lead inserido (Manual ou Importado) caia na primeira coluna.
-- ==============================================================================

-- 1. Função que encontra o estágio inicial e atribui ao lead
CREATE OR REPLACE FUNCTION public.fn_auto_assign_lead_pipeline_stage()
RETURNS TRIGGER AS $$
DECLARE
    default_stage_id UUID;
BEGIN
    -- Só age se o lead ainda não tiver um estágio definido
    IF NEW.pipeline_stage_id IS NULL THEN
        -- Busca o estágio com o menor order_index para a organização do lead
        SELECT id INTO default_stage_id
        FROM public.pipeline_stages
        WHERE organization_id = NEW.organization_id
        ORDER BY order_index ASC
        LIMIT 1;

        -- Atribui o estágio encontrado
        IF default_stage_id IS NOT NULL THEN
            NEW.pipeline_stage_id := default_stage_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger de Inserção na tabela de Leads
DROP TRIGGER IF EXISTS trg_auto_assign_lead_pipeline_stage ON public.leads;
CREATE TRIGGER trg_auto_assign_lead_pipeline_stage
    BEFORE INSERT ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.fn_auto_assign_lead_pipeline_stage();

-- 3. Backfill: Corrigir leads existentes que estão "no limbo" (sem coluna)
-- Atribui o estágio inicial para leads que não possuem pipeline_stage_id
DO $$
DECLARE
    org_record RECORD;
    first_stage_id UUID;
BEGIN
    FOR org_record IN SELECT id FROM public.organizations LOOP
        -- Busca o primeiro estágio da org
        SELECT id INTO first_stage_id 
        FROM public.pipeline_stages 
        WHERE organization_id = org_record.id 
        ORDER BY order_index ASC 
        LIMIT 1;

        -- Se encontrou o estágio, atualiza os leads órfãos daquela org
        IF first_stage_id IS NOT NULL THEN
            UPDATE public.leads 
            SET pipeline_stage_id = first_stage_id 
            WHERE organization_id = org_record.id 
            AND pipeline_stage_id IS NULL;
        END IF;
    END LOOP;
END $$;
