import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Key, CreditCard, Users, AlertTriangle } from 'lucide-react';
import { storage } from '../utils/storage';
import SecurityScore from './SecurityScore';
import { collectRenewals } from '../utils/renewals';
import { useI18n } from '../context/I18nContext';

const Dashboard = () => {
  const { t } = useI18n();
  const data = storage.get() || {};
  const people = data.people || [];
  const credentials = data.credentials || [];
  const banking = data.banking || [];
  const investments = data.investments || [];
  const renewals = collectRenewals(data, people).filter((item) => item.days <= 60);
  const totalInvestmentValue = investments.reduce((sum, inv) => sum + (Number(inv.currentValue) || 0), 0);

  const stats = [
    { title: t('nav.people'), value: people.length, icon: Users, tint: 'from-cyan-400 to-blue-500' },
    { title: t('nav.credentials'), value: credentials.length, icon: Key, tint: 'from-violet-400 to-fuchsia-500' },
    { title: t('nav.banking'), value: banking.length, icon: CreditCard, tint: 'from-emerald-400 to-teal-500' },
    { title: t('dash.attention'), value: renewals.filter((item) => item.days <= 0).length, icon: AlertTriangle, tint: 'from-amber-400 to-orange-500' },
  ];

  const barData = investments.map((inv) => ({
    name: (inv.name || 'Fund').slice(0, 8),
    value: Number(inv.currentValue) || 0,
  }));

  return (
    <div className="p-4 md:p-8 mt-12 md:mt-0 space-y-6">
      <div>
        <p className="text-xs tracking-[0.22em] uppercase text-cyan-300/70 mb-2">Family Vault</p>
        <h1 className="font-display text-3xl md:text-5xl text-white leading-tight">{t('dash.title')}</h1>
        <p className="text-white/45 mt-3 max-w-xl">{t('dash.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="glass-panel rounded-3xl p-4 md:p-5"
            >
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${stat.tint} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-display text-2xl text-white">{stat.value}</p>
              <p className="text-white/40 text-xs mt-1">{stat.title}</p>
            </motion.div>
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
              <div key={item.id} className="flex items-center justify-between bg-white/5 rounded-2xl px-4 py-3">
                <div>
                  <p className="text-white text-sm">{item.title}</p>
                  <p className="text-white/40 text-xs">{item.subtitle} · {item.category}</p>
                </div>
                <span className={`text-xs font-medium ${item.days < 0 ? 'text-rose-300' : item.days <= 14 ? 'text-amber-300' : 'text-cyan-300'}`}>
                  {item.days < 0 ? `${Math.abs(item.days)}d overdue` : `${item.days}d`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {people.length > 0 && (
        <div className="glass-panel rounded-3xl p-5 md:p-6">
          <h2 className="text-white font-medium mb-4">{t('dash.family')}</h2>
          <div className="flex flex-wrap gap-3">
            {people.map((person) => (
              <div key={person.id} className="px-4 py-3 rounded-2xl bg-white/5 text-sm text-white/80">
                {person.name}
                <span className="text-white/35 ml-2">{person.relation || ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SecurityScore />
        <div className="glass-panel rounded-3xl p-6">
          <h3 className="text-white font-medium mb-4">{t('nav.investments')}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData.length ? barData : [{ name: '—', value: 0 }]}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff' }} />
              <Bar dataKey="value" fill="#67e8f9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {totalInvestmentValue > 0 && (
            <p className="text-white/40 text-sm mt-3">₹{(totalInvestmentValue / 1000).toFixed(1)}K recorded</p>
          )}
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6">
        <h3 className="text-white font-medium mb-2">{t('dash.encrypted')}</h3>
        <p className="text-white/45 text-sm">{t('dash.encryptedBody')}</p>
      </div>
    </div>
  );
};

export default Dashboard;
