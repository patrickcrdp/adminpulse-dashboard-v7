import { supabase } from '../supabaseClient';
import { Lead } from '../types';

export class LeadsFacade {
    static async fetchLeads(): Promise<Lead[]> {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Lead[] || [];
    }

    static async updateLeadStatus(id: string, newStatus: string): Promise<void> {
        const { error } = await supabase
            .from('leads')
            .update({ status: newStatus as any })
            .eq('id', id);

        if (error) throw error;
    }

    static async deleteLead(id: string): Promise<void> {
        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    static async insertLead(leadData: any): Promise<Lead> {
        const { data, error } = await supabase
            .from('leads')
            .insert(leadData)
            .select()
            .single();

        if (error) throw error;
        return data as Lead;
    }
}
