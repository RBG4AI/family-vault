import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users } from 'lucide-react';
import { storage } from '../utils/storage';
import AddCredentialModal from './AddCredentialModal';
import { useI18n } from '../context/I18nContext';

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
  '';

const linkedFor = (personId) =>
  PERSON_BUCKETS.flatMap((key) => (storage.get(key) || []).filter((item) => item.personId === personId).map((item) => ({ ...item, _kind: key })));

const unlinkPerson = (personId) => {
  PERSON_BUCKETS.forEach((key) => {
    const items = storage.get(key) || [];
    storage.set(key, items.map((item) => (item.personId === personId ? { ...item, personId: '' } : item)));
  });
};

const PeopleSection = () => {
  const { t } = useI18n();
  const [people, setPeople] = useState(() => storage.get('people') || []);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const selectedPerson = people.find((person) => person.id === selected);
  const linked = useMemo(() => (selected ? linkedFor(selected) : []), [selected, people]);

  const save = (data) => {
    const next = people.some((person) => person.id === data.id)
      ? people.map((person) => (person.id === data.id ? data : person))
      : [...people, data];
    setPeople(next);
    storage.set('people', next);
  };

  return (
    <div className="p-4 md:p-8 mt-12 md:mt-0">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-cyan-300/80 mb-2">{t('nav.family')}</p>
          <h1 className="font-display text-3xl md:text-4xl text-white">{t('nav.people')}</h1>
          <p className="text-white/50 mt-2">{people.length} {t('common.items')} · {t('people.encrypted')}</p>
        </div>
        <button onClick={() => { setEdit(null); setOpen(true); }} className="btn-primary">
          <Plus size={18} /> {t('common.add')}
        </button>
      </div>

      {people.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center">
          <Users className="w-10 h-10 text-white/30 mx-auto mb-4" />
          <p className="text-white/60">{t('people.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((person, index) => (
            <motion.button
              key={person.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelected(person.id)}
              className="glass-panel rounded-3xl p-5 text-left hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-lg font-semibold">
                  {initials(person.name)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-semibold truncate">{person.name}</h3>
                  <p className="text-white/45 text-sm truncate">{[person.relation ? t(`option.${person.relation}`) : '', person.birthday].filter(Boolean).join(' · ')}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {selectedPerson && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          <button className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setSelected(null); setConfirmDelete(false); }} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative glass-panel rounded-3xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-display text-white">{selectedPerson.name}</h2>
                {selectedPerson.relation ? <p className="text-white/50 text-sm">{t(`option.${selectedPerson.relation}`)}</p> : null}
              </div>
              <button className="text-sm text-cyan-300" onClick={() => { setEdit(selectedPerson); setOpen(true); }}>{t('common.edit')}</button>
            </div>
            <p className="text-white/40 text-sm mb-4">{t('people.linkedCount', { count: linked.length })}</p>
            <div className="space-y-2">
              {linked.length === 0 && <p className="text-white/40 text-sm">{t('people.nothingLinked')}</p>}
              {linked.map((item) => (
                <div key={item.id} className="bg-white/5 rounded-xl px-3 py-2 text-sm text-white/80">
                  {t(`nav.${item._kind}`)} · {linkedTitle(item) || t('common.untitled')}
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              {confirmDelete ? (
                <button
                  className="text-sm text-rose-300"
                  onClick={() => {
                    unlinkPerson(selectedPerson.id);
                    const next = people.filter((person) => person.id !== selectedPerson.id);
                    setPeople(next);
                    storage.set('people', next);
                    setSelected(null);
                    setConfirmDelete(false);
                  }}
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
    </div>
  );
};

export default PeopleSection;
