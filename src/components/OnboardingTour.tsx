import * as React from 'react';
import Joyride, { CallBackProps, STATUS, Step, Styles } from 'react-joyride';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

import { useTour } from '../context/TourContext';

export const OnboardingTour: React.FC = () => {
    const { user } = useAuth();
    const { run, steps, stopTour } = useTour();

    const handleJoyrideCallback = async (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            stopTour();
            if (user && status === STATUS.FINISHED) {
                try {
                    // Update user profile to mark onboarding as completed IF it's the main dashboard tour
                    // For now, we can just log or implement more complex logic if needed
                    /* 
                    const { error } = await supabase
                        .from('profiles')
                        .update({ onboarding_completed: true })
                        .eq('id', user.id);
                    */
                } catch (err) {
                    console.error('Unexpected error updating onboarding:', err);
                }
            }
        }
    };

    const tourStyles: Partial<Styles> = {
        options: {
            zIndex: 10000,
            primaryColor: '#6366f1', // Indigo-500
            backgroundColor: '#1e293b', // Slate-800
            textColor: '#f8fafc', // Slate-50
            arrowColor: '#1e293b',
        },
        tooltip: {
            borderRadius: '12px',
            padding: '20px',
        },
        buttonNext: {
            backgroundColor: '#6366f1',
            fontSize: '14px',
            fontWeight: '600',
            padding: '10px 16px',
            borderRadius: '8px',
        },
        buttonBack: {
            color: '#94a3b8',
            marginRight: '10px',
        },
        buttonSkip: {
            color: '#64748b',
        },
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showProgress
            showSkipButton
            callback={handleJoyrideCallback}
            styles={tourStyles}
            locale={{
                back: 'Voltar',
                close: 'Fechar',
                last: 'Concluir',
                next: 'Próximo',
                skip: 'Pular',
            }}
        />
    );
};
