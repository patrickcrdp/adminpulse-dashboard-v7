import React, { useState } from 'react';
import { LeadsFacade } from '../../services/leadsFacade';
import { Lead } from '../../types';
import { Button } from '../ui/Button';
import { X, User, Mail, Phone, MessageSquare, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as XLSX from 'xlsx';

interface AddLeadModalProps {
    onClose: () => void;
    onAdd: (lead: Lead) => void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({ onClose, onAdd }) => {
    const { organization, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'manual' | 'import'>('manual');

    // Manual Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        status: 'new',
        message: ''
    });

    // Import State
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importStats, setImportStats] = useState<{ total: number, success: number, failed: number } | null>(null);

    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const mapStatus = (rawStatus: string): string => {
        if (!rawStatus) return 'new';
        const lower = rawStatus.toString().toLowerCase().trim();

        if (lower.includes('novo') || lower === 'new') return 'new';
        if (lower.includes('qualificado') || lower === 'qualified') return 'qualified';
        if (lower.includes('contata') || lower.includes('contact') || lower === 'contacted') return 'contacted';
        if (lower.includes('convert') || lower.includes('ganho') || lower === 'won') return 'converted';
        if (lower.includes('perdid') || lower === 'lost') return 'lost';

        return 'new'; // Default
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImportFile(e.target.files[0]);
            setError(null);
            setImportStats(null);
        }
    };

    const processImport = async () => {
        if (!importFile) return;
        setLoading(true);
        setError(null);

        try {
            const data = await importFile.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                throw new Error("A planilha está vazia.");
            }

            let successCount = 0;
            let failCount = 0;

            for (const row of jsonData) {
                try {
                    // Flexible column mapping (case insensitive search could be better, but simple for now)
                    const name = row['Nome'] || row['Name'] || row['nome'] || 'Sem Nome';
                    const email = row['Email'] || row['E-mail'] || row['email'];
                    const phone = row['Telefone'] || row['Phone'] || row['Celular'] || row['phone'];
                    const rawStatus = row['Status'] || row['Fase'] || row['status'];
                    const message = row['Mensagem'] || row['Message'] || row['Observação'] || '';

                    if (!email && !phone) {
                        console.warn("Skipping row without contact info:", row);
                        failCount++;
                        continue;
                    }

                    const status = mapStatus(rawStatus);

                    await LeadsFacade.insertLead({
                        ...(organization?.id && { organization_id: organization.id }),
                        name,
                        email: email || '',
                        phone: phone || '',
                        status,
                        message,
                        traffic_source: 'Importação',
                        created_at: new Date().toISOString()
                    });
                    successCount++;
                } catch (err) {
                    console.error("Failed to import row", row, err);
                    failCount++;
                }
            }

            setImportStats({ total: jsonData.length, success: successCount, failed: failCount });

            // Refresh dashboard data if at least one succeeded
            if (successCount > 0) {
                // We can't pass a single lead back, but triggering a refresh would be ideal.
                // For now, we simulate adding one dummy lead to trigger refresh or just close.
                onAdd({} as Lead);
            }

        } catch (err: any) {
            setError("Erro ao processar arquivo: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitManual = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Basic Validation
        if (!formData.name.trim()) {
            setError("Nome é obrigatório.");
            return;
        }

        setLoading(true);

        try {
            // 1. Optimistic Update (Immediate Feedback)
            const tempId = `temp-${Date.now()}`;
            const optimisticLead: Lead = {
                id: tempId,
                organization_id: organization?.id || '',
                user_id: user?.id,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                status: 'new',
                message: formData.message,
                traffic_source: 'Manual',
                created_at: new Date().toISOString(),
                // Add default/empty fields required by Lead type if any
            };

            // Update UI immediately
            onAdd(optimisticLead);
            onClose();

            // 2. Perform background server request
            await LeadsFacade.insertLead({
                ...(organization?.id && { organization_id: organization.id }),
                user_id: user?.id,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                status: 'new',
                message: formData.message,
                traffic_source: 'Manual',
                created_at: new Date().toISOString()
            });



        } catch (err: any) {
            console.error("Error adding lead:", err);
            // Since the modal is already closed, we might need a global toast to show error.
            alert("Erro ao salvar lead no servidor (mas exibido localmente): " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
                setImportFile(file);
                setError(null);
                setImportStats(null);
            } else {
                setError("Formato de arquivo inválido. Use .xlsx ou .csv");
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-dark-card rounded-xl shadow-2xl w-full max-w-md border border-dark-border animate-in zoom-in duration-200 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border bg-dark-bg/50">
                    <h2 className="text-lg font-bold text-white">Adicionar Lead</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Organization Warning */}
                {!organization && (
                    <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 text-xs text-amber-400 flex items-center gap-2">
                        <AlertCircle size={14} />
                        <span>Organização não detectada. Tentando reconectar...</span>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-dark-border">
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'manual' ? 'text-primary-400 border-b-2 border-primary-500 bg-primary-500/5' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Registro Manual
                    </button>
                    <button
                        onClick={() => setActiveTab('import')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'import' ? 'text-primary-400 border-b-2 border-primary-500 bg-primary-500/5' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Importar Planilha
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300 flex items-start gap-2">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {activeTab === 'manual' ? (
                        <form onSubmit={handleSubmitManual} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Nome Completo *</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-dark-bg border border-dark-border rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary-500 outline-none"
                                        placeholder="Ex: Carlos Oliveira"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-dark-bg border border-dark-border rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary-500 outline-none"
                                        placeholder="carlos@exemplo.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Telefone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-dark-bg border border-dark-border rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary-500 outline-none"
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Mensagem / Observação</label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full bg-dark-bg border border-dark-border rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary-500 outline-none min-h-[80px] resize-none"
                                        placeholder="Notas iniciais sobre o lead..."
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <Button variant="ghost" className="flex-1" onClick={onClose} type="button">
                                    Cancelar
                                </Button>
                                <Button className="flex-1" type="submit" isLoading={loading} disabled={!organization}>
                                    Salvar Lead
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6 text-center">
                            {!importStats ? (
                                <>
                                    <div
                                        className={`border-2 border-dashed rounded-xl p-8 transition-colors bg-dark-bg/30 ${importFile ? 'border-primary-500/50 bg-primary-500/5' : 'border-dark-border hover:border-primary-500/50'}`}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                    >
                                        <FileSpreadsheet className={`w-12 h-12 mx-auto mb-4 ${importFile ? 'text-primary-400' : 'text-slate-500'}`} />

                                        {importFile ? (
                                            <div className="mb-4">
                                                <p className="text-primary-300 font-medium mb-1 truncate max-w-[200px] mx-auto">{importFile.name}</p>
                                                <p className="text-slate-400 text-sm">1 arquivo selecionado</p>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-slate-300 font-medium mb-1">Arraste sua planilha aqui</p>
                                                <p className="text-slate-500 text-sm mb-4">Suporta arquivos .xlsx ou .csv</p>
                                            </>
                                        )}

                                        <input
                                            type="file"
                                            accept=".xlsx, .xls, .csv"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg cursor-pointer text-sm font-medium transition-colors"
                                        >
                                            <Upload size={16} />
                                            {importFile ? 'Trocar Arquivo' : 'Selecionar Arquivo'}
                                        </label>
                                    </div>

                                    <div className="text-left text-xs text-slate-500 bg-dark-bg p-3 rounded-lg border border-dark-border">
                                        <p className="font-semibold text-slate-400 mb-1">Colunas esperadas:</p>
                                        <p>Nome, Email, Telefone, Status (opcional)</p>
                                        <p className="mt-2 text-slate-600">Status aceitos: Novo, Qualificado, Contatado, Convertido, Perdido.</p>
                                    </div>

                                    <div className="pt-2 flex gap-3">
                                        <Button variant="ghost" className="flex-1" onClick={onClose}>
                                            Cancelar
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            onClick={processImport}
                                            disabled={!importFile}
                                            isLoading={loading}
                                        >
                                            Processar Importação
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="py-4">
                                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-2">Importação Concluída!</h3>
                                    <div className="flex justify-center gap-8 my-6">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-emerald-400">{importStats.success}</p>
                                            <p className="text-xs text-slate-500 uppercase">Sucesso</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-slate-100">{importStats.total}</p>
                                            <p className="text-xs text-slate-500 uppercase">Total</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-red-400">{importStats.failed}</p>
                                            <p className="text-xs text-slate-500 uppercase">Falhas</p>
                                        </div>
                                    </div>
                                    <Button className="w-full" onClick={onClose}>
                                        Fechar e Atualizar
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
