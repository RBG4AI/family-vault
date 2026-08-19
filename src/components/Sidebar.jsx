import React, { useEffect, useRef, useState } from 'react';
import {
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
  Building2,
  HeartPulse,
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';

const Sidebar = ({ activeSection, setActiveSection, onLock, vaultName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();
  const asideRef = useRef(null);
  const closeSidebar = () => setIsOpen(false);

  useEffect(() => {
    const node = asideRef.current;
    if (!node) return undefined;
    const mq = window.matchMedia('(min-width: 768px)');
    const apply = () => {
      if (mq.matches || isOpen) node.removeAttribute('inert');
      else node.setAttribute('inert', '');
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [isOpen]);

  const goHome = () => {
    setActiveSection('dashboard');
    closeSidebar();
  };

  const groups = [
    {
      label: t('nav.family'),
      items: [
        { id: 'people', label: t('nav.people'), icon: Users },
        { id: 'vitals', label: t('nav.vitals'), icon: HeartPulse },
        { id: 'vehicles', label: t('nav.vehicles'), icon: Car },
        { id: 'properties', label: t('nav.properties'), icon: Building2 },
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
        className={`md:hidden fixed top-4 left-4 z-[60] p-3 glass-panel rounded-2xl text-white print:hidden ${isOpen ? 'hidden' : ''}`}
        aria-label={t('nav.openMenu')}
      >
        <Menu className="w-6 h-6" />
      </button>

      <button
        type="button"
        onClick={goHome}
        className={`fixed top-4 right-4 z-[60] flex items-center gap-2 p-3 md:px-4 glass-panel rounded-2xl text-white print:hidden ${
          isOpen ? 'hidden' : ''
        } ${activeSection === 'dashboard' ? 'bg-white/15' : ''}`}
        aria-label={t('nav.goHome')}
      >
        <Home className="w-5 h-5" />
        <span className="hidden md:inline text-sm font-medium">{t('nav.dashboard')}</span>
      </button>

      {isOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={closeSidebar} />}

      <aside
        ref={asideRef}
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
              <h1 className="text-base font-semibold text-white truncate">{vaultName || t('nav.vault')}</h1>
              <p className="text-[11px] text-cyan-200/60 tracking-wide">{t('nav.onDevice')}</p>
            </div>
          </div>
          <button type="button" onClick={closeSidebar} className="md:hidden p-2 text-gray-400" aria-label={t('nav.closeMenu')}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={goHome}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
              activeSection === 'dashboard'
                ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                : 'text-white/45 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home size={16} />
            <span>{t('nav.dashboard')}</span>
          </button>
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
