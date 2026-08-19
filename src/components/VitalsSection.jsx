import React, { useMemo, useState } from 'react';
import { Plus, HeartPulse } from 'lucide-react';
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
    const next = [...vitals, data];
    setVitals(next);
    storage.set('vitals', next);
  };

  return (
    <div className="p-4 md:p-8 mt-12 md:mt-0 space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-rose-300/80 mb-2">Health</p>
          <h1 className="font-display text-3xl md:text-4xl text-white">{t('nav.vitals')}</h1>
          <p className="text-white/50 mt-2">Readings stay encrypted. No clinic cloud.</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary" disabled={!people.length}>
          <Plus size={18} /> {t('common.add')}
        </button>
      </div>

      {!people.length && (
        <div className="glass-panel rounded-3xl p-8 text-white/50">Add a family member first, then log vitals for them.</div>
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
          <h3 className="text-white mb-4">Trend</h3>
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
            No readings yet.
          </div>
        )}
        {rows.map((item) => (
          <div key={item.id} className="glass-panel rounded-2xl px-4 py-3 flex justify-between text-sm">
            <span className="text-white/70">{item.date}</span>
            <span className="text-white">
              {item.systolic && item.diastolic ? `${item.systolic}/${item.diastolic}` : '—'} BP
              {item.sugar ? ` · ${item.sugar} sugar` : ''}
              {item.weight ? ` · ${item.weight} kg` : ''}
            </span>
          </div>
        ))}
      </div>

      <AddCredentialModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSave={(data) => save({ ...data, personId: data.personId || personId })}
        type="vital"
      />
    </div>
  );
};

export default VitalsSection;
