-- ==============================================================================
-- ESTRUTURA DE PRODUÇÃO: MÓDULO DE ATENDIMENTO (INBOX)
-- Refinamentos para segurança, performance e automação.
-- ==============================================================================

-- 1. Melhoria na vinculação automática com Leads
-- Sempre que uma conversa for criada ou atualizada, tenta vincular ao lead pelo telefone/email
CREATE OR REPLACE FUNCTION public.fn_link_inbox_to_lead()
RETURNS TRIGGER AS $$
DECLARE
    v_lead_id UUID;
    v_clean_phone TEXT;
BEGIN
    -- Limpa o external_convo_id (geralmente o telefone no WhatsApp) para comparar
    v_clean_phone := regexp_replace(NEW.external_convo_id, '[^0-9]', '', 'g');
    
    -- Busca lead pelo telefone (lógica simplificada: últimos 8 dígitos para evitar erros de DDI/prefixo)
    SELECT id INTO v_lead_id 
    FROM public.leads 
    WHERE organization_id = NEW.organization_id 
      AND (
        regexp_replace(phone, '[^0-9]', '', 'g') LIKE '%' || right(v_clean_phone, 8)
        OR email = NEW.external_convo_id -- Para IDs que são emails
      )
    LIMIT 1;

    IF v_lead_id IS NOT NULL THEN
        NEW.contact_id := v_lead_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_link_inbox_to_lead
BEFORE INSERT OR UPDATE OF external_convo_id ON public.inbox_conversations
FOR EACH ROW EXECUTE FUNCTION public.fn_link_inbox_to_lead();

-- 2. Tabela de Automação e Regras de Mensagem (Chatbot / IA)
CREATE TABLE IF NOT EXISTS public.inbox_automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    trigger_type TEXT NOT NULL, -- 'keyword', 'first_message', 'outside_hours'
    trigger_value TEXT, -- A palavra-chave ou configuração
    response_text TEXT,
    ai_enabled BOOLEAN DEFAULT false,
    ai_prompt TEXT, -- Instruções específicas para este fluxo
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Histórico de Status de Mensagem (Sent, Delivered, Read)
CREATE TABLE IF NOT EXISTS public.inbox_message_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.inbox_messages(id) ON DELETE CASCADE,
    status TEXT NOT NULL, -- 'sent', 'delivered', 'read', 'failed'
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- 4. Funções de Auditoria e KPI (Tempo Médio de Resposta)
CREATE OR REPLACE FUNCTION public.get_inbox_stats(p_org_id UUID)
RETURNS JSON AS $$
DECLARE
    v_stats JSON;
BEGIN
    SELECT json_build_object(
        'waiting', (SELECT count(*) FROM public.inbox_conversations WHERE organization_id = p_org_id AND status = 'new'),
        'in_progress', (SELECT count(*) FROM public.inbox_conversations WHERE organization_id = p_org_id AND status = 'in_progress'),
        'closed_today', (SELECT count(*) FROM public.inbox_conversations WHERE organization_id = p_org_id AND status = 'closed' AND updated_at >= CURRENT_DATE),
        'avg_response_time_min', 0 -- Placeholder para lógica complexa de timestamps
    ) INTO v_stats;
    
    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS Adicional para Automação
ALTER TABLE public.inbox_automation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their org automation" ON public.inbox_automation_rules
    FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = public.inbox_automation_rules.organization_id AND user_id = auth.uid()));

-- 6. Garantir que as tabelas base tenham RLS corretos (Removendo o modo permissivo de teste)
DROP POLICY IF EXISTS "Users can view organization conversations" ON public.inbox_conversations;
CREATE POLICY "Users can view organization conversations" ON public.inbox_conversations
    FOR ALL TO authenticated USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can view organization messages" ON public.inbox_messages;
CREATE POLICY "Users can view organization messages" ON public.inbox_messages
    FOR ALL TO authenticated USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    );
