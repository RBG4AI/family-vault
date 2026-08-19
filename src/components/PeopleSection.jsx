import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Droplets, Phone, Plus, Users, X } from 'lucide-react';
import { storage } from '../utils/storage';
import AddCredentialModal from './AddCredentialModal';
import { useI18n } from '../context/I18nContext';
import { useToast } from '../context/ToastContext';
import { ageFromBirthday, optionLabel, telHref } from '../utils/telLink';
import BackButton from './BackButton';

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?';

const PERSON_BUCKETS = ['credentials', 'emails', 'banking', 'cards', 'government', 'insurance', 'investments', 'vehicles', 'properties', 'notes', 'vitals'];

const linkedTitle = (item) =>
  item.name ||
  item.appName ||
  item.emailAddress ||
  item.bankName ||
  item.cardType ||
  item.documentType ||
  item.title ||
  item.registrationNumber ||
  item.policyNumber ||
  item.insuranceType ||
  item.username ||
  item.date ||
  '';

const linkedFor = (personId) =>
  PERSON_BUCKETS.flatMap((key) => (storage.get(key) || []).filter((item) => item.personId === personId).map((item) => ({ ...item, _kind: key })));

const unlinkPerson = (personId) => {
  const snapshot = PERSON_BUCKETS.map((key) => ({
    key,
    ids: (storage.get(key) || []).filter((item) => item.personId === personId).map((item) => item.id),
  }));
  PERSON_BUCKETS.forEach((key) => {
    const items = storage.get(key) || [];
    storage.set(key, items.map((item) => (item.personId === personId ? { ...item, personId: '' } : item)));
  });
  return snapshot;
};

const relinkPerson = (personId, snapshot) => {
  snapshot.forEach(({ key, ids }) => {
    const items = storage.get(key) || [];
    storage.set(
      key,
      items.map((item) => (ids.includes(item.id) ? { ...item, personId } : item))
    );
  });
};

const REL_TINT = {
  Self: 'from-cyan-400 to-blue-500',
  Spouse: 'from-rose-400 to-fuchsia-500',
  Parent: 'from-amber-400 to-orange-500',
  Child: 'from-emerald-400 to-teal-500',
  Sibling: 'from-violet-400 to-indigo-500',
  Grandparent: 'from-lime-400 to-emerald-600',
  Other: 'from-slate-400 to-slate-600',
};

const REL_KEYS = ['Self', 'Spouse', 'Parent', 'Child', 'Sibling', 'Grandparent', 'Other'];

const QUICK_ADD = [
  { form: 'app', bucket: 'credentials', nav: 'credentials' },
  { form: 'government', bucket: 'government', nav: 'government' },
  { form: 'insurance', bucket: 'insurance', nav: 'insurance' },
  { form: 'note', bucket: 'notes', nav: 'notes' },
];

const PeopleSection = ({ onNavigate, focusId, onFocusHandled, onBack }) => {
  const { t } = useI18n();
  const { toast } = useToast();
  const [people, setPeople] = useState(() => storage.get('people') || []);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [quick, setQuick] = useState(null);

  const selectedPerson = people.find((person) => person.id === selected);
  const linked = useMemo(() => (selected ? linkedFor(selected) : []), [selected, people]);

  const save = (data) => {
    const next = people.some((person) => person.id === data.id)
      ? people.map((person) => (person.id === data.id ? data : person))
      : [...people, data];
    setPeople(next);
    storage.set('people', next);
  };

  const saveLinked = (data) => {
    if (!quick) return;
    const items = storage.get(quick.bucket) || [];
    const next = items.some((item) => item.id === data.id)
      ? items.map((item) => (item.id === data.id ? data : item))
      : [...items, data];
    storage.set(quick.bucket, next);
    setQuick(null);
    setPeople((current) => [...current]);
  };

  const closePerson = () => {
    setSelected(null);
    setConfirmDelete(false);
  };

  const removePerson = (person) => {
    const snapshot = unlinkPerson(person.id);
    const next = people.filter((item) => item.id !== person.id);
    setPeople(next);
    storage.set('people', next);
    closePerson();
    toast(t('common.deleted'), {
      undoLabel: t('common.undo'),
      undo: () => {
        const restored = [...(storage.get('people') || []), person];
        storage.set('people', restored);
        setPeople(restored);
        relinkPerson(person.id, snapshot);
      },
    });
  };

  useEffect(() => {
    if (!focusId) return undefined;
    setSelected(focusId);
    onFocusHandled?.();
    return undefined;
  }, [focusId, onFocusHandled]);

  useEffect(() => {
    if (!selected) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') closePerson();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selected]);

  const emergencyHref = selectedPerson ? telHref(selectedPerson.emergencyPhone) : '';
  const phoneHref = selectedPerson ? telHref(selectedPerson.phone) : '';
  const age = selectedPerson ? ageFromBirthday(selectedPerson.birthday) : null;
  const withBlood = people.filter((person) => person.bloodGroup && person.bloodGroup !== 'Unknown').length;

  return (
    <div className="p-4 md:p-8 mt-16">
      <BackButton onClick={onBack} />
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-cyan-300/80 mb-2">{t('nav.family')}</p>
          <h1 className="font-display text-3xl md:text-4xl text-white">{t('nav.people')}</h1>
          <p className="text-white/50 mt-2">{people.length} {t('common.items')} · {t('people.encrypted')}</p>
        </div>
        <button onClick={() => { setEdit(null); setOpen(true); }} className="btn-primary">
          <Plus size={18} /> {t('common.add')}
        </button>
      </div>

      {people.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          <div className="rounded-3xl p-4 bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
            <p className="text-white/45 text-xs">{t('common.items')}</p>
            <p className="text-white font-display text-2xl mt-1">{people.length}</p>
          </div>
          {REL_KEYS.map((key) => {
            const count = people.filter((person) => person.relation === key).length;
            return (
              <div key={key} className={`rounded-3xl p-4 bg-gradient-to-br ${REL_TINT[key]} text-white`}>
                <p className="font-display text-2xl">{count}</p>
                <p className="text-xs opacity-90 mt-0.5">{optionLabel(t, key)}</p>
              </div>
            );
          })}
          <div className="rounded-3xl p-4 bg-gradient-to-br from-rose-400 to-red-500 text-white">
            <Droplets size={16} />
            <p className="font-display text-2xl mt-1">{withBlood}</p>
            <p className="text-xs opacity-90 mt-0.5">{t('field.bloodGroup')}</p>
          </div>
        </div>
      )}

      {people.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center">
          <Users className="w-10 h-10 text-white/30 mx-auto mb-4" />
          <p className="text-white/60">{t('people.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((person, index) => {
            const tint = REL_TINT[person.relation] || REL_TINT.Other;
            const personAge = ageFromBirthday(person.birthday);
            const records = linkedFor(person.id).length;
            return (
              <motion.button
                key={person.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelected(person.id)}
                className="glass-panel rounded-3xl overflow-hidden text-left hover:border-white/20 transition-colors"
              >
                <div className={`h-2 bg-gradient-to-r ${tint}`} />
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tint} flex items-center justify-center text-lg font-semibold text-white`}>
                      {initials(person.name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold truncate">{person.name}</h3>
                      <p className="text-white/45 text-sm truncate">
                        {person.relation ? optionLabel(t, person.relation) : t('people.familyMember')}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-white/5 px-3 py-2">
                      <p className="text-[11px] text-white/40">{t('field.birthday')}</p>
                      <p className="text-white text-sm mt-0.5">{personAge != null ? t('people.yearsOld', { age: personAge }) : '—'}</p>
                    </div>
                    <div className="rounded-2xl bg-rose-400/15 px-3 py-2">
                      <p className="text-[11px] text-rose-100/70">{t('field.bloodGroup')}</p>
                      <p className="text-rose-50 text-sm mt-0.5">{person.bloodGroup ? optionLabel(t, person.bloodGroup) : '—'}</p>
                    </div>
                    <div className="rounded-2xl bg-cyan-400/15 px-3 py-2">
                      <p className="text-[11px] text-cyan-100/70">{t('people.records')}</p>
                      <p className="text-cyan-50 text-sm mt-0.5">{records}</p>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {selectedPerson && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closePerson} aria-label={t('common.close')} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative glass-panel rounded-3xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4 gap-3">
              <div className="min-w-0">
                <h2 className="text-2xl font-display text-white">{selectedPerson.name}</h2>
                {selectedPerson.relation ? <p className="text-white/50 text-sm">{optionLabel(t, selectedPerson.relation)}</p> : null}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" className="text-sm text-cyan-300 px-2 py-1" onClick={() => { setEdit(selectedPerson); setOpen(true); }}>{t('common.edit')}</button>
                <button
                  type="button"
                  className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg"
                  onClick={closePerson}
                  aria-label={t('common.close')}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="rounded-2xl bg-cyan-400/15 px-3 py-2.5">
                <p className="text-[11px] text-cyan-100/70">{t('field.birthday')}</p>
                <p className="text-cyan-50 text-sm mt-0.5">{age != null ? t('people.yearsOld', { age }) : '—'}</p>
              </div>
              <div className="rounded-2xl bg-rose-400/15 px-3 py-2.5">
                <p className="text-[11px] text-rose-100/70">{t('field.bloodGroup')}</p>
                <p className="text-rose-50 text-sm mt-0.5">{selectedPerson.bloodGroup ? optionLabel(t, selectedPerson.bloodGroup) : t('people.noBlood')}</p>
              </div>
              {selectedPerson.allergies ? (
                <div className="rounded-2xl bg-amber-400/15 px-3 py-2.5 col-span-2">
                  <p className="text-[11px] text-amber-100/70">{t('field.allergies')}</p>
                  <p className="text-amber-50 text-sm mt-0.5">{selectedPerson.allergies}</p>
                </div>
              ) : null}
              {selectedPerson.doctorName ? (
                <div className="rounded-2xl bg-violet-400/15 px-3 py-2.5 col-span-2">
                  <p className="text-[11px] text-violet-100/70">{t('field.doctorName')}</p>
                  <p className="text-violet-50 text-sm mt-0.5">{selectedPerson.doctorName}</p>
                </div>
              ) : null}
              {selectedPerson.lockerHint ? (
                <div className="rounded-2xl bg-white/5 px-3 py-2.5 col-span-2">
                  <p className="text-[11px] text-white/40">{t('field.lockerHint')}</p>
                  <p className="text-white/80 text-sm mt-0.5">{selectedPerson.lockerHint}</p>
                </div>
              ) : null}
            </div>

            {(emergencyHref || phoneHref || selectedPerson.email) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {emergencyHref && (
                  <a href={emergencyHref} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/20 text-rose-100 text-sm">
                    <Phone size={14} /> {t('people.callEmergency')}
                  </a>
                )}
                {phoneHref && (
                  <a href={phoneHref} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-500/15 text-cyan-100 text-sm">
                    <Phone size={14} /> {t('people.callPhone')}
                  </a>
                )}
                {selectedPerson.email && (
                  <a href={`mailto:${selectedPerson.email}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 text-white/80 text-sm truncate max-w-full">
                    {selectedPerson.email}
                  </a>
                )}
              </div>
            )}

            <p className="text-white/40 text-sm mb-3">{t('people.linkedCount', { count: linked.length })}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {QUICK_ADD.map((item) => (
                <button
                  key={item.bucket}
                  type="button"
                  className="px-3 py-1.5 text-xs rounded-lg bg-cyan-500/15 text-cyan-100"
                  onClick={() => setQuick(item)}
                >
                  {t('common.add')} {t(`nav.${item.nav}`)}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {linked.length === 0 && <p className="text-white/40 text-sm">{t('people.nothingLinked')}</p>}
              {linked.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate?.(item._kind, item.id)}
                  className="w-full flex items-center justify-between gap-2 bg-white/5 hover:bg-white/10 rounded-xl px-3 py-2 text-sm text-white/80 text-left"
                >
                  <span className="truncate">{t(`nav.${item._kind}`)} · {linkedTitle(item) || t('common.untitled')}</span>
                  <ChevronRight size={16} className="shrink-0 text-white/35" />
                </button>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              {confirmDelete ? (
                <button
                  className="text-sm text-rose-300"
                  onClick={() => removePerson(selectedPerson)}
                >
                  {t('people.confirmDelete')}
                </button>
              ) : (
                <button className="text-sm text-white/40 hover:text-rose-300" onClick={() => setConfirmDelete(true)}>
                  {t('common.delete')}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <AddCredentialModal isOpen={open} onClose={() => setOpen(false)} onSave={save} editData={edit} type="person" />
      <AddCredentialModal
        isOpen={Boolean(quick)}
        onClose={() => setQuick(null)}
        onSave={saveLinked}
        type={quick?.form}
        defaultPersonId={selected}
      />
    </div>
  );
};

export default PeopleSection;
