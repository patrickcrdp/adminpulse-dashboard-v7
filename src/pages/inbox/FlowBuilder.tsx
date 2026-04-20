import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Handle,
  Position,
  Connection,
  Edge,
  BackgroundVariant,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Play, Bot, MessageSquare, FileText, Image as ImageIcon, Video, Mic, MapPin, 
  List, Settings, Type, Link as LinkIcon, Database, Loader2, GitMerge, X, 
  Target, GitCommit, Tag, UserRound, Ban, Briefcase, Calendar, Pointer, 
  Users, ClipboardList, Clock, Phone, Trash2, Plus, 
  Layers, MoreVertical, PlusCircle, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { InboxFacade } from '../../services/inboxFacade';

const AVAILABLE_ACTIONS = [
  { id: 'msg', icon: MessageSquare, title: 'Mensagem' },
  { id: 'file', icon: FileText, title: 'Arquivo' },
  { id: 'conn', icon: GitMerge, title: 'Conexão' },
  { id: 'cond', icon: GitCommit, title: 'Condição' },
  { id: 'delay', icon: Loader2, title: 'Aguardar' },
  { id: 'config', icon: Settings, title: 'Configurações' },
  { id: 'tag', icon: Tag, title: 'Etiqueta' },
  { id: 'contact', icon: UserRound, title: 'Contato' },
  { id: 'ban', icon: Ban, title: 'Bloquear' },
  { id: 'api1', icon: Database, title: 'API/Banco' },
  { id: 'api2', icon: Database, title: 'Webhook' },
  { id: 'ai', icon: Bot, title: 'Inteligência Artificial' },
  { id: 'business', icon: Briefcase, title: 'Negócios' },
  { id: 'calendar', icon: Calendar, title: 'Agenda' },
  { id: 'click', icon: Pointer, title: 'Botão' },
  { id: 'split', icon: Users, title: 'Distribuir' },
  { id: 'id', icon: UserRound, title: 'Identificação' },
  { id: 'map', icon: MapPin, title: 'Localização' },
  { id: 'note', icon: ClipboardList, title: 'Nota' },
  { id: 'video', icon: Video, title: 'Vídeo' },
  { id: 'clock', icon: Clock, title: 'Horário de Func.' },
  { id: 'tag2', icon: Tag, title: 'Tag Personalizada' },
  { id: 'msg2', icon: MessageSquare, title: 'Resposta Rápida' },
  { id: 'phone', icon: Phone, title: 'Ligar' },
  { id: 'doc', icon: FileText, title: 'Documento' }
];

// ------ CUSTOM NODE DESIGN ------
const CustomNode = ({ id, data, selected, positionAbsoluteX, positionAbsoluteY }: any) => {
  const { setNodes, setEdges, getNode } = useReactFlow();

  const handleCreateAssociatedNode = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentNode = getNode(id);
    const baseX = currentNode?.position?.x || positionAbsoluteX || 0;
    const baseY = currentNode?.position?.y || positionAbsoluteY || 0;

    const newId = `node_${Math.random().toString(36).substr(2, 9)}`;
    const newNode = {
      id: newId,
      type: 'custom',
      position: { x: baseX, y: baseY + 150 }, 
      data: { label: 'Nova Etapa', icon: 'Bot', actions: [] },
    };
    
    const newEdge = {
        id: `e${id}-${newId}`,
        source: id,
        target: newId,
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 }
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge as any]);
  };

  return (
    <div className={`relative bg-white rounded-xl shadow-lg border-2 w-[220px] transition-all ${selected ? 'border-primary-500 shadow-primary-500/20' : 'border-slate-200'} `}>
      <button 
        onClick={handleCreateAssociatedNode}
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-slate-200 hover:border-primary-500 text-slate-400 hover:text-primary-600 rounded-full flex items-center justify-center shadow-md z-10 transition-colors"
      >
        <Plus size={14} strokeWidth={3} />
      </button>

      {data.isStart !== true && (
        <Handle type="target" position={Position.Top} className="w-3 h-3 bg-primary-500 border-2 border-white" />
      )}
      
      <div className="flex items-center gap-3 p-4">
        <div className={`p-2 rounded-lg ${data.isStart ? 'bg-primary-50 text-primary-600' : 'bg-slate-50 text-slate-600'}`}>
           {data.icon === 'Play' ? <Play size={16} className="fill-primary-600" /> : <Bot size={16} />}
        </div>
        <div className="flex-1">
          <p className="font-bold text-slate-700 text-sm">{data.label}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary-500 border-2 border-white opacity-0" />
    </div>
  );
};

export const FlowBuilder: React.FC = () => {
  const { organization } = useAuth();
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const defaultInitialNodes = [
    { id: '1', type: 'custom', position: { x: 250, y: 100 }, data: { label: 'Inicio', icon: 'Play', isStart: true, actions: [] } },
    { id: '2', type: 'custom', position: { x: 250, y: 300 }, data: { label: 'Boas vindas!', icon: 'Bot', actions: [] } },
  ];
  const defaultInitialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  ];

  const [flows, setFlows] = useState<any[]>([]);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [activeFlowName, setActiveFlowName] = useState<string>('Fluxo Lógico Padrão');
  const [loadingFlows, setLoadingFlows] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState(defaultInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultInitialEdges);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  // Load Flows from Database
  useEffect(() => {
    const loadAllFlows = async () => {
      if (!organization?.id) return;
      try {
        const data = await InboxFacade.fetchChatFlows(organization.id);
        if (data && data.length > 0) {
            setFlows(data);
            setActiveFlowId(data[0].id);
            setActiveFlowName(data[0].name);
            setNodes(data[0].nodes || defaultInitialNodes);
            setEdges(data[0].edges || defaultInitialEdges);
        } else {
            // First time - create temp layout
            const tempId = `temp_${Date.now()}`;
            const firstFlow = { id: tempId, name: 'Fluxo Novo', nodes: defaultInitialNodes, edges: defaultInitialEdges };
            setFlows([firstFlow]);
            setActiveFlowId(tempId);
            setActiveFlowName('Fluxo Novo');
        }
      } catch (err) {
        console.error("Falha ao carregar Flows", err);
      } finally {
        setLoadingFlows(false);
      }
    };
    loadAllFlows();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?.id]);


  // Switch active flow
  const handleSelectFlow = (id: string) => {
     const flow = flows.find(f => f.id === id);
     if (flow) {
         setSelectedNode(null); // fechar properties se abertas
         setActiveFlowId(flow.id);
         setActiveFlowName(flow.name);
         setNodes(flow.nodes && flow.nodes.length > 0 ? flow.nodes : defaultInitialNodes);
         setEdges(flow.edges || []);
     }
  };

  // Create new UI flow (not yet saved to DB)
  const handleCreateNewFlow = () => {
      setSelectedNode(null);
      const tempId = `temp_${Date.now()}`;
      const newFlow = { id: tempId, name: 'Novo Fluxo sem nome', nodes: defaultInitialNodes, edges: defaultInitialEdges };
      setFlows([...flows, newFlow]);
      setActiveFlowId(tempId);
      setActiveFlowName(newFlow.name);
      setNodes(defaultInitialNodes);
      setEdges(defaultInitialEdges);
  };

  // Save Flow
  const handleSaveFlow = async () => {
      if (!organization?.id || !activeFlowId) return;
      setIsSaving(true);
      try {
          const result = await InboxFacade.saveChatFlow({
              id: activeFlowId,
              organization_id: organization.id,
              name: activeFlowName,
              nodes: nodes,
              edges: edges,
              is_active: true
          });
          
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2000);

          // Update local ID if it was temp
          if (activeFlowId.startsWith('temp_') && result?.id) {
              setFlows(prev => prev.map(f => f.id === activeFlowId ? { ...f, id: result.id, name: activeFlowName, nodes, edges } : f));
              setActiveFlowId(result.id);
          } else {
              setFlows(prev => prev.map(f => f.id === activeFlowId ? { ...f, name: activeFlowName, nodes, edges } : f));
          }
      } catch (err) {
          console.error("Erro ao salvar fluxo", err);
          alert("Ocorreu um erro ao salvar seu fluxo de decisões");
      } finally {
          setIsSaving(false);
      }
  };

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(({ ...params, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } } as any), eds)),
    [setEdges],
  );

  const onNodeClick = (event: React.MouseEvent, node: any) => {
    setSelectedNode(node);
  };

  const handlePaneClick = () => {
    setSelectedNode(null);
  };

  const updateNodeLabel = (val: string) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          n.data = { ...n.data, label: val };
        }
        return n;
      })
    );
    setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, label: val }});
  };

  const addActionToNode = (actionType: any) => {
    if (!selectedNode) return;
    const updatedNodeData = {
      ...selectedNode.data,
      actions: [...(selectedNode.data.actions || []), actionType]
    };
    setNodes((nds) =>
      nds.map((n) => (n.id === selectedNode.id ? { ...n, data: updatedNodeData } : n))
    );
    setSelectedNode({ ...selectedNode, data: updatedNodeData });
  };
  
  const removeActionFromNode = (indexToRemove: number) => {
    if (!selectedNode) return;
    const updatedActions = (selectedNode.data.actions || []).filter((_: any, i: number) => i !== indexToRemove);
    const updatedNodeData = { ...selectedNode.data, actions: updatedActions };
    setNodes((nds) =>
      nds.map((n) => (n.id === selectedNode.id ? { ...n, data: updatedNodeData } : n))
    );
    setSelectedNode({ ...selectedNode, data: updatedNodeData });
  };

  if (loadingFlows) {
      return <div className="h-[calc(100vh-8rem)] flex items-center justify-center text-slate-400"><Loader2 className="animate-spin mr-2" /> Carregando arquitetura neural...</div>
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 animate-in fade-in duration-500 pb-10">
        
       {/* Left Sidebar - Flow Directory (n8n inspired) */}
       <div className="w-64 bg-white border border-slate-200/50 rounded-3xl shadow-xl flex flex-col overflow-hidden shrink-0">
           <div className="p-5 border-b border-slate-100 bg-slate-50/50">
               <div className="flex items-center gap-2 text-primary-600 font-bold mb-1">
                   <Layers size={18} />
                   <span>Seus Fluxos</span>
               </div>
               <p className="text-[11px] text-slate-500 leading-tight">Organize múltiplas jornadas de atendimento.</p>
           </div>
           
           <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
               {flows.map(flow => (
                   <button 
                      key={flow.id}
                      onClick={() => handleSelectFlow(flow.id)}
                      className={`w-full text-left p-3 rounded-xl flex items-center justify-between group transition-all
                          ${activeFlowId === flow.id ? 'bg-primary-50 text-primary-700 border border-primary-100' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-800 border border-transparent'}
                      `}
                   >
                       <span className="font-semibold text-sm truncate">{flow.name}</span>
                       <MoreVertical size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                   </button>
               ))}
           </div>

           <div className="p-4 border-t border-slate-100 bg-white">
               <button 
                  onClick={handleCreateNewFlow}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl transition-colors"
               >
                  <PlusCircle size={16} /> Novo Fluxo
               </button>
           </div>
       </div>

       {/* Main Editor Space */}
       <div className="flex-1 bg-slate-50 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 relative flex flex-col">
          
          {/* Top action bar of the Active Flow */}
          <div className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-10 flex items-center justify-between px-6 shrink-0">
             <div className="flex items-center gap-3">
                 <div className="bg-primary-500 text-white p-2 rounded-lg"><GitMerge size={20} /></div>
                 <div>
                    <input 
                       className="text-lg font-bold text-slate-800 leading-tight focus:outline-none focus:border-b focus:border-primary-500 bg-transparent"
                       value={activeFlowName}
                       onChange={(e) => setActiveFlowName(e.target.value)}
                       placeholder="Nome do Fluxo..."
                    />
                    <p className="text-xs text-slate-500">Interface de edição</p>
                 </div>
             </div>
             <div className="flex gap-3">
                <button 
                   onClick={handleSaveFlow}
                   disabled={isSaving}
                   className="px-6 py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-70 flex items-center gap-2"
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : (saveSuccess ? <CheckCircle2 size={16} /> : <Target size={16} />)}
                    {isSaving ? 'Salvando...' : (saveSuccess ? 'Salvo!' : 'Salvar Regras')}
                </button>
             </div>
          </div>

          {/* The React Flow Canvas */}
          <div className="flex-1 relative">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={handlePaneClick}
                nodeTypes={nodeTypes}
                fitView
              >
                <Controls className="bg-white border-slate-200 shadow-md" />
                <MiniMap className="bg-white border-slate-200 rounded-xl overflow-hidden shadow-md" />
                <Background 
                  variant={BackgroundVariant.Dots} 
                  gap={24} 
                  size={2} 
                  color="#cbd5e1"
                />
              </ReactFlow>

              {/* Slide-in Sidebar Editor */}
              <div className={`absolute top-0 right-0 bottom-0 w-[400px] bg-white border-l border-slate-200 shadow-2xl transform transition-transform duration-300 ease-in-out z-20 flex flex-col ${selectedNode ? 'translate-x-0' : 'translate-x-full'}`}>
                 {selectedNode && (
                     <>
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-800">{selectedNode.data.label}</h3>
                            <button onClick={handlePaneClick} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Nome da Etapa</label>
                                    <input 
                                        type="text" 
                                        value={selectedNode.data.label}
                                        onChange={(e) => updateNodeLabel(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium"
                                    />
                                </div>

                                <div className="flex border-b border-slate-200">
                                    <button className="px-4 py-3 border-b-2 border-primary-500 text-primary-600 font-bold text-sm">INTERAÇÕES</button>
                                    <button className="px-4 py-3 text-slate-500 font-medium text-sm hover:text-slate-800 transition-colors">CONDIÇÕES</button>
                                </div>

                                <div>
                                     <p className="text-xs text-slate-400 mb-3 font-medium">Adicione ações que este bloco executará:</p>
                                     <div className="grid grid-cols-8 gap-2">
                                        {AVAILABLE_ACTIONS.map((act, index) => {
                                          const Icon = act.icon;
                                          return (
                                            <button 
                                              key={index}
                                              onClick={() => addActionToNode(act)}
                                              className={`p-2 border rounded-xl transition-colors flex items-center justify-center
                                                ${act.id === 'ai' ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-600' : 'bg-slate-100/80 hover:bg-slate-200 border-slate-200 text-slate-600'}
                                              `} 
                                              title={act.title}
                                            >
                                              <Icon size={16} />
                                            </button>
                                          );
                                        })}
                                     </div>
                                </div>

                                {/* Node Actions List */}
                                {(selectedNode.data.actions && selectedNode.data.actions.length > 0) && (
                                    <div className="space-y-2 mt-6 pt-6 border-t border-slate-100">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fluxo de Ações Desta Etapa</p>
                                        {selectedNode.data.actions.map((act: any, index: number) => {
                                           const Icon = act.icon;
                                           return (
                                               <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm group">
                                                  <div className="flex items-center gap-3">
                                                      <div className={`p-2 rounded-lg ${act.id === 'ai' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                                                          <Icon size={16} />
                                                      </div>
                                                      <span className="text-sm font-semibold text-slate-700">{act.title}</span>
                                                  </div>
                                                  <button 
                                                      onClick={() => removeActionFromNode(index)}
                                                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                  >
                                                      <Trash2 size={14} />
                                                  </button>
                                               </div>
                                           );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                     </>
                 )}
              </div>
          </div>
       </div>
    </div>
  );
};
