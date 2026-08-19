import React from 'react';
import {
  AlertTriangle,
  Bike,
  Building2,
  Car,
  CreditCard,
  FileText,
  Home,
  Key,
  Landmark,
  Mail,
  Shield,
  StickyNote,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { optionLabel } from '../utils/telLink';
import { daysUntil } from '../utils/dates';
import { formatInr, holdingValue } from '../utils/money';

const dueCount = (items, fields) =>
  items.filter((item) =>
    fields.some((field) => {
      const days = daysUntil(item[field]);
      return days != null && days <= 30;
    })
  ).length;

const CountTile = ({ tint, icon: Icon, value, label }) => (
  <div className={`rounded-3xl p-4 bg-gradient-to-br ${tint} text-white`}>
    {Icon ? <Icon size={16} className="opacity-90" /> : null}
    <p className="font-display text-2xl mt-2">{value}</p>
    <p className="text-xs opacity-90 mt-0.5">{label}</p>
  </div>
);

const NeutralTile = ({ value, label }) => (
  <div className="rounded-3xl p-4 bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
    <p className="text-white/45 text-xs">{label}</p>
    <p className="text-white font-display text-2xl mt-1">{value}</p>
  </div>
);

const DueTile = ({ due, label }) => (
  <div className={`rounded-3xl p-4 border ${due ? 'bg-amber-400/20 border-amber-300/20 text-amber-100' : 'bg-white/5 border-white/10 text-white/70'}`}>
    <AlertTriangle size={16} />
    <p className="font-display text-2xl mt-2">{due}</p>
    <p className="text-xs mt-0.5">{label}</p>
  </div>
);

const KIND_TILES = {
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
  government: [
    { key: 'PAN Card', tint: 'from-orange-400 to-amber-500' },
    { key: 'Aadhaar Card', tint: 'from-violet-400 to-indigo-500' },
    { key: 'Passport', tint: 'from-sky-400 to-blue-600' },
    { key: 'Driving License', tint: 'from-lime-400 to-green-600' },
    { key: 'Voter ID', tint: 'from-rose-400 to-pink-500' },
    { key: 'UAN', tint: 'from-teal-400 to-emerald-600' },
    { key: 'Ration Card', tint: 'from-amber-400 to-orange-600' },
  ],
  insurance: [
    { key: 'Health Insurance', tint: 'from-rose-400 to-red-500' },
    { key: 'Life Insurance', tint: 'from-violet-400 to-purple-600' },
    { key: 'Term Insurance', tint: 'from-indigo-400 to-blue-600' },
    { key: 'Motor Insurance', tint: 'from-orange-400 to-amber-600' },
    { key: 'Home Insurance', tint: 'from-amber-400 to-yellow-500' },
    { key: 'Travel Insurance', tint: 'from-cyan-400 to-sky-500' },
  ],
  investments: [
    { key: 'Mutual Fund', tint: 'from-cyan-400 to-blue-500' },
    { key: 'Stock', tint: 'from-violet-400 to-fuchsia-500' },
    { key: 'FD', tint: 'from-emerald-400 to-teal-600' },
    { key: 'PPF', tint: 'from-amber-400 to-orange-500' },
    { key: 'Gold', tint: 'from-yellow-400 to-amber-600' },
    { key: 'Crypto', tint: 'from-fuchsia-400 to-purple-600' },
  ],
};

const typeField = {
  vehicles: 'vehicleType',
  properties: 'propertyType',
  government: 'documentType',
  insurance: 'insuranceType',
  investments: 'investmentType',
};

const dueFields = {
  vehicles: ['insuranceExpiry', 'pucExpiry', 'rcExpiry'],
  properties: ['taxDueDate'],
  cards: ['expiryDate'],
  government: ['expiryDate'],
  insurance: ['policyEndDate'],
  investments: ['maturityDate'],
};

const AssetSummary = ({ type, items }) => {
  const { t } = useI18n();
  const people = new Set(items.map((item) => item.personId).filter(Boolean)).size;
  const due = dueCount(items, dueFields[type] || []);
  const kinds = KIND_TILES[type];
  const field = typeField[type];

  const extra = [];
  if (type === 'credentials' || type === 'emails') {
    const with2fa = items.filter((item) => item.twoFactorEnabled).length;
    extra.push(
      <CountTile key="2fa" tint="from-emerald-400 to-teal-500" icon={Shield} value={with2fa} label={t('assets.with2fa')} />,
      <CountTile key="no2fa" tint="from-amber-400 to-orange-500" icon={Key} value={items.length - with2fa} label={t('assets.no2fa')} />,
      <CountTile
        key="codes"
        tint="from-violet-400 to-fuchsia-500"
        icon={Shield}
        value={items.filter((item) => item.twoFactorCodes).length}
        label={t('assets.backupCodes')}
      />
    );
    if (type === 'emails') {
      extra.push(
        <CountTile
          key="recovery"
          tint="from-sky-400 to-indigo-500"
          icon={Mail}
          value={items.filter((item) => item.recoveryEmail || item.recoveryPhone).length}
          label={t('assets.withRecovery')}
        />
      );
    }
  }

  if (type === 'banking') {
    extra.push(
      <CountTile
        key="banks"
        tint="from-cyan-400 to-blue-500"
        icon={Landmark}
        value={new Set(items.map((item) => item.bankName).filter(Boolean)).size}
        label={t('assets.banks')}
      />,
      <CountTile
        key="nominee"
        tint="from-amber-400 to-rose-500"
        icon={Users}
        value={items.filter((item) => item.nominee).length}
        label={t('assets.withNominee')}
      />
    );
  }

  if (type === 'cards') {
    extra.push(
      <CountTile
        key="credit"
        tint="from-amber-400 to-rose-500"
        icon={CreditCard}
        value={items.filter((item) => item.cardType === 'Credit Card').length}
        label={t('assets.credit')}
      />,
      <CountTile
        key="debit"
        tint="from-cyan-400 to-indigo-500"
        icon={CreditCard}
        value={items.filter((item) => item.cardType === 'Debit Card').length}
        label={t('assets.debit')}
      />
    );
  }

  if (type === 'investments') {
    const total = items.reduce((sum, item) => sum + holdingValue(item), 0);
    extra.unshift(
      <div key="value" className="rounded-3xl p-4 bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
        <TrendingUp size={16} className="opacity-90" />
        <p className="font-display text-xl mt-2 leading-none">{formatInr(total)}</p>
        <p className="text-xs opacity-90 mt-1.5">{t('assets.totalValue')}</p>
      </div>
    );
  }

  if (type === 'notes') {
    extra.push(
      <CountTile
        key="linked"
        tint="from-cyan-400 to-blue-500"
        icon={Users}
        value={items.filter((item) => item.personId).length}
        label={t('assets.linkedPeople')}
      />,
      <CountTile
        key="unlinked"
        tint="from-violet-400 to-fuchsia-500"
        icon={StickyNote}
        value={items.filter((item) => !item.personId).length}
        label={t('dash.unlinked')}
      />
    );
  }

  const IconFor = (kind) => kind.icon || (type === 'government' ? FileText : type === 'insurance' ? Shield : TrendingUp);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      <NeutralTile value={items.length} label={t('common.items')} />
      {kinds?.map((kind) => {
        const Icon = IconFor(kind);
        const count = items.filter((item) => item[field] === kind.key).length;
        return (
          <CountTile key={kind.key} tint={kind.tint} icon={Icon} value={count} label={optionLabel(t, kind.key)} />
        );
      })}
      {extra}
      {type !== 'notes' && type !== 'credentials' && type !== 'emails' && type !== 'banking' ? (
        <CountTile tint="from-sky-400 to-indigo-500" icon={Users} value={people} label={t('assets.linkedPeople')} />
      ) : null}
      {dueFields[type] ? <DueTile due={due} label={t('assets.dueSoon')} /> : null}
    </div>
  );
};

export default AssetSummary;
