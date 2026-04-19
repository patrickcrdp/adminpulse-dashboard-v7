import React from 'react';

interface BadgeProps {
  status?: string; // Made optional to handle missing data gracefully
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const styles: Record<string, string> = {
    new: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    contacted: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    qualified: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    converted: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    lost: "bg-red-500/10 text-red-400 border-red-500/20",
    // Fallbacks for legacy
    responded: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    closed: "bg-purple-500/10 text-purple-400 border-purple-500/20", // Map old closed to converted style
    archived: "bg-slate-500/10 text-slate-400 border-slate-500/20"
  };

  const labels: Record<string, string> = {
    new: "Novo Lead",
    contacted: "Em Contato",
    qualified: "Qualificado",
    converted: "Convertido",
    lost: "Perdido",
    responded: "Em Contato",
    closed: "Convertido",
    archived: "Arquivado"
  };

  // Safe handling of undefined/null status
  const currentStatus = status || 'new';
  const safeStatus = currentStatus.toLowerCase();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[safeStatus] || styles.new}`}>
      {labels[safeStatus] || currentStatus}
    </span>
  );
};