import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const path = url.pathname.split('/').pop()
  const provider = url.searchParams.get('provider') || 'meta' // default meta para compatibilidade

  // Configurações por Provider
  const configs: Record<string, any> = {
    meta: {
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      clientId: Deno.env.get('META_CLIENT_ID'),
      clientSecret: Deno.env.get('META_CLIENT_SECRET'),
      scope: 'ads_read,ads_management,business_management,public_profile',
    },
    google: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      clientId: Deno.env.get('GOOGLE_CLIENT_ID'),
      clientSecret: Deno.env.get('GOOGLE_CLIENT_SECRET'),
      scope: 'https://www.googleapis.com/auth/adwords',
    },
    tiktok: {
      authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
      tokenUrl: 'https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/',
      clientId: Deno.env.get('TIKTOK_CLIENT_ID'),
      clientSecret: Deno.env.get('TIKTOK_CLIENT_SECRET'),
      scope: 'ads.readonly',
    }
  }

  const config = configs[provider]
  if (!config) {
    return new Response(JSON.stringify({ error: 'Provedor inválido' }), { status: 400, headers: corsHeaders })
  }

  const redirectUri = `https://${url.hostname}/functions/v1/ads-oauth/callback?provider=${provider}`

  // 1. Rota de Conexão (Redirecionamento)
  if (path === 'connect') {
    try {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) throw new Error('Unauthorized')

      const authUrl = new URL(config.authUrl)
      authUrl.searchParams.set('client_id', config.clientId || '')
      authUrl.searchParams.set('redirect_uri', redirectUri)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', config.scope)

      // Meta pede 'state', Google pede 'state', TikTok pede 'state'
      // Guardamos o token do usuário e a origem no state para recuperar no callback
      const origin = url.searchParams.get('origin') || 'http://localhost:5173'
      authUrl.searchParams.set('state', `${authHeader.replace('Bearer ', '')}@@@${origin}`)

      // Adicionais específicos
      if (provider === 'google') {
        authUrl.searchParams.set('access_type', 'offline')
        authUrl.searchParams.set('prompt', 'consent')
      }

      return new Response(JSON.stringify({ url: authUrl.toString() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })
    }
  }

  // 2. Rota de Callback (Processamento do Token)
  if (path === 'callback') {
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const [userAccessToken, appOrigin] = state?.split('@@@') || []

    if (!code || !userAccessToken) {
      return new Response('Parâmetros ausentes no callback', { status: 400 })
    }

    try {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Validar usuário
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(userAccessToken)
      if (userError || !user) throw new Error('Sessão expirada ou usuário inválido')

      // Pegar Organization ID do usuário
      const { data: membership } = await supabaseAdmin
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single()

      if (!membership) throw new Error('Organização não encontrada para o usuário')

      // Trocar code por access_token
      let body;
      if (provider === 'meta' || provider === 'google') {
        body = new URLSearchParams({
          code,
          client_id: config.clientId || '',
          client_secret: config.clientSecret || '',
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        })
      } else {
        // TikTok Body
        body = JSON.stringify({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          auth_code: code,
        })
      }

      const tokenRes = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: provider === 'tiktok' ? { 'Content-Type': 'application/json' } : { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
      })

      const tokenData = await tokenRes.json()
      if (tokenData.error || tokenData.message === 'error') {
        throw new Error(tokenData.error_description || tokenData.message || 'Erro ao trocar token')
      }

      // Salvar integração no banco
      const { error: upsertError } = await supabaseAdmin
        .from('marketing_integrations')
        .upsert({
          organization_id: membership.organization_id,
          provider: provider,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || null,
          token_expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
          status: 'active',
          updated_at: new Date().toISOString()
        }, { onConflict: 'organization_id, provider' })

      if (upsertError) throw upsertError

      // Redirecionar de volta para a página de configurações
      const finalOrigin = appOrigin || 'http://localhost:5173'
      return Response.redirect(`${finalOrigin}/#/settings?connected=${provider}`, 302)

    } catch (error) {
      console.error(`[OAuth Callback Error - ${provider}]:`, error.message)
      return new Response(`Erro ao conectar ${provider}: ${error.message}`, { status: 500 })
    }
  }

  return new Response('Endpoint não encontrado', { status: 404, headers: corsHeaders })
})
