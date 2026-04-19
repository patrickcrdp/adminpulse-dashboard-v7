-- ==============================================================================
-- SEED DE DADOS PARA TESTE DO MÓDULO DE MARKETING
-- Popula as tabelas para validar a funcionalidade do frontend.
-- ==============================================================================

DO $$ 
DECLARE
    v_org_id UUID;
BEGIN
    -- Pegar a ID da primeira organização disponível para o teste
    SELECT id INTO v_org_id FROM public.organizations LIMIT 1;

    IF v_org_id IS NULL THEN
        RAISE NOTICE 'Nenhuma organização encontrada. Crie uma conta ou organização primeiro.';
        RETURN;
    END IF;

    -- 1. Inserir Configuração de Marketing
    INSERT INTO public.marketing_config (organization_id, industry, monthly_budget_goal, monthly_revenue_goal, average_ticket, target_cac)
    VALUES (v_org_id, 'imobiliario', 5000.00, 100000.00, 25000.00, 150.00)
    ON CONFLICT (organization_id) DO UPDATE SET
        industry = EXCLUDED.industry,
        monthly_budget_goal = EXCLUDED.monthly_budget_goal,
        monthly_revenue_goal = EXCLUDED.monthly_revenue_goal;

    -- 2. Inserir Estatísticas de Ads dos últimos 7 dias
    DELETE FROM public.marketing_stats WHERE organization_id = v_org_id;
    
    INSERT INTO public.marketing_stats (organization_id, provider, date, spend, impressions, clicks, conversions, leads_generated, revenue_generated)
    VALUES 
        (v_org_id, 'meta', CURRENT_DATE, 150.50, 5200, 120, 5, 5, 12500.00),
        (v_org_id, 'meta', CURRENT_DATE - INTERVAL '1 day', 180.00, 6100, 145, 8, 8, 0.00),
        (v_org_id, 'google', CURRENT_DATE, 90.00, 1200, 45, 2, 2, 0.00),
        (v_org_id, 'google', CURRENT_DATE - INTERVAL '1 day', 110.00, 1500, 55, 3, 3, 25000.00),
        (v_org_id, 'meta', CURRENT_DATE - INTERVAL '2 days', 210.00, 7500, 190, 12, 12, 0.00);

    -- 3. Inserir Criativos
    DELETE FROM public.marketing_creatives WHERE organization_id = v_org_id;

    INSERT INTO public.marketing_creatives (organization_id, name, media_url, media_type, performance_score, status)
    VALUES 
        (v_org_id, 'Venda Direta | Story | Gancho 03', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0', 'image', 9.8, 'active'),
        (v_org_id, 'Carrossel Institucional | Feed', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f', 'image', 7.2, 'active'),
        (v_org_id, 'UGC Cliente | Prova Social', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113', 'video', 10.0, 'active');

    RAISE NOTICE 'Dados de teste de marketing inseridos com sucesso para a org %', v_org_id;
END $$;
