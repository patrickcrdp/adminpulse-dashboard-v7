import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Kanban,
  Crown,
  UserPlus,
  Calendar,
  BarChart3,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { FloatingGuideButton } from './FloatingGuideButton';
import { OnboardingTour } from './OnboardingTour';
import { AddMemberModal } from './AddMemberModal';
import { NotificationBell } from './NotificationBell';
import { Target, Megaphone, PenTool, Image as ImageIcon, ChevronDown, MessageSquare, Zap, Bot } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, profile, organization, userRole, loading, signOut } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = React.useState(false);

  console.log('[Layout] Rendering layout. loading=', loading, 'user_id=', user?.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Carregando Aplicação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const navGroups = [
    {
      title: 'Principal',
      items: [
        { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
        { label: 'Pipeline', icon: <Kanban size={20} />, path: '/pipeline' },
        { label: 'Leads', icon: <Users size={20} />, path: '/leads' },
      ]
    },
    {
      title: 'Atendimento',
      items: [
        { label: 'Chat Unificado', icon: <MessageSquare size={20} />, path: '/inbox' },
        { label: 'Integrações', icon: <Zap size={20} />, path: '/inbox/integrations' },
        { label: 'Automação (IA)', icon: <Bot size={20} />, path: '/inbox/automation' },
      ]
    },
    {
      title: 'Marketing',
      items: [
        { label: 'Tráfego Pago', icon: <Megaphone size={20} />, path: '/marketing/traffic' },
        { label: 'Planejamento', icon: <PenTool size={20} />, path: '/marketing/planning' },
        { label: 'Criativos', icon: <ImageIcon size={20} />, path: '/marketing/creatives' },
      ]
    },
    {
      title: 'Gestão',
      items: [
        { label: 'Calendário', icon: <Calendar size={20} />, path: '/calendar' },
        { label: 'Relatórios', icon: <BarChart3 size={20} />, path: '/reports' },
        { label: 'Planos', icon: <Crown size={20} />, path: '/plans' },
        { label: 'Configurações', icon: <Settings size={20} />, path: '/settings' },
      ]
    }
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-dark-bg flex font-sans text-slate-200">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30 bg-[#0d1325] border-r border-white/5 transform transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'w-[88px]' : 'w-72'}
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col shadow-2xl relative">
          {/* Toggle Button Desktop */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex absolute -right-3 top-12 w-6 h-6 bg-primary-500 rounded-full items-center justify-center text-white border border-white/10 shadow-lg hover:scale-110 active:scale-95 transition-all z-40"
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Logo Section */}
          <div className={`pt-10 pb-8 px-6 flex flex-col items-center gap-4 transition-all duration-300 ${isSidebarCollapsed ? 'px-2' : ''}`}>
            <div className="relative group w-full flex justify-center">
              <div className="transition-all">
                {organization?.logo_url ? (
                  <div className={`p-3 bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-inner backdrop-blur-md transition-all ${isSidebarCollapsed ? 'p-1' : ''}`}>
                    <img
                      src={organization.logo_url}
                      alt="Logo"
                      className={`object-contain filter drop-shadow-2xl transition-all duration-500 group-hover:scale-105 ${isSidebarCollapsed ? 'w-8 h-8' : 'max-w-[140px] h-16'}`}
                    />
                  </div>
                ) : (
                  <div className={`flex items-center gap-3 bg-primary-500/10 rounded-2xl border border-primary-500/20 transition-all ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
                    <ShieldCheck className="w-8 h-8 text-primary-400" />
                    {!isSidebarCollapsed && <span className="text-xl font-bold text-white tracking-tight">AdminPulse</span>}
                  </div>
                )}
              </div>
            </div>
            {!isSidebarCollapsed && organization?.name && (
              <div className="flex flex-col items-center animate-in fade-in duration-500">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center">
                  {organization.name}
                </span>
                <div className="h-[2px] w-8 bg-primary-500/30 mt-2 rounded-full"></div>
              </div>
            )}
          </div>

          <div className="px-6 mb-6">
            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"></div>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 space-y-6 overflow-y-auto custom-scrollbar transition-all ${isSidebarCollapsed ? 'px-3' : 'px-4'}`}>
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1.5">
                {!isSidebarCollapsed && (
                  <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 mt-2">
                    {group.title}
                  </h3>
                )}
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      id={`nav-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => setIsSidebarOpen(false)}
                      title={isSidebarCollapsed ? item.label : ''}
                      className={`
                        flex items-center rounded-xl transition-all duration-300 group
                        ${isSidebarCollapsed ? 'justify-center py-4 px-0' : 'px-4 py-3'}
                        ${isActive
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25 font-semibold'
                          : 'text-slate-400 hover:bg-white/[0.03] hover:text-white'
                        }
                      `}
                    >
                      <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-primary-400'}`}>
                        {item.icon}
                      </span>
                      {!isSidebarCollapsed && <span className="ml-3 text-sm animate-in slide-in-from-left-2">{item.label}</span>}
                      {isActive && !isSidebarCollapsed && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                      )}
                    </Link>
                  );
                })}
                {isSidebarCollapsed && <div className="h-px bg-white/5 mx-2 my-4" />}
              </div>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className={`mt-auto transition-all ${isSidebarCollapsed ? 'p-2' : 'p-6'}`}>
            <div className={`rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm transition-all ${isSidebarCollapsed ? 'p-2 flex flex-col items-center gap-4' : 'p-4'}`}>
              <div className={`flex items-center ${isSidebarCollapsed ? 'mb-0' : 'mb-5'}`}>
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-lg overflow-hidden border border-white/10">
                    <span className="w-full h-full flex items-center justify-center">
                      {profile?.avatar_url
                        ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        : <span>{profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}</span>
                      }
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0d1325] rounded-full"></div>
                </div>
                {!isSidebarCollapsed && (
                  <div className="ml-3 overflow-hidden animate-in fade-in">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white truncate">
                        {profile?.full_name || user?.email || 'Usuário'}
                        </p>
                        {userRole && (
                            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${userRole === 'admin' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                                {userRole === 'admin' ? 'Admin' : 'Atend.'}
                            </span>
                        )}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate uppercase tracking-widest font-bold opacity-70">
                      {organization?.name || 'Workspace'}
                    </p>
                  </div>
                )}
              </div>

              {!isSidebarCollapsed && (
                <div className="space-y-1 animate-in slide-in-from-bottom-2">
                  <Link
                    to="/settings"
                    className="w-full flex items-center px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  >
                    <Settings size={14} className="mr-3" />
                    Privacidade & Perfil
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg transition-all"
                  >
                    <LogOut size={14} className="mr-3" />
                    Sair da Conta
                  </button>
                </div>
              )}
              {isSidebarCollapsed && (
                <button
                  onClick={handleSignOut}
                  title="Sair da Conta"
                  className="p-2 text-slate-500 hover:text-rose-400 bg-white/5 rounded-xl"
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header - Desktop & Mobile */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-dark-bg/40 backdrop-blur-xl border-b border-white/[0.04] sticky top-0 z-20">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white p-2 mr-2 bg-white/5 rounded-lg border border-white/5"
            >
              <Menu size={20} />
            </button>
            <span className="lg:hidden text-lg font-bold text-white">AdminPulse</span>
            <div className="hidden lg:block">
              {/* Optional page title or breadcrumbs */}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationBell />
            <div className="hidden sm:block h-6 w-[1px] bg-dark-border mx-1"></div>
            <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-full bg-white/5 border border-white/5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] uppercase tracking-tighter font-bold text-slate-500">Sistema Online</span>
            </div>
          </div>
        </header>

        {/* Page Content - Full Width Optimized */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full h-full">
            {children}
          </div>
        </div>

        {/* Floating Guide Button & Tour */}
        <FloatingGuideButton />
        <OnboardingTour />
        <AddMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
        />
      </main>
    </div>
  );
};