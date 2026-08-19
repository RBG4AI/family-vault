import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Key, CreditCard, Users, AlertTriangle, Download, Printer, Calendar } from 'lucide-react';
import { storage } from '../utils/storage';
import { collectRenewals } from '../utils/renewals';
import { backupIsStale, getLastBackupAt } from '../utils/devicePrefs';
import { downloadVaultBackup } from '../utils/exportBackup';
import { downloadRenewalsIcs } from '../utils/ics';
import { useI18n } from '../context/I18nContext';
import { useVaultContext } from '../context/VaultContext';
import StorageDisclaimer from './StorageDisclaimer';
import EmergencyPrint from './EmergencyPrint';

const Dashboard = ({ onNavigate }) => {
  const { t } = useI18n();
  const vault = useVaultContext();
  const data = storage.get() || {};
  const people = data.people || [];
  const credentials = data.credentials || [];
  const banking = data.banking || [];
  const investments = data.investments || [];
  const renewals = collectRenewals(data, people).filter((item) => item.days <= 60);
  const totalInvestmentValue = investments.reduce((sum, inv) => sum + (Number(inv.currentValue) || 0), 0);
  const [backupError, setBackupError] = useState('');
  const [, setBackupTick] = useState(0);
  const lastBackup = getLastBackupAt(vault.meta?.id);
  const staleBackup = backupIsStale(vault.meta?.id);

  const stats = [
    { title: t('nav.people'), value: people.length, icon: Users, tint: 'from-cyan-400 to-blue-500', section: 'people' },
    { title: t('nav.credentials'), value: credentials.length, icon: Key, tint: 'from-violet-400 to-fuchsia-500', section: 'credentials' },
    { title: t('nav.banking'), value: banking.length, icon: CreditCard, tint: 'from-emerald-400 to-teal-500', section: 'banking' },
    { title: t('dash.attention'), value: renewals.length, icon: AlertTriangle, tint: 'from-amber-400 to-orange-500' },
  ];

  const barData = investments.map((inv) => ({
    name: (inv.name || 'Fund').slice(0, 8),
    value: Number(inv.currentValue) || 0,
  }));

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
    <div className="p-4 md:p-8 mt-16 space-y-6 print:hidden">
      <div>
        <p className="text-xs tracking-[0.22em] uppercase text-cyan-300/70 mb-2">{t('dash.eyebrow')}</p>
        <h1 className="font-display text-3xl md:text-5xl text-white leading-tight">{t('dash.title')}</h1>
        <p className="text-white/45 mt-3 max-w-xl">{t('dash.subtitle')}</p>
      </div>

      {staleBackup && (
        <div className="glass-panel rounded-3xl p-5 border border-amber-400/25 space-y-3">
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
        <div className="glass-panel rounded-3xl p-8 text-center space-y-3">
          <Users className="w-10 h-10 text-white/30 mx-auto" />
          <p className="text-white">{t('dash.addFamilyTitle')}</p>
          <p className="text-white/45 text-sm">{t('people.empty')}</p>
          <button type="button" onClick={() => onNavigate('people')} className="btn-primary">
            {t('dash.addFamily')}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.button
              type="button"
              key={stat.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              onClick={() => stat.section && onNavigate(stat.section)}
              className="glass-panel rounded-3xl p-4 md:p-5 text-left"
            >
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${stat.tint} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-display text-2xl text-white">{stat.value}</p>
              <p className="text-white/40 text-xs mt-1">{stat.title}</p>
            </motion.button>
          );
        })}
      </div>

      <div className="glass-panel rounded-3xl p-5 md:p-6">
        <h2 className="text-white font-medium mb-4">{t('dash.attention')}</h2>
        {renewals.length === 0 ? (
          <p className="text-white/40 text-sm">{t('dash.noAttention')}</p>
        ) : (
          <div className="space-y-2">
            {renewals.slice(0, 6).map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => onNavigate(item.section)}
                className="w-full flex items-center justify-between bg-white/5 rounded-2xl px-4 py-3 text-left hover:bg-white/10"
              >
                <div>
                  <p className="text-white text-sm">{item.title}</p>
                  <p className="text-white/40 text-xs">{item.subtitle} · {item.category}</p>
                </div>
                <span className={`text-xs font-medium ${item.days < 0 ? 'text-rose-300' : item.days <= 14 ? 'text-amber-300' : 'text-cyan-300'}`}>
                  {item.days < 0 ? t('dash.overdue', { days: Math.abs(item.days) }) : t('dash.daysLeft', { days: item.days })}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {people.length > 0 && (
        <div className="glass-panel rounded-3xl p-5 md:p-6">
          <h2 className="text-white font-medium mb-4">{t('dash.family')}</h2>
          <div className="flex flex-wrap gap-3">
            {people.map((person) => (
              <button
                type="button"
                key={person.id}
                onClick={() => onNavigate('people')}
                className="px-4 py-3 rounded-2xl bg-white/5 text-sm text-white/80 hover:bg-white/10"
              >
                {person.name}
                <span className="text-white/35 ml-2">{person.relation || ''}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => window.print()} className="px-4 py-2 bg-white/10 text-white rounded-xl flex items-center gap-2">
          <Printer size={16} /> {t('sheet.print')}
        </button>
        <button type="button" onClick={() => downloadRenewalsIcs(collectRenewals(data, people))} className="px-4 py-2 bg-white/10 text-white rounded-xl flex items-center gap-2">
          <Calendar size={16} /> {t('sheet.calendar')}
        </button>
      </div>

      <div className="glass-panel rounded-3xl p-6">
        <h3 className="text-white font-medium mb-4">{t('nav.investments')}</h3>
        {barData.length === 0 ? (
          <p className="text-white/40 text-sm">{t('dash.noInvestments')}</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff' }} />
                <Bar dataKey="value" fill="#67e8f9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {totalInvestmentValue > 0 && (
              <p className="text-white/40 text-sm mt-3">{t('dash.recorded', { value: (totalInvestmentValue / 1000).toFixed(1) })}</p>
            )}
          </>
        )}
      </div>

      <div className="glass-panel rounded-3xl p-6 space-y-3">
        <h3 className="text-white font-medium">{t('dash.encrypted')}</h3>
        <p className="text-white/45 text-sm">{t('dash.encryptedBody')}</p>
        <StorageDisclaimer />
      </div>
    </div>
    <EmergencyPrint data={data} />
    </>
  );
};

export default Dashboard;
