import React, { useEffect, useState } from 'react';
import { Bike, Car, Check, Copy, Edit, Trash2 } from 'lucide-react';
import { copyToClipboard, storage } from '../utils/storage';
import { useI18n } from '../context/I18nContext';
import { useToast } from '../context/ToastContext';
import { optionLabel } from '../utils/telLink';
import { daysUntil, dueTone, formatDisplayDate } from '../utils/dates';

const THEME = {
  Car: { icon: Car, bar: 'from-sky-400 to-indigo-500' },
  Bike: { icon: Bike, bar: 'from-orange-400 to-rose-500' },
  Scooter: { icon: Bike, bar: 'from-emerald-400 to-teal-500' },
  Other: { icon: Car, bar: 'from-violet-400 to-fuchsia-500' },
};

const TONE = {
  overdue: 'bg-rose-400/20 text-rose-100',
  soon: 'bg-amber-400/20 text-amber-100',
  watch: 'bg-cyan-400/15 text-cyan-100',
  ok: 'bg-emerald-400/15 text-emerald-100',
  muted: 'bg-white/5 text-white/50',
};

const DueTile = ({ label, iso, t }) => {
  const days = daysUntil(iso);
  const tone = dueTone(days);
  let hint = t('assets.noDate');
  if (days != null) {
    hint = days < 0 ? t('dash.overdue', { days: Math.abs(days) }) : t('dash.daysLeft', { days });
  }
  return (
    <div className={`rounded-2xl px-3 py-2.5 ${TONE[tone]}`}>
      <p className="text-[11px] opacity-80">{label}</p>
      <p className="text-sm font-medium mt-0.5">{iso ? formatDisplayDate(iso) : '—'}</p>
      <p className="text-[11px] mt-0.5 opacity-80">{hint}</p>
    </div>
  );
};

const VehicleCard = ({ item, onEdit, onDelete, highlighted }) => {
  const { t } = useI18n();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const people = storage.get('people') || [];
  const person = people.find((row) => row.id === item.personId);
  const theme = THEME[item.vehicleType] || THEME.Other;
  const Icon = theme.icon;

  useEffect(() => {
    if (!confirmDelete) return undefined;
    const timer = window.setTimeout(() => setConfirmDelete(false), 4000);
    return () => window.clearTimeout(timer);
  }, [confirmDelete]);

  const copyReg = async () => {
    if (!item.registrationNumber) return;
    const ok = await copyToClipboard(item.registrationNumber);
    if (ok) {
      setCopied(true);
      toast(t('common.copied'));
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`glass-panel rounded-3xl overflow-hidden ${highlighted ? 'ring-2 ring-cyan-400/70' : ''}`}>
      <div className={`h-2 bg-gradient-to-r ${theme.bar}`} />
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.bar} flex items-center justify-center shrink-0`}>
              <Icon className="text-white" size={22} />
            </span>
            <div className="min-w-0">
              <h3 className="text-white font-semibold truncate">{item.name || t('common.untitled')}</h3>
              <p className="text-white/45 text-xs">
                {[item.vehicleType ? optionLabel(t, item.vehicleType) : '', person?.name].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <button type="button" onClick={() => onEdit(item)} className="p-2 text-white/40 hover:text-cyan-300" aria-label={t('common.edit')}>
              <Edit size={16} />
            </button>
            {confirmDelete ? (
              <button type="button" onClick={() => onDelete(item.id)} className="px-2 text-xs text-rose-300">{t('people.confirmDelete')}</button>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="p-2 text-white/40 hover:text-rose-300" aria-label={t('common.delete')}>
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        <button type="button" onClick={copyReg} className="w-full text-left rounded-2xl bg-white/5 hover:bg-white/10 px-3 py-3">
          <p className="text-[11px] text-white/40">{t('field.registrationNumber')}</p>
          <p className="text-white font-mono text-lg tracking-wide flex items-center gap-2">
            {item.registrationNumber || '—'}
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-white/35" />}
          </p>
        </button>

        <div className="grid grid-cols-3 gap-2">
          <DueTile label={t('field.insuranceExpiry')} iso={item.insuranceExpiry} t={t} />
          <DueTile label={t('field.pucExpiry')} iso={item.pucExpiry} t={t} />
          <DueTile label={t('field.rcExpiry')} iso={item.rcExpiry} t={t} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {item.insurer ? (
            <div className="rounded-2xl bg-white/5 px-3 py-2.5">
              <p className="text-[11px] text-white/40">{t('field.insurer')}</p>
              <p className="text-white text-sm truncate">{item.insurer}</p>
            </div>
          ) : null}
          {item.policyNumber ? (
            <div className="rounded-2xl bg-white/5 px-3 py-2.5">
              <p className="text-[11px] text-white/40">{t('field.policyNumber')}</p>
              <p className="text-white text-sm font-mono truncate">{item.policyNumber}</p>
            </div>
          ) : null}
        </div>
        {item.notes ? <p className="text-white/45 text-sm">{item.notes}</p> : null}
      </div>
    </div>
  );
};

export default VehicleCard;
