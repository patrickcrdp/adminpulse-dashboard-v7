import "jsr:@supabase/functions-js/edge-runtime.d.ts"
// @ts-ignore
import { Resend } from 'npm:resend';

declare const Deno: any;

// Configuração de CORS para permitir chamadas do front-end
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

Deno.serve(async (req: any) => {
  // 1. Responde às verificações de segurança do navegador (CORS Preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    // 2. Extrai os dados enviados pelo Front-end (ex: assunto, destinatario)
    // Se o front-end não enviar nada, usamos os dados estáticos como fallback
    let body: any = {};
    try {
      body = await req.json();
    } catch(e) {
      // Ignora se não for JSON válido
    }

    // 3. Inicializa o Resend. 
    // É ALTAMENTE RECOMENDADO colocar sua chave re_xxxx nas Secrets do Supabase
    // em vez de deixar fixo aqui.
    // Ex: const resendKey = Deno.env.get('RESEND_API_KEY') || 're_xxxxxxxxx';
    const resendKey = Deno.env.get('RESEND_API_KEY') || 're_Vh2Jn7Z6_DQPWiw2mx7jBzWjVcFnyDKbm'; 

    const resend = new Resend(resendKey);

    // 4. Parâmetros do E-mail
    const emailTo = body.to || 'patrickcrdp2024@gmail.com';
    const emailSubject = body.subject || 'Hello World do AdminPulse!';
    const emailHtml = body.html || '<p>Congrats on sending your <strong>first email</strong> via Edge Function!</p>';
    
    // O remetente "onboarding@resend.dev" só funciona para enviar e-mails PARA O SEU PRÓPRIO E-MAIL de cadastro no Resend.
    // Quando você adicionar seu domínio (ex: adminpulse.com) no Resend, mude para:
    // 'contato@adminpulse.com'
    const emailFrom = 'onboarding@resend.dev';

    console.log(`[Resend] Preparando envio de e-mail para: ${emailTo}...`);

    // 5. Envia o E-mail usando o SDK
    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: emailTo,
      subject: emailSubject,
      html: emailHtml
    });

    if (error) {
      console.error("[Resend] Erro da API retornou:", error);
      throw new Error(error.message || "Erro desconhecido ao enviar email pelo Resend");
    }

    console.log(`[Resend] E-mail enviado com sucesso! ID: ${data?.id}`);

    // 6. Retorna o Sucesso confirmando a ação
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "E-mail enviado com sucesso!",
        id: data?.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (err: any) {
    console.error("[Resend] Erro Crítico:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Erro interno na Edge Function" }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
