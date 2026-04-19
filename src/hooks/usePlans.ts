import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BillingFacade } from '../services/billingFacade';

export const usePlans = () => {
    const [loading, setLoading] = useState(false);
    const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
    const [status, setStatus] = useState<string>('trialing');
    const navigate = useNavigate();

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const profile = await BillingFacade.getSubscriptionStatus();
                if (profile) {
                    setStatus(profile.subscription_status || 'trialing');
                    if (profile.trial_ends_at) {
                        const days = Math.ceil((new Date(profile.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        setTrialDaysLeft(days > 0 ? days : 0);
                    }
                }
            } catch (err) {
                console.error("Error checking subscription status", err);
            }
        };
        checkStatus();
    }, []);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const data = await BillingFacade.createCheckoutSession('price_1T1FvdGtFzbXqI05bkZoaMxu');
            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error: any) {
            console.error('Error creating checkout session:', error);
            alert(`Erro ao iniciar checkout: ${error.message || 'Tente novamente mais tarde.'}`);
        } finally {
            setLoading(false);
        }
    };

    const isPro = status === 'active' || status === 'pro';

    return {
        loading,
        trialDaysLeft,
        status,
        navigate,
        handleSubscribe,
        isPro
    };
};
