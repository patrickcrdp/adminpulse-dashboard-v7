import React from 'react';
import { Lead } from '../types';
import { Button } from '../components/ui/Button';
import { LeadModal } from '../components/crm/LeadModal';
import { AddLeadModal } from '../components/crm/AddLeadModal';
// import * as XLSX from 'xlsx'; // Moved to dynamic import
import {
  Eye,
  Trash2,
  Search,
  Download,
  Filter,
  ChevronDown,
  Plus
} from 'lucide-react';
import { useLeadsData } from '../hooks/useLeadsData';

export const Leads: React.FC = () => {
  const {
    leads,
    setLeads,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedLead,
    setSelectedLead,
    isAddModalOpen,
    setIsAddModalOpen,
    actionLoading,
    updatingStatusId,
    filteredLeads,
    fetchLeads,
    handleDelete,
    handleStatusChange,
    handleExport,
    getStatusColorClass
  } = useLeadsData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Diretório de Leads</h1>
          <p className="text-slate-400 text-sm mt-1">Gerencie, filtre e exporte sua base de leads.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none w-full sm:w-64"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none appearance-none cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="new">Novos</option>
              <option value="contacted">Em Contato</option>
              <option value="qualified">Qualificado</option>
              <option value="converted">Convertido</option>
              <option value="lost">Perdido</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>
          <Button
            variant="secondary"
            onClick={handleExport}
            icon={<Download size={16} />}
            className="whitespace-nowrap"
          >
            Exportar
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus size={16} />}
            className="whitespace-nowrap"
          >
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-border">
            <thead className="bg-dark-bg/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Origem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Contato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    Loading directory...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Nenhum lead encontrado com seus filtros.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-dark-border/30 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{lead.name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-xs text-slate-400 bg-dark-bg px-2 py-1 rounded border border-dark-border w-fit">
                        {lead.utm_source || lead.traffic_source || 'Direct'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">{lead.email || '-'}</div>
                      {lead.phone && <div className="text-xs text-slate-500">{lead.phone}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {/* Inline Status Dropdown */}
                      <div className="relative inline-block">
                        <select
                          value={lead.status}
                          disabled={updatingStatusId === lead.id}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className={`
                            appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-medium border
                            focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-dark-card cursor-pointer
                            transition-colors duration-200
                            ${getStatusColorClass(lead.status)}
                            ${updatingStatusId === lead.id ? 'opacity-50 cursor-wait' : ''}
                          `}
                        >
                          <option value="new" className="bg-dark-card text-slate-300">Novo Lead</option>
                          <option value="contacted" className="bg-dark-card text-slate-300">Em Contato</option>
                          <option value="qualified" className="bg-dark-card text-slate-300">Qualificado</option>
                          <option value="converted" className="bg-dark-card text-slate-300">Convertido</option>
                          <option value="lost" className="bg-dark-card text-slate-300">Perdido</option>
                          <option value="archived" className="bg-dark-card text-slate-300">Arquivado</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-60">
                          {updatingStatusId === lead.id ? (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <ChevronDown size={12} />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        className="p-1.5 h-8 w-8 rounded-full text-slate-400 hover:text-white"
                        onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}
                        title="View Full Details"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        className="p-1.5 h-8 w-8 rounded-full text-red-400 hover:text-red-500"
                        onClick={(e) => handleDelete(lead.id, e)}
                        disabled={actionLoading === lead.id}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRM Modal */}
      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={(updatedLead) => {
            setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l));
            setSelectedLead(updatedLead);
          }}
          onDelete={(id) => {
            setLeads(leads.filter(l => l.id !== id));
            setSelectedLead(null);
          }}
        />
      )}

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <AddLeadModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={(newLead) => {
            if (newLead?.id) {
              setLeads((prev) => [newLead, ...prev]);

              // If it's a real lead (from import) or optimistic (from manual), we leave it.
              // If it's optimistic (temp-id), we might want to fetch real data silently after a bit
              // to ensure we have the real ID for editing.
              if (newLead.id.startsWith('temp-')) {
                setTimeout(() => fetchLeads(), 1000); // Silent refresh to get real ID
              }
            } else {
              fetchLeads();
            }
          }}
        />
      )}
    </div>
  );
};