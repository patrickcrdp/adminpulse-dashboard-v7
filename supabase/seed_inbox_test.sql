-- Dados de Teste para o Módulo de Atendimento
DO $$
DECLARE
    org_id UUID;
    convo_id UUID;
    user_id UUID;
BEGIN
    -- Pegar a primeira organização e o primeiro usuário para o teste
    SELECT id INTO org_id FROM public.organizations LIMIT 1;
    SELECT id INTO user_id FROM auth.users LIMIT 1;

    IF org_id IS NOT NULL THEN
        -- 1. Criar uma conversa de WhatsApp
        INSERT INTO public.inbox_conversations (organization_id, provider, external_convo_id, customer_name, last_message, status)
        VALUES (org_id, 'whatsapp', '5511999999999', 'Ricardo Almeida', 'Olá, gostaria de saber os preços', 'new')
        RETURNING id INTO convo_id;

        INSERT INTO public.inbox_messages (conversation_id, organization_id, content, is_from_customer, type)
        VALUES 
            (convo_id, org_id, 'Olá, gostaria de saber os preços', true, 'text'),
            (convo_id, org_id, 'Com certeza Ricardo! Qual plano você tem interesse?', false, 'text');

        -- 2. Criar uma conversa de Instagram
        INSERT INTO public.inbox_conversations (organization_id, provider, external_convo_id, customer_name, last_message, status)
        VALUES (org_id, 'instagram', 'ig_user_123', 'Mariana Silva', 'Amei o post de hoje!', 'new')
        RETURNING id INTO convo_id;

        INSERT INTO public.inbox_messages (conversation_id, organization_id, content, is_from_customer, type)
        VALUES (convo_id, org_id, 'Amei o post de hoje!', true, 'text');

        -- 3. Criar uma integração fictícia para o Dashboard não aparecer vazio
        INSERT INTO public.inbox_integrations (organization_id, provider, provider_id, status)
        VALUES 
            (org_id, 'whatsapp', '123456789', 'active'),
            (org_id, 'instagram', '987654321', 'active')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
