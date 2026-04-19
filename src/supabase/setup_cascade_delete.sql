-- ==============================================================================
-- CONFIGURAÇÃO DE DELEÇÃO EM CASCATA (CLEANUP AUTOMÁTICO)
-- Garante que ao deletar um usuário em 'auth.users', todos os dados vinculados
-- (Leads, Atividades, Membros) sejam apagados automaticamente.
-- ==============================================================================

-- 1. Tabela ORGANIZATION_MEMBERS (Vínculo Usuário <-> Organização)
-- Verifica se já existe a constraint e a recria com ON DELETE CASCADE
ALTER TABLE public.organization_members
DROP CONSTRAINT IF EXISTS organization_members_user_id_fkey,
ADD CONSTRAINT organization_members_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 2. Tabela LEADS (Dados criados pelo usuário)
-- Ajusta a coluna user_id adicionada recentemente
ALTER TABLE public.leads
DROP CONSTRAINT IF EXISTS leads_user_id_fkey,
ADD CONSTRAINT leads_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 3. Tabela ACTIVITIES (Atividades do usuário)
-- Se existir coluna user_id em activities (assumindo que sim ou criando se não)
DO $$
BEGIN
    -- Verifica se activities tem user_id, se sim, aplica cascade
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'user_id') THEN
        ALTER TABLE public.activities
        DROP CONSTRAINT IF EXISTS activities_user_id_fkey;
        
        ALTER TABLE public.activities
        ADD CONSTRAINT activities_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Opcional: ORGANIZATIONS (Se o dono for deletado, apaga a organização?)
-- CUIDADO: Isso apagaria a organização para TODOS os membros se o dono sair.
-- Geralmente NÃO se faz isso automaticamente em sistemas multi-tenant sérios.
-- A organização deve persistir ou ser transferida.
-- Mantedos o padrão: Se o dono for deletado, ele some de 'organization_members',
-- mas a 'organization' fica orfã de dono (precisa de lógica de negócio para tratar),
-- mas os dados da empresa NÃO somem. Isso é mais seguro.
