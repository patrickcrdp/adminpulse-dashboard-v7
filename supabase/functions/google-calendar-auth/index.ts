import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper para Criptografia AES-GCM
async function encrypt(text: string, keyString: string) {
  const keyData = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(keyString));
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(text)
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const path = url.pathname.split('/').pop()

  const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
  const encryptionKey = Deno.env.get('TOKEN_ENCRYPTION_KEY')
  const redirectUri = `https://${url.hostname}/functions/v1/google-calendar-auth/callback`

  if (path === 'connect') {
    try {
      const authUserHeader = req.headers.get('Authorization')
      if (!authUserHeader) throw new Error('Unauthorized')

      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      googleAuthUrl.searchParams.set('client_id', clientId!)
      googleAuthUrl.searchParams.set('redirect_uri', redirectUri)
      googleAuthUrl.searchParams.set('response_type', 'code')
      googleAuthUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly openid email profile')
      googleAuthUrl.searchParams.set('access_type', 'offline')
      googleAuthUrl.searchParams.set('prompt', 'consent')
      
      const appOrigin = url.searchParams.get('origin') || 'http://localhost:5173'
      googleAuthUrl.searchParams.set('state', `${authUserHeader.replace('Bearer ', '')}@@@${appOrigin}`)

      return new Response(JSON.stringify({ url: googleAuthUrl.toString() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })
    }
  }

  if (path === 'callback') {
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const [accessToken, appOrigin] = state?.split('@@@') || []

    if (!code || !accessToken) return new Response('Faltando parâmetros', { status: 400 })

    try {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken)
      if (userError || !user) throw new Error('Usuário inválido')

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId!,
          client_secret: clientSecret!,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      })

      const tokens = await tokenResponse.json()
      if (tokens.error) throw new Error(tokens.error_description)

      const googleUserRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      })
      const googleUser = await googleUserRes.json()

      // Criptografa tokens antes de salvar
      const encryptedAccess = await encrypt(tokens.access_token, encryptionKey!)
      const encryptedRefresh = await encrypt(tokens.refresh_token, encryptionKey!)

      let organizationId = user.user_metadata.organization_id;
      
      if (!organizationId) {
        console.log(`[Auth] Buscando organization_id via DB para o usuário ${user.id}`);
        organizationId = await getOrgId(supabaseAdmin, user.id);
      }

      if (!organizationId) {
        // Fallback Crítico: Se ainda não tiver, tenta criar uma org rápida ou buscar a última
        const { data: lastOrg } = await supabaseAdmin
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        organizationId = lastOrg?.organization_id;
      }

      if (!organizationId) {
        throw new Error('Não foi possível identificar sua organização. Por favor, recarregue o dashboard e tente novamente.');
      }

      console.log(`[Auth] Vinculando integração à organização: ${organizationId}`);

      // Garante que o perfil do usuário exista (evita erro de chave estrangeira)
      await ensureProfileExists(supabaseAdmin, user);

      // Lógica de Retry para o UPSERT (evita erro de chave estrangeira se o banco estiver lento)
      let dbError = null;
      for (let i = 0; i < 3; i++) {
        console.log(`[Upsert] Tentativa ${i + 1} de salvar integração para o usuário ${user.id}`);
        
        const { error } = await supabaseAdmin
          .from('calendar_integrations')
          .upsert({
            user_id: user.id,
            organization_id: organizationId,
            provider: 'google',
            provider_account_id: googleUser.sub,
            access_token_enc: encryptedAccess,
            refresh_token_enc: encryptedRefresh,
            token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
            is_active: true
          });

        if (!error) {
          dbError = null;
          console.log('[Upsert] Integração salva com sucesso!');
          break;
        }

        dbError = error;
        console.warn(`[Upsert] Falha na tentativa ${i + 1}:`, error.message);
        
        // Se for erro de Foreign Key, espera 2 segundos antes de tentar de novo
        if (error.code === '23503') {
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          break; // Se for outro tipo de erro, não adianta tentar de novo
        }
      }

      if (dbError) throw dbError;

      // Redireciona para o dashboard do frontend
      const redirectBase = appOrigin || 'http://localhost:5173'
      return Response.redirect(`${redirectBase}/#/calendar?google_connected=true`, 302)

    } catch (error) {
      console.error(error)
      return new Response(`Erro na autenticação: ${error.message}`, { status: 500 })
    }
  }

  return new Response('Not Found', { status: 404 })
})

async function getOrgId(supabase: any, userId: string) {
  // Retry logic: Tenta buscar a organização 5 vezes, aguardando 1.5s entre cada tentativa
  // Isso dá tempo para a trigger do banco de dados criar a organização e o vínculo
  for (let i = 0; i < 5; i++) {
    console.log(`[getOrgId] Tentativa ${i + 1} de buscar organização para o usuário ${userId}`);
    
    const { data, error } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (data?.organization_id) {
      console.log(`[getOrgId] Organização encontrada: ${data.organization_id}`);
      return data.organization_id;
    }

    if (error) {
      console.error(`[getOrgId] Erro ao buscar organização:`, error);
    }

    // Espera 1500ms antes da próxima tentativa
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  return null;
}

async function ensureProfileExists(supabase: any, user: any) {
  // Verifica se o perfil existe
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (profile) return true;

  console.log(`[ensureProfileExists] Perfil não encontrado para ${user.id}. Tentando aguardar ou criar...`);

  // Tenta criar o perfil básico
  const { error: insertError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      onboarding_completed: false,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

  if (insertError) {
    console.warn(`[ensureProfileExists] Aviso ao criar perfil: ${insertError.message}`);
    // Se falhar, pode ser porque o banco tem triggers próprios. 
    // Vamos apenas esperar um pouco mais para a FK não falhar no próximo passo.
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  return true;
}
