import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { CalendarViewType } from '../types/calendar.types';
import { calendarUtils } from '../utils/calendar.utils';
import ViewSwitcher from './ViewSwitcher';
import { GoogleCalendarConnect } from '../../../components/GoogleCalendarConnect';

interface CalendarHeaderProps {
    currentDate: Date;
    view: CalendarViewType;
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
    onViewChange: (view: CalendarViewType) => void;
    onNewEvent: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    currentDate,
    view,
    onPrev,
    onNext,
    onToday,
    onViewChange,
    onNewEvent,
}) => {
    const getTitle = () => {
        if (view === 'month') {
            return calendarUtils.formatDate(currentDate, { month: 'long', year: 'numeric' });
        }
        if (view === 'week') {
            const days = calendarUtils.getDaysInWeek(currentDate);
            const start = days[0];
            const end = days[6];
            if (start.getMonth() === end.getMonth()) {
                return `${start.getDate()} - ${end.getDate()} de ${calendarUtils.formatDate(start, { month: 'long', year: 'numeric' })}`;
            }
            return `${calendarUtils.formatDate(start, { day: 'numeric', month: 'short' })} - ${calendarUtils.formatDate(end, { day: 'numeric', month: 'short', year: 'numeric' })}`;
        }
        return calendarUtils.formatDate(currentDate, { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="flex flex-col gap-6 mb-8 p-6 glass-morphism rounded-[2.5rem] border border-white/5 shadow-2xl">
            {/* Top Row: Title and Main Controls */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">

                {/* Left Section: Icon + Title + Nav */}
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600/20 rounded-2xl border border-indigo-500/30 shadow-[0_0_20px_rgba(79,70,229,0.15)]">
                            <CalendarIcon className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white capitalize tracking-tight leading-none">
                                {getTitle()}
                            </h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Gestão de Agendamentos</p>
                        </div>
                    </div>

                    <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-2xl p-1 backdrop-blur-md shadow-inner">
                        <button
                            onClick={onPrev}
                            className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white"
                            title="Anterior"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onToday}
                            className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all bg-white/5 rounded-lg border border-white/5 hover:bg-indigo-600 hover:border-indigo-500"
                        >
                            Hoje
                        </button>
                        <button
                            onClick={onNext}
                            className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white"
                            title="Próximo"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Right Section: Sync + Switcher + Button */}
                <div className="flex flex-wrap items-center gap-4 xl:justify-end">
                    <GoogleCalendarConnect />

                    <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 p-1.5 rounded-2xl">
                        <ViewSwitcher currentView={view} onViewChange={onViewChange} />
                        <button
                            onClick={onNewEvent}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 border border-indigo-400/30 whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Novo Evento</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarHeader;
