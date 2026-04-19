import React from 'react';
import { Lead } from '../types';
import { LeadModal } from '../components/crm/LeadModal';
import { PipelineSettingsModal } from '../components/crm/PipelineSettingsModal';
import { usePipelineData } from '../hooks/usePipelineData';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle, DollarSign, Calendar, Settings, Edit2 } from 'lucide-react';

// Extracted component to fix type issues and improve performance
interface KanbanCardProps {
  lead: Lead;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onClick: (lead: Lead) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ lead, isDragging, onDragStart, onClick }) => (
  <div
    draggable
    onDragStart={(e) => onDragStart(e, lead.id)}
    onClick={() => onClick(lead)}
    className={`
      bg-dark-card border border-dark-border p-4 rounded-xl shadow-sm cursor-grab active:cursor-grabbing
      hover:border-primary-500/50 transition-all group relative
      ${isDragging ? 'opacity-50' : 'opacity-100'}
    `}
  >
    <div className="flex justify-between items-start mb-2">
      <h4 className="font-semibold text-white truncate pr-2">{lead.name}</h4>
      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0
        ${lead.status === 'new' ? 'bg-blue-500' :
          lead.status === 'contacted' || (lead.status as string) === 'responded' ? 'bg-amber-500' :
            lead.status === 'qualified' ? 'bg-emerald-500' : 'bg-slate-500'
        }`}
      />
    </div>
    <p className="text-xs text-slate-400 mb-3 truncate">{lead.email}</p>

    <div className="flex items-center justify-between mt-2 pt-2 border-t border-dark-border/50">
      <span className="text-[10px] text-slate-500 flex items-center gap-1">
        <Calendar size={10} />
        {new Date(lead.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </span>
      <span className="text-[10px] text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded capitalize">
        {lead.utm_source || 'Direto'}
      </span>
    </div>
  </div>
);

export const Pipeline: React.FC = () => {
  const {
    leads,
    stages,
    loading,
    selectedLead, setSelectedLead,
    draggedLeadId,
    isSettingsOpen,
    initialStageId,
    fetchData,
    handleDragStart,
    handleDragOver,
    handleDrop,
    getColumnLeads,
    openSettings,
    closeSettings,
    updateLead,
    removeLead
  } = usePipelineData();

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Pipeline de Vendas</h1>
          <p className="text-slate-400 text-sm">Arraste e solte leads para atualizar o estágio.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-emerald-400">Valor Total do Pipeline</p>
            <p className="text-2xl font-bold text-white">Est. R$ {leads.length * 150}</p>
          </div>
          <button
            onClick={() => openSettings()}
            className="p-3 bg-white/[0.05] border border-white/[0.1] rounded-2xl text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all shadow-lg active:scale-95 group"
            title="Configurar Estágios"
          >
            <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 h-full min-w-[max-content]">
          {stages.map((stage) => {
            const colLeads = getColumnLeads(stage.id);
            return (
              <div
                key={stage.id}
                className="flex-1 flex flex-col min-w-[280px] w-[300px] bg-dark-bg/30 rounded-xl border border-dashed border-dark-border/50"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className={`p-4 border-b-2 ${stage.color || 'border-blue-500/50'} bg-dark-card/50 rounded-t-xl flex justify-between items-center group/col`}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-200">{stage.name}</h3>
                    <button
                      onClick={() => openSettings(stage.id)}
                      className="p-1 text-slate-600 hover:text-emerald-400 transition-colors opacity-0 group-hover/col:opacity-100"
                      title="Editar Estágio"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                  <span className="bg-dark-bg text-slate-400 text-xs px-2 py-1 rounded-full border border-dark-border">
                    {colLeads.length}
                  </span>
                </div>

                <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
                  {loading ? (
                    <div className="flex justify-center py-4"><Loader2 className="animate-spin text-slate-500" /></div>
                  ) : (
                    colLeads.map(lead => (
                      <KanbanCard
                        key={lead.id}
                        lead={lead}
                        isDragging={draggedLeadId === lead.id}
                        onDragStart={handleDragStart}
                        onClick={setSelectedLead}
                      />
                    ))
                  )}
                  {colLeads.length === 0 && !loading && (
                    <div className="text-center py-8 border-2 border-dashed border-dark-border rounded-lg m-2">
                      <p className="text-slate-600 text-sm">Nenhum lead</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={updateLead}
          onDelete={removeLead}
        />
      )}
      {/* Settings Modal */}
      {isSettingsOpen && (
        <PipelineSettingsModal
          onClose={closeSettings}
          onUpdate={fetchData}
          initialStageId={initialStageId}
        />
      )}
    </div>
  );
};
