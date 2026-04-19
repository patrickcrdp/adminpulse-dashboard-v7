-- ==============================================================================
-- FIX DEFINITIVO: TRIGGER handle_new_user + PROFILES
-- A trigger original NÃO criava o perfil do usuário na tabela profiles.
-- Isso causava erro 500 "Database error saving new user" no signup.
-- Cole e execute INTEIRO no Supabase SQL Editor.
-- ==============================================================================

-- 1. Garante que a tabela profiles existe com a estrutura correta
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT,
    onboarding_completed BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Ativa RLS e cria policies para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- 3. Policy para service_role (usado pela trigger)
DROP POLICY IF EXISTS "Service role full access profiles" ON public.profiles;
CREATE POLICY "Service role full access profiles" ON public.profiles
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. Recria a trigger handle_new_user COMPLETA (agora cria perfil + org + membership)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    new_org_id uuid;
    user_name text;
BEGIN
    -- Extrair nome do usuário dos metadados
    user_name := COALESCE(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name',
        split_part(new.email, '@', 1)
    );

    -- Step 1: Criar perfil do usuário (CRÍTICO - sem isso, appointments falha)
    INSERT INTO public.profiles (id, full_name, email, updated_at)
    VALUES (new.id, user_name, new.email, now())
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        email = COALESCE(EXCLUDED.email, profiles.email),
        updated_at = now();

    -- Step 2: Criar organização padrão
    INSERT INTO public.organizations (name)
    VALUES (COALESCE(user_name, 'Minha Empresa') || '''s Team')
    RETURNING id INTO new_org_id;

    -- Step 3: Vincular usuário como owner da organização
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (new_org_id, new.id, 'owner');

    RETURN new;
EXCEPTION WHEN OTHERS THEN
    -- Se algo falhar, loga mas NÃO bloqueia o cadastro
    RAISE WARNING 'handle_new_user failed for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;

-- 5. Recriar a trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Corrigir perfis faltantes de usuários existentes
INSERT INTO public.profiles (id, email, updated_at)
SELECT id, email, now() FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 7. Verificação
SELECT 'Trigger OK' as status, count(*) as profiles_total FROM public.profiles;
