import { Step } from 'react-joyride';

export const GLOBAL_STEPS: Step[] = [
    {
        target: 'body',
        content: 'Bem-vindo ao AdminPulse! Este é o seu guia interativo. Vamos explorar o sistema.',
        placement: 'center',
    },
    {
        target: '#nav-item-dashboard',
        content: 'Aqui no Dashboard você tem uma visão geral dos seus resultados e métricas em tempo real.',
    },
    {
        target: '#nav-item-pipeline',
        content: 'No Pipeline, você gerencia seus negócios e acompanha o progresso de cada oportunidade.',
    },
    {
        target: '#nav-item-leads',
        content: 'Gerencie sua base de contatos, adicione novos leads e acompanhe o histórico de interações aqui.',
    },
    {
        target: '#nav-item-planos',
        content: 'Visualize e gerencie as opções de planos disponíveis para seus clientes.',
    },
];

export const DASHBOARD_STEPS: Step[] = [
    ...GLOBAL_STEPS,
    {
        target: '#ai-insights',
        content: 'O "Coach IA" analisa seus dados e fornece dicas estratégicas para melhorar suas vendas.',
    },
    {
        target: '#kpi-section',
        content: 'Acompanhe indicadores vitais: Total de Leads, Conversão, Qualidade e Tempo de Resposta.',
    },
    {
        target: '#chart-volume',
        content: 'Gráfico de aquisição: veja como o volume de leads evolui dia a dia.',
    },
    {
        target: '#recent-activity',
        content: 'Feed de atividades: saiba o que está acontecendo agora com seus leads.',
    },
];

export const PIPELINE_STEPS: Step[] = [
    ...GLOBAL_STEPS,
    {
        target: 'body',
        content: 'Este é o seu quadro Kanban. Arraste e solte leads para mover entre as etapas do funil.',
        placement: 'center',
    },
];

export const LEADS_STEPS: Step[] = [
    ...GLOBAL_STEPS,
    {
        target: 'body',
        content: 'Lista completa de leads. Use os filtros para encontrar contatos específicos ou exportar dados.',
        placement: 'center',
    },
];

export const PLANS_STEPS: Step[] = [
    ...GLOBAL_STEPS,
    {
        target: 'body',
        content: 'Configure os planos de assinatura e preços do seu SaaS aqui.',
        placement: 'center',
    },
];
