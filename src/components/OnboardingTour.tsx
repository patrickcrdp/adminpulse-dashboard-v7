import * as React from 'react';
import Joyride, { CallBackProps, STATUS, Step, Styles } from 'react-joyride';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

import { useTour } from '../context/TourContext';

export const OnboardingTour: React.FC = () => {
    const { user } = useAuth();
    const { run, steps, stopTour } = useTour();
    const [delayedRun, setDelayedRun] = React.useState(false);

    // Proteção de estabilidade: O Tour espera 1 segundo após o 'run' ficar true
    // para garantir que os componentes pesados (gráficos/tabelas) já existam no DOM
    React.useEffect(() => {
        let timer: any;
        if (run) {
            timer = setTimeout(() => {
                setDelayedRun(true);
            }, 1000);
        } else {
            setDelayedRun(false);
        }
        return () => clearTimeout(timer);
    }, [run]);

    const handleJoyrideCallback = async (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setDelayedRun(false);
            stopTour();
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
            run={delayedRun}
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
