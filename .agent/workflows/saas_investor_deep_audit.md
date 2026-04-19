---
name: saas-investor-deep-audit
description: Executa auditoria técnica agressiva de SaaS com foco em due diligence para investidores. Identifica riscos estruturais, falhas arquiteturais, vulnerabilidades críticas, dívida técnica, problemas de escalabilidade e maturidade do produto. Use antes de investimento, captação ou crescimento agressivo.
---

# SaaS Investor Deep Audit

Esta skill executa uma auditoria técnica com mentalidade de:

- Investidor
- Venture Capital
- CTO avaliando aquisição
- Due Diligence pré-aporte

Não é uma revisão comum.

É uma avaliação de risco real de negócio.

---

# 🎯 Objetivo

Responder:

- Esse SaaS é investível?
- Ele escala?
- Ele quebra com 1.000 usuários?
- Ele sobrevive a 10.000?
- Existe risco jurídico por falha de segurança?
- Existe risco de colapso técnico?
- O time sabe o que está fazendo?

---

# 🔥 Modo de Operação

A análise deve ser:

- Brutalmente honesta
- Técnica
- Baseada em impacto real
- Orientada a risco financeiro
- Sem suavização

Se algo estiver errado, dizer claramente:

> Isso inviabiliza investimento.

---

# 📊 Estrutura da Auditoria

Executar na seguinte ordem obrigatória:

---

# 1️⃣ Arquitetura: Fundamento ou Gambiarra?

Identificar:

- Monolito desorganizado?
- Arquitetura improvisada?
- Ausência de camadas?
- Backend frágil?
- Frontend acoplado demais?

Avaliar:

- Separação real de responsabilidades
- Domínio isolado?
- Serviços desacoplados?
- Lógica de negócio misturada com UI?
- Infra preparada para crescimento?

Classificar:

- 🟢 Arquitetura sólida
- 🟡 MVP estruturável
- 🔴 Arquitetura frágil
- ⚫ Arquitetura colapsável

---

# 2️⃣ Risco de Escalabilidade

Simular mentalmente:

- 100 usuários simultâneos
- 1.000 usuários
- 10.000 usuários

Analisar:

- Queries sem índice?
- Falta de paginação?
- N+1 queries?
- Sem cache?
- Estado global pesado?
- Bundle gigante?
- Falta de lazy loading?

Determinar:

> Em qual volume o sistema quebra?

---

# 3️⃣ Segurança: Existe risco jurídico?

Verificar profundamente:

### 🔐 Autenticação
- Token expira?
- Refresh token seguro?
- Validação no backend ou só no frontend?
- Possível forjar requisição?

### 🔐 Autorização
- Role-based real?
- Filtro por tenant obrigatório?
- Vazamento de dados entre organizações?

### 🔐 Banco
- RLS ativo (se Supabase)?
- Queries filtram por tenant?
- SQL Injection possível?
- Falta de validação server-side?

### 🔐 Dados sensíveis
- Variáveis expostas?
- API keys no frontend?
- Secrets versionados?

Classificar risco:

- 🟢 Seguro
- 🟡 Exposto
- 🔴 Vulnerável
- ⚫ Risco jurídico imediato

---

# 4️⃣ Multi-Tenancy: Isolamento Real ou Ilusão?

Verificar:

- tenant_id obrigatório em TODAS as tabelas?
- Filtro por tenant em TODAS as queries?
- Possível acessar dados de outra organização?
- RLS bem configurado?
- Middleware valida organização?

Se houver falha aqui:

> Isso inviabiliza investimento imediatamente.

---

# 5️⃣ Qualidade de Código e Maturidade do Time

Analisar:

- Uso correto de TypeScript?
- Uso excessivo de any?
- Arquivos gigantes?
- Código duplicado?
- Falta de padrão?
- Dependências desnecessárias?
- Código morto?
- Testes existem?

Identificar:

- Parece projeto de iniciante?
- Parece MVP corrido?
- Parece produto estruturado?

---

# 6️⃣ Dívida Técnica Oculta

Detectar:

- Falta de logs estruturados
- Falta de monitoramento
- Falta de tratamento global de erros
- Falta de observabilidade
- Falta de auditoria de ações

Responder:

> Quanto custará corrigir isso no futuro?

---

# 7️⃣ Dependência de Infra

Analisar:

- Vendor lock-in?
- Uso incorreto de Supabase?
- Uso inadequado de serverless?
- Custos escalam linearmente ou exponencialmente?
- Existe risco de custo explosivo?

---

# 8️⃣ Preparação para Due Diligence

Responder:

- Existe documentação?
- Existe padronização?
- Existe versionamento adequado?
- Existe organização?
- O código parece auditável?

Se não:

> Alto risco operacional.

---

# 📌 Relatório Final Obrigatório

A resposta deve conter:

---

## 📊 Diagnóstico Executivo

Resumo direto e sem filtro.

---

## 🚨 Riscos Críticos (Bloqueiam Investimento)

Lista priorizada.

---

## ⚠️ Riscos Estruturais

---

## 🔐 Riscos de Segurança

---

## ⚡ Gargalos de Escalabilidade

---

## 🧱 Dívida Técnica Estimada

Classificar:

- Baixa
- Média
- Alta
- Explosiva

---

## 💰 Investível?

Responder claramente:

- ✅ Sim
- ⚠️ Com reestruturação
- ❌ Não investível no estado atual

Justificar.

---

## 📈 Nível de Maturidade Técnica (1 a 5)

1 – Projeto frágil  
2 – MVP instável  
3 – Produto funcional  
4 – Estruturado para crescer  
5 – Enterprise-grade  

---

# 🧠 Mentalidade Obrigatória

A análise deve pensar:

- Se eu investir 1 milhão nisso, eu durmo tranquilo?
- Esse sistema aguenta escala?
- Esse sistema é defensável?
- Existe risco de vazamento de dados?
- Existe risco de colapso técnico?

---

# 🔥 Modo Sem Piedade

Se encontrar falha grave:

Não suavizar.

Dizer claramente:

- Isso quebra com escala.
- Isso é risco jurídico.
- Isso é amadorismo estrutural.
- Isso precisa ser refeito.

---

# 🎯 Resultado Esperado

Após executar esta skill, o fundador deve saber exatamente onde seu "bebê" é feio e o que precisa fazer para ele sobreviver no mundo real.
