-- ==============================================================================
-- CORREÇÃO DEFINITIVA DE ORGANIZAÇÃO E USUÁRIOS (V3 FINAL)
-- Correção Anterior: O erro ocorria porque a trigger 'auto_add_owner_to_org' tentava usar
-- auth.uid() que é NULO quando rodamos scripts no SQL Editor.
-- Solução: Tornamos a função 'auto_add_owner_to_org' mais segura.
-- ==============================================================================

-- 1. TORNAR A TRIGGER EXISTENTE SEGURA (Evita o erro de user_id NULL)
CREATE OR REPLACE FUNCTION public.auto_add_owner_to_org()
RETURNS TRIGGER AS $$
BEGIN
  -- Só tenta adicionar automaticamente se houver um usuário logado (auth.uid())
  -- Se for rodado pelo sistema (nosso script de correção), ignoramos isso
  -- pois o script fará a inserção do membro manualmente.
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (NEW.id, auth.uid(), 'owner');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. FUNÇÃO E TRIGGER PARA NOVOS USUÁRIOS (Fluxo de Cadastro Automático)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  new_slug TEXT;
  company_name TEXT;
BEGIN
  -- Define nome e slug base
  company_name := COALESCE(NEW.raw_user_meta_data->>'company_name', 'Minha Organização');
  -- Remove caracteres especiais do slug e garante lowercase
  new_slug := lower(regexp_replace(company_name, '[^a-zA-Z0-9]', '', 'g'));
  -- Adiciona sufixo aleatório para garantir unicidade
  new_slug := new_slug || '-' || substr(md5(random()::text), 1, 6);

  -- 1. Cria a organização
  -- Nota: Isso vai disparar 'auto_add_owner_to_org', mas como o usuário acabou
  -- de ser criado, o auth.uid() pode não bater ou ser nulo.
  -- De qualquer forma, garantimos a inserção do membro manualmente abaixo.
  INSERT INTO public.organizations (name, slug)
  VALUES (company_name, new_slug)
  RETURNING id INTO new_org_id;

  -- 2. Insere o MEMBRO (Dono)
  -- Usamos ON CONFLICT para garantir que não haja erro se a trigger já tiver inserido
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner')
  ON CONFLICT (organization_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recria a trigger na tabela de usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- 3. ROTINA DE CORREÇÃO (BACKFILL)
-- Conserta usuários que estão travados agora
DO $$
DECLARE
  r RECORD;
  new_org_id UUID;
  user_slug TEXT;
  base_email_part TEXT;
BEGIN
  FOR r IN 
    SELECT u.id, u.email 
    FROM auth.users u
    LEFT JOIN public.organization_members om ON u.id = om.user_id
    WHERE om.id IS NULL
  LOOP
    base_email_part := split_part(r.email, '@', 1);
    
    -- Gera Slugs únicos
    user_slug := lower(regexp_replace(base_email_part, '[^a-zA-Z0-9]', '', 'g')) || '-' || substr(md5(random()::text), 1, 6);
    
    RAISE NOTICE 'Corrigindo usuário: % (Slug: %)', r.email, user_slug;

    -- Cria Org (O Trigger 'auto_add_owner_to_org' vai rodar, mas ignorará pois auth.uid é null aqui)
    INSERT INTO public.organizations (name, slug)
    VALUES ('Organização de ' || base_email_part, user_slug)
    RETURNING id INTO new_org_id;

    -- Cria Membro Manualmente com segurança
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (new_org_id, r.id, 'owner')
    ON CONFLICT (organization_id, user_id) DO NOTHING;
    
  END LOOP;
END;
$$;
