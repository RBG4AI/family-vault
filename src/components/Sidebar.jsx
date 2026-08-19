import React, { useState } from 'react';
import {
  LayoutDashboard,
  Key,
  CreditCard,
  FileText,
  Shield,
  TrendingUp,
  Settings,
  LogOut,
  Lock,
  Menu,
  X,
  StickyNote,
  Mail,
  Users,
  Car,
  Home,
  HeartPulse,
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';

const Sidebar = ({ activeSection, setActiveSection, onLock, vaultName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();
  const closeSidebar = () => setIsOpen(false);

  const groups = [
    {
      label: t('nav.dashboard'),
      items: [{ id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard }],
    },
    {
      label: t('nav.family'),
      items: [
        { id: 'people', label: t('nav.people'), icon: Users },
        { id: 'vitals', label: t('nav.vitals'), icon: HeartPulse },
        { id: 'vehicles', label: t('nav.vehicles'), icon: Car },
        { id: 'properties', label: t('nav.properties'), icon: Home },
      ],
    },
    {
      label: t('nav.vault'),
      items: [
        { id: 'credentials', label: t('nav.credentials'), icon: Key },
        { id: 'emails', label: t('nav.emails'), icon: Mail },
        { id: 'banking', label: t('nav.banking'), icon: CreditCard },
        { id: 'cards', label: t('nav.cards'), icon: CreditCard },
        { id: 'government', label: t('nav.government'), icon: FileText },
        { id: 'insurance', label: t('nav.insurance'), icon: Shield },
        { id: 'investments', label: t('nav.investments'), icon: TrendingUp },
        { id: 'notes', label: t('nav.notes'), icon: StickyNote },
      ],
    },
    {
      label: t('nav.settings'),
      items: [{ id: 'settings', label: t('nav.settings'), icon: Settings }],
    },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 glass-panel rounded-2xl text-white"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {isOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={closeSidebar} />}

      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative z-50 w-[17rem] h-screen sidebar-shell p-5 flex flex-col transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between mb-8 px-1">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 gradient-primary rounded-2xl flex items-center justify-center shrink-0 glow-primary">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-white truncate">{vaultName || 'Vault'}</h1>
              <p className="text-[11px] text-cyan-200/60 tracking-wide">{t('nav.onDevice')}</p>
            </div>
          </div>
          <button onClick={closeSidebar} className="md:hidden p-2 text-gray-400" aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto pr-1">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.18em] text-white/30">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        closeSidebar();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        isActive
                          ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                          : 'text-white/45 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <button
          onClick={onLock}
          className="mt-3 flex items-center gap-3 px-3 py-2.5 text-white/50 hover:text-rose-300 rounded-xl hover:bg-rose-500/10 text-sm"
        >
          <LogOut size={16} />
          {t('nav.lock')}
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
