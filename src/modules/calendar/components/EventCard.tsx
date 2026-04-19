import React from 'react';
import { CalendarEvent } from '../types/calendar.types';
import { Clock, MapPin, Globe, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface EventCardProps {
    event: CalendarEvent;
    onClick: (event: CalendarEvent) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
    const getStatusStyles = () => {
        switch (event.status) {
            case 'confirmed': return {
                bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
                border: 'border-emerald-500/20 hover:border-emerald-500/40',
                text: 'text-emerald-400',
                indicator: 'bg-emerald-500',
                icon: <CheckCircle2 className="w-2.5 h-2.5" />
            };
            case 'cancelled': return {
                bg: 'bg-rose-500/10 hover:bg-rose-500/20',
                border: 'border-rose-500/20 hover:border-rose-500/40',
                text: 'text-rose-400',
                indicator: 'bg-rose-500',
                icon: <XCircle className="w-2.5 h-2.5" />
            };
            case 'no_show': return {
                bg: 'bg-amber-500/10 hover:bg-amber-500/20',
                border: 'border-amber-500/20 hover:border-amber-500/40',
                text: 'text-amber-400',
                indicator: 'bg-amber-500',
                icon: <AlertCircle className="w-2.5 h-2.5" />
            };
            case 'completed': return {
                bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
                border: 'border-indigo-500/20 hover:border-indigo-500/40',
                text: 'text-indigo-400',
                indicator: 'bg-indigo-500',
                icon: <CheckCircle2 className="w-2.5 h-2.5" />
            };
            default: return {
                bg: 'bg-slate-500/10 hover:bg-slate-500/20',
                border: 'border-slate-500/20 hover:border-slate-500/40',
                text: 'text-slate-400',
                indicator: 'bg-slate-500',
                icon: <Clock className="w-2.5 h-2.5" />
            };
        }
    };

    const styles = getStatusStyles();
    const startTime = new Date(event.start_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onClick(event);
            }}
            className={`
                group relative flex flex-col gap-1 p-2.5 mb-2
                rounded-xl border transition-all duration-300
                shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5
                cursor-pointer overflow-hidden backdrop-blur-sm
                ${styles.bg} ${styles.border}
            `}
        >
            {/* Status Indicator Bar */}
            <div className={`absolute top-0 left-0 bottom-0 w-1 ${styles.indicator} opacity-50 group-hover:opacity-100 transition-opacity`} />

            <div className="flex items-center justify-between gap-2">
                <span className={`truncate font-black text-[11px] uppercase tracking-wide ${styles.text}`}>
                    {event.title}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                    {event.google_event_id && (
                        <Globe className="w-3 h-3 text-indigo-400/80" title="Sincronizado" />
                    )}
                    <span className={`${styles.text} opacity-80`}>{styles.icon}</span>
                </div>
            </div>

            <div className="flex items-center gap-2.5 mt-0.5">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                    <Clock className="w-3 h-3 text-indigo-400/50" />
                    {startTime}
                </div>
                {event.location && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate max-w-[100px]">
                        <MapPin className="w-3 h-3 text-indigo-400/50" />
                        {event.location}
                    </div>
                )}
            </div>

            {/* Premium Tooltip */}
            <div className="invisible group-hover:visible absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-4 rounded-2xl bg-[#1A2234] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all animate-in fade-in zoom-in-95 pointer-events-none">
                <h4 className="font-black text-xs text-white uppercase tracking-wider border-b border-white/5 pb-2 mb-2 flex items-center justify-between">
                    {event.title}
                    <span className={`text-[9px] px-2 py-0.5 rounded-full ${styles.bg} ${styles.text}`}>{event.status}</span>
                </h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                        <Clock className="w-4 h-4 text-indigo-400" />
                        <span className="font-bold">{startTime}</span>
                    </div>
                    {event.location && (
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                            <MapPin className="w-4 h-4 text-indigo-400" />
                            <span className="truncate">{event.location}</span>
                        </div>
                    )}
                    {event.description && (
                        <div className="text-[10px] text-slate-500 italic mt-2 line-clamp-2 border-t border-white/5 pt-2">
                            "{event.description}"
                        </div>
                    )}
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#1A2234]" />
            </div>
        </div>
    );
};

export default EventCard;
