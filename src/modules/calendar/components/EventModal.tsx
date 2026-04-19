import React, { useState, useEffect } from 'react';
import { X, Trash2, User, MapPin, Clock, AlignLeft, Info } from 'lucide-react';
import { CalendarEvent, AppointmentStatus } from '../types/calendar.types';
import { supabase } from '../../../supabaseClient';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: Partial<CalendarEvent> | null;
    onSave: (event: Partial<CalendarEvent>) => Promise<any>;
    onDelete?: (id: string) => Promise<any>;
    onUpdate?: (id: string, updates: Partial<CalendarEvent>) => Promise<any>;
}

const EventModal: React.FC<EventModalProps> = ({
    isOpen,
    onClose,
    event,
    onSave,
    onDelete,
    onUpdate,
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [startAt, setStartAt] = useState('');
    const [endAt, setEndAt] = useState('');
    const [status, setStatus] = useState<AppointmentStatus>('scheduled');
    const [leadId, setLeadId] = useState('');
    const [leads, setLeads] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (event) {
            setTitle(event.title || '');
            setDescription(event.description || '');
            setLocation(event.location || '');

            const formatToInput = (dateStr?: string) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            };

            const initialStart = event.start_at || event.created_at || new Date().toISOString();
            setStartAt(formatToInput(initialStart));

            if (event.end_at) {
                setEndAt(formatToInput(event.end_at));
            } else {
                const date = new Date(initialStart);
                date.setHours(date.getHours() + 1);
                setEndAt(formatToInput(date.toISOString()));
            }

            setStatus(event.status || 'scheduled');
            setLeadId(event.lead_id || '');
        } else {
            setTitle('');
            setDescription('');
            setLocation('');
            const now = new Date();
            const formatToInput = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            setStartAt(formatToInput(now));
            const later = new Date(now.getTime() + 60 * 60 * 1000);
            setEndAt(formatToInput(later));
            setStatus('scheduled');
            setLeadId('');
        }

        const fetchLeads = async () => {
            const { data } = await supabase.from('leads').select('id, name').order('name');
            if (data) setLeads(data);
        };
        fetchLeads();
    }, [event, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !startAt || !endAt) return;

        const startDate = new Date(startAt);
        let endDate = new Date(endAt);

        if (endDate <= startDate) {
            alert('A data de término deve ser posterior à data de início.');
            return;
        }

        setLoading(true);
        try {
            const appointmentData: Partial<CalendarEvent> = {
                title,
                description,
                location,
                start_at: startDate.toISOString(),
                end_at: endDate.toISOString(),
                status,
                lead_id: leadId || undefined,
            };

            if (event?.id && onUpdate) {
                await onUpdate(event.id, appointmentData);
                alert('Agendamento atualizado com sucesso!');
            } else {
                await onSave(appointmentData);
                alert('Agendamento confirmado com sucesso!');
            }
            onClose();
        } catch (err: any) {
            console.error(err);
            alert('Erro ao salvar agendamento: ' + (err.message || 'Erro desconhecido'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="bg-[#151C2C] rounded-[2.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.8)] w-full max-w-xl overflow-hidden border border-white/5 flex flex-col transform animate-in zoom-in-95 duration-500 scale-100">
                {/* Visual Header Decoration */}
                <div className="h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 w-full" />

                {/* Header */}
                <div className="flex items-center justify-between p-8 pb-4">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight text-gradient">
                            {event?.id ? 'Editar Agendamento' : 'Novo Agendamento'}
                        </h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Sincronização Ativa • Google Agenda</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
                        .text-gradient { background: linear-gradient(135deg, #fff 0%, #94a3b8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                    `}} />

                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1 flex items-center justify-between">
                            Título do Compromisso
                            <span className="text-indigo-400/50 italic font-medium normal-case">* obrigatório</span>
                        </label>
                        <input
                            required
                            autoFocus
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 outline-none transition-all text-xl font-black shadow-inner"
                            placeholder="Que tal: Reunião de Sucesso?"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="group">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1 flex items-center gap-2 group-focus-within:text-indigo-400 transition-colors">
                                <Clock className="w-4 h-4" /> Início
                            </label>
                            <input
                                required
                                type="datetime-local"
                                value={startAt}
                                onChange={(e) => setStartAt(e.target.value)}
                                className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 outline-none transition-all cursor-pointer"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1 flex items-center gap-2 group-focus-within:text-indigo-400 transition-colors">
                                <Clock className="w-4 h-4" /> Término
                            </label>
                            <input
                                required
                                type="datetime-local"
                                value={endAt}
                                onChange={(e) => setEndAt(e.target.value)}
                                className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 outline-none transition-all cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="group">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1 flex items-center gap-2 group-focus-within:text-indigo-400 transition-colors">
                                <MapPin className="w-4 h-4" /> Localização
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-slate-200 placeholder-slate-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 outline-none transition-all"
                                placeholder="Google Meet, Escritório..."
                            />
                        </div>
                        <div className="group">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1 flex items-center gap-2 group-focus-within:text-indigo-400 transition-colors">
                                <Info className="w-4 h-4" /> Status
                            </label>
                            <div className="relative">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 outline-none transition-all cursor-pointer appearance-none"
                                >
                                    <option value="scheduled">🟡 Agendado</option>
                                    <option value="confirmed">🟢 Confirmado</option>
                                    <option value="cancelled">🔴 Cancelado</option>
                                    <option value="completed">🔵 Concluído</option>
                                    <option value="no_show">⚪ Não Compareceu</option>
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <AlignLeft className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1 flex items-center gap-2 group-focus-within:text-indigo-400 transition-colors">
                            <User className="w-4 h-4" /> Lead Relacionado
                        </label>
                        <select
                            value={leadId}
                            onChange={(e) => setLeadId(e.target.value)}
                            className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 outline-none transition-all cursor-pointer appearance-none"
                        >
                            <option value="" className="bg-[#1A2234]">Nenhum lead selecionado</option>
                            {leads.map((l) => (
                                <option key={l.id} value={l.id} className="bg-[#1A2234]">{l.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="group">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1 flex items-center gap-2 group-focus-within:text-indigo-400 transition-colors">
                            <AlignLeft className="w-4 h-4" /> Descrição
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-3xl text-slate-300 placeholder-slate-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/40 outline-none transition-all resize-none h-32"
                            placeholder="Adicione detalhes cruciais aqui..."
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-8 pb-4 border-t border-white/5">
                        {event?.id && onDelete ? (
                            <button
                                type="button"
                                onClick={() => event.id && onDelete(event.id).then(onClose)}
                                className="flex items-center gap-2.5 text-rose-500 hover:text-rose-400 font-black text-[10px] uppercase tracking-widest transition-all p-3 hover:bg-rose-500/10 rounded-2xl border border-transparent hover:border-rose-500/20"
                            >
                                <Trash2 className="w-4 h-4" />
                                Excluir
                            </button>
                        ) : <div />}

                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-4 text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                            >
                                Fechar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-10 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.1em] hover:bg-indigo-500 shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none border border-indigo-400/30"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Processando
                                    </div>
                                ) : event?.id ? 'Salvar Alterações' : 'Confirmar Agendamento'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventModal;
