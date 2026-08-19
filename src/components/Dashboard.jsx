import React, { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Calendar,
  Car,
  CreditCard,
  Download,
  FileText,
  HeartPulse,
  Home,
  Key,
  Mail,
  Printer,
  Shield,
  StickyNote,
  TrendingUp,
  Users,
} from 'lucide-react';
import { storage } from '../utils/storage';
import { collectRenewals } from '../utils/renewals';
import { backupIsStale, getLastBackupAt } from '../utils/devicePrefs';
import { downloadVaultBackup } from '../utils/exportBackup';
import { downloadRenewalsIcs } from '../utils/ics';
import { useI18n } from '../context/I18nContext';
import { useVaultContext } from '../context/VaultContext';
import { optionLabel } from '../utils/telLink';
import StorageDisclaimer from './StorageDisclaimer';
import EmergencyPrint from './EmergencyPrint';
import AccessPrint from './AccessPrint';
import InvestmentOverview from './InvestmentOverview';
import { printSection } from '../utils/printSection';

const REL_TINT = {
  Self: 'from-cyan-400 to-blue-500',
  Spouse: 'from-rose-400 to-fuchsia-500',
  Parent: 'from-amber-400 to-orange-500',
  Child: 'from-emerald-400 to-teal-500',
  Sibling: 'from-violet-400 to-indigo-500',
  Grandparent: 'from-lime-400 to-emerald-600',
  Other: 'from-slate-400 to-slate-600',
};

const Dashboard = ({ onNavigate }) => {
  const { t } = useI18n();
  const vault = useVaultContext();
  const data = storage.get() || {};
  const people = data.people || [];
  const credentials = data.credentials || [];
  const emails = data.emails || [];
  const banking = data.banking || [];
  const cards = data.cards || [];
  const government = data.government || [];
  const insurance = data.insurance || [];
  const investments = data.investments || [];
  const vehicles = data.vehicles || [];
  const properties = data.properties || [];
  const vitals = data.vitals || [];
  const notes = data.notes || [];
  const renewals = collectRenewals(data, people).filter((item) => item.days <= 60);
  const [backupError, setBackupError] = useState('');
  const [, setBackupTick] = useState(0);
  const lastBackup = getLastBackupAt(vault.meta?.id);
  const staleBackup = backupIsStale(vault.meta?.id);

  const stats = [
    { title: t('nav.people'), value: people.length, icon: Users, tint: 'from-cyan-400 to-blue-500', section: 'people' },
    { title: t('nav.credentials'), value: credentials.length, icon: Key, tint: 'from-violet-400 to-fuchsia-500', section: 'credentials' },
    { title: t('nav.emails'), value: emails.length, icon: Mail, tint: 'from-sky-400 to-indigo-500', section: 'emails' },
    { title: t('nav.banking'), value: banking.length, icon: CreditCard, tint: 'from-emerald-400 to-teal-500', section: 'banking' },
    { title: t('nav.cards'), value: cards.length, icon: CreditCard, tint: 'from-amber-400 to-rose-500', section: 'cards' },
    { title: t('nav.government'), value: government.length, icon: FileText, tint: 'from-orange-400 to-amber-500', section: 'government' },
    { title: t('nav.insurance'), value: insurance.length, icon: Shield, tint: 'from-rose-400 to-red-500', section: 'insurance' },
    { title: t('nav.investments'), value: investments.length, icon: TrendingUp, tint: 'from-lime-400 to-emerald-600', section: 'investments' },
    { title: t('nav.vehicles'), value: vehicles.length, icon: Car, tint: 'from-sky-400 to-indigo-500', section: 'vehicles' },
    { title: t('nav.properties'), value: properties.length, icon: Home, tint: 'from-amber-400 to-orange-500', section: 'properties' },
    { title: t('nav.vitals'), value: vitals.length, icon: HeartPulse, tint: 'from-pink-400 to-rose-500', section: 'vitals' },
    { title: t('nav.notes'), value: notes.length, icon: StickyNote, tint: 'from-yellow-400 to-amber-500', section: 'notes' },
    { title: t('dash.attention'), value: renewals.length, icon: AlertTriangle, tint: 'from-amber-400 to-orange-500' },
  ];

  const handleBackup = async () => {
    try {
      await downloadVaultBackup(vault);
      setBackupError('');
      setBackupTick((n) => n + 1);
    } catch {
      setBackupError(t('common.saveFailed'));
    }
  };

  return (
    <>
    <div className="px-4 pt-20 pb-4 md:p-8 md:pt-24 space-y-5 md:space-y-6 print:hidden print-hide">
      <div>
        <p className="text-[10px] md:text-xs tracking-[0.22em] uppercase text-cyan-300/70 mb-1">{t('dash.eyebrow')}</p>
        <h1 className="font-display text-2xl md:text-5xl text-white leading-tight">{t('dash.title')}</h1>
        <p className="hidden md:block text-white/45 mt-3 max-w-xl">{t('dash.subtitle')}</p>
      </div>

      {staleBackup && (
        <div className="rounded-2xl md:rounded-3xl p-4 md:p-5 bg-gradient-to-br from-amber-400/20 to-orange-500/10 border border-amber-400/25 space-y-3">
          <p className="text-white font-medium">{t('dash.backupTitle')}</p>
          <p className="text-white/50 text-sm">
            {lastBackup ? t('dash.backupStale') : t('dash.backupNever')}
          </p>
          <button type="button" onClick={handleBackup} className="btn-primary">
            <Download size={16} /> {t('settings.export')}
          </button>
          {backupError && <p className="text-rose-300 text-sm">{backupError}</p>}
        </div>
      )}

      {people.length === 0 && (
        <div className="glass-panel rounded-2xl md:rounded-3xl p-6 md:p-8 text-center space-y-3">
          <Users className="w-10 h-10 text-white/30 mx-auto" />
          <p className="text-white">{t('dash.addFamilyTitle')}</p>
          <p className="text-white/45 text-sm">{t('people.empty')}</p>
          <button type="button" onClick={() => onNavigate('people')} className="btn-primary">
            {t('dash.addFamily')}
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              type="button"
              key={stat.title}
              onClick={() => stat.section && onNavigate(stat.section)}
              className={`rounded-2xl md:rounded-3xl p-2.5 md:p-4 text-left bg-gradient-to-br ${stat.tint} text-white`}
            >
              <Icon className="w-4 h-4 md:w-5 md:h-5 opacity-90" />
              <p className="font-display text-lg md:text-2xl mt-1.5 md:mt-3 tabular-nums">{stat.value}</p>
              <p className="text-[10px] md:text-xs opacity-90 mt-0.5 leading-tight truncate">{stat.title}</p>
            </button>
          );
        })}
      </div>

      <div className="glass-panel rounded-2xl md:rounded-3xl p-4 md:p-6">
        <h2 className="text-white font-medium mb-3 md:mb-4">{t('dash.attention')}</h2>
        {renewals.length === 0 ? (
          <p className="text-white/40 text-sm">{t('dash.noAttention')}</p>
        ) : (
          <div className="space-y-2">
            {renewals.slice(0, 6).map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => onNavigate(item.section, item.itemId)}
                className={`w-full flex items-center justify-between gap-3 rounded-2xl px-3 md:px-4 py-2.5 md:py-3 text-left ${
                  item.days < 0 ? 'bg-rose-400/15' : item.days <= 14 ? 'bg-amber-400/15' : 'bg-cyan-400/10'
                }`}
              >
                <div className="min-w-0">
                  <p className="text-white text-sm truncate">{item.title}</p>
                  <p className="text-white/40 text-xs truncate">{item.subtitle} · {item.category}</p>
                </div>
                <span className={`text-xs font-medium shrink-0 ${item.days < 0 ? 'text-rose-200' : item.days <= 14 ? 'text-amber-200' : 'text-cyan-200'}`}>
                  {item.days < 0 ? t('dash.overdue', { days: Math.abs(item.days) }) : t('dash.daysLeft', { days: item.days })}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {people.length > 0 && (
        <div>
          <h2 className="text-white font-medium mb-3">{t('dash.family')}</h2>
          <div className="flex md:grid gap-2 md:gap-3 overflow-x-auto scroll-touch hide-scroll snap-x snap-mandatory -mx-4 px-4 pb-1 md:mx-0 md:px-0 md:overflow-visible md:grid-cols-3 lg:grid-cols-4">
            {people.map((person) => {
              const tint = REL_TINT[person.relation] || REL_TINT.Other;
              return (
                <button
                  type="button"
                  key={person.id}
                  onClick={() => onNavigate('people', person.id)}
                  className={`snap-start shrink-0 w-[8.5rem] md:w-auto rounded-2xl md:rounded-3xl p-3 md:p-4 text-left bg-gradient-to-br ${tint} text-white`}
                >
                  <p className="font-semibold truncate">{person.name}</p>
                  <p className="text-xs opacity-90 mt-1 truncate">{person.relation ? optionLabel(t, person.relation) : t('people.familyMember')}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <button type="button" onClick={() => printSection('emergency')} className="rounded-2xl md:rounded-3xl p-3 md:p-4 bg-gradient-to-br from-rose-400/20 to-orange-500/10 text-white text-left">
          <Printer size={16} className="opacity-80" />
          <p className="mt-2 md:mt-3 text-xs md:text-sm font-medium leading-tight">{t('sheet.print')}</p>
        </button>
        <button type="button" onClick={() => printSection('access')} className="rounded-2xl md:rounded-3xl p-3 md:p-4 bg-gradient-to-br from-violet-400/20 to-fuchsia-500/10 text-white text-left">
          <Building2 size={16} className="opacity-80" />
          <p className="mt-2 md:mt-3 text-xs md:text-sm font-medium leading-tight">{t('access.print')}</p>
        </button>
        <button type="button" onClick={() => downloadRenewalsIcs(collectRenewals(data, people))} className="rounded-2xl md:rounded-3xl p-3 md:p-4 bg-gradient-to-br from-cyan-400/20 to-blue-500/10 text-white text-left">
          <Calendar size={16} className="opacity-80" />
          <p className="mt-2 md:mt-3 text-xs md:text-sm font-medium leading-tight">{t('sheet.calendar')}</p>
        </button>
      </div>

      <InvestmentOverview investments={investments} people={people} onNavigate={onNavigate} />

      <div className="glass-panel rounded-2xl md:rounded-3xl p-4 md:p-6 space-y-3">
        <h3 className="text-white font-medium">{t('dash.encrypted')}</h3>
        <p className="text-white/45 text-sm hidden md:block">{t('dash.encryptedBody')}</p>
        <StorageDisclaimer />
      </div>
    </div>
    <EmergencyPrint data={data} />
    <AccessPrint />
    </>
  );
};

export default Dashboard;
