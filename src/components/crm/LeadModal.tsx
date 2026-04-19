import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Lead, Activity } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import {
  X, Mail, Phone, Globe, Calendar, User,
  MessageSquare, PhoneCall, Users, FileText, Send, Clock, Trash2
} from 'lucide-react';

interface LeadModalProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: (lead: Lead) => void;
  onDelete?: (id: string) => void;
  initialTab?: 'details' | 'activity';
}

export const LeadModal: React.FC<LeadModalProps> = ({ lead, onClose, onUpdate, onDelete, initialTab = 'details' }) => {
  const { organization } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>(initialTab);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newNote, setNewNote] = useState('');
  const [activityType, setActivityType] = useState<'note' | 'call' | 'whatsapp' | 'meeting'>('note');
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [sendingNote, setSendingNote] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'activity') {
      fetchActivities();
    }
  }, [activeTab, lead.id]);

  const fetchActivities = async () => {
    setLoadingActivities(true);
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('lead_id', lead.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setActivities(data as Activity[]);
    }
    setLoadingActivities(false);
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    // Organization check removed to allow activity creation even if context is missing

    setSendingNote(true);
    const { data, error } = await supabase
      .from('activities')
      .insert({
        lead_id: lead.id,
        ...(organization?.id && { organization_id: organization.id }),
        activity_type: activityType,
        description: newNote,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (!error && data) {
      setActivities([data as Activity, ...activities]);
      setNewNote('');
    } else {
      console.error("Erro ao criar atividade:", error);
      alert(`Erro ao salvar atividade: ${error?.message || JSON.stringify(error)}`);
    }
    setSendingNote(false);
  };

  const updateStatus = async (newStatus: Lead['status']) => {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', lead.id);

    if (!error) {
      onUpdate({ ...lead, status: newStatus });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmation) {
      setDeleteConfirmation(true);
      return;
    }

    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', lead.id);

      if (error) throw error;

      if (onDelete) {
        onDelete(lead.id);
      }
      onClose();
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Erro ao excluir lead. Tente novamente.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-dark-card rounded-2xl shadow-2xl w-full max-w-4xl border border-dark-border overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[800px] animate-in fade-in zoom-in duration-200">

        {/* Left Sidebar: Basic Info */}
        <div className="w-full md:w-1/3 bg-dark-bg/50 border-r border-dark-border p-6 flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">{lead.name}</h2>
            <div className="flex items-center gap-2 mb-4">
              <Badge status={lead.status} />
              <span className="text-xs text-slate-500">Adicionado em {new Date(lead.created_at).toLocaleDateString()}</span>
            </div>

            <div className="space-y-2 mb-6">
              <select
                value={lead.status}
                onChange={(e) => updateStatus(e.target.value as any)}
                className="w-full bg-dark-card border border-dark-border text-white text-sm rounded-lg p-2.5 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="new">Novo Lead</option>
                <option value="contacted">Em Contato</option>
                <option value="qualified">Qualificado</option>
                <option value="converted">Convertido</option>
                <option value="lost">Perdido</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 text-sm overflow-y-auto flex-1">
            <div className="flex items-center space-x-3 text-slate-300 p-2 hover:bg-dark-card rounded-lg transition-colors">
              <Mail size={16} className="text-primary-500" />
              <span className="truncate" title={lead.email}>{lead.email}</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-300 p-2 hover:bg-dark-card rounded-lg transition-colors">
              <Phone size={16} className="text-primary-500" />
              <span>{lead.phone || 'No phone'}</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-300 p-2 hover:bg-dark-card rounded-lg transition-colors">
              <Globe size={16} className="text-primary-500" />
              <span className="capitalize">{lead.utm_source || lead.traffic_source || 'Direto'}</span>
            </div>

            <div className="mt-4 p-3 bg-dark-card rounded-lg border border-dark-border">
              <p className="text-xs uppercase font-semibold text-slate-500 mb-2">Mensagem Original</p>
              <p className="text-slate-300 italic whitespace-pre-wrap">{lead.message}</p>
            </div>
          </div>

          {/* Delete Action */}
          <div className="mt-6 pt-6 border-t border-dark-border">
            {!deleteConfirmation ? (
              <button
                onClick={() => setDeleteConfirmation(true)}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                Excluir Lead
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-300 text-center">Tem certeza? Esta ação é irreversível.</p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="flex-1 text-slate-400 hover:text-white"
                    onClick={() => setDeleteConfirmation(false)}
                    disabled={deleteLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none"
                    onClick={handleDelete}
                    isLoading={deleteLoading}
                  >
                    Confirmar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div >

        {/* Right Content: Tabs & Activities */}
        < div className="flex-1 flex flex-col bg-dark-card" >
          <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('details')}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${activeTab === 'details'
                  ? 'border-primary-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
                  }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${activeTab === 'activity'
                  ? 'border-primary-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
                  }`}
              >
                Linha do Tempo
              </button>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-dark-bg/20">
            {activeTab === 'details' ? (
              <div className="text-center text-slate-500 mt-10">
                <User size={48} className="mx-auto mb-4 opacity-20" />
                <p>Campos personalizados adicionais e detalhes estendidos iriam aqui.</p>
                <p className="text-sm mt-2">Mude para <b>Linha do Tempo</b> para gerenciar tarefas.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Activity Input */}
                <div className="bg-dark-card border border-dark-border rounded-xl p-4 shadow-sm">
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setActivityType('note')}
                      className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 ${activityType === 'note' ? 'bg-primary-500/20 text-primary-400' : 'text-slate-400 hover:bg-dark-border'}`}
                    >
                      <FileText size={14} /> Nota
                    </button>
                    <button
                      onClick={() => setActivityType('call')}
                      className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 ${activityType === 'call' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:bg-dark-border'}`}
                    >
                      <PhoneCall size={14} /> Chamada
                    </button>
                    <button
                      onClick={() => setActivityType('meeting')}
                      className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 ${activityType === 'meeting' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:bg-dark-border'}`}
                    >
                      <Users size={14} /> Reunião
                    </button>
                    <button
                      onClick={() => setActivityType('whatsapp')}
                      className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 ${activityType === 'whatsapp' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:bg-dark-border'}`}
                    >
                      <MessageSquare size={14} /> WhatsApp
                    </button>
                  </div>
                  <form onSubmit={handleAddActivity}>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder={`Adicione uma descrição para ${activityType}...`}
                      className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none min-h-[80px]"
                    />
                    <div className="flex justify-end mt-2">
                      <Button type="submit" size="sm" isLoading={sendingNote} icon={<Send size={14} />}>
                        Registrar Atividade
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Timeline */}
                <div className="relative border-l border-dark-border ml-3 space-y-6">
                  {loadingActivities ? (
                    <div className="pl-6 text-sm text-slate-500">Carregando histórico...</div>
                  ) : activities.length === 0 ? (
                    <div className="pl-6 text-sm text-slate-500">Nenhuma atividade registrada.</div>
                  ) : (
                    activities.map((act) => (
                      <div key={act.id} className="relative pl-6">
                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-dark-bg 
                          ${act.activity_type === 'call' ? 'bg-blue-500' :
                            act.activity_type === 'meeting' ? 'bg-purple-500' :
                              act.activity_type === 'whatsapp' ? 'bg-emerald-500' : 'bg-slate-500'
                          }`}
                        />
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
                            {act.activity_type}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(act.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-dark-card border border-dark-border rounded-lg p-3 text-sm text-slate-200 shadow-sm">
                          {act.description}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div >
      </div >
    </div >
  );
};