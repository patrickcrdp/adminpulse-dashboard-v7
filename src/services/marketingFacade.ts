import { supabase } from '../supabaseClient';

export interface TrafficStats {
    spend: number;
    impressions: number;
    clicks: number;
    leads_generated: number;
    revenue_generated: number;
    date: string;
    provider: string;
}

export class MarketingFacade {
    static async fetchTrafficStats(startDate: string): Promise<TrafficStats[]> {
        const { data, error } = await supabase
            .from('marketing_stats')
            .select('*')
            .gte('date', startDate)
            .order('date', { ascending: true });

        if (error) throw error;
        return data || [];
    }
}
