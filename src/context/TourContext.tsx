import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Step } from 'react-joyride';
import { DASHBOARD_STEPS, GLOBAL_STEPS, LEADS_STEPS, PIPELINE_STEPS, PLANS_STEPS } from '../constants/tourSteps';

interface TourContextType {
    run: boolean;
    steps: Step[];
    startTour: () => void;
    stopTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [run, setRun] = useState(false);
    const [steps, setSteps] = useState<Step[]>(GLOBAL_STEPS);
    const location = useLocation();

    useEffect(() => {
        // Update steps based on current route
        switch (location.pathname) {
            case '/':
                setSteps(DASHBOARD_STEPS);
                break;
            case '/pipeline':
                setSteps(PIPELINE_STEPS);
                break;
            case '/leads':
                setSteps(LEADS_STEPS);
                break;
            case '/plans':
                setSteps(PLANS_STEPS);
                break;
            default:
                setSteps(GLOBAL_STEPS);
        }
    }, [location.pathname]);

    const startTour = () => setRun(true);
    const stopTour = () => setRun(false);

    return (
        <TourContext.Provider value={{ run, steps, startTour, stopTour }}>
            {children}
        </TourContext.Provider>
    );
};

export const useTour = () => {
    const context = useContext(TourContext);
    if (context === undefined) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
};
