import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useTour } from '../context/TourContext';

export const FloatingGuideButton: React.FC = () => {
    const { startTour } = useTour();

    return (
        <button
            onClick={startTour}
            className="fixed bottom-6 right-6 p-4 bg-primary-600 hover:bg-primary-500 text-white rounded-full shadow-lg hover:shadow-primary-500/20 transition-all duration-300 z-50 group flex items-center justify-center"
            aria-label="Iniciar Guia Interativo"
            title="Ajuda / Guia Interativo"
        >
            <HelpCircle size={28} className="animate-pulse group-hover:animate-none" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 ease-in-out whitespace-nowrap font-medium">
                Ajuda
            </span>
        </button>
    );
};
