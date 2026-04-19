# Guia de Configuração: Autenticação (OAuth) e Email (SMTP)

Este guia detalha como configurar o login social (Google, LinkedIn) e o envio de emails transacionais (SMTP) no seu projeto AdminPulse usando Supabase.

---

## Parte 1: Autenticação Social (Google e LinkedIn)

O objetivo é permitir que o usuário faça login com Google, LinkedIn ou Email/Senha e seja **reconhecido como a mesma pessoa**, desde que o email seja o mesmo.

### A. Google OAuth
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um **Novo Projeto** (ex: `AdminPulse Auth`).
3. No menu lateral, vá em **APIs e Serviços** > **Tela de permissão OAuth**.
   - Selecione **Externo** e clique em Criar.
   - Preencha:
     - **Nome do App**: AdminPulse
     - **Email de suporte**: Seu email
     - **Domínios autorizados**: Adicione o domínio do seu site (se houver) e `supabase.co`.
   - Clique em Salvar e Continuar.
4. Vá em **Credenciais** > **Criar Credenciais** > **ID do cliente OAuth**.
   - **Tipo de aplicativo**: Aplicação da Web.
   - **Origens JavaScript autorizadas**:
     - `http://localhost:3000` (para testes locais)
     - `https://<seu-projeto>.supabase.co`
   - **URIs de redirecionamento autorizados**:
     - `https://<seu-projeto>.supabase.co/auth/v1/callback`
   - Clique em **Criar**.
5. **Copie** o `ID do Cliente` e a `Chave Secreta do Cliente`.
6. No **Supabase Dashboard** > **Authentication** > **Providers**, ative Google e cole as chaves.

### B. LinkedIn OAuth
1. Acesse o [LinkedIn Developers](https://www.linkedin.com/developers/).
2. Clique em **Create App**.
   - **App Name**: AdminPulse
   - **LinkedIn Page**: Associe à sua página (obrigatório).
   - **Logo**: Envie um logo.
3. Na aba **Auth**, em **OAuth 2.0 settings**:
   - Adicione a URL de redirecionamento: `https://<seu-projeto>.supabase.co/auth/v1/callback`
4. Na aba **Products**, solicite acesso ao produto **"Sign In with LinkedIn using OpenID Connect"**. Isso é crucial para receber o email do usuário.
5. Copie o `Client ID` e `Client Secret` na aba **Auth**.
6. No **Supabase Dashboard** > **Authentication** > **Providers**, ative LinkedIn (OIDC) e cole as chaves.

### C. Unificação de Contas (Mesmo Usuário)
Para que o Supabase entenda que `joao@email.com` no Google é o mesmo `joao@email.com` no LinkedIn e o mesmo do login por senha:

1. No Supabase Dashboard, vá em **Authentication** > **Providers**.
2. Expanda a configuração de Email (e de cada provedor).
3. **MUITO IMPORTANTE:** Certifique-se de que a opção **"Confirm email"** esteja ativada OU que você entenda que contas não verificadas podem não ser fundidas automaticamente por segurança.
4. O Supabase funde contas automaticamente se o **email for verificado** em ambos os lados.
   - Exemplo: Se logo com Google (email já verificado pelo Google), o Supabase cria a conta. Se depois logo com LinkedIn (email verificado pelo LinkedIn), o Supabase detecta o mesmo email e conecta as contas.

---

## Parte 2: Configuração de Email (SMTP)

Necessário para enviar emails de confirmação, recuperação de senha e convites com confiabilidade e marca personalizada. Recomenda-se usar **Resend** ou **SendGrid**.

### 1. Criar conta no Provedor (Ex: Resend)
1. Crie uma conta em [Resend.com](https://resend.com/).
2. Adicione seu domínio (ex: `adminpulse.com`) e configure os registros DNS (DKIM/SPF) no seu provedor de domínio.
3. Após verificar o domínio, vá em **API Keys** e crie uma nova chave.

### 2. Painel Supabase
1. Vá em **Project Settings** (ícone de engrenagem) > **Auth**.
2. Role até a seção **SMTP Settings**.
3. Ative **Enable Custom SMTP**.
4. Preencha com os dados do Resend (ou outro):
   - **Sender Email**: `noreply@seudominio.com` (deve ser verificado no Resend)
   - **Sender Name**: AdminPulse
   - **Host**: `smtp.resend.com`
   - **Port**: `465` (SSL) ou `587` (TLS)
   - **User**: `resend`
   - **Password**: Sua API Key do Resend (`re_123...`)
5. Clique em **Save**.

### 3. Personalizar Templates
Ainda em **Authentication** > **Email Templates**, você pode alterar o texto e HTML dos emails.

---

## Parte 3: Variáveis de Ambiente (.env)

Certifique-se de que seu arquivo `.env` (ou variáveis na Vercel/Netlify) tenha as chaves corretas do Supabase.

```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-chave-anonima>
```
