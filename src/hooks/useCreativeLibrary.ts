import { useState, useEffect } from 'react';
import { CreativeLibraryFacade, MarketingCreative } from '../services/creativeLibraryFacade';

export const useCreativeLibrary = () => {
    const [loading, setLoading] = useState(true);
    const [creatives, setCreatives] = useState<MarketingCreative[]>([]);

    useEffect(() => {
        const fetchCreatives = async () => {
            try {
                setLoading(true);
                const data = await CreativeLibraryFacade.fetchCreatives();
                setCreatives(data);
            } catch (err) {
                console.error('Error fetching creatives:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCreatives();
    }, []);

    return {
        loading,
        creatives
    };
};
