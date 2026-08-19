import React, { useMemo } from 'react';
import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { formatInr, holdingValue } from '../utils/money';
import { optionLabel } from '../utils/telLink';

const PERSON_COLORS = ['#67e8f9', '#a78bfa', '#34d399', '#f472b6', '#fbbf24', '#60a5fa', '#fb923c', '#f87171'];
const TYPE_COLORS = ['#22d3ee', '#818cf8', '#4ade80', '#e879f9', '#facc15', '#38bdf8', '#fb7185', '#c084fc'];
const UNLINKED = '#94a3b8';

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.[0]) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-2xl bg-slate-950/95 border border-white/10 px-3 py-2 shadow-xl">
      <p className="text-white text-sm font-medium">{row.name}</p>
      <p className="text-cyan-200 text-xs mt-0.5">{formatInr(row.value)}</p>
    </div>
  );
};

const Donut = ({ data, colors, total, emptyLabel, centerHint }) => {
  if (!data.length || total <= 0) {
    return <p className="text-white/40 text-sm py-16 text-center">{emptyLabel}</p>;
  }
  return (
    <div className="relative h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={68}
            outerRadius={96}
            paddingAngle={data.length > 1 ? 3 : 0}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={entry.id || entry.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-white font-display text-xl leading-none">{formatInr(total)}</p>
        {centerHint ? <p className="text-white/40 text-[11px] mt-1.5">{centerHint}</p> : null}
      </div>
    </div>
  );
};

const InvestmentOverview = ({ investments = [], people = [], onNavigate }) => {
  const { t } = useI18n();

  const { personSlices, typeSlices, total, personRows } = useMemo(() => {
    const personMap = new Map(people.map((person, index) => [person.id, { person, index }]));
    const byPerson = new Map();
    const byType = new Map();
    let totalValue = 0;

    investments.forEach((item) => {
      const value = holdingValue(item);
      if (value <= 0) return;
      totalValue += value;
      const linked = personMap.get(item.personId);
      const personKey = linked ? item.personId : 'unlinked';
      const personName = linked ? linked.person.name : t('dash.unlinked');
      const color = linked ? PERSON_COLORS[linked.index % PERSON_COLORS.length] : UNLINKED;
      const current = byPerson.get(personKey) || {
        id: personKey,
        personId: linked ? item.personId : '',
        name: personName,
        value: 0,
        color,
        types: new Set(),
      };
      current.value += value;
      if (item.investmentType) current.types.add(item.investmentType);
      byPerson.set(personKey, current);

      const typeName = item.investmentType || t('common.untitled');
      const typeRow = byType.get(typeName) || { id: typeName, name: typeName, value: 0 };
      typeRow.value += value;
      byType.set(typeName, typeRow);
    });

    const personRows = [...byPerson.values()]
      .sort((a, b) => b.value - a.value)
      .map((row) => ({
        ...row,
        types: [...row.types],
        pct: totalValue ? Math.round((row.value / totalValue) * 100) : 0,
      }));

    return {
      personSlices: personRows.map(({ id, name, value }) => ({ id, name, value })),
      typeSlices: [...byType.values()].sort((a, b) => b.value - a.value),
      total: totalValue,
      personRows,
    };
  }, [investments, people, t]);

  if (investments.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-6">
        <h3 className="text-white font-medium mb-2">{t('nav.investments')}</h3>
        <p className="text-white/40 text-sm">{t('dash.noInvestments')}</p>
      </div>
    );
  }

  const personColors = personRows.map((row) => row.color);

  return (
    <div className="glass-panel rounded-3xl p-5 md:p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.18em] uppercase text-cyan-300/70 mb-1">{t('nav.investments')}</p>
          <h3 className="text-white font-display text-2xl">{formatInr(total)}</h3>
          <p className="text-white/40 text-sm">{t('dash.householdTotal')}</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate?.('investments')}
          className="p-2.5 rounded-2xl bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/20"
          aria-label={t('nav.investments')}
        >
          <TrendingUp size={18} />
        </button>
      </div>

      <div className="hidden md:grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-3">
          <p className="text-white/60 text-xs uppercase tracking-wider px-1 mb-1">{t('dash.byPerson')}</p>
          <Donut data={personSlices} colors={personColors} total={total} emptyLabel={t('dash.noInvestments')} centerHint={t('dash.byPerson')} />
        </div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-3">
          <p className="text-white/60 text-xs uppercase tracking-wider px-1 mb-1">{t('dash.byType')}</p>
          <Donut data={typeSlices} colors={TYPE_COLORS} total={total} emptyLabel={t('dash.noInvestments')} centerHint={t('dash.byType')} />
        </div>
      </div>

      <div className="space-y-2">
        {personRows.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => (row.personId ? onNavigate?.('people', row.personId) : onNavigate?.('investments'))}
            className="w-full flex items-center gap-3 rounded-2xl bg-white/5 hover:bg-white/10 px-3 py-3 text-left"
          >
            <span className="w-2.5 h-10 rounded-full shrink-0" style={{ background: row.color }} />
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm truncate">{row.name}</p>
              <p className="text-white/40 text-xs truncate">
                {row.types.map((type) => optionLabel(t, type)).filter(Boolean).join(' · ')}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-white text-sm tabular-nums">{formatInr(row.value)}</p>
              <p className="text-white/40 text-xs">{row.pct}%</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default InvestmentOverview;
