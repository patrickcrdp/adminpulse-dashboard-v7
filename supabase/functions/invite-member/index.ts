import "jsr:@supabase/functions-js/edge-runtime.d.ts"
// @ts-ignore
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'
// @ts-ignore
import { Resend } from 'npm:resend'

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

Deno.serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Manual JWT Verification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
        throw new Error("Missing Authorization header. You must be logged in to invite members.");
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: userAuthConfig, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !userAuthConfig?.user) {
        throw new Error("Unauthorized: Token inválido ou expirado.");
    }

    const payload = await req.json()
    const { email, organization_id, role } = payload;
    
    if (!email || !organization_id) {
        throw new Error("Email e organization_id são obrigatórios.");
    }

    // Verify if the invoking user is actually part of this organization 
    // (A simple check to ensure no cross-tenant invites)
    const { data: membershipData, error: membershipError } = await supabaseAdmin
        .from('organization_members')
        .select('role')
        .eq('organization_id', organization_id)
        .eq('user_id', userAuthConfig.user.id)
        .single();
        
    if (membershipError || !membershipData) {
         throw new Error("Permissão Negada: Você não faz parte desta organização.");
    }

    if (membershipData.role !== 'admin') {
         throw new Error("Permissão Negada: Apenas administradores podem convidar membros.");
    }

    // VERIFICAR LIMITE DE 7 MEMBROS POR ORGANIZAÇÃO
    // Somente convida se houver menos de 7
    const { count: currentMemberCount, error: countError } = await supabaseAdmin
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization_id);
        
    if (countError) {
        throw new Error("Erro ao verificar o limite de membros da organização.");
    }
    
    // @ts-ignore (count could be null, but we checked for error)
    if (currentMemberCount >= 7) {
        throw new Error("LimiteAtingido"); // A string mágica que será traduzida no catch
    }

    // --------------------------------------------------------
    // C. GERAÇÃO DE LINK E ENVIO VIA RESEND (Garantia de Entrega)
    // --------------------------------------------------------
    
    // 1. Gera o link de convite sem disparar o e-mail problemático do Supabase
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email: email,
      options: {
         data: { role: role || 'member' }
      }
    })

    if (linkError) throw linkError

    if (!linkData?.user?.id || !linkData?.properties?.action_link) {
        throw new Error("Falha ao gerar o link de convite ou criar o usuário no Auth.");
    }

    const invitedUserId = linkData.user.id;
    const actionLink = linkData.properties.action_link;

    // 2. Dispara o E-mail usando o Resend para contornar totalmente os limites
    // 2. [INATIVADO TEMPORARIAMENTE] Dispara o E-mail usando o Resend 
    /*
    const resendKey = Deno.env.get('RESEND_API_KEY') || 're_Vh2Jn7Z6_DQPWiw2mx7jBzWjVcFnyDKbm';
    const resend = new Resend(resendKey);

    console.log(`[Convite] Gerado Link para: ${email}. Enviando via Resend...`);

    const { error: resendError } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Troque quando verificar seu dominio!
      to: email,
      subject: `Convite de Acesso - AdminPulse`,
      html: `...`
    });

    if (resendError) {
        console.error("[Convite] Falha crítica do Resend:", resendError);
        throw new Error("Erro no provedor de envios Resend: " + resendError.message);
    }
    */
    console.log("[Aviso QA] API do Resend foi desativada temporariamente. Link de convite gerado silenciosamente.");

    const { error: memberError } = await supabaseAdmin
      .from('organization_members')
      .insert({
        organization_id: organization_id,
        user_id: invitedUserId,
        role: role || 'member'
      })

    if (memberError) {
        // Se falhou ao inserir na tabela (ex: limite de membros atingido), precisamos avisar o frontend!
        throw memberError
    }

    return new Response(
      JSON.stringify({ message: "Convite enviado com sucesso!", userId: invitedUserId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (err: any) {
    let rawErrorMessage = "Erro desconhecido";
    if (err instanceof Error) {
        rawErrorMessage = err.message;
    } else if (err && typeof err === 'object') {
        rawErrorMessage = err.message || JSON.stringify(err);
    } else {
        rawErrorMessage = String(err);
    }
    
    // TRADUÇÃO DE ERROS PARA PT-BR
    let friendlyMessage = rawErrorMessage;
    
    if (rawErrorMessage.includes('duplicate key value violates unique constraint "organization_members_organization_id_user_id_key"')) {
        friendlyMessage = "Este usuário já é membro desta organização.";
    } else if (rawErrorMessage.includes('User already registered') || rawErrorMessage.includes('Email already in use')) {
        friendlyMessage = "Este e-mail já está cadastrado no sistema.";
    } else if (rawErrorMessage.includes('rate_limit') || rawErrorMessage.includes('over_email_send_rate_limit')) {
        friendlyMessage = "Limite de e-mails atingido. Por favor, aguarde alguns minutos e tente novamente.";
    } else if (rawErrorMessage.includes('Database error saving new user')) {
        friendlyMessage = "Erro no banco de dados ao salvar o usuário.";
    } else if (rawErrorMessage.includes('Organization has reached the member limit') || rawErrorMessage.includes('LimiteAtingido')) { // Exemplo de trigger ou verificação manual
        friendlyMessage = "Sua organização atingiu o limite máximo de 7 membros permitidos.";
    } else if (rawErrorMessage.includes('invalid email')) {
        friendlyMessage = "O formato do e-mail é inválido.";
    }
    
    const errorStack = err instanceof Error ? err.stack : undefined;
    
    console.error("Erro Fatal na Edge Function:", rawErrorMessage, errorStack);
    
    return new Response(JSON.stringify({ 
      error: friendlyMessage, // Envia a versão traduzida para o Front
      details: rawErrorMessage, // Mantém o erro técnico apenas nos detalhes para debugar no frontend se preciso
      stack: errorStack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 200
    })
  }
})
