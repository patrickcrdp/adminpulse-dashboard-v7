import { supabase } from '../supabaseClient';

export class BillingFacade {
    static async getSubscriptionStatus() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('trial_ends_at, subscription_status')
            .eq('id', user.id)
            .single();

        if (error) throw error;
        return profile;
    }

    static async createCheckoutSession(priceId: string) {
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: { price_id: priceId },
        });

        if (error) throw error;
        return data;
    }
}
