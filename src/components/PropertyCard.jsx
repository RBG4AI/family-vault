import React, { useEffect, useState } from 'react';
import { Building2, Check, Copy, Edit, Home, Landmark, MapPin, Trash2 } from 'lucide-react';
import { copyToClipboard, storage } from '../utils/storage';
import { useI18n } from '../context/I18nContext';
import { useToast } from '../context/ToastContext';
import { optionLabel } from '../utils/telLink';
import { daysUntil, dueTone, formatDisplayDate } from '../utils/dates';
import { mapsHref, mapsLabel } from '../utils/maps';

const THEME = {
  Home: { icon: Home, bar: 'from-amber-400 to-rose-500' },
  Apartment: { icon: Building2, bar: 'from-cyan-400 to-blue-500' },
  Plot: { icon: MapPin, bar: 'from-lime-400 to-emerald-600' },
  Shop: { icon: Landmark, bar: 'from-violet-400 to-fuchsia-500' },
  Other: { icon: Building2, bar: 'from-slate-400 to-slate-600' },
};

const TONE = {
  overdue: 'bg-rose-400/20 text-rose-100',
  soon: 'bg-amber-400/20 text-amber-100',
  watch: 'bg-cyan-400/15 text-cyan-100',
  ok: 'bg-emerald-400/15 text-emerald-100',
  muted: 'bg-white/5 text-white/50',
};

const PropertyCard = ({ item, onEdit, onDelete, highlighted }) => {
  const { t } = useI18n();
  const { toast } = useToast();
  const [copied, setCopied] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const people = storage.get('people') || [];
  const person = people.find((row) => row.id === item.personId);
  const theme = THEME[item.propertyType] || THEME.Other;
  const Icon = theme.icon;
  const taxDays = daysUntil(item.taxDueDate);
  const taxTone = dueTone(taxDays);
  const mapsLink = mapsHref(item.mapsLocation, item.address);
  const mapsText = mapsLabel(item.mapsLocation, item.address) || item.address;

  useEffect(() => {
    if (!confirmDelete) return undefined;
    const timer = window.setTimeout(() => setConfirmDelete(false), 4000);
    return () => window.clearTimeout(timer);
  }, [confirmDelete]);

  const copy = async (value, key) => {
    if (!value) return;
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(key);
      toast(t('common.copied'));
      window.setTimeout(() => setCopied(''), 2000);
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
                {[item.propertyType ? optionLabel(t, item.propertyType) : '', person?.name].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <button type="button" onClick={() => onEdit(item)} className="p-2 text-white/40 hover:text-cyan-300" aria-label={t('common.edit')}>
              <Edit size={16} />
            </button>
            {mapsLink ? (
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-white/40 hover:text-emerald-300"
                aria-label={t('assets.openMaps')}
              >
                <MapPin size={16} />
              </a>
            ) : null}
            {confirmDelete ? (
              <button type="button" onClick={() => onDelete(item.id)} className="px-2 text-xs text-rose-300">{t('people.confirmDelete')}</button>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="p-2 text-white/40 hover:text-rose-300" aria-label={t('common.delete')}>
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 px-3 py-3">
          <p className="text-[11px] text-white/40">{t('field.address')}</p>
          <p className="text-white text-sm leading-6">{item.address || '—'}</p>
        </div>

        {mapsLink ? (
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl px-3 py-3 bg-gradient-to-br from-emerald-400/20 to-cyan-500/10 hover:from-emerald-400/30 hover:to-cyan-500/20 border border-emerald-300/15"
          >
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shrink-0">
              <MapPin className="text-white" size={18} />
            </span>
            <span className="min-w-0">
              <p className="text-emerald-50 text-sm font-medium">{t('assets.openMaps')}</p>
              <p className="text-white/45 text-xs truncate mt-0.5">{mapsText || t('field.mapsLocation')}</p>
            </span>
          </a>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => copy(item.surveyNumber, 'survey')} className="text-left rounded-2xl bg-white/5 hover:bg-white/10 px-3 py-2.5">
            <p className="text-[11px] text-white/40">{t('field.surveyNumber')}</p>
            <p className="text-white text-sm font-mono truncate flex items-center gap-2">
              {item.surveyNumber || '—'}
              {item.surveyNumber ? copied === 'survey' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-white/30" /> : null}
            </p>
          </button>
          <div className={`rounded-2xl px-3 py-2.5 ${TONE[taxTone]}`}>
            <p className="text-[11px] opacity-80">{t('field.taxDueDate')}</p>
            <p className="text-sm font-medium mt-0.5">{item.taxDueDate ? formatDisplayDate(item.taxDueDate) : '—'}</p>
            <p className="text-[11px] mt-0.5 opacity-80">
              {taxDays == null
                ? t('assets.noDate')
                : taxDays < 0
                  ? t('dash.overdue', { days: Math.abs(taxDays) })
                  : t('dash.daysLeft', { days: taxDays })}
            </p>
          </div>
        </div>
        {item.notes ? <p className="text-white/45 text-sm">{item.notes}</p> : null}
      </div>
    </div>
  );
};

export default PropertyCard;
