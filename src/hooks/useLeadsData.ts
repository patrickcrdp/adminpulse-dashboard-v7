import { useState, useEffect } from 'react';
import { Lead } from '../types';
import { LeadsFacade } from '../services/leadsFacade';
import { useAuth } from '../context/AuthContext';

export const useLeadsData = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
    const { organization } = useAuth();
    
    const fetchLeads = async () => {
        if (!organization?.id) return;
        setLoading(true);
        try {
            const data = await LeadsFacade.fetchLeads();
            setLeads(data);
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (organization?.id) {
            fetchLeads();
        }
    }, [organization?.id]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Tem certeza que deseja excluir este lead?')) return;

        setActionLoading(id);
        try {
            await LeadsFacade.deleteLead(id);
            setLeads(prev => prev.filter(l => l.id !== id));
            if (selectedLead?.id === id) setSelectedLead(null);
        } catch (error) {
            console.error('Error deleting lead:', error);
            alert('Falha ao excluir lead');
        } finally {
            setActionLoading(null);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        setUpdatingStatusId(id);

        // Optimistic Update
        const previousLeads = [...leads];
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus as any } : l));

        try {
            await LeadsFacade.updateLeadStatus(id, newStatus);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Falha ao atualizar status');
            setLeads(previousLeads); // Revert
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const term = searchTerm.toLowerCase();
        const name = lead.name || '';
        const email = lead.email || '';

        const matchesSearch =
            name.toLowerCase().includes(term) ||
            email.toLowerCase().includes(term) ||
            (lead.phone && lead.phone.includes(searchTerm));

        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleExport = async () => {
        if (filteredLeads.length === 0) {
            alert("Nenhum lead para exportar.");
            return;
        }

        try {
            // Dynamic import to reduce bundle size
            const XLSX = await import('xlsx');

            const exportData = filteredLeads.map(lead => ({
                'Date': new Date(lead.created_at).toLocaleString(),
                'Name': lead.name || 'Unknown',
                'Email': lead.email || 'No Email',
                'Phone': lead.phone || '',
                'Status': lead.status || 'New',
                'Source': lead.utm_source || lead.traffic_source || 'Direct',
                'Message': lead.message || ''
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Leads");

            const dateStr = new Date().toISOString().split('T')[0];
            XLSX.writeFile(wb, `leads_export_${dateStr}.xlsx`);
        } catch (error) {
            console.error('Error exporting leads:', error);
            alert('Falha ao exportar leads');
        }
    };

    const getStatusColorClass = (status: string) => {
        const safeStatus = (status || 'new').toLowerCase();
        const styles: Record<string, string> = {
            new: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
            contacted: "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
            qualified: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
            converted: "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20",
            lost: "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20",
            closed: "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20",
            // Legacy support
            responded: "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
            archived: "bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20"
        };
        return styles[safeStatus] || styles.new;
    };

    return {
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
    };
};
