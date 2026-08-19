import React, { useEffect, useState } from 'react';
import { Check, Copy, Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import { daysUntil, dueTone, formatDisplayDate } from '../utils/dates';

export const DUE_TONE = {
  overdue: 'bg-rose-400/20 text-rose-100',
  soon: 'bg-amber-400/20 text-amber-100',
  watch: 'bg-cyan-400/15 text-cyan-100',
  ok: 'bg-emerald-400/15 text-emerald-100',
  muted: 'bg-white/5 text-white/50',
};

export const maskLast4 = (value) => {
  const text = String(value);
  if (text.length <= 4) return '••••';
  return `${'•'.repeat(Math.min(8, text.length - 4))}${text.slice(-4)}`;
};

export const maskAll = (value) => '•'.repeat(Math.min(12, Math.max(6, String(value).length)));

export const DueTile = ({ label, iso, t }) => {
  const days = daysUntil(iso);
  const tone = dueTone(days);
  let hint = t('assets.noDate');
  if (days != null) {
    hint = days < 0 ? t('dash.overdue', { days: Math.abs(days) }) : t('dash.daysLeft', { days });
  }
  return (
    <div className={`rounded-2xl px-3 py-2.5 ${DUE_TONE[tone]}`}>
      <p className="text-[11px] opacity-80">{label}</p>
      <p className="text-sm font-medium mt-0.5">{iso ? formatDisplayDate(iso) : '—'}</p>
      <p className="text-[11px] mt-0.5 opacity-80">{hint}</p>
    </div>
  );
};

export const InfoTile = ({ label, children, className = 'bg-white/5 text-white', onClick }) => {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`rounded-2xl px-3 py-2.5 text-left min-w-0 ${className} ${onClick ? 'hover:bg-white/10' : ''}`}
    >
      <p className="text-[11px] opacity-70">{label}</p>
      <div className="text-sm font-medium mt-0.5 truncate">{children}</div>
    </Tag>
  );
};

export const SecretTile = ({ label, value, shown, onToggle, onCopy, copied, last4, t }) => {
  if (value === undefined || value === null || value === '') return null;
  const display = shown ? String(value) : last4 ? maskLast4(value) : maskAll(value);
  return (
    <div className="rounded-2xl bg-white/5 px-3 py-2.5 min-w-0">
      <p className="text-[11px] text-white/40">{label}</p>
      <div className="flex items-center gap-2 mt-0.5">
        <p className="text-white font-mono text-sm truncate flex-1">{display}</p>
        <button type="button" onClick={onToggle} className="text-white/40 hover:text-white shrink-0" aria-label={shown ? t('common.hide') : t('common.reveal')}>
          {shown ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <button type="button" onClick={onCopy} className="text-white/40 hover:text-white shrink-0" aria-label={t('common.copy')}>
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
};

export const CopyTile = ({ label, value, onCopy, copied, mono }) => {
  if (!value) return null;
  return (
    <button type="button" onClick={onCopy} className="rounded-2xl bg-white/5 hover:bg-white/10 px-3 py-2.5 text-left min-w-0">
      <p className="text-[11px] text-white/40">{label}</p>
      <p className={`text-white text-sm mt-0.5 truncate flex items-center gap-2 ${mono ? 'font-mono' : ''}`}>
        {value}
        {copied ? <Check size={12} className="text-emerald-400 shrink-0" /> : <Copy size={12} className="text-white/30 shrink-0" />}
      </p>
    </button>
  );
};

export const RecordShell = ({ bar, Icon, title, subtitle, highlighted, onEdit, onDelete, t, children }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!confirmDelete) return undefined;
    const timer = window.setTimeout(() => setConfirmDelete(false), 4000);
    return () => window.clearTimeout(timer);
  }, [confirmDelete]);

  return (
    <div className={`glass-panel rounded-3xl overflow-hidden ${highlighted ? 'ring-2 ring-cyan-400/70' : ''}`}>
      <div className={`h-2 bg-gradient-to-r ${bar}`} />
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${bar} flex items-center justify-center shrink-0`}>
              <Icon className="text-white" size={22} />
            </span>
            <div className="min-w-0">
              <h3 className="text-white font-semibold truncate">{title}</h3>
              {subtitle ? <p className="text-white/45 text-xs truncate">{subtitle}</p> : null}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <button type="button" onClick={onEdit} className="p-2 text-white/40 hover:text-cyan-300" aria-label={t('common.edit')}>
              <Edit size={16} />
            </button>
            {confirmDelete ? (
              <button type="button" onClick={onDelete} className="px-2 text-xs text-rose-300">{t('people.confirmDelete')}</button>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="p-2 text-white/40 hover:text-rose-300" aria-label={t('common.delete')}>
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};
