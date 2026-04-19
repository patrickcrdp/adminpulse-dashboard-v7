import React from 'react';
import { CalendarViewType } from '../types/calendar.types';

interface ViewSwitcherProps {
    currentView: CalendarViewType;
    onViewChange: (view: CalendarViewType) => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ currentView, onViewChange }) => {
    const views: { id: CalendarViewType; label: string }[] = [
        { id: 'month', label: 'Mês' },
        { id: 'week', label: 'Semana' },
        { id: 'day', label: 'Dia' },
    ];

    return (
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
            {views.map((view) => (
                <button
                    key={view.id}
                    onClick={() => onViewChange(view.id)}
                    className={`
                        px-5 py-2 text-[10px] font-black uppercase tracking-[0.1em] rounded-xl transition-all duration-300
                        ${currentView === view.id
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-105'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        }
                    `}
                >
                    {view.label}
                </button>
            ))}
        </div>
    );
};

export default ViewSwitcher;
