import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PipelineFacade } from '../services/pipelineFacade';
import { Lead, PipelineStage } from '../types';

export const usePipelineData = () => {
    const { organization } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [stages, setStages] = useState<PipelineStage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [initialStageId, setInitialStageId] = useState<string | null>(null);

    const fetchData = async () => {
        if (!organization?.id) return;
        setLoading(true);
        try {
            const [stagesData, leadsData] = await Promise.all([
                PipelineFacade.fetchStages(organization.id),
                PipelineFacade.fetchLeads(organization.id)
            ]);
            setStages(stagesData);
            setLeads(leadsData);
        } catch (error) {
            console.error("Erro ao carregar dados do pipeline:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organization?.id]);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedLeadId(id);
        e.dataTransfer.setData('leadId', id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, stageId: string) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData('leadId');

        if (!leadId) return;

        // Optimistic Update
        const updatedLeads = leads.map(l =>
            l.id === leadId ? { ...l, pipeline_stage_id: stageId } : l
        );
        setLeads(updatedLeads);
        setDraggedLeadId(null);

        try {
            // Backend Update
            await PipelineFacade.updateLeadStage(leadId, stageId);
        } catch (error) {
            console.error("Failed to update stage", error);
            fetchData(); // Revert on error
        }
    };

    const getColumnLeads = (stageId: string) => {
        return leads.filter(l => l.pipeline_stage_id === stageId);
    };

    const openSettings = (stageId: string | null = null) => {
        setInitialStageId(stageId);
        setIsSettingsOpen(true);
    };

    const closeSettings = () => {
        setIsSettingsOpen(false);
        setInitialStageId(null);
    };
    
    const updateLead = (updated: Lead) => {
        setLeads(leads.map(l => l.id === updated.id ? updated : l));
        setSelectedLead(updated);
    };
    
    const removeLead = (id: string) => {
        setLeads(leads.filter(l => l.id !== id));
        setSelectedLead(null);
    };

    return {
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
    };
};
