import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import React from 'react';

export interface KPIProps {
    title: string;
    value: string | number;
    subtext: string;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
    onClick?: () => void;
}

export const KPI: React.FC<KPIProps> = ({ title, value, subtext, icon, trend, trendUp, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-dark-card border border-dark-border rounded-xl p-5 shadow-sm hover:border-primary-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/10 group ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
        <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-dark-bg rounded-lg border border-dark-border text-slate-300 group-hover:text-primary-400 group-hover:border-primary-500/30 transition-colors">
                {icon}
            </div>
            {trend && (
                <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 group-hover:bg-red-500/20'} transition-colors`}>
                    {trendUp ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                    {trend}
                </div>
            )}
        </div>
        <div>
            <h3 className="text-slate-400 text-sm font-medium group-hover:text-slate-300 transition-colors">{title}</h3>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{subtext}</p>
        </div>
    </div>
);
