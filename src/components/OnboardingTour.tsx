import * as React from 'react';
// import Joyride, { CallBackProps, STATUS, Step, Styles } from 'react-joyride';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

import { useTour } from '../context/TourContext';

// ⚠️ DESABILITADO: react-joyride v3.0.0-7 (beta) é incompatível com React 19.
// O Joyride manipula o DOM diretamente (tooltips, overlays), o que colide com o 
// reconciliador do React 19 durante re-renders (profile update, avatar upload, etc.),
// causando o erro fatal: "NotFoundError: Failed to execute 'insertBefore' on 'Node'"
//
// SOLUÇÃO: Quando o react-joyride lançar uma versão estável compatível com React 19,
// basta descomentar o código abaixo e remover o `return null`.
export const OnboardingTour: React.FC = () => {
    // Tour desabilitado para estabilidade em produção
    return null;

    /* CÓDIGO ORIGINAL PRESERVADO PARA REATIVAÇÃO FUTURA:
    const { user } = useAuth();
    const { run, steps, stopTour } = useTour();

    const handleJoyrideCallback = async (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            stopTour();
        }
    };

    const tourStyles: Partial<Styles> = {
        options: {
            zIndex: 10000,
            primaryColor: '#6366f1',
            backgroundColor: '#1e293b',
            textColor: '#f8fafc',
            arrowColor: '#1e293b',
        },
        tooltip: { borderRadius: '12px', padding: '20px' },
        buttonNext: { backgroundColor: '#6366f1', fontSize: '14px', fontWeight: '600', padding: '10px 16px', borderRadius: '8px' },
        buttonBack: { color: '#94a3b8', marginRight: '10px' },
        buttonSkip: { color: '#64748b' },
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
    */
};

