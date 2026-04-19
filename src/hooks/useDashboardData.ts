import { useState, useEffect } from 'react';
import { DashboardFacade } from '../services/dashboardFacade';
import { DashboardStats, ChartData, Insight, Activity, Lead } from '../types';
import { useAuth } from '../context/AuthContext';

const generateMockVisitors = (leadsCount: number) => {
  const conversionRate = 0.03 + (Math.random() * 0.02);
  return Math.round(leadsCount / conversionRate);
};

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    qualifiedLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    costPerLead: 0,
    qualityScore: 0,
    contactRate: 0,
    stalledLeads: 0,
    avgSalesCycle: '0 dias'
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [pipelineData, setPipelineData] = useState<any[]>([]);
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<(Activity & { leads?: { name: string, phone: string } })[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<(Activity & { leads?: { name: string, phone: string } })[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const { organization } = useAuth(); // Importar do authContext

  useEffect(() => {
    if (organization?.id) {
       fetchDashboardData();
    }
  }, [timeRange, organization?.id]);

  useEffect(() => {
    if (insights.length > 0) {
      const interval = setInterval(() => {
        setCurrentInsightIndex((prev) => (prev + 1) % insights.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [insights]);

  const generateAIInsights = (stats: DashboardStats, sources: Map<string, number>, activities: Activity[]) => {
    const newInsights: Insight[] = [];

    if (stats.newLeads > 0) {
      newInsights.push({ type: 'warning', message: `Atenção: ${stats.newLeads} novos leads aguardando seu contato!`, metric: 'Prioridade' });
    } else {
      newInsights.push({ type: 'neutral', message: 'Caixa de entrada limpa. Que tal revisar leads antigos?', metric: 'Tranquilo' });
    }

    if (stats.conversionRate > 5) {
      newInsights.push({ type: 'positive', message: `Taxa de conversão excelente (${stats.conversionRate.toFixed(1)}%). O tráfego está qualificado!`, metric: 'Conversão' });
    } else if (stats.conversionRate < 1 && stats.totalLeads > 20) {
      newInsights.push({ type: 'warning', message: 'Taxa de conversão baixa. Verifique a qualidade dos leads.', metric: 'Otimizar' });
    }

    if (stats.avgResponseTime) {
      if (stats.avgResponseTime.includes('min') && parseInt(stats.avgResponseTime) < 30) {
        newInsights.push({ type: 'positive', message: 'Tempo de resposta ágil! Isso aumenta muito a conversão.', metric: 'Agilidade' });
      } else if (stats.avgResponseTime.includes('h')) {
        newInsights.push({ type: 'warning', message: 'Tempo de resposta alto. Tente contatar leads em até 1 hora.', metric: 'Atenção' });
      }
    }

    let topSource = '';
    let topCount = 0;
    sources.forEach((count, source) => {
      if (count > topCount) {
        topCount = count;
        topSource = source;
      }
    });
    if (topSource) {
      newInsights.push({ type: 'neutral', message: `Muitos leads vindo de "${topSource}". Invista mais aqui!`, metric: 'Origem' });
    }

    const calls = activities.filter(a => a.activity_type === 'call').length;
    if (calls > 5) {
      newInsights.push({ type: 'positive', message: 'Time focado em ligações. Ótimo para fechar negócios!', metric: 'Esforço' });
    }

    if (newInsights.length === 0) {
      newInsights.push({ type: 'neutral', message: 'Monitorando seus dados em tempo real...', metric: 'IA Ativa' });
    }

    if (stats.costPerLead > 0) {
      const estimatedROI = (stats.convertedLeads * 1250) / (stats.totalLeads * stats.costPerLead);
      if (estimatedROI > 3) {
        newInsights.push({ type: 'positive', message: `Seu ROI estimado está em ${estimatedROI.toFixed(1)}x. Estratégia de tráfego muito lucrativa!`, metric: 'ROI' });
      } else {
        newInsights.push({ type: 'neutral', message: 'Acompanhe seu ROAS de perto para garantir a margem de lucro.', metric: 'Financeiro' });
      }
    }

    setInsights(newInsights);
  };

  const processActivities = async (acts: any[]) => {
    if (!acts || acts.length === 0) return [];
    const leadIds = Array.from(new Set(acts.map(a => a.lead_id))) as string[];
    const lpData = await DashboardFacade.fetchLeadsBasicInfo(leadIds);
    const lMap = new Map(lpData?.map(l => [l.id, l]) || []);
    return acts.map(act => ({ ...act, leads: lMap.get(act.lead_id) }));
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      let days = 30;
      if (timeRange === '7d') days = 7;
      if (timeRange === '90d') days = 90;
      if (timeRange === 'all') days = 3650; // 10 years approx for "All time"

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - days);

      let previousStartDateISO = previousStartDate.toISOString();
      let startDateISO = startDate.toISOString();
      
      if (timeRange === 'all') {
         // Se for "Todo o período", forçamos a data incial para o primeiro minuto de 1970 
         // ou 2000 para não quebrar relatórios do postgres.
         startDateISO = new Date('2020-01-01T00:00:00Z').toISOString();
         previousStartDateISO = new Date('2010-01-01T00:00:00Z').toISOString(); // Prev apenas para não crashar
      }

      // OTIMIZAÇÃO MAX: Busca de dados em paralelo para reduzir tempo da API < 500ms
      const [allLeads, activities, upcoming, rangeActivities] = await Promise.all([
        DashboardFacade.fetchLeadsFromDate(previousStartDateISO),
        DashboardFacade.fetchRecentActivities(10),
        DashboardFacade.fetchUpcomingAppointments(5),
        DashboardFacade.fetchActivitiesByDateRange(startDateISO)
      ]);

      let leads = allLeads?.filter((l: Lead) => new Date(l.created_at) >= startDate) || [];
      
      // Se for all time, consideramos todos os leads como ativos.
      if (timeRange === 'all') {
         leads = allLeads || [];
      }

      if (activities && activities.length > 0) {
        setRecentActivities(await processActivities(activities) as any);
      } else {
        setRecentActivities([]);
      }
      
      if (upcoming && upcoming.length > 0) {
        setUpcomingAppointments(await processActivities(upcoming) as any);
      } else {
        setUpcomingAppointments([]);
      }

      if (leads) {
        const total = leads.length;
        const newLeads = leads.filter((l: Lead) => l.status === 'new').length;
        const contacted = leads.filter((l: Lead) => l.status === 'contacted').length;
        const qualified = leads.filter((l: Lead) => l.status === 'qualified').length;
        const converted = leads.filter((l: Lead) => l.status === 'converted').length;

        const activatedLeads = total - newLeads;
        const contactRate = total > 0 ? (activatedLeads / total) * 100 : 0;

        const convertedLeadsList = leads.filter((l: Lead) => l.status === 'converted' && l.updated_at);
        let calculatedAvgSalesCycle = '0 dias';

        if (convertedLeadsList.length > 0) {
          let totalCycleDays = 0;
          convertedLeadsList.forEach((l: Lead) => {
            const start = new Date(l.created_at);
            const end = new Date(l.updated_at!);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            totalCycleDays += diffDays;
          });
          const avgDays = Math.round(totalCycleDays / convertedLeadsList.length);
          calculatedAvgSalesCycle = `${avgDays} dias`;
        }

        const now = new Date();
        const recentActivityMap = new Map<string, Date>();
        rangeActivities?.forEach(a => {
          const d = new Date(a.created_at);
          const current = recentActivityMap.get(a.lead_id);
          if (!current || d > current) {
            recentActivityMap.set(a.lead_id, d);
          }
        });

        const stalledLeadsValues = leads.filter((l: Lead) => {
          if (['converted', 'lost', 'archived'].includes(l.status as string)) return false;
          const createdAt = new Date(l.created_at);
          const lastActivity = recentActivityMap.get(l.id);

          if (lastActivity) {
            return (now.getTime() - lastActivity.getTime()) / (1000 * 3600 * 24) > 7;
          }
          return (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24) > 7;
        }).length;

        const qualityCount = leads.filter((l: Lead) => l.phone && l.phone.length > 5 && l.email).length;
        const qualityScore = total > 0 ? Math.round((qualityCount / total) * 100) : 0;

        const mockAdSpend = total * 12.50;
        const costPerLead = total > 0 ? mockAdSpend / total : 0;

        const mockTotalVisitors = generateMockVisitors(total);
        const conversionRate = mockTotalVisitors > 0 ? (total / mockTotalVisitors) * 100 : 0;

        const responseTimeValue = await DashboardFacade.getAverageResponseTime();

        const currentStats = {
          totalLeads: total,
          newLeads,
          contactedLeads: contacted,
          qualifiedLeads: qualified,
          convertedLeads: converted,
          conversionRate,
          costPerLead,
          qualityScore,
          avgResponseTime: responseTimeValue,
          contactRate,
          stalledLeads: stalledLeadsValues,
          avgSalesCycle: calculatedAvgSalesCycle
        };

        const previousLeads = allLeads?.filter((l: Lead) => {
          const d = new Date(l.created_at);
          return d >= previousStartDate && d < startDate;
        }) || [];

        const prevTotal = previousLeads.length;
        const prevConverted = previousLeads.filter((l: Lead) => l.status === 'converted').length;
        const prevQualified = previousLeads.filter((l: Lead) => l.status === 'qualified').length;
        const prevResponsive = previousLeads.filter((l: Lead) => l.status === 'contacted').length;

        const prevMockVisitors = generateMockVisitors(prevTotal);
        const prevConversionRate = prevMockVisitors > 0 ? (prevTotal / prevMockVisitors) * 100 : 0;

        const prevQualityCount = previousLeads.filter((l: Lead) => l.phone && l.phone.length > 5 && l.email).length;
        const prevQualityScore = prevTotal > 0 ? Math.round((prevQualityCount / prevTotal) * 100) : 0;

        const prevNew = previousLeads.filter((l: Lead) => l.status === 'new').length;
        const prevActivated = prevTotal - prevNew;
        const prevContactRate = prevTotal > 0 ? (prevActivated / prevTotal) * 100 : 0;

        const calculateTrend = (current: number, previous: number) => {
          if (previous === 0) {
            return current === 0 ? 0 : 100;
          }
          return ((current - previous) / previous) * 100;
        };

        const trends = {
          totalLeads: calculateTrend(total, prevTotal),
          conversionRate: calculateTrend(conversionRate, prevConversionRate),
          qualifiedLeads: calculateTrend(qualified, prevQualified),
          qualityScore: calculateTrend(qualityScore, prevQualityScore),
          avgResponseTime: 0,
          contactRate: calculateTrend(contactRate, prevContactRate),
          stalledLeads: 0,
          avgSalesCycle: 0
        };

        setStats({ ...currentStats, trends });

        setPipelineData([
          { name: 'Novos', value: newLeads, color: '#3b82f6' },
          { name: 'Contatados', value: contacted, color: '#f59e0b' },
          { name: 'Qualificados', value: qualified, color: '#10b981' },
          { name: 'Convertidos', value: converted, color: '#64748b' }
        ]);

        const sources = new Map<string, number>();
        leads.forEach((l: Lead) => {
          let source = l.traffic_source || l.utm_source || 'Site (Direto)';
          source = source.charAt(0).toUpperCase() + source.slice(1);
          sources.set(source, (sources.get(source) || 0) + 1);
        });

        const sourceChartData = Array.from(sources.entries())
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        const sourceColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
        setSourceData(sourceChartData.map((d, i) => ({ ...d, color: sourceColors[i % sourceColors.length] })));

        generateAIInsights(currentStats, sources, activities || []);

        const dateMap = new Map<string, number>();
        leads.forEach((lead: Lead) => {
          const date = new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          dateMap.set(date, (dateMap.get(date) || 0) + 1);
        });

        const history = [];
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const count = dateMap.get(dateStr) || 0;
          history.push({
            date: dateStr,
            count: count,
            visitors: count * (Math.floor(Math.random() * 20) + 15)
          });
        }

        setChartData(history);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    chartData,
    pipelineData,
    sourceData,
    recentActivities,
    upcomingAppointments,
    insights,
    loading,
    timeRange,
    setTimeRange,
    currentInsightIndex,
    fetchDashboardData
  };
};
