---
description: Realizar uma análise técnica completa do sistema SaaS (Auditoria, Debug, Segurança, Performance)
---

# 🎯 Objetivo

Realizar uma **análise técnica completa** do sistema SaaS, incluindo:

- Estrutura do projeto
- Arquitetura
- Qualidade de código
- Código morto
- Segurança
- Performance
- Banco de dados
- Multi-tenancy
- Escalabilidade
- Clean Code
- Padrões arquiteturais
- Preparação para produção

---

# 📌 Quando usar esta Skill

Use esta skill quando:

- O projeto está crescendo e precisa de auditoria técnica
- Antes de subir para produção
- Antes de buscar investimento
- Quando o sistema está lento ou instável
- Quando há suspeita de código morto
- Para melhorar organização e manutenibilidade
- Para validar segurança do SaaS
- Para preparar arquitetura escalável

---

# 🧠 Processo de Auditoria

A análise deve seguir obrigatoriamente esta ordem:

---

# 1️⃣ Análise da Estrutura do Projeto

Avaliar:

- Organização de pastas
- Separação de responsabilidades
- Modularização
- Camadas bem definidas?
- Frontend e backend desacoplados?
- Existe padrão arquitetural claro?

Verificar:

- Estrutura monolítica desorganizada?
- Mistura de lógica de negócio com UI?
- Arquivos grandes demais (> 300 linhas)?
- Repetição de código?

Classificar:

- ✅ Estrutura sólida
- ⚠️ Estrutura aceitável
- ❌ Estrutura problemática

---

# 2️⃣ Arquitetura do Sistema

Identificar:

- SPA?
- API REST?
- Serverless?
- Monolito?
- Multi-tenant?

Avaliar:

- Existe separação clara entre:
  - UI
  - Lógica de negócio
  - Acesso a dados
- Uso correto de context/state?
- Acoplamento excessivo?
- Dependência circular?

Detectar:

- Anti-patterns
- God files
- Props drilling excessivo
- State global mal estruturado

---

# 3️⃣ Qualidade do Código

Analisar:

- Nomeação de variáveis
- Clareza de funções
- Funções longas demais
- Código repetido
- Comentários desnecessários
- Falta de tipagem (TypeScript mal usado)
- Uso incorreto de any
- Código procedural em excesso

Classificar:

- Clean
- Médio
- Técnico crítico

---

# 4️⃣ Detecção de Código Morto

Procurar:

- Funções não utilizadas
- Componentes não importados
- Imports não usados
- Variáveis declaradas e não usadas
- Endpoints obsoletos
- Contexts não utilizados
- Scripts antigos

Avaliar:

- Dependências não utilizadas no package.json
- Bibliotecas pesadas desnecessárias

---

# 5️⃣ Segurança do SaaS

Verificar:

### 🔐 Autenticação
- JWT bem implementado?
- Tokens expiram?
- Refresh token seguro?
- Validação server-side?

### 🔐 Autorização
- Controle por role?
- Verificação no backend?
- Apenas frontend protegendo rotas?

### 🔐 Banco de dados
- RLS ativado (se Supabase)?
- Queries protegidas?
- SQL Injection possível?
- Filtros por tenant obrigatórios?

### 🔐 Variáveis sensíveis
- Uso correto de .env?
- Chaves expostas no frontend?
- API keys no código?

Classificar risco:

- 🟢 Seguro
- 🟡 Atenção
- 🔴 Crítico

---

# 6️⃣ Banco de Dados

Avaliar:

- Modelagem correta?
- Índices adequados?
- Foreign keys?
- Cascade correto?
- Normalização adequada?
- Tabelas gigantes sem paginação?

Verificar:

- Multi-tenancy isolado corretamente?
- Tenant_id obrigatório?
- Vazamento entre organizações possível?

---

# 7️⃣ Performance

Frontend:

- Re-renders desnecessários?
- Falta de memoization?
- Uso incorreto de useEffect?
- Bundle muito grande?
- Lazy loading implementado?

Backend:

- Queries pesadas?
- Falta de paginação?
- N+1 queries?
- Filtros ineficientes?

Infra:

- Cache implementado?
- Rate limit?
- Compressão?

---

# 8️⃣ Escalabilidade

Avaliar:

- Sistema suporta crescimento?
- Arquitetura preparada para:
  - 1k usuários?
  - 10k?
  - 100k?
- Existe separação por camadas?
- Possível migrar para microserviços?

---

# 9️⃣ SaaS-Specific Checks

Verificar:

- Multi-tenancy isolado corretamente
- Controle de plano (Free, Pro, etc.)
- Billing desacoplado?
- Logs estruturados?
- Auditoria de ações?
- Observabilidade?

---

# 🔎 Relatório Final Obrigatório

A resposta final deve seguir este formato:

## 📊 Diagnóstico Geral
Resumo executivo do estado do sistema.

## 🚨 Problemas Críticos
Lista priorizada.

## ⚠️ Problemas Médios

## 🧹 Melhorias Estruturais

## 🔐 Riscos de Segurança

## ⚡ Melhorias de Performance

## 🧠 Dívida Técnica

## 📈 Nível de Maturidade do SaaS
Classificar de 1 a 5:

1 - Protótipo frágil  
2 - MVP inicial  
3 - SaaS funcional  
4 - SaaS estruturado  
5 - SaaS enterprise-ready  

---

# 🧭 Tom da Análise

A análise deve ser:

- Técnica
- Direta
- Sem suavização desnecessária
- Baseada em boas práticas modernas
- Pensando como CTO

---

# 📌 Regras Importantes

- Nunca assumir contexto — sempre analisar o código real.
- Não elogiar sem justificativa técnica.
- Sempre sugerir melhoria prática.
- Priorizar segurança e escalabilidade.
- Pensar como investidor avaliando o projeto.

---

# 🔥 Modo Hardcore

Se o sistema apresentar falhas graves:

- Ser direto
- Indicar risco real
- Explicar impacto futuro
- Sugerir plano de correção estruturado

---

# 🏁 Resultado Esperado

Após rodar esta skill, o desenvolvedor deve saber:

- Onde está vulnerável
- Onde está desorganizado
- Onde pode escalar
- Onde está desperdiçando performance
- E o que precisa fazer para virar um SaaS sólido
