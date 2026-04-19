-- ==============================================================================
-- CORREÇÃO DE SCHEMA: ADICIONAR COLUNA USER_ID
-- O erro "Could not find the 'user_id' column" indica que esta coluna falta na tabela leads.
-- Este script adiciona a coluna e cria a referência para auth.users.
-- ==============================================================================

-- 1. Adicionar colunas se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'user_id') THEN
        ALTER TABLE public.leads ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Atualizar RLS Policies (Opcional, mas recomendado para garantir acesso)
-- Garante que o usuário possa ver seus próprios leads (caso a policy use user_id)
-- CREATE POLICY "Users can view their own leads" ON public.leads FOR SELECT USING (auth.uid() = user_id);

-- 3. Índice para performance (já estava no script de otimização, mas reforçando)
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads (user_id);
