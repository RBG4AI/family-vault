import React, { useMemo, useState } from 'react';
import { Plus, HeartPulse, Pencil, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { storage } from '../utils/storage';
import AddCredentialModal from './AddCredentialModal';
import { useI18n } from '../context/I18nContext';

const VitalsSection = () => {
  const { t } = useI18n();
  const people = storage.get('people') || [];
  const [vitals, setVitals] = useState(() => storage.get('vitals') || []);
  const [personId, setPersonId] = useState(people[0]?.id || '');
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const rows = useMemo(
    () => vitals.filter((item) => !personId || item.personId === personId).sort((a, b) => String(b.date).localeCompare(String(a.date))),
    [vitals, personId]
  );

  const chart = [...rows].reverse().map((item) => ({
    date: item.date,
    systolic: Number(item.systolic) || null,
    sugar: Number(item.sugar) || null,
  }));

  const save = (data) => {
    const withPerson = { ...data, personId: data.personId || personId };
    const next = vitals.some((item) => item.id === withPerson.id)
      ? vitals.map((item) => (item.id === withPerson.id ? withPerson : item))
      : [...vitals, withPerson];
    setVitals(next);
    storage.set('vitals', next);
    setEditData(null);
  };

  const remove = (id) => {
    const next = vitals.filter((item) => item.id !== id);
    setVitals(next);
    storage.set('vitals', next);
  };

  return (
    <div className="p-4 md:p-8 mt-16 space-y-6">
      <div className="flex items-end justify-between">
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
        <select value={personId} onChange={(e) => setPersonId(e.target.value)} className="field">
          {people.map((person) => (
            <option key={person.id} value={person.id} className="bg-dark-800">{person.name}</option>
          ))}
        </select>
      )}

      {chart.length > 1 && (
        <div className="glass-panel rounded-3xl p-5">
          <h3 className="text-white mb-4">{t('vitals.trend')}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chart}>
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #ffffff22', borderRadius: 12 }} />
              <Line type="monotone" dataKey="systolic" stroke="#67e8f9" dot={false} />
              <Line type="monotone" dataKey="sugar" stroke="#f9a8d4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-3">
        {rows.length === 0 && (
          <div className="glass-panel rounded-3xl p-10 text-center text-white/40">
            <HeartPulse className="mx-auto mb-3 opacity-40" />
            {t('vitals.empty')}
          </div>
        )}
        {rows.map((item) => (
          <div key={item.id} className="glass-panel rounded-2xl px-4 py-3 flex justify-between items-center gap-3 text-sm">
            <span className="text-white/70">{item.date}</span>
            <span className="text-white flex-1">
              {item.systolic && item.diastolic ? `${item.systolic}/${item.diastolic}` : '—'} BP
              {item.sugar ? ` · ${item.sugar}` : ''}
              {item.weight ? ` · ${item.weight} kg` : ''}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                aria-label={t('common.edit')}
                onClick={() => { setEditData(item); setOpen(true); }}
                className="p-2 text-white/40 hover:text-cyan-300"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                aria-label={t('common.delete')}
                onClick={() => {
                  if (window.confirm(t('vitals.confirmDelete'))) remove(item.id);
                }}
                className="p-2 text-white/40 hover:text-rose-300"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
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
