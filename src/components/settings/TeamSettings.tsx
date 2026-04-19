import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Settings, Shield, User } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { AddMemberModal } from '../AddMemberModal';

interface Member {
  id: string;
  user_id: string;
  role: 'admin' | 'member';
  profile: {
    full_name: string;
    email: string;
  };
}

export const TeamSettings: React.FC = () => {
    const { organization, userRole } = useAuth();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchMembers = async () => {
        if (!organization) return;
        try {
            const { data, error } = await supabase
                .from('organization_members')
                .select(`
                    id,
                    user_id,
                    role,
                    profile:profiles(full_name, email)
                `)
                .eq('organization_id', organization.id);
            
            if (!error && data) {
                setMembers(data as any);
            }
        } catch (err) {
            console.error('Erro ao buscar membros', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [organization]);

    if (userRole !== 'admin') return null;

    return (
        <div className="group bg-white/[0.02] border border-white/[0.05] rounded-[2rem] overflow-hidden shadow-2xl hover:border-purple-500/30 transition-all duration-500 backdrop-blur-sm mt-10">
            <div className="p-8 border-b border-white/[0.05] bg-white/[0.01] flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform duration-500">
                        <Users size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Equipe e Membros</h2>
                        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Gerencie os acessos do seu Tenant</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95"
                >
                    <UserPlus size={18} />
                    Adicionar Membro
                </button>
            </div>

            <div className="p-10">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {members.map(member => (
                            <div key={member.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:bg-white/[0.04] transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg 
                                        ${member.role === 'admin' ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-800 text-slate-400'}
                                    `}>
                                        {member.profile?.full_name ? member.profile.full_name.charAt(0).toUpperCase() : <User size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-200">
                                            {member.profile?.full_name || 'Usuário Pendente'}
                                        </h4>
                                        <p className="text-xs text-slate-500">{member.profile?.email || 'Aguardando registro...'}</p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest
                                    ${member.role === 'admin' 
                                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                                        : 'bg-slate-800/50 border-slate-700/50 text-slate-400'}
                                `}>
                                    {member.role === 'admin' ? <Shield size={12} /> : <Settings size={12} />}
                                    {member.role === 'admin' ? 'Administrador' : 'Atendente'}
                                </div>
                            </div>
                        ))}
                        {members.length === 0 && (
                            <p className="text-slate-500 text-center py-4 text-sm">Nenhum membro encontrado.</p>
                        )}
                    </div>
                )}
            </div>

            <AddMemberModal 
                isOpen={isAddModalOpen} 
                onClose={() => {
                    setIsAddModalOpen(false);
                    fetchMembers(); // refresh after close
                }} 
            />
        </div>
    );
};
