import React, { useState } from 'react';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { CalendarEvent, CalendarViewType } from '../types/calendar.types';
import { calendarUtils } from '../utils/calendar.utils';
import CalendarHeader from './CalendarHeader';
import EventCard from './EventCard';
import EventModal from './EventModal';
import { Plus, Calendar, Clock } from 'lucide-react';

const CalendarView: React.FC = () => {
    const {
        events,
        loading,
        currentDate,
        setCurrentDate,
        view,
        setView,
        addEvent,
        updateEvent,
        removeEvent,
    } = useCalendarEvents();

    const [selectedEvent, setSelectedEvent] = useState<Partial<CalendarEvent> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handlePrev = () => {
        const newDate = new Date(currentDate);
        if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
        else if (view === 'week') newDate.setDate(newDate.getDate() - 7);
        else newDate.setDate(newDate.getDate() - 1);
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
        else if (view === 'week') newDate.setDate(newDate.getDate() + 7);
        else newDate.setDate(newDate.getDate() + 1);
        setCurrentDate(newDate);
    };

    const handleToday = () => setCurrentDate(new Date());

    const handleNewEvent = (date?: Date) => {
        const start = date || new Date();
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        setSelectedEvent({
            start_at: start.toISOString(),
            end_at: end.toISOString()
        });
        setIsModalOpen(true);
    };

    const handleEditEvent = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const filterEventsByDay = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        return events.filter(e => {
            const eventDate = new Date(e.start_at);
            return eventDate.getFullYear() === year &&
                   eventDate.getMonth() === month &&
                   eventDate.getDate() === day;
        });
    };

    const renderMonthView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`pad-${i}`} className="h-32 border-b border-r border-white/5 bg-white/[0.02]" />);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const dateStr = date.toLocaleDateString('pt-BR');
            const dayEvents = filterEventsByDay(date);
            const isToday = new Date().toLocaleDateString('pt-BR') === dateStr;
            const holiday = calendarUtils.getHoliday(date);

            days.push(
                <div
                    key={d}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) handleNewEvent(date);
                    }}
                    className={`
                        h-36 border-b border-r border-white/5 p-2 overflow-y-auto group 
                        hover:bg-white/[0.04] transition-all cursor-pointer relative
                        ${holiday ? 'bg-rose-500/5' : ''}
                        ${isToday ? 'bg-indigo-500/5' : ''}
                    `}
                >
                    <div className="flex justify-between items-center mb-1 pointer-events-none sticky top-0 z-10">
                        <span className={`
                            text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg transition-all
                            ${isToday
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50 scale-110'
                                : 'text-slate-400 group-hover:text-slate-200'}
                        `}>
                            {d}
                        </span>
                        {holiday && (
                            <span className="text-[9px] font-bold text-rose-400/80 uppercase tracking-tighter truncate max-w-[70px]">
                                {holiday}
                            </span>
                        )}
                    </div>
                    <div className="space-y-1.5 mt-1">
                        {dayEvents.map(event => (
                            <EventCard key={event.id} event={event} onClick={handleEditEvent} />
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-7 border-t border-l border-white/5 rounded-2xl overflow-hidden glass-morphism animate-in fade-in zoom-in-95 duration-500">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="p-3 text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white/[0.03] border-r border-b border-white/5">
                        {day}
                    </div>
                ))}
                {days}
            </div>
        );
    };

    const renderWeekView = () => {
        const days = calendarUtils.getDaysInWeek(currentDate);

        return (
            <div className="grid grid-cols-7 border-t border-l border-white/5 rounded-3xl overflow-hidden glass-morphism animate-in fade-in slide-in-from-bottom-4 duration-700">
                {days.map((date, i) => {
                    const dateStr = date.toLocaleDateString('pt-BR');
                    const dayEvents = filterEventsByDay(date);
                    const isToday = new Date().toLocaleDateString('pt-BR') === dateStr;
                    const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i];
                    const holiday = calendarUtils.getHoliday(date);

                    return (
                        <div
                            key={i}
                            onClick={(e) => {
                                if (e.target === e.currentTarget) handleNewEvent(date);
                            }}
                            className={`flex flex-col min-h-[600px] border-r border-white/5 cursor-pointer hover:bg-white/[0.03] transition-colors ${holiday ? 'bg-rose-500/5' : ''}`}
                        >
                            <div className="p-4 text-center bg-white/[0.03] border-b border-white/5 pointer-events-none">
                                <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{dayName}</span>
                                <div className="flex flex-col items-center gap-1">
                                    <span className={`
                                        inline-flex items-center justify-center w-10 h-10 text-lg font-bold rounded-xl transition-all
                                        ${isToday
                                            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/40 scale-105'
                                            : 'text-slate-300'}
                                    `}>
                                        {date.getDate()}
                                    </span>
                                    {holiday && <span className="text-[9px] font-bold text-rose-400 uppercase mt-1">{holiday}</span>}
                                </div>
                            </div>
                            <div className="flex-1 p-3 space-y-2 bg-transparent overflow-y-auto">
                                {dayEvents.map(event => (
                                    <div key={event.id} className="transform transition-all hover:translate-x-1">
                                        <EventCard event={event} onClick={handleEditEvent} />
                                    </div>
                                ))}
                                {dayEvents.length === 0 && (
                                    <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Plus className="text-white/10 w-8 h-8" />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderDayView = () => {
        const dayEvents = filterEventsByDay(currentDate);
        const holiday = calendarUtils.getHoliday(currentDate);

        return (
            <div
                onClick={(e) => {
                    if (e.target === e.currentTarget) handleNewEvent(currentDate);
                }}
                className="max-w-4xl mx-auto border border-white/10 rounded-[2rem] overflow-hidden glass-morphism animate-in zoom-in-95 duration-500 group cursor-pointer"
            >
                <div className={`p-8 border-b border-white/10 flex items-center justify-between pointer-events-none relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-transparent opacity-50" />
                    <div className="relative flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex flex-col items-center justify-center border border-white/10 shadow-inner">
                            <span className="text-2xl font-black text-white">{currentDate.getDate()}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-500">{calendarUtils.formatDate(currentDate, { month: 'short' })}</span>
                        </div>
                        <div>
                            <span className="text-xl font-black text-white capitalize flex items-center gap-3">
                                {calendarUtils.formatDate(currentDate, { weekday: 'long' })}
                                {holiday && (
                                    <span className="px-3 py-1 bg-rose-500/20 text-rose-400 text-[10px] rounded-full border border-rose-500/30 uppercase tracking-widest font-black">
                                        {holiday}
                                    </span>
                                )}
                            </span>
                            <div className="flex items-center gap-4 mt-1">
                                <p className="text-sm text-slate-400 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {dayEvents.length} compromissos</p>
                                <p className="text-sm text-slate-400 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Próxima: {dayEvents[0]?.title || 'Livre'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-10 space-y-4 min-h-[400px]">
                    {dayEvents.length > 0 ? (
                        dayEvents.map(event => (
                            <div key={event.id} className="transform transition-all hover:scale-[1.02] hover:translate-x-1">
                                <EventCard event={event} onClick={handleEditEvent} />
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-80 text-slate-500">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 animate-pulse">
                                <Plus className="w-10 h-10 opacity-30" />
                            </div>
                            <p className="text-lg font-bold text-slate-300">Agenda livre para hoje</p>
                            <p className="text-sm mt-2 opacity-60">Toque em qualquer lugar para agendar</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-transparent relative pb-24 font-sans antialiased text-slate-200">
            <style dangerouslySetInnerHTML={{
                __html: `
                .glass-morphism {
                    background: rgba(21, 28, 44, 0.4);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .text-gradient {
                    background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}} />

            <CalendarHeader
                currentDate={currentDate}
                view={view}
                onPrev={handlePrev}
                onNext={handleNext}
                onToday={handleToday}
                onViewChange={setView}
                onNewEvent={() => handleNewEvent()}
            />

            {loading && !events.length ? (
                <div className="flex flex-col items-center justify-center h-[500px]">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500" />
                        <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border border-indigo-500/20" />
                    </div>
                    <p className="mt-6 text-indigo-400 font-bold tracking-widest uppercase text-[10px] animate-pulse">Sincronizando Dados...</p>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    {view === 'month' && renderMonthView()}
                    {view === 'week' && renderWeekView()}
                    {view === 'day' && renderDayView()}
                </div>
            )}

            {/* Premium Floating Action Button */}
            <button
                onClick={() => handleNewEvent()}
                className="fixed bottom-10 right-10 w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:bg-indigo-500 hover:scale-110 active:scale-95 transition-all z-50 group border border-indigo-400/50"
                title="Novo Agendamento"
            >
                <div className="absolute inset-0 bg-white/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                <Plus size={40} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>

            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                event={selectedEvent}
                onSave={addEvent}
                onUpdate={updateEvent}
                onDelete={removeEvent}
            />
        </div>
    );
};

export default CalendarView;
