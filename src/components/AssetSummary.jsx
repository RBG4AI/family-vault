import React from 'react';
import { AlertTriangle, Bike, Building2, Car, Home } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { optionLabel } from '../utils/telLink';
import { daysUntil } from '../utils/dates';

const TILES = {
  vehicles: [
    { key: 'Car', icon: Car, tint: 'from-sky-400 to-indigo-500' },
    { key: 'Bike', icon: Bike, tint: 'from-orange-400 to-rose-500' },
    { key: 'Scooter', icon: Bike, tint: 'from-emerald-400 to-teal-500' },
    { key: 'Other', icon: Car, tint: 'from-violet-400 to-fuchsia-500' },
  ],
  properties: [
    { key: 'Home', icon: Home, tint: 'from-amber-400 to-rose-500' },
    { key: 'Apartment', icon: Building2, tint: 'from-cyan-400 to-blue-500' },
    { key: 'Plot', icon: Building2, tint: 'from-lime-400 to-emerald-600' },
    { key: 'Shop', icon: Building2, tint: 'from-violet-400 to-fuchsia-500' },
  ],
};

const dueCount = (items, fields) =>
  items.filter((item) =>
    fields.some((field) => {
      const days = daysUntil(item[field]);
      return days != null && days <= 30;
    })
  ).length;

const AssetSummary = ({ type, items }) => {
  const { t } = useI18n();
  const typeKey = type === 'vehicles' ? 'vehicleType' : 'propertyType';
  const dueFields = type === 'vehicles' ? ['insuranceExpiry', 'pucExpiry', 'rcExpiry'] : ['taxDueDate'];
  const kinds = TILES[type] || [];
  const due = dueCount(items, dueFields);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      <div className="rounded-3xl p-4 bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
        <p className="text-white/45 text-xs">{t('common.items')}</p>
        <p className="text-white font-display text-2xl mt-1">{items.length}</p>
      </div>
      {kinds.map((kind) => {
        const Icon = kind.icon;
        const count = items.filter((item) => item[typeKey] === kind.key).length;
        return (
          <div key={kind.key} className={`rounded-3xl p-4 bg-gradient-to-br ${kind.tint} text-white`}>
            <Icon size={16} className="opacity-90" />
            <p className="font-display text-2xl mt-2">{count}</p>
            <p className="text-xs opacity-90 mt-0.5">{optionLabel(t, kind.key)}</p>
          </div>
        );
      })}
      <div className={`rounded-3xl p-4 border ${due ? 'bg-amber-400/20 border-amber-300/20 text-amber-100' : 'bg-white/5 border-white/10 text-white/70'}`}>
        <AlertTriangle size={16} />
        <p className="font-display text-2xl mt-2">{due}</p>
        <p className="text-xs mt-0.5">{t('assets.dueSoon')}</p>
      </div>
    </div>
  );
};

export default AssetSummary;
