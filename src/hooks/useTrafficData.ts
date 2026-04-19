import { useState, useEffect } from 'react';
import { MarketingFacade, TrafficStats } from '../services/marketingFacade';

export const useTrafficData = () => {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30d');
    const [stats, setStats] = useState({
        spend: 0,
        impressions: 0,
        clicks: 0,
        ctr: 0,
        cpc: 0,
        leads: 0,
        cpl: 0,
        roi: 0,
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [platforms, setPlatforms] = useState<any[]>([]);

    useEffect(() => {
        const fetchTrafficStats = async () => {
            try {
                setLoading(true);
                const days = timeRange === '30d' ? 30 : 7;
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - days);

                const data = await MarketingFacade.fetchTrafficStats(startDate.toISOString().split('T')[0]);

                if (data && data.length > 0) {
                    const totals = data.reduce((acc: any, curr: TrafficStats) => ({
                        spend: acc.spend + (Number(curr.spend) || 0),
                        impressions: acc.impressions + (Number(curr.impressions) || 0),
                        clicks: acc.clicks + (Number(curr.clicks) || 0),
                        leads: acc.leads + (Number(curr.leads_generated) || 0),
                        revenue: acc.revenue + (Number(curr.revenue_generated) || 0),
                    }), { spend: 0, impressions: 0, clicks: 0, leads: 0, revenue: 0 });

                    setStats({
                        spend: totals.spend,
                        impressions: totals.impressions,
                        clicks: totals.clicks,
                        ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
                        cpc: totals.clicks > 0 ? totals.spend / totals.clicks : 0,
                        leads: totals.leads,
                        cpl: totals.leads > 0 ? totals.spend / totals.leads : 0,
                        roi: totals.spend > 0 ? (totals.revenue / totals.spend) * 100 : 0,
                    });

                    // Process chart data
                    const dailyData = data.reduce((acc: any, curr: TrafficStats) => {
                        const dateLabel = new Date(curr.date).toLocaleDateString('pt-BR', { weekday: 'short' });
                        if (!acc[dateLabel]) acc[dateLabel] = { name: dateLabel, spend: 0, leads: 0 };
                        acc[dateLabel].spend += Number(curr.spend) || 0;
                        acc[dateLabel].leads += Number(curr.leads_generated) || 0;
                        return acc;
                    }, {});
                    setChartData(Object.values(dailyData));

                    // Process platforms
                    const platformMap = data.reduce((acc: any, curr: TrafficStats) => {
                        if (!acc[curr.provider]) acc[curr.provider] = { name: curr.provider === 'meta' ? 'Instagram/FB Ads' : curr.provider === 'google' ? 'Google Ads' : 'TikTok Ads', spend: 0, leads: 0, color: curr.provider === 'meta' ? '#ec4899' : curr.provider === 'google' ? '#3b82f6' : '#000000' };
                        acc[curr.provider].spend += Number(curr.spend) || 0;
                        acc[curr.provider].leads += Number(curr.leads_generated) || 0;
                        return acc;
                    }, {});

                    const totalSpend = totals.spend || 1;
                    setPlatforms(Object.values(platformMap).map((p: any) => ({
                        ...p,
                        value: Math.round((p.spend / totalSpend) * 100)
                    })));
                } else {
                    // Reset on no data
                    setStats({ spend: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, leads: 0, cpl: 0, roi: 0 });
                    setChartData([]);
                    setPlatforms([]);
                }
            } catch (err) {
                console.error('Error fetching traffic stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrafficStats();
    }, [timeRange]);

    return {
        loading,
        timeRange,
        setTimeRange,
        stats,
        chartData,
        platforms
    };
};
