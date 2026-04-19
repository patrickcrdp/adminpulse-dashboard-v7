import { supabase } from '../supabaseClient';

export interface MarketingCreative {
    id: string;
    name: string;
    media_url: string;
    media_type: string;
    status: string;
    performance_score: number;
    created_at: string;
}

export class CreativeLibraryFacade {
    static async fetchCreatives(): Promise<MarketingCreative[]> {
        const { data, error } = await supabase
            .from('marketing_creatives')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as MarketingCreative[] || [];
    }
}
