import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Clock, Calendar as CalendarIcon, User, X } from 'lucide-react';
import { useNotifications, type Notification as AppNotification } from '../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

export const NotificationBell: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notification: AppNotification) => {
        if (!notification.read_at) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            if (notification.link.startsWith('/')) {
                navigate(notification.link);
            } else {
                window.open(notification.link, '_blank');
            }
        }
        setIsOpen(false);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'appointment_reminder': return <CalendarIcon className="w-4 h-4 text-indigo-400" />;
            case 'lead_assigned': return <User className="w-4 h-4 text-emerald-400" />;
            default: return <Bell className="w-4 h-4 text-slate-400" />;
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = (now.getTime() - date.getTime()) / 1000;

        if (diff < 60) return 'Agora';
        if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
        return date.toLocaleDateString('pt-BR');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (window.Notification && window.Notification.permission === 'default') {
                        window.Notification.requestPermission();
                    }
                }}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all duration-200"
                title="Notificações"
            >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[10px] font-bold text-white items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            Notificações
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] rounded-full border border-indigo-500/30">
                                    {unreadCount} novas
                                </span>
                            )}
                        </h3>
                        <button
                            onClick={markAllAsRead}
                            className="text-[10px] uppercase tracking-wider font-bold text-slate-400 hover:text-indigo-400 transition-colors"
                        >
                            Marcar todas como lidas
                        </button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-xs text-slate-500 tracking-tight">Buscando atualizações...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                                    <Bell className="w-6 h-6 text-slate-600" />
                                </div>
                                <p className="text-sm text-slate-400 font-medium">Tudo limpo por aqui!</p>
                                <p className="text-xs text-slate-500 mt-1">Avisaremos quando algo novo acontecer.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {notifications.map((n: AppNotification) => (
                                    <div
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`p-4 hover:bg-white/5 cursor-pointer transition-colors relative group ${!n.read_at ? 'bg-indigo-500/5' : ''}`}
                                    >
                                        {!n.read_at && (
                                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                        )}
                                        <div className="flex gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${!n.read_at ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-slate-800/50 border-white/5'
                                                }`}>
                                                {getIcon(n.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm tracking-tight ${!n.read_at ? 'text-white font-medium' : 'text-slate-300'}`}>
                                                    {n.title}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                                    {n.message}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-[10px] text-slate-600 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatTime(n.created_at)}
                                                    </span>
                                                    {!n.read_at && (
                                                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                                            Novo
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-white/5 bg-slate-900/50 text-center">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-[11px] text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
                        >
                            Fechar Painel
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
