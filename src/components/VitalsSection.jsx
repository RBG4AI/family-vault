import React, { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, Droplets, HeartPulse, Pencil, Plus, Scale, Trash2 } from 'lucide-react';
import { storage } from '../utils/storage';
import AddCredentialModal from './AddCredentialModal';
import { useI18n } from '../context/I18nContext';
import { useToast } from '../context/ToastContext';
import BackButton from './BackButton';
import { optionLabel } from '../utils/telLink';
import {
  bpStatus,
  deltaLabel,
  formatChartDate,
  formatVitalDate,
  pulseStatus,
  sugarStatus,
  vitalNum,
} from '../utils/vitals';

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?';

const STATUS = {
  ok: 'bg-emerald-400/15 text-emerald-200',
  watch: 'bg-amber-400/15 text-amber-200',
  high: 'bg-rose-400/15 text-rose-200',
};

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl bg-slate-950/95 border border-white/10 px-3 py-2 text-xs">
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((row) => (
        <p key={row.dataKey} className="text-white">
          {row.name} {row.value ?? '—'}
        </p>
      ))}
    </div>
  );
};

const MiniChart = ({ title, data, areas }) => {
  const has = data.some((row) => areas.some((area) => row[area.key] != null));
  if (!has) return null;
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
      <p className="text-white/60 text-xs uppercase tracking-wider mb-3">{title}</p>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              {areas.map((area) => (
                <linearGradient key={area.key} id={`fill-${area.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={area.color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={area.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
            <Tooltip content={<ChartTip />} />
            {areas.map((area) => (
              <Area
                key={area.key}
                type="monotone"
                dataKey={area.key}
                name={area.name}
                stroke={area.color}
                fill={`url(#fill-${area.key})`}
                strokeWidth={2}
                dot={{ r: 3, fill: area.color, strokeWidth: 0 }}
                connectNulls
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-3 mt-2">
        {areas.map((area) => (
          <span key={area.key} className="text-[11px] text-white/45 inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: area.color }} />
            {area.name}
          </span>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, unit, status, statusLabel, delta, tint }) => (
  <div className={`rounded-3xl p-4 border border-white/10 bg-gradient-to-br ${tint}`}>
    <div className="flex items-center justify-between mb-3">
      <span className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center">
        <Icon size={16} className="text-white" />
      </span>
      {statusLabel ? <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS[status] || STATUS.ok}`}>{statusLabel}</span> : null}
    </div>
    <p className="text-white/50 text-xs">{label}</p>
    <p className="text-white font-display text-2xl mt-1">
      {value || '—'}
      {value && unit ? <span className="text-sm text-white/40 ml-1">{unit}</span> : null}
    </p>
    {delta ? <p className="text-white/40 text-xs mt-1">{delta}</p> : null}
  </div>
);

const Metric = ({ label, value, unit, status, statusLabel }) => {
  if (!value) return null;
  return (
    <div className="rounded-2xl bg-white/5 px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-white/40 text-[11px]">{label}</p>
        {status ? <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS[status]}`}>{statusLabel}</span> : null}
      </div>
      <p className="text-white text-sm mt-1">
        {value} {unit ? <span className="text-white/40">{unit}</span> : null}
      </p>
    </div>
  );
};

const VitalsSection = ({ focusId, onFocusHandled, onBack }) => {
  const { t } = useI18n();
  const { toast } = useToast();
  const people = storage.get('people') || [];
  const [vitals, setVitals] = useState(() => storage.get('vitals') || []);
  const [personId, setPersonId] = useState(people[0]?.id || '');
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [highlightId, setHighlightId] = useState(null);

  const person = people.find((item) => item.id === personId);
  const rows = useMemo(
    () => vitals.filter((item) => !personId || item.personId === personId).sort((a, b) => String(b.date).localeCompare(String(a.date))),
    [vitals, personId]
  );
  const latest = rows[0];
  const previous = rows[1];
  const statusText = (key) => (key ? t(`vitals.${key}`) : '');

  const chart = useMemo(
    () =>
      [...rows].reverse().map((item) => ({
        label: formatChartDate(item.date),
        systolic: vitalNum(item.systolic),
        diastolic: vitalNum(item.diastolic),
        sugar: vitalNum(item.sugar),
        weight: vitalNum(item.weight),
        heartRate: vitalNum(item.heartRate),
      })),
    [rows]
  );

  const save = (data) => {
    const withPerson = { ...data, personId: data.personId || personId };
    const next = vitals.some((item) => item.id === withPerson.id)
      ? vitals.map((item) => (item.id === withPerson.id ? withPerson : item))
      : [...vitals, withPerson];
    setVitals(next);
    storage.set('vitals', next);
    setEditData(null);
  };

  const remove = (item) => {
    const next = vitals.filter((row) => row.id !== item.id);
    setVitals(next);
    storage.set('vitals', next);
    toast(t('common.deleted'), {
      undoLabel: t('common.undo'),
      undo: () => {
        const current = storage.get('vitals') || [];
        if (current.some((row) => row.id === item.id)) return;
        const restored = [...current, item];
        storage.set('vitals', restored);
        setVitals(restored);
      },
    });
  };

  useEffect(() => {
    if (!focusId) return undefined;
    const match = vitals.find((item) => item.id === focusId);
    if (match?.personId) setPersonId(match.personId);
    setHighlightId(focusId);
    const scrollTimer = window.setTimeout(() => {
      document.getElementById(`record-${focusId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      onFocusHandled?.();
    }, 160);
    const clearTimer = window.setTimeout(() => setHighlightId(null), 3200);
    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(clearTimer);
    };
  }, [focusId, onFocusHandled]);

  const describeDelta = (field) => {
    const delta = deltaLabel(latest?.[field], previous?.[field]);
    if (!delta) return '';
    if (delta.kind === 'same') return t('vitals.same');
    return t(delta.kind === 'up' ? 'vitals.up' : 'vitals.down', { value: delta.value });
  };

  return (
    <div className="p-4 md:p-8 mt-16 space-y-6">
      <BackButton onClick={onBack} />
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-rose-300/80 mb-2">{t('vitals.health')}</p>
          <h1 className="font-display text-3xl md:text-4xl text-white">{t('nav.vitals')}</h1>
          <p className="text-white/50 mt-2">{t('vitals.body')}</p>
        </div>
        <button
          type="button"
          onClick={() => { setEditData(null); setOpen(true); }}
          className="btn-primary"
          disabled={!people.length}
        >
          <Plus size={18} /> {t('common.add')}
        </button>
      </div>

      {!people.length && (
        <div className="glass-panel rounded-3xl p-8 text-white/50">{t('vitals.needPeople')}</div>
      )}

      {people.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {people.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPersonId(item.id)}
              className={`shrink-0 flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full text-sm ${
                personId === item.id ? 'bg-rose-400/20 text-white ring-1 ring-rose-300/40' : 'bg-white/5 text-white/60'
              }`}
            >
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-400 to-amber-300 text-[11px] text-slate-900 font-semibold flex items-center justify-center">
                {initials(item.name)}
              </span>
              {item.name}
            </button>
          ))}
        </div>
      )}

      {person && (
        <div className="glass-panel rounded-3xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-emerald-300 flex items-center justify-center text-lg font-semibold text-slate-900">
            {initials(person.name)}
          </div>
          <div className="min-w-0">
            <h2 className="text-white font-semibold truncate">{person.name}</h2>
            <p className="text-white/45 text-sm">
              {[
                person.relation ? optionLabel(t, person.relation) : '',
                person.bloodGroup ? `${t('field.bloodGroup')} ${optionLabel(t, person.bloodGroup)}` : '',
                t('vitals.readings', { count: rows.length }),
              ].filter(Boolean).join(' · ')}
            </p>
            {person.allergies ? <p className="text-amber-200/80 text-sm mt-1">{t('field.allergies')} {person.allergies}</p> : null}
            {latest ? <p className="text-white/35 text-xs mt-1">{t('vitals.latestOn', { date: formatVitalDate(latest.date) })}</p> : null}
          </div>
        </div>
      )}

      {latest && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={Activity}
            label={t('vitals.bp')}
            value={vitalNum(latest.systolic) && vitalNum(latest.diastolic) ? `${latest.systolic}/${latest.diastolic}` : ''}
            unit={t('vitals.mmHg')}
            status={bpStatus(latest.systolic, latest.diastolic)}
            statusLabel={statusText(bpStatus(latest.systolic, latest.diastolic))}
            delta={describeDelta('systolic')}
            tint="from-rose-500/20 to-transparent"
          />
          <StatCard
            icon={Droplets}
            label={t('vitals.sugar')}
            value={vitalNum(latest.sugar)}
            unit={t('vitals.mgdl')}
            status={sugarStatus(latest.sugar)}
            statusLabel={statusText(sugarStatus(latest.sugar))}
            delta={describeDelta('sugar')}
            tint="from-amber-400/20 to-transparent"
          />
          <StatCard
            icon={Scale}
            label={t('vitals.weight')}
            value={vitalNum(latest.weight)}
            unit={t('vitals.kg')}
            delta={describeDelta('weight')}
            tint="from-cyan-400/20 to-transparent"
          />
          <StatCard
            icon={HeartPulse}
            label={t('vitals.pulse')}
            value={vitalNum(latest.heartRate)}
            unit={t('vitals.bpm')}
            status={pulseStatus(latest.heartRate)}
            statusLabel={statusText(pulseStatus(latest.heartRate))}
            delta={describeDelta('heartRate')}
            tint="from-emerald-400/20 to-transparent"
          />
        </div>
      )}

      {chart.length > 1 && (
        <div className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <MiniChart
              title={t('vitals.bpTrend')}
              data={chart}
              areas={[
                { key: 'systolic', name: t('field.systolic'), color: '#fb7185' },
                { key: 'diastolic', name: t('field.diastolic'), color: '#67e8f9' },
              ]}
            />
            <MiniChart
              title={t('vitals.sugarTrend')}
              data={chart}
              areas={[{ key: 'sugar', name: t('vitals.sugar'), color: '#fbbf24' }]}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <MiniChart
              title={t('vitals.weight')}
              data={chart}
              areas={[{ key: 'weight', name: t('vitals.kg'), color: '#34d399' }]}
            />
            <MiniChart
              title={t('vitals.pulse')}
              data={chart}
              areas={[{ key: 'heartRate', name: t('vitals.bpm'), color: '#c084fc' }]}
            />
          </div>
          <p className="text-white/35 text-xs px-1">{t('vitals.guide')}</p>
        </div>
      )}

      <div className="space-y-3">
        {rows.length === 0 && people.length > 0 && (
          <div className="glass-panel rounded-3xl p-10 text-center text-white/40">
            <HeartPulse className="mx-auto mb-3 opacity-40" />
            {t('vitals.empty')}
          </div>
        )}
        {rows.map((item) => {
          const bp = vitalNum(item.systolic) && vitalNum(item.diastolic) ? `${item.systolic}/${item.diastolic}` : '';
          const statusBp = bpStatus(item.systolic, item.diastolic);
          const statusSugar = sugarStatus(item.sugar);
          const statusPulse = pulseStatus(item.heartRate);
          return (
            <div
              key={item.id}
              id={`record-${item.id}`}
              className={`glass-panel rounded-3xl p-4 ${highlightId === item.id ? 'ring-2 ring-cyan-400/70' : ''}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-white font-medium">{formatVitalDate(item.date)}</p>
                  <p className="text-white/40 text-xs">{t('vitals.reading')}</p>
                </div>
                <div className="flex gap-1">
                  <button type="button" aria-label={t('common.edit')} onClick={() => { setEditData(item); setOpen(true); }} className="p-2 text-white/40 hover:text-cyan-300">
                    <Pencil size={14} />
                  </button>
                  <button type="button" aria-label={t('common.delete')} onClick={() => remove(item)} className="p-2 text-white/40 hover:text-rose-300">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Metric label={t('vitals.bp')} value={bp} unit={t('vitals.mmHg')} status={statusBp} statusLabel={statusText(statusBp)} />
                <Metric label={t('vitals.sugar')} value={vitalNum(item.sugar)} unit={t('vitals.mgdl')} status={statusSugar} statusLabel={statusText(statusSugar)} />
                <Metric label={t('vitals.weight')} value={vitalNum(item.weight)} unit={t('vitals.kg')} />
                <Metric label={t('vitals.pulse')} value={vitalNum(item.heartRate)} unit={t('vitals.bpm')} status={statusPulse} statusLabel={statusText(statusPulse)} />
              </div>
              {item.notes ? <p className="text-white/50 text-sm mt-3">{item.notes}</p> : null}
            </div>
          );
        })}
      </div>

      <AddCredentialModal
        isOpen={open}
        onClose={() => { setOpen(false); setEditData(null); }}
        onSave={save}
        editData={editData}
        type="vital"
        defaultPersonId={personId}
      />
    </div>
  );
};

export default VitalsSection;
