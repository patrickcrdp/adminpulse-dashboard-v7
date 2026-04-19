# Relatório Completo — AdminPulse Dashboard v19
**Data:** 08 de Abril de 2026  
**Domínio:** `novadigitaltech.com.br`  
**Repositório:** `patrickcrdp/adminpulse-dashboard-v7`

---

## 🔴 Diagnóstico: Problemas Encontrados Hoje

### 1. Botão "Confirmar Agendamento" ficava em PROCESSANDO eternamente
**Causa raiz:** A tabela `appointments` tinha RLS (Row Level Security) ativado **sem nenhuma policy de INSERT**. O Supabase bloqueia silenciosamente a operação — sem erro visível, sem timeout, apenas... nada acontece.

### 2. Botão "Conectar Agenda" não funcionava
**Causa raiz:** A tabela `calendar_integrations` também não tinha policies de SELECT para membros da organização. O componente não conseguia verificar se já existia uma conexão ativa, e o botão não reagia.

### 3. Erro "foreign key constraint appointments_user_id_fkey"
**Causa raiz:** O usuário autenticado não tinha um registro na tabela `profiles`. A tabela `appointments` referencia `profiles(id)` via `user_id`, então o INSERT falhava por falta de perfil.

### 4. Eventos apareciam no banco mas não no calendário
**Causa raiz:** O filtro `filterEventsByDay` usava `.toISOString()` que converte para UTC. Em UTC-3 (Brasil), eventos agendados para a tarde/noite "mudavam de dia" visualmente.

### 5. Campo "Término" alterava o campo "Início"
**Causa raiz:** Bug no `onChange` do input de data — ambos os campos apontavam para `setStartAt`.

---

## 🟢 Correções Aplicadas (no GitHub)

| Arquivo | O que foi feito |
|---|---|
| `src/modules/calendar/components/EventModal.tsx` | Corrigido onChange do campo Término. Adicionado alertas de sucesso/erro. |
| `src/modules/calendar/components/CalendarView.tsx` | Refatorado filtro de data para usar comparação local (Ano/Mês/Dia). |
| `src/modules/calendar/services/calendar.service.ts` | Payload explícito no createEvent. Tratamento de erro com mensagem clara. |
| `src/services/authFacade.ts` | Adicionados escopos de Google Calendar no login OAuth. |
| `src/components/AuthEventHandler.tsx` | Removida trava de sessão para auto-sync. |
| `src/components/GoogleCalendarConnect.tsx` | Busca por organização em vez de user_id. Label mudou para "Agenda da Empresa". |
| `supabase/functions/sync-appointment/index.ts` | Busca integração por organization_id (Enterprise). |
| `supabase/functions/google-calendar-webhook/index.ts` | **NOVO** — Endpoint para receber notificações push do Google. |
| `supabase/fix_appointments_and_calendar_rls.sql` | **NOVO** — Script SQL definitivo com todas as RLS policies. |

---

## ⚠️ Ação Necessária do Usuário (SQL no Supabase)

O código frontend e as Edge Functions já estão atualizados e em produção.  
**Porém, o script SQL abaixo precisa ser executado no SQL Editor do Supabase:**

> Arquivo: `supabase/fix_appointments_and_calendar_rls.sql`

Este script:
- ✅ Cria policies de SELECT/INSERT/UPDATE/DELETE para `appointments`
- ✅ Cria policies de SELECT e gestão para `calendar_integrations`
- ✅ Garante que a tabela `profiles` existe e que todos os usuários têm perfil
- ✅ Adiciona colunas extras para sincronização avançada
- ✅ Exibe verificação final mostrando quantas policies estão ativas

**Sem este script, o botão de agendamento e o botão de conectar agenda NÃO vão funcionar.**

---

## 📊 Estado Atual do Projeto

| Módulo | Status | Observação |
|---|---|---|
| **Login/Auth** | ✅ Funcional | Google OAuth com escopos de Calendar inclusos |
| **Dashboard** | ✅ Funcional | KPIs e métricas operacionais |
| **Leads/CRM** | ✅ Funcional | Leads vão automaticamente para "Novos Leads" no pipeline |
| **Pipeline** | ✅ Funcional | Trigger automática no banco |
| **Calendário (Frontend)** | ✅ Funcional | Filtro de datas corrigido, modal funcional |
| **Calendário (INSERT)** | 🔴 Aguardando SQL | Precisa rodar o script RLS no Supabase |
| **Google Calendar Sync** | 🔴 Aguardando SQL | Precisa rodar o script RLS + clicar em Conectar Agenda |
| **Notificações** | ✅ Funcional | Triggers de lembrete configuradas |
| **Inbox/Atendimento** | ✅ Funcional | WhatsApp integration preparada |

---

## 🎯 Próximos Passos Recomendados

1. **IMEDIATO:** Rodar o script SQL `fix_appointments_and_calendar_rls.sql` no Supabase
2. **IMEDIATO:** Após rodar, testar criar um agendamento e conectar a agenda
3. **CURTO PRAZO:** Implementar lembretes automáticos via WhatsApp para leads agendados
4. **MÉDIO PRAZO:** Ativar sincronização bidirecional (Google → AdminPulse) via Webhooks
5. **LONGO PRAZO:** Migrar RLS para JWT Custom Claims para melhor performance em escala

---

*Relatório gerado automaticamente em 08/04/2026 às 19:55 BRT*
