import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { PipelineStage } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
    X,
    Plus,
    Trash2,
    GripVertical,
    Loader2,
    CheckCircle2,
    AlertCircle,
    LayoutList,
    Edit2,
    Save,
    Calendar,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

interface PipelineSettingsModalProps {
    onClose: () => void;
    onUpdate: () => void;
    initialStageId?: string | null;
}

export const PipelineSettingsModal: React.FC<PipelineSettingsModalProps> = ({ onClose, onUpdate, initialStageId }) => {
    const { organization } = useAuth();
    const [stages, setStages] = useState<PipelineStage[]>([]);
    const [newStageName, setNewStageName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Edit State
    const [editingStageId, setEditingStageId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');

    useEffect(() => {
        fetchStages();
    }, []);

    const fetchStages = async () => {
        if (!organization?.id) return;
        const { data, error } = await supabase
            .from('pipeline_stages')
            .select('*')
            .eq('organization_id', organization.id)
            .order('order_index', { ascending: true });

        if (!error && data) {
            setStages(data);

            // If we have an initialStageId, start editing that stage immediately
            if (initialStageId) {
                const stageToEdit = data.find(s => s.id === initialStageId);
                if (stageToEdit) {
                    handleStartEdit(stageToEdit);
                }
            }
        }
    };

    const handleAddStage = async () => {
        if (!newStageName.trim() || !organization?.id) return;

        setLoading(true);
        setError(null);
        try {
            const newOrder = stages.length;
            const { error: err } = await supabase
                .from('pipeline_stages')
                .insert([{
                    organization_id: organization.id,
                    name: newStageName.trim(),
                    order_index: newOrder,
                    color: 'border-slate-500/50'
                }]);

            if (err) throw err;
            setNewStageName('');
            await fetchStages();
            setSuccess('Estágio adicionado!');
            onUpdate();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStage = async (stageId: string, isSystem: boolean) => {
        if (isSystem) {
            setError('Estágios do sistema não podem ser excluídos.');
            return;
        }

        if (!window.confirm('Tem certeza? Leads neste estágio ficarão sem coluna.')) return;

        setLoading(true);
        try {
            const { error: err } = await supabase
                .from('pipeline_stages')
                .delete()
                .eq('id', stageId);

            if (err) throw err;
            await fetchStages();
            onUpdate();
            setSuccess('Estágio removido.');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStartEdit = (stage: PipelineStage) => {
        setEditingStageId(stage.id);
        setEditName(stage.name);
        setEditDescription(stage.description || '');
    };

    const handleSaveEdit = async (stageId: string) => {
        if (!editName.trim()) return;

        setLoading(true);
        try {
            const { error: err } = await supabase
                .from('pipeline_stages')
                .update({
                    name: editName.trim(),
                    description: editDescription.trim(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', stageId);

            if (err) throw err;
            setEditingStageId(null);
            await fetchStages();
            onUpdate();
            setSuccess('Estágio atualizado!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-dark-bg border border-dark-border rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-white/[0.05] bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                            <LayoutList size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Configurar Funil</h2>
                            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Gerencie suas colunas</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-xl hover:bg-white/10">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Messages */}
                    {(success || error) && (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 border text-sm ${success ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                            }`}>
                            {success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            <span>{success || error}</span>
                        </div>
                    )}

                    {/* Add Stage */}
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={newStageName}
                            onChange={(e) => setNewStageName(e.target.value)}
                            placeholder="Nome da nova coluna..."
                            className="flex-1 bg-slate-900/50 border border-white/[0.05] rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                        />
                        <button
                            onClick={handleAddStage}
                            disabled={loading || !newStageName.trim()}
                            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-8 rounded-2xl font-bold transition-all flex items-center gap-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                            Adicionar
                        </button>
                    </div>

                    {/* Stages List */}
                    <div className="space-y-4">
                        {stages.map((stage) => {
                            const isEditing = editingStageId === stage.id;

                            return (
                                <div
                                    key={stage.id}
                                    className={`bg-white/[0.02] border rounded-3xl transition-all overflow-hidden ${isEditing ? 'border-emerald-500/30 ring-1 ring-emerald-500/20' : 'border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.03]'
                                        }`}
                                >
                                    <div className="p-5 flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <GripVertical size={18} className="text-slate-600" />
                                            <div className={`w-3 h-3 rounded-full ${stage.color.replace('border-', 'bg-').split('/')[0]}`} />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-200">{stage.name}</span>
                                                {stage.description && !isEditing && (
                                                    <span className="text-[10px] text-slate-500 mt-0.5 max-w-[300px] truncate">{stage.description}</span>
                                                )}
                                            </div>
                                            {stage.is_system && (
                                                <span className="text-[8px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter ml-2">Sistema</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {!isEditing && (
                                                <>
                                                    <button
                                                        onClick={() => handleStartEdit(stage)}
                                                        className="p-2 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-xl opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    {!stage.is_system && (
                                                        <button
                                                            onClick={() => handleDeleteStage(stage.id, stage.is_system)}
                                                            className="p-2 text-slate-500 hover:text-rose-400 transition-colors bg-white/5 rounded-xl opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="p-6 border-t border-white/[0.05] bg-black/20 space-y-6 animate-in slide-in-from-top-4 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Estágio</label>
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="w-full bg-slate-900 border border-white/[0.05] rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex justify-between">
                                                        <span>Data de Criação</span>
                                                        <span className="text-slate-600 flex items-center gap-1 font-bold">
                                                            <Calendar size={10} />
                                                            {new Date(stage.created_at).toLocaleDateString()}
                                                        </span>
                                                    </label>
                                                    <div className="w-full bg-slate-900/30 border border-white/[0.02] rounded-2xl px-5 py-4 text-slate-500 text-sm font-medium cursor-not-allowed">
                                                        {new Date(stage.created_at).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descrição / Regra de Negócio</label>
                                                <textarea
                                                    value={editDescription}
                                                    onChange={(e) => setEditDescription(e.target.value)}
                                                    rows={3}
                                                    placeholder="Descreva o que deve ser feito neste estágio..."
                                                    className="w-full bg-slate-900 border border-white/[0.05] rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium resize-none"
                                                />
                                            </div>

                                            <div className="flex justify-end gap-3 pt-2">
                                                <button
                                                    onClick={() => setEditingStageId(null)}
                                                    className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={() => handleSaveEdit(stage.id)}
                                                    disabled={loading || !editName.trim()}
                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
                                                >
                                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                                    Salvar Alterações
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-white/[0.01] border-t border-white/[0.05] text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">As alterações são refletidas instantaneamente no seu Dashboard</p>
                </div>
            </div>
        </div>
    );
};
